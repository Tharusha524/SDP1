#!/usr/bin/env python3
"""
Update Storekeeper IDs and Emails Script
Changes StorekeeperID format to SK-0001 style and updates email addresses
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

def update_storekeeper_data():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        print("\n" + "="*80)
        print("UPDATING STOREKEEPER DATA")
        print("="*80 + "\n")

        # Describe current table
        cursor.execute("DESCRIBE Storekeeper")
        columns = cursor.fetchall()
        print("Current Storekeeper table structure:")
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")

        # Step 1: Find and drop foreign keys referencing Storekeeper(StorekeeperID)
        print("\n📝 Step 1: Handling foreign key constraints...")
        cursor.execute("""
            SELECT CONSTRAINT_NAME, TABLE_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_NAME = 'Storekeeper'
            AND REFERENCED_COLUMN_NAME = 'StorekeeperID'
            AND TABLE_SCHEMA = DATABASE()
        """)
        foreign_keys = cursor.fetchall()
        dropped_fks = []
        for fk_name, table_name in foreign_keys:
            cursor.execute(f"ALTER TABLE {table_name} DROP FOREIGN KEY {fk_name}")
            dropped_fks.append((fk_name, table_name))
            print(f"  ✓ Dropped FK: {fk_name} from {table_name}")

        # Step 2: Modify StorekeeperID column to VARCHAR
        print("\n📝 Step 2: Modifying StorekeeperID column to VARCHAR...")
        cursor.execute("ALTER TABLE Storekeeper MODIFY COLUMN StorekeeperID INT")
        cursor.execute("ALTER TABLE Storekeeper DROP PRIMARY KEY")
        cursor.execute("ALTER TABLE Storekeeper MODIFY COLUMN StorekeeperID VARCHAR(20)")
        cursor.execute("ALTER TABLE Storekeeper ADD PRIMARY KEY (StorekeeperID)")
        print("✅ StorekeeperID column updated to VARCHAR(20)")

        # Step 3: Fetch current storekeepers and build mapping
        print("\n📝 Step 3: Fetching current storekeeper records...")
        cursor.execute("SELECT StorekeeperID, Name, Email FROM Storekeeper ORDER BY StorekeeperID")
        current_storekeepers = cursor.fetchall()
        print(f"Found {len(current_storekeepers)} storekeeper records")

        # Prepare updates: map numeric IDs to SK-XXXX
        updates = []
        for row in current_storekeepers:
            old_id = str(row[0])
            try:
                n = int(old_id)
            except Exception:
                # already non-numeric, skip
                continue
            new_id = f"SK-{n:04d}"
            # Build better email from name
            name = row[1].lower().replace(' ', '')
            new_email = f"{name}keeper{n}@gmail.com"
            updates.append((old_id, new_id, new_email))

        # Create temporary updates table
        cursor.execute("CREATE TEMPORARY TABLE storekeeper_updates (old_id VARCHAR(20), new_id VARCHAR(20), new_email VARCHAR(255))")
        for old_id, new_id, new_email in updates:
            cursor.execute("INSERT INTO storekeeper_updates VALUES (%s, %s, %s)", (old_id, new_id, new_email))

        # Step 4: Update related tables (convert FK column types and values)
        if dropped_fks:
            print("\n📝 Step 4: Updating related tables...")
            for fk_name, table_name in dropped_fks:
                cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE 'StorekeeperID'")
                if cursor.fetchone():
                    cursor.execute(f"ALTER TABLE {table_name} MODIFY COLUMN StorekeeperID VARCHAR(20)")
                    print(f"  ✓ Modified StorekeeperID in {table_name}")
                    for old_id, new_id, _ in updates:
                        cursor.execute(f"UPDATE {table_name} SET StorekeeperID = %s WHERE StorekeeperID = %s", (new_id, old_id))

        # Step 5: Insert new storekeeper records and delete old ones
        print("\n📝 Step 5: Updating Storekeeper table...")

        # To avoid unique email conflicts, set a temporary email placeholder on the old records first
        for old_id, new_id, new_email in updates:
            temp_email = f"__tmp_{old_id}@local.invalid"
            cursor.execute("UPDATE Storekeeper SET Email = %s WHERE StorekeeperID = %s", (temp_email, old_id))

        # Now insert new records using final emails
        for old_id, new_id, new_email in updates:
            cursor.execute("""
                INSERT INTO Storekeeper (StorekeeperID, Name, Email, Password, ContactNo, CreatedAt, UpdatedAt)
                SELECT %s, Name, %s, Password, ContactNo, CreatedAt, NOW()
                FROM Storekeeper WHERE StorekeeperID = %s
            """, (new_id, new_email, old_id))
            print(f"  ✓ Created new record: {new_id} with email {new_email}")

        for old_id, _, _ in updates:
            cursor.execute("DELETE FROM Storekeeper WHERE StorekeeperID = %s", (old_id,))
            print(f"  ✓ Removed old record: {old_id}")

        # Step 6: Restore foreign keys
        print("\n📝 Step 6: Restoring foreign key constraints...")
        for fk_name, table_name in dropped_fks:
            # Check if the table actually has StorekeeperID column
            cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE 'StorekeeperID'")
            if cursor.fetchone():
                cursor.execute(f"""
                    ALTER TABLE {table_name}
                    ADD CONSTRAINT {fk_name}
                    FOREIGN KEY (StorekeeperID) REFERENCES Storekeeper(StorekeeperID)
                """)
                print(f"  ✓ Restored FK: {fk_name} on {table_name}")
            else:
                print(f"  ⚠ Skipped FK {fk_name} - {table_name} has no StorekeeperID column")

        connection.commit()

        # Verification
        print("\n📝 Step 7: Verifying updates...")
        cursor.execute("SELECT StorekeeperID, Name, Email FROM Storekeeper ORDER BY StorekeeperID")
        updated_storekeepers = cursor.fetchall()

        print("\n✅ UPDATED STOREKEEPER RECORDS:")
        print("-"*80)
        for sk in updated_storekeepers:
            print(f"  ID: {sk[0]:<12} | Name: {sk[1]:<25} | Email: {sk[2]}")

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
    confirm = input("This will update Storekeeper IDs and emails. Continue? (yes/no): ")
    if confirm.lower() == 'yes':
        update_storekeeper_data()
    else:
        print("Operation cancelled.")
