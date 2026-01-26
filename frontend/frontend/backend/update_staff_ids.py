#!/usr/bin/env python3
"""
Update Staff IDs and Emails Script
Changes StaffID format to S-0001 style and updates email addresses
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

def update_staff_data():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        print("\n" + "="*80)
        print("UPDATING STAFF DATA")
        print("="*80 + "\n")

        # Describe current table
        cursor.execute("DESCRIBE Staff")
        columns = cursor.fetchall()
        print("Current Staff table structure:")
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")

        # Step 1: Find and drop foreign keys referencing Staff(StaffID)
        print("\n📝 Step 1: Handling foreign key constraints...")
        cursor.execute("""
            SELECT CONSTRAINT_NAME, TABLE_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_NAME = 'Staff'
            AND REFERENCED_COLUMN_NAME = 'StaffID'
            AND TABLE_SCHEMA = DATABASE()
        """)
        foreign_keys = cursor.fetchall()
        dropped_fks = []
        for fk_name, table_name in foreign_keys:
            cursor.execute(f"ALTER TABLE {table_name} DROP FOREIGN KEY {fk_name}")
            dropped_fks.append((fk_name, table_name))
            print(f"  ✓ Dropped FK: {fk_name} from {table_name}")

        # Step 2: Modify StaffID column to VARCHAR
        print("\n📝 Step 2: Modifying StaffID column to VARCHAR...")
        cursor.execute("ALTER TABLE Staff MODIFY COLUMN StaffID INT")
        cursor.execute("ALTER TABLE Staff DROP PRIMARY KEY")
        cursor.execute("ALTER TABLE Staff MODIFY COLUMN StaffID VARCHAR(20)")
        cursor.execute("ALTER TABLE Staff ADD PRIMARY KEY (StaffID)")
        print("✅ StaffID column updated to VARCHAR(20)")

        # Step 3: Fetch current staff and build mapping
        print("\n📝 Step 3: Fetching current staff records...")
        cursor.execute("SELECT StaffID, Name, Email FROM Staff ORDER BY StaffID")
        current_staff = cursor.fetchall()
        print(f"Found {len(current_staff)} staff records")

        # Prepare updates: map numeric IDs to S-XXXX
        updates = []
        for row in current_staff:
            old_id = str(row[0])
            try:
                n = int(old_id)
            except Exception:
                # already non-numeric, skip
                continue
            new_id = f"S-{n:04d}"
            # Build better email from name
            name = row[1].lower().replace(' ', '')
            new_email = f"{name}staff{n}@gmail.com"
            updates.append((old_id, new_id, new_email))

        # Create temporary updates table
        cursor.execute("CREATE TEMPORARY TABLE staff_updates (old_id VARCHAR(20), new_id VARCHAR(20), new_email VARCHAR(255))")
        for old_id, new_id, new_email in updates:
            cursor.execute("INSERT INTO staff_updates VALUES (%s, %s, %s)", (old_id, new_id, new_email))

        # Step 4: Update related tables (convert FK column types and values)
        if dropped_fks:
            print("\n📝 Step 4: Updating related tables...")
            for fk_name, table_name in dropped_fks:
                cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE 'StaffID'")
                if cursor.fetchone():
                    cursor.execute(f"ALTER TABLE {table_name} MODIFY COLUMN StaffID VARCHAR(20)")
                    print(f"  ✓ Modified StaffID in {table_name}")
                    for old_id, new_id, _ in updates:
                        cursor.execute(f"UPDATE {table_name} SET StaffID = %s WHERE StaffID = %s", (new_id, old_id))

        # Step 5: Insert new staff records and delete old ones
        print("\n📝 Step 5: Updating Staff table...")

        # To avoid unique email conflicts, set a temporary email placeholder on the old records first
        for old_id, new_id, new_email in updates:
            temp_email = f"__tmp_{old_id}@local.invalid"
            cursor.execute("UPDATE Staff SET Email = %s WHERE StaffID = %s", (temp_email, old_id))

        # Now insert new records using final emails
        for old_id, new_id, new_email in updates:
            cursor.execute("""
                INSERT INTO Staff (StaffID, Name, Email, Password, ContactNo, Status, CreatedAt, UpdatedAt)
                SELECT %s, Name, %s, Password, ContactNo, Status, CreatedAt, NOW()
                FROM Staff WHERE StaffID = %s
            """, (new_id, new_email, old_id))
            print(f"  ✓ Created new record: {new_id} with email {new_email}")

        for old_id, _, _ in updates:
            cursor.execute("DELETE FROM Staff WHERE StaffID = %s", (old_id,))
            print(f"  ✓ Removed old record: {old_id}")

        # Step 6: Restore foreign keys
        print("\n📝 Step 6: Restoring foreign key constraints...")
        for fk_name, table_name in dropped_fks:
            cursor.execute(f"""
                ALTER TABLE {table_name}
                ADD CONSTRAINT {fk_name}
                FOREIGN KEY (StaffID) REFERENCES Staff(StaffID)
            """)
            print(f"  ✓ Restored FK: {fk_name} on {table_name}")

        connection.commit()

        # Verification
        print("\n📝 Step 7: Verifying updates...")
        cursor.execute("SELECT StaffID, Name, Email FROM Staff ORDER BY StaffID")
        updated_staff = cursor.fetchall()

        print("\n✅ UPDATED STAFF RECORDS:")
        print("-"*80)
        for s in updated_staff:
            print(f"  ID: {s[0]:<12} | Name: {s[1]:<25} | Email: {s[2]}")

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
    confirm = input("This will update Staff IDs and emails. Continue? (yes/no): ")
    if confirm.lower() == 'yes':
        update_staff_data()
    else:
        print("Operation cancelled.")
