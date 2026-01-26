#!/usr/bin/env python3
"""
Update Inventory IDs Script
Changes InventoryID format to IN-001 style (3 digits)
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

def update_inventory_data():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        print("\n" + "="*80)
        print("UPDATING INVENTORY DATA")
        print("="*80 + "\n")

        # Describe current table
        cursor.execute("DESCRIBE Inventory")
        columns = cursor.fetchall()
        print("Current Inventory table structure:")
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")

        # Step 1: Find and drop foreign keys referencing Inventory(InventoryID)
        print("\n📝 Step 1: Handling foreign key constraints...")
        cursor.execute("""
            SELECT CONSTRAINT_NAME, TABLE_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_NAME = 'Inventory'
            AND REFERENCED_COLUMN_NAME = 'InventoryID'
            AND TABLE_SCHEMA = DATABASE()
        """)
        foreign_keys = cursor.fetchall()
        dropped_fks = []
        for fk_name, table_name in foreign_keys:
            cursor.execute(f"ALTER TABLE {table_name} DROP FOREIGN KEY {fk_name}")
            dropped_fks.append((fk_name, table_name))
            print(f"  ✓ Dropped FK: {fk_name} from {table_name}")

        # Step 2: Modify InventoryID column to VARCHAR
        print("\n📝 Step 2: Modifying InventoryID column to VARCHAR...")
        cursor.execute("ALTER TABLE Inventory MODIFY COLUMN InventoryID INT")
        cursor.execute("ALTER TABLE Inventory DROP PRIMARY KEY")
        cursor.execute("ALTER TABLE Inventory MODIFY COLUMN InventoryID VARCHAR(20)")
        cursor.execute("ALTER TABLE Inventory ADD PRIMARY KEY (InventoryID)")
        print("✅ InventoryID column updated to VARCHAR(20)")

        # Step 3: Fetch current inventory records and build mapping
        print("\n📝 Step 3: Fetching current inventory records...")
        cursor.execute("SELECT InventoryID FROM Inventory ORDER BY InventoryID")
        current_inventory = cursor.fetchall()
        print(f"Found {len(current_inventory)} inventory records")

        # Prepare updates: map numeric IDs to IN-XXX (3 digits)
        updates = []
        for row in current_inventory:
            old_id = str(row[0])
            try:
                n = int(old_id)
            except Exception:
                # already non-numeric, skip
                continue
            new_id = f"IN-{n:03d}"  # 3 digits
            updates.append((old_id, new_id))

        # Create temporary updates table
        cursor.execute("CREATE TEMPORARY TABLE inventory_updates (old_id VARCHAR(20), new_id VARCHAR(20))")
        for old_id, new_id in updates:
            cursor.execute("INSERT INTO inventory_updates VALUES (%s, %s)", (old_id, new_id))

        # Step 4: Update related tables (convert FK column types and values)
        if dropped_fks:
            print("\n📝 Step 4: Updating related tables...")
            for fk_name, table_name in dropped_fks:
                cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE 'InventoryID'")
                if cursor.fetchone():
                    cursor.execute(f"ALTER TABLE {table_name} MODIFY COLUMN InventoryID VARCHAR(20)")
                    print(f"  ✓ Modified InventoryID in {table_name}")
                    for old_id, new_id in updates:
                        cursor.execute(f"UPDATE {table_name} SET InventoryID = %s WHERE InventoryID = %s", (new_id, old_id))

        # Step 5: Insert new inventory records and delete old ones
        print("\n📝 Step 5: Updating Inventory table...")

        # Insert new records
        for old_id, new_id in updates:
            cursor.execute("""
                INSERT INTO Inventory (InventoryID, ProductID, AvailableQuantity, MinimumThreshold, LastUpdated, UpdatedBy)
                SELECT %s, ProductID, AvailableQuantity, MinimumThreshold, LastUpdated, UpdatedBy
                FROM Inventory WHERE InventoryID = %s
            """, (new_id, old_id))
            print(f"  ✓ Created new record: {new_id}")

        for old_id, _ in updates:
            cursor.execute("DELETE FROM Inventory WHERE InventoryID = %s", (old_id,))
            print(f"  ✓ Removed old record: {old_id}")

        # Step 6: Restore foreign keys
        print("\n📝 Step 6: Restoring foreign key constraints...")
        for fk_name, table_name in dropped_fks:
            cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE 'InventoryID'")
            if cursor.fetchone():
                cursor.execute(f"""
                    ALTER TABLE {table_name}
                    ADD CONSTRAINT {fk_name}
                    FOREIGN KEY (InventoryID) REFERENCES Inventory(InventoryID)
                """)
                print(f"  ✓ Restored FK: {fk_name} on {table_name}")

        connection.commit()

        # Verification
        print("\n📝 Step 7: Verifying updates...")
        cursor.execute("SELECT InventoryID, ProductID, AvailableQuantity, UpdatedBy FROM Inventory ORDER BY InventoryID")
        updated_inventory = cursor.fetchall()

        print("\n✅ UPDATED INVENTORY RECORDS:")
        print("-"*80)
        for inv in updated_inventory:
            print(f"  ID: {inv[0]:<10} | ProductID: {inv[1]:<10} | Quantity: {inv[2]:<6} | UpdatedBy: {inv[3]}")

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
    confirm = input("This will update Inventory IDs to IN-XXX format (3 digits). Continue? (yes/no): ")
    if confirm.lower() == 'yes':
        update_inventory_data()
    else:
        print("Operation cancelled.")
