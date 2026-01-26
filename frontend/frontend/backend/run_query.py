#!/usr/bin/env python3
"""
Custom SQL Query Runner
Execute custom SQL queries on the MySQL database
"""

import mysql.connector
from mysql.connector import Error
import os
import sys
from dotenv import load_dotenv
from tabulate import tabulate

# Load environment variables from .env file
load_dotenv()

def get_db_connection():
    """Create and return a database connection"""
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', 'root'),
        'database': os.getenv('DB_NAME', 'marukawa_concrete_db')
    }
    return mysql.connector.connect(**db_config)

def execute_query(query, params=None):
    """Execute a custom SQL query and return results"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Execute the query
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        # Check if it's a SELECT query or other query type
        if query.strip().upper().startswith('SELECT') or query.strip().upper().startswith('SHOW') or query.strip().upper().startswith('DESCRIBE'):
            # Fetch results for SELECT queries
            results = cursor.fetchall()
            column_names = [desc[0] for desc in cursor.description]
            return {
                'type': 'select',
                'columns': column_names,
                'rows': results,
                'count': len(results)
            }
        else:
            # For INSERT, UPDATE, DELETE, etc.
            connection.commit()
            return {
                'type': 'modify',
                'affected_rows': cursor.rowcount,
                'last_insert_id': cursor.lastrowid
            }
            
    except Error as e:
        return {
            'type': 'error',
            'message': str(e)
        }
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

def display_results(result):
    """Display query results in a formatted way"""
    if result['type'] == 'error':
        print(f"\n❌ Error executing query: {result['message']}")
        return
    
    if result['type'] == 'select':
        if result['count'] > 0:
            print(f"\n✅ Query executed successfully! ({result['count']} rows returned)")
            print("\n" + tabulate(result['rows'], headers=result['columns'], tablefmt='grid'))
        else:
            print("\n✅ Query executed successfully! (0 rows returned)")
            print("No data found.")
    
    elif result['type'] == 'modify':
        print(f"\n✅ Query executed successfully!")
        print(f"   Affected rows: {result['affected_rows']}")
        if result['last_insert_id'] > 0:
            print(f"   Last insert ID: {result['last_insert_id']}")

def run_interactive_mode():
    """Run queries in interactive mode"""
    print("=" * 70)
    print("MySQL Custom Query Runner - Interactive Mode")
    print("=" * 70)
    print(f"Database: {os.getenv('DB_NAME', 'marukawa_concrete_db')}")
    print("Type 'exit' or 'quit' to exit")
    print("Type 'help' for example queries")
    print("=" * 70)
    
    while True:
        try:
            print("\n")
            query = input("SQL> ").strip()
            
            if not query:
                continue
                
            if query.lower() in ['exit', 'quit', 'q']:
                print("\n👋 Goodbye!")
                break
            
            if query.lower() == 'help':
                print("\n📚 Example Queries:")
                print("   SELECT * FROM users;")
                print("   SELECT * FROM products WHERE price > 100;")
                print("   INSERT INTO users (name, email) VALUES ('John', 'john@example.com');")
                print("   UPDATE users SET name = 'Jane' WHERE id = 1;")
                print("   DELETE FROM users WHERE id = 1;")
                print("   SHOW TABLES;")
                print("   DESCRIBE users;")
                continue
            
            # Execute the query
            result = execute_query(query)
            display_results(result)
            
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")

def run_single_query(query):
    """Run a single query from command line argument"""
    print("=" * 70)
    print("MySQL Custom Query Runner")
    print("=" * 70)
    print(f"Database: {os.getenv('DB_NAME', 'marukawa_concrete_db')}")
    print(f"Query: {query}")
    print("=" * 70)
    
    result = execute_query(query)
    display_results(result)

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) > 1:
        # Run single query from command line
        query = ' '.join(sys.argv[1:])
        run_single_query(query)
    else:
        # Run in interactive mode
        run_interactive_mode()

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)
