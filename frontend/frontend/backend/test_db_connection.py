#!/usr/bin/env python3
"""
Database Connection Test Script
Tests MySQL database connection using credentials from .env file
"""

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def test_database_connection():
    """Test the MySQL database connection"""
    
    # Get database credentials from environment variables
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', 'root'),
        'database': os.getenv('DB_NAME', 'marukawa_concrete_db')
    }
    
    print("=" * 50)
    print("MySQL Database Connection Test")
    print("=" * 50)
    print(f"Host: {db_config['host']}")
    print(f"User: {db_config['user']}")
    print(f"Database: {db_config['database']}")
    print("=" * 50)
    
    connection = None
    
    try:
        # Attempt to establish connection
        print("\n🔄 Attempting to connect to database...")
        connection = mysql.connector.connect(**db_config)
        
        if connection.is_connected():
            db_info = connection.get_server_info()
            print(f"✅ Successfully connected to MySQL Server version {db_info}")
            
            # Get cursor and execute test query
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE();")
            record = cursor.fetchone()
            print(f"✅ You're connected to database: {record[0]}")
            
            # Test: List all tables in the database
            cursor.execute("SHOW TABLES;")
            tables = cursor.fetchall()
            
            if tables:
                print(f"\n📊 Tables in database ({len(tables)} found):")
                for table in tables:
                    print(f"   - {table[0]}")
            else:
                print("\n⚠️  No tables found in the database")
            
            cursor.close()
            print("\n✅ Database connection test completed successfully!")
            return True
            
    except Error as e:
        print(f"\n❌ Error connecting to MySQL Database: {e}")
        print("\n💡 Common issues:")
        print("   1. MySQL server is not running")
        print("   2. Incorrect credentials in .env file")
        print("   3. Database does not exist")
        print("   4. Firewall blocking connection")
        return False
        
    finally:
        if connection and connection.is_connected():
            connection.close()
            print("\n🔒 Database connection closed")

if __name__ == "__main__":
    try:
        test_database_connection()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
