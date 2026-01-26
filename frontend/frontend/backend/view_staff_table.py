import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

def view_staff_table():
    try:
        # Connect to database
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', '127.0.0.1'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', 'root'),
            database=os.getenv('DB_NAME', 'SDP')
        )
        
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            
            # Get all records from staff table
            cursor.execute("SELECT * FROM staff")
            staff_records = cursor.fetchall()
            
            if staff_records:
                print("\n" + "="*100)
                print("STAFF TABLE")
                print("="*100)
                print(f"\nTotal Records: {len(staff_records)}\n")
                
                # Print each record
                for i, record in enumerate(staff_records, 1):
                    print(f"\n--- Record {i} ---")
                    for key, value in record.items():
                        print(f"{key:20s}: {value}")
                
                print("\n" + "="*100)
            else:
                print("\nNo records found in the staff table.")
            
            cursor.close()
            
    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection and connection.is_connected():
            connection.close()
            print("\nDatabase connection closed.")

if __name__ == "__main__":
    view_staff_table()
