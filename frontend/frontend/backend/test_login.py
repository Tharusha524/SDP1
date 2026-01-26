import mysql.connector
import sys

# Database connection settings
config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'marukawa_concrete_db'
}

def test_connection():
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor(dictionary=True)
        print("✓ Database connection successful!")
        return conn, cursor
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        sys.exit(1)

def test_login(cursor, email, password):
    print(f"\nTesting login for: {email}")
    
    # Check Staff table
    cursor.execute("SELECT StaffID as id, Name, Email, Password, 'staff' as role FROM Staff WHERE Email = %s", (email,))
    row = cursor.fetchone()
    if row:
        print(f"  Found in Staff table: {row['Name']}")
        if row['Password'] == password:
            print(f"  ✓ Password matches!")
            return row
        else:
            print(f"  ✗ Password mismatch. DB has: '{row['Password']}', you entered: '{password}'")
            return None
    
    # Check Admin table
    cursor.execute("SELECT AdminID as id, Name, Email, Password, 'admin' as role FROM Admin WHERE Email = %s", (email,))
    row = cursor.fetchone()
    if row:
        print(f"  Found in Admin table: {row['Name']}")
        if row['Password'] == password:
            print(f"  ✓ Password matches!")
            return row
        else:
            print(f"  ✗ Password mismatch. DB has: '{row['Password']}', you entered: '{password}'")
            return None
    
    # Check Customer table
    cursor.execute("SELECT CustomerID as id, Name, Email, Password, 'customer' as role FROM Customer WHERE Email = %s", (email,))
    row = cursor.fetchone()
    if row:
        print(f"  Found in Customer table: {row['Name']}")
        if row['Password'] == password:
            print(f"  ✓ Password matches!")
            return row
        else:
            print(f"  ✗ Password mismatch. DB has: '{row['Password']}', you entered: '{password}'")
            return None
    
    # Check Storekeeper table
    cursor.execute("SELECT StorekeeperID as id, Name, Email, Password, 'storekeeper' as role FROM Storekeeper WHERE Email = %s", (email,))
    row = cursor.fetchone()
    if row:
        print(f"  Found in Storekeeper table: {row['Name']}")
        if row['Password'] == password:
            print(f"  ✓ Password matches!")
            return row
        else:
            print(f"  ✗ Password mismatch. DB has: '{row['Password']}', you entered: '{password}'")
            return None
    
    print(f"  ✗ User not found in any table!")
    return None

def list_all_users(cursor):
    print("\n=== All Users in Database ===")
    
    tables = ['Admin', 'Staff', 'Customer', 'Storekeeper']
    for table in tables:
        try:
            cursor.execute(f"SELECT Name, Email, Password FROM {table} LIMIT 3")
            rows = cursor.fetchall()
            if rows:
                print(f"\n{table}:")
                for row in rows:
                    print(f"  - {row['Name']} | {row['Email']} | Password: {row['Password']}")
        except Exception as e:
            print(f"  Error reading {table}: {e}")

if __name__ == "__main__":
    conn, cursor = test_connection()
    
    # List all users first
    list_all_users(cursor)
    
    # Test login with kasun
    print("\n=== Testing Login ===")
    result = test_login(cursor, "kasun@cementlk.com", "1234")
    if result:
        print(f"\n✓ LOGIN SUCCESS!")
        print(f"  User: {result['Name']}")
        print(f"  Role: {result['role']}")
    else:
        print(f"\n✗ LOGIN FAILED!")
    
    cursor.close()
    conn.close()
