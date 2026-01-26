import mysql.connector
import bcrypt

# Generate bcrypt hash for "1234"
password_hash = bcrypt.hashpw('1234'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
print(f"Generated hash: {password_hash}")

# Connect to database
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='root',
    database='marukawa_concrete_db'
)

cursor = conn.cursor()

# Update Staff table
query = "UPDATE Staff SET Name = %s, Password = %s WHERE Email = %s"
values = ('kasun jayasena', password_hash, 'kasun@cementlk.com')

cursor.execute(query, values)
conn.commit()

print(f"Updated {cursor.rowcount} row(s)")

# Verify the update
cursor.execute("SELECT Name, Email, Password FROM Staff WHERE Email = 'kasun@cementlk.com'")
result = cursor.fetchone()
print(f"\nVerification:")
print(f"Name: {result[0]}")
print(f"Email: {result[1]}")
print(f"Password Hash: {result[2]}")

# Test the password
if bcrypt.checkpw('1234'.encode('utf-8'), result[2].encode('utf-8')):
    print("\n✅ Password '1234' verification: SUCCESS")
else:
    print("\n❌ Password '1234' verification: FAILED")

cursor.close()
conn.close()
