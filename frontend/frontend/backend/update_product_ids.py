#!/usr/bin/env python3
"""
Update Product IDs Script
Changes ProductID format to P-001 style (3 digits)
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

def update_product_data():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        print("\n" + "="*80)
        print("UPDATING PRODUCT DATA")
        print("="*80 + "\n")

        # Describe current table
        cursor.execute("DESCRIBE Product")
        columns = cursor.fetchall()
        print("Current Product table structure:")
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")

        # Step 1: Find and drop foreign keys referencing Product(ProductID)
        print("\n📝 Step 1: Handling foreign key constraints...")
        cursor.execute("""
            SELECT CONSTRAINT_NAME, TABLE_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_NAME = 'Product'
            AND REFERENCED_COLUMN_NAME = 'ProductID'
            AND TABLE_SCHEMA = DATABASE()
        """)
        foreign_keys = cursor.fetchall()
        dropped_fks = []
        for fk_name, table_name in foreign_keys:
            cursor.execute(f"ALTER TABLE {table_name} DROP FOREIGN KEY {fk_name}")
            dropped_fks.append((fk_name, table_name))
            print(f"  ✓ Dropped FK: {fk_name} from {table_name}")

        # Step 2: Modify ProductID column to VARCHAR
        print("\n📝 Step 2: Modifying ProductID column to VARCHAR...")
        cursor.execute("ALTER TABLE Product MODIFY COLUMN ProductID INT")
        cursor.execute("ALTER TABLE Product DROP PRIMARY KEY")
        cursor.execute("ALTER TABLE Product MODIFY COLUMN ProductID VARCHAR(20)")
        cursor.execute("ALTER TABLE Product ADD PRIMARY KEY (ProductID)")
        print("✅ ProductID column updated to VARCHAR(20)")

        # Step 3: Fetch current products and build mapping
        print("\n📝 Step 3: Fetching current product records...")
        cursor.execute("SELECT ProductID, Name, Price FROM Product ORDER BY ProductID")
        current_products = cursor.fetchall()
        print(f"Found {len(current_products)} product records")

        # Prepare updates: map numeric IDs to P-XXX (3 digits)
        updates = []
        for row in current_products:
            old_id = str(row[0])
            try:
                n = int(old_id)
            except Exception:
                # already non-numeric, skip
                continue
            new_id = f"P-{n:03d}"  # 3 digits
            updates.append((old_id, new_id))

        # Create temporary updates table
        cursor.execute("CREATE TEMPORARY TABLE product_updates (old_id VARCHAR(20), new_id VARCHAR(20))")
        for old_id, new_id in updates:
            cursor.execute("INSERT INTO product_updates VALUES (%s, %s)", (old_id, new_id))

        # Step 4: Update related tables (convert FK column types and values)
        if dropped_fks:
            print("\n📝 Step 4: Updating related tables...")
            for fk_name, table_name in dropped_fks:
                cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE 'ProductID'")
                if cursor.fetchone():
                    cursor.execute(f"ALTER TABLE {table_name} MODIFY COLUMN ProductID VARCHAR(20)")
                    print(f"  ✓ Modified ProductID in {table_name}")
                    for old_id, new_id in updates:
                        cursor.execute(f"UPDATE {table_name} SET ProductID = %s WHERE ProductID = %s", (new_id, old_id))

        # Step 5: Insert new product records and delete old ones
        print("\n📝 Step 5: Updating Product table...")

        # Insert new records
        for old_id, new_id in updates:
            cursor.execute("""
                INSERT INTO Product (ProductID, Name, Description, Price, Image, Category, IsActive, CreatedAt, UpdatedAt)
                SELECT %s, Name, Description, Price, Image, Category, IsActive, CreatedAt, NOW()
                FROM Product WHERE ProductID = %s
            """, (new_id, old_id))
            print(f"  ✓ Created new record: {new_id}")

        for old_id, _ in updates:
            cursor.execute("DELETE FROM Product WHERE ProductID = %s", (old_id,))
            print(f"  ✓ Removed old record: {old_id}")

        # Step 6: Restore foreign keys
        print("\n📝 Step 6: Restoring foreign key constraints...")
        for fk_name, table_name in dropped_fks:
            cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE 'ProductID'")
            if cursor.fetchone():
                cursor.execute(f"""
                    ALTER TABLE {table_name}
                    ADD CONSTRAINT {fk_name}
                    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
                """)
                print(f"  ✓ Restored FK: {fk_name} on {table_name}")

        connection.commit()

        # Verification
        print("\n📝 Step 7: Verifying updates...")
        cursor.execute("SELECT ProductID, Name, Price, Category FROM Product ORDER BY ProductID")
        updated_products = cursor.fetchall()

        print("\n✅ UPDATED PRODUCT RECORDS:")
        print("-"*80)
        for p in updated_products:
            print(f"  ID: {p[0]:<10} | Name: {p[1]:<30} | Price: ${p[2]:<8} | Category: {p[3]}")

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
    confirm = input("This will update Product IDs to P-XXX format (3 digits). Continue? (yes/no): ")
    if confirm.lower() == 'yes':
        update_product_data()
    else:
        print("Operation cancelled.")
