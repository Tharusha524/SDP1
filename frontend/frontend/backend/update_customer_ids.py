#!/usr/bin/env python3
"""
Update Customer IDs and Emails Script
Changes CustomerID format to CUS-0001 style and updates selected email addresses
"""

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', 'root'),
        'database': os.getenv('DB_NAME', 'SDP')
    }
    return mysql.connector.connect(**db_config)

def update_customer_data():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        print("\n" + "="*80)
        print("UPDATING CUSTOMER DATA")
        print("="*80 + "\n")

        # Describe current table
        cursor.execute("DESCRIBE Customer")
        columns = cursor.fetchall()
        print("Current Customer table structure:")
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")

        # Step 1: Find and drop foreign keys referencing Customer(CustomerID)
        print("\n📝 Step 1: Handling foreign key constraints...")
        cursor.execute("""
            SELECT CONSTRAINT_NAME, TABLE_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_NAME = 'Customer'
            AND REFERENCED_COLUMN_NAME = 'CustomerID'
            AND TABLE_SCHEMA = DATABASE()
        """)
        foreign_keys = cursor.fetchall()
        dropped_fks = []
        for fk_name, table_name in foreign_keys:
            cursor.execute(f"ALTER TABLE {table_name} DROP FOREIGN KEY {fk_name}")
            dropped_fks.append((fk_name, table_name))
            print(f"  ✓ Dropped FK: {fk_name} from {table_name}")

        # Step 2: Modify CustomerID column to VARCHAR
        print("\n📝 Step 2: Modifying CustomerID column to VARCHAR...")
        cursor.execute("ALTER TABLE Customer MODIFY COLUMN CustomerID INT")
        cursor.execute("ALTER TABLE Customer DROP PRIMARY KEY")
        cursor.execute("ALTER TABLE Customer MODIFY COLUMN CustomerID VARCHAR(20)")
        cursor.execute("ALTER TABLE Customer ADD PRIMARY KEY (CustomerID)")
        print("✅ CustomerID column updated to VARCHAR(20)")

        # Step 3: Fetch current customers and build mapping
        print("\n📝 Step 3: Fetching current customer records...")
        cursor.execute("SELECT CustomerID, Name, Email FROM Customer ORDER BY CustomerID")
        current_customers = cursor.fetchall()
        print(f"Found {len(current_customers)} customer records")

        # Prepare updates: map numeric IDs to CUS-XXXX
        updates = []
        for row in current_customers:
            old_id = str(row[0])
            try:
                n = int(old_id)
            except Exception:
                # already non-numeric, skip
                continue
            new_id = f"CUS-{n:04d}"
            # Default: keep existing email
            new_email = row[2]
            updates.append((old_id, new_id, new_email))

        # Specific email replacements (customize as needed)
        email_overrides = {
            'nuwan@gmail.com': 'nuwanjawardhana56@gmail.com'
        }

        # Create temporary updates table
        cursor.execute("CREATE TEMPORARY TABLE customer_updates (old_id VARCHAR(20), new_id VARCHAR(20), new_email VARCHAR(255))")
        for old_id, new_id, new_email in updates:
            # apply email overrides when matched
            if new_email in email_overrides:
                new_email = email_overrides[new_email]
            cursor.execute("INSERT INTO customer_updates VALUES (%s, %s, %s)", (old_id, new_id, new_email))

        # Step 4: Update related tables (convert FK column types and values)
        if dropped_fks:
            print("\n📝 Step 4: Updating related tables...")
            for fk_name, table_name in dropped_fks:
                cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE 'CustomerID'")
                if cursor.fetchone():
                    cursor.execute(f"ALTER TABLE {table_name} MODIFY COLUMN CustomerID VARCHAR(20)")
                    print(f"  ✓ Modified CustomerID in {table_name}")
                    for old_id, new_id, _ in updates:
                        cursor.execute(f"UPDATE {table_name} SET CustomerID = %s WHERE CustomerID = %s", (new_id, old_id))

        # Step 5: Insert new customer records and delete old ones
        print("\n📝 Step 5: Updating Customer table...")

        # To avoid unique email conflicts, set a temporary email placeholder on the old records first
        for old_id, new_id, new_email in updates:
            temp_email = f"__tmp_{old_id}@local.invalid"
            cursor.execute("UPDATE Customer SET Email = %s WHERE CustomerID = %s", (temp_email, old_id))

        # Now insert new records using final emails
        for old_id, new_id, new_email in updates:
            # If an override exists in the temporary table, ensure we pick the override
            # (we already applied overrides when building the temp table)
            cursor.execute("""
                INSERT INTO Customer (CustomerID, Name, Email, Password, ContactNo, Address, CreatedAt, UpdatedAt)
                SELECT %s, Name, %s, Password, ContactNo, Address, CreatedAt, NOW()
                FROM Customer WHERE CustomerID = %s
            """, (new_id, new_email, old_id))
            print(f"  ✓ Created new record: {new_id} with email {new_email}")

        for old_id, _, _ in updates:
            cursor.execute("DELETE FROM Customer WHERE CustomerID = %s", (old_id,))
            print(f"  ✓ Removed old record: {old_id}")

        # Step 6: Restore foreign keys
        print("\n📝 Step 6: Restoring foreign key constraints...")
        for fk_name, table_name in dropped_fks:
            cursor.execute(f"""
                ALTER TABLE {table_name}
                ADD CONSTRAINT {fk_name}
                FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
            """)
            print(f"  ✓ Restored FK: {fk_name} on {table_name}")

        connection.commit()

        # Verification
        print("\n📝 Step 7: Verifying updates...")
        cursor.execute("SELECT CustomerID, Name, Email FROM Customer ORDER BY CustomerID")
        updated_customers = cursor.fetchall()

        print("\n✅ UPDATED CUSTOMER RECORDS:")
        print("-"*80)
        for c in updated_customers:
            print(f"  ID: {c[0]:<12} | Name: {c[1]:<25} | Email: {c[2]}")

        print("\n✅ All updates completed successfully!")

    except Error as e:
        print(f"\n❌ Database Error: {e}")
        if connection:
            connection.rollback()
            print("Changes rolled back.")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
            print("\n🔌 Database connection closed.\n")

if __name__ == '__main__':
    confirm = input("This will update Customer IDs and selected emails. Continue? (yes/no): ")
    if confirm.lower() == 'yes':
        update_customer_data()
    else:
        print("Operation cancelled.")
