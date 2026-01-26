#!/usr/bin/env python3
"""
Update Admin IDs and Emails Script
Changes AdminID format to A-0001 style and updates email addresses
"""

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    """Create and return a database connection"""
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', 'root'),
        'database': os.getenv('DB_NAME', 'SDP')
    }
    return mysql.connector.connect(**db_config)

def update_admin_data():
    """Update Admin IDs to A-XXXX format and change emails"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        print("\n" + "="*80)
        print("UPDATING ADMIN DATA")
        print("="*80 + "\n")
        
        # First, check current admin table structure
        cursor.execute("DESCRIBE Admin")
        columns = cursor.fetchall()
        print("Current Admin table structure:")
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")
        
        # Step 1: Handle foreign key constraints and modify AdminID column
        print("\n📝 Step 1: Handling foreign key constraints...")
        
        # Drop foreign key constraints that reference AdminID
        cursor.execute("""
            SELECT CONSTRAINT_NAME, TABLE_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE REFERENCED_TABLE_NAME = 'Admin' 
            AND REFERENCED_COLUMN_NAME = 'AdminID'
            AND TABLE_SCHEMA = DATABASE()
        """)
        foreign_keys = cursor.fetchall()
        
        dropped_fks = []
        for fk_name, table_name in foreign_keys:
            cursor.execute(f"ALTER TABLE {table_name} DROP FOREIGN KEY {fk_name}")
            dropped_fks.append((fk_name, table_name))
            print(f"  ✓ Dropped FK: {fk_name} from {table_name}")
        
        # Modify AdminID column
        print("\n📝 Step 2: Modifying AdminID column to VARCHAR...")
        cursor.execute("ALTER TABLE Admin MODIFY COLUMN AdminID INT")
        cursor.execute("ALTER TABLE Admin DROP PRIMARY KEY")
        cursor.execute("ALTER TABLE Admin MODIFY COLUMN AdminID VARCHAR(20)")
        cursor.execute("ALTER TABLE Admin ADD PRIMARY KEY (AdminID)")
        print("✅ AdminID column updated to VARCHAR(20)")
        
        # Step 2: Create temporary mapping of old IDs to new IDs
        print("\n📝 Step 3: Fetching current admin records...")
        cursor.execute("SELECT AdminID, Name, Email FROM Admin ORDER BY AdminID")
        current_admins = cursor.fetchall()
        
        print(f"Found {len(current_admins)} admin records")
        
        # Step 3: Update records with new IDs and emails
        print("\n📝 Step 4: Updating admin records...")
        
        # Create temporary table to store updates
        cursor.execute("CREATE TEMPORARY TABLE admin_updates (old_id VARCHAR(20), new_id VARCHAR(20), new_email VARCHAR(100))")
        
        # Prepare updates
        updates = [
            ('1', 'A-0001', 'sanduni123@gmail.com'),
            ('2', 'A-0002', 'thilakarathna56@gmail.com')
        ]
        
        for old_id, new_id, new_email in updates:
            cursor.execute("INSERT INTO admin_updates VALUES (%s, %s, %s)", (old_id, new_id, new_email))
        
        # Update related tables first (if any)
        if dropped_fks:
            print("\n📝 Step 5: Updating related tables...")
            for fk_name, table_name in dropped_fks:
                # Check if table has AdminID column
                cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE 'AdminID'")
                if cursor.fetchone():
                    # Modify the foreign key column to VARCHAR
                    cursor.execute(f"ALTER TABLE {table_name} MODIFY COLUMN AdminID VARCHAR(20)")
                    print(f"  ✓ Modified AdminID in {table_name}")
                    
                    # Update the values
                    for old_id, new_id, _ in updates:
                        cursor.execute(f"UPDATE {table_name} SET AdminID = %s WHERE AdminID = %s", (new_id, old_id))
        
        # Update Admin table
        print("\n📝 Step 6: Updating Admin table...")
        for old_id, new_id, new_email in updates:
            # First, create new record with new ID
            cursor.execute("""
                INSERT INTO Admin (AdminID, Name, Email, Password, CreatedAt, UpdatedAt)
                SELECT %s, Name, %s, Password, CreatedAt, NOW()
                FROM Admin WHERE AdminID = %s
            """, (new_id, new_email, old_id))
            
            print(f"  ✓ Created new record: {new_id} with email {new_email}")
        
        # Delete old records
        for old_id, _, _ in updates:
            cursor.execute("DELETE FROM Admin WHERE AdminID = %s", (old_id,))
            print(f"  ✓ Removed old record: {old_id}")
        
        # Restore foreign key constraints
        print("\n📝 Step 7: Restoring foreign key constraints...")
        for fk_name, table_name in dropped_fks:
            cursor.execute(f"""
                ALTER TABLE {table_name} 
                ADD CONSTRAINT {fk_name} 
                FOREIGN KEY (AdminID) REFERENCES Admin(AdminID)
            """)
            print(f"  ✓ Restored FK: {fk_name} on {table_name}")
        
        # Commit changes
        connection.commit()
        
        print("\n📝 Step 8: Verifying updates...")
        cursor.execute("SELECT AdminID, Name, Email FROM Admin ORDER BY AdminID")
        updated_admins = cursor.fetchall()
        
        print("\n✅ UPDATED ADMIN RECORDS:")
        print("-" * 80)
        for admin in updated_admins:
            print(f"  ID: {admin[0]:<10} | Name: {admin[1]:<20} | Email: {admin[2]}")
        
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

if __name__ == "__main__":
    confirm = input("This will update Admin IDs and emails. Continue? (yes/no): ")
    if confirm.lower() == 'yes':
        update_admin_data()
    else:
        print("Operation cancelled.")
