#!/usr/bin/env python3
"""
Quick Admin Data Retrieval Script
Fetch all admin data from MySQL database
"""

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from tabulate import tabulate
import json

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

def fetch_admin_data():
    """Fetch all admin data from the database"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        print("\n" + "="*80)
        print("ADMIN DATA RETRIEVAL")
        print("="*80 + "\n")
        
        # 1. Fetch from Admin table
        print("📊 ADMIN TABLE:")
        print("-" * 80)
        cursor.execute("SELECT * FROM Admin")
        admins = cursor.fetchall()
        
        if admins:
            print(tabulate(admins, headers="keys", tablefmt="grid"))
            print(f"\nTotal Admins: {len(admins)}\n")
        else:
            print("No admin records found.\n")
        
        # 2. Fetch admin users from users table
        print("\n📊 USERS TABLE (Admin Role):")
        print("-" * 80)
        cursor.execute("SELECT * FROM users WHERE role = 'admin'")
        admin_users = cursor.fetchall()
        
        if admin_users:
            print(tabulate(admin_users, headers="keys", tablefmt="grid"))
            print(f"\nTotal Admin Users: {len(admin_users)}\n")
        else:
            print("No admin users found in users table.\n")
        
        # 3. Show all tables in database
        print("\n📊 ALL TABLES IN DATABASE:")
        print("-" * 80)
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        table_list = [list(t.values())[0] for t in tables]
        print(", ".join(table_list))
        print(f"\nTotal Tables: {len(table_list)}\n")
        
        # 4. Export to JSON
        export_data = {
            'admins': admins,
            'admin_users': admin_users,
            'tables': table_list
        }
        
        with open('admin_data_export.json', 'w') as f:
            json.dump(export_data, f, indent=2, default=str)
        
        print("\n✅ Data exported to: admin_data_export.json")
        
        return export_data
        
    except Error as e:
        print(f"❌ Database Error: {e}")
        return None
        
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
            print("\n🔌 Database connection closed.\n")

if __name__ == "__main__":
    fetch_admin_data()
