#!/usr/bin/env python3
"""
Update Notification IDs Script
Changes NotificationID format to NO-001 style (3 digits)
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

def update_notification_data():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        print("\n" + "="*80)
        print("UPDATING NOTIFICATION DATA")
        print("="*80 + "\n")

        # Describe current table
        cursor.execute("DESCRIBE Notification")
        columns = cursor.fetchall()
        print("Current Notification table structure:")
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")

        # Step 1: Find and drop foreign keys referencing Notification(NotificationID)
        print("\n📝 Step 1: Handling foreign key constraints...")
        cursor.execute("""
            SELECT CONSTRAINT_NAME, TABLE_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_NAME = 'Notification'
            AND REFERENCED_COLUMN_NAME = 'NotificationID'
            AND TABLE_SCHEMA = DATABASE()
        """)
        foreign_keys = cursor.fetchall()
        dropped_fks = []
        for fk_name, table_name in foreign_keys:
            cursor.execute(f"ALTER TABLE {table_name} DROP FOREIGN KEY {fk_name}")
            dropped_fks.append((fk_name, table_name))
            print(f"  ✓ Dropped FK: {fk_name} from {table_name}")

        if not dropped_fks:
            print("  No foreign key constraints found.")

        # Step 2: Modify NotificationID column to VARCHAR
        print("\n📝 Step 2: Modifying NotificationID column to VARCHAR...")
        cursor.execute("ALTER TABLE Notification MODIFY COLUMN NotificationID INT")
        cursor.execute("ALTER TABLE Notification DROP PRIMARY KEY")
        cursor.execute("ALTER TABLE Notification MODIFY COLUMN NotificationID VARCHAR(20)")
        cursor.execute("ALTER TABLE Notification ADD PRIMARY KEY (NotificationID)")
        print("✅ NotificationID column updated to VARCHAR(20)")

        # Step 3: Fetch current notifications and build mapping
        print("\n📝 Step 3: Fetching current notification records...")
        cursor.execute("SELECT NotificationID FROM Notification ORDER BY NotificationID")
        current_notifications = cursor.fetchall()
        print(f"Found {len(current_notifications)} notification records")

        # Prepare updates: map numeric IDs to NO-XXX (3 digits)
        updates = []
        for row in current_notifications:
            old_id = str(row[0])
            try:
                n = int(old_id)
            except Exception:
                # already non-numeric, skip
                continue
            new_id = f"NO-{n:03d}"  # 3 digits
            updates.append((old_id, new_id))

        if not updates:
            print("  No numeric IDs found to update.")
            return

        # Create temporary updates table
        cursor.execute("CREATE TEMPORARY TABLE notification_updates (old_id VARCHAR(20), new_id VARCHAR(20))")
        for old_id, new_id in updates:
            cursor.execute("INSERT INTO notification_updates VALUES (%s, %s)", (old_id, new_id))

        # Step 4: Update related tables (convert FK column types and values)
        if dropped_fks:
            print("\n📝 Step 4: Updating related tables...")
            for fk_name, table_name in dropped_fks:
                cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE 'NotificationID'")
                if cursor.fetchone():
                    cursor.execute(f"ALTER TABLE {table_name} MODIFY COLUMN NotificationID VARCHAR(20)")
                    print(f"  ✓ Modified NotificationID in {table_name}")
                    for old_id, new_id in updates:
                        cursor.execute(f"UPDATE {table_name} SET NotificationID = %s WHERE NotificationID = %s", (new_id, old_id))

        # Step 5: Insert new notification records and delete old ones
        print("\n📝 Step 5: Updating Notification table...")

        # Get all columns except NotificationID
        cursor.execute("SHOW COLUMNS FROM Notification")
        all_columns = [col[0] for col in cursor.fetchall() if col[0] != 'NotificationID']
        columns_str = ', '.join(all_columns)

        # Insert new records
        for old_id, new_id in updates:
            cursor.execute(f"""
                INSERT INTO Notification (NotificationID, {columns_str})
                SELECT %s, {columns_str}
                FROM Notification WHERE NotificationID = %s
            """, (new_id, old_id))
            print(f"  ✓ Created new record: {new_id}")

        for old_id, _ in updates:
            cursor.execute("DELETE FROM Notification WHERE NotificationID = %s", (old_id,))
            print(f"  ✓ Removed old record: {old_id}")

        # Step 6: Restore foreign keys
        if dropped_fks:
            print("\n📝 Step 6: Restoring foreign key constraints...")
            for fk_name, table_name in dropped_fks:
                cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE 'NotificationID'")
                if cursor.fetchone():
                    cursor.execute(f"""
                        ALTER TABLE {table_name}
                        ADD CONSTRAINT {fk_name}
                        FOREIGN KEY (NotificationID) REFERENCES Notification(NotificationID)
                    """)
                    print(f"  ✓ Restored FK: {fk_name} on {table_name}")

        connection.commit()

        # Verification
        print("\n📝 Step 7: Verifying updates...")
        cursor.execute("SELECT NotificationID, Message, Type, IsRead, DateTime FROM Notification ORDER BY NotificationID")
        updated_notifications = cursor.fetchall()

        print("\n✅ UPDATED NOTIFICATION RECORDS:")
        print("-"*80)
        for notif in updated_notifications:
            msg_preview = notif[1][:40] + "..." if len(notif[1]) > 40 else notif[1]
            print(f"  ID: {notif[0]:<10} | Type: {notif[2]:<15} | Read: {notif[3]} | Message: {msg_preview}")

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
    confirm = input("This will update Notification IDs to NO-XXX format (3 digits). Continue? (yes/no): ")
    if confirm.lower() == 'yes':
        update_notification_data()
    else:
        print("Operation cancelled.")
