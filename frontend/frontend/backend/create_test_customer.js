const db = require('./config/db');
const bcrypt = require('bcrypt');
const { generateCustomerId } = require('./utils/idGenerator');

(async () => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Use a SINGLE ID for both tables (unified ID system)
    const customerId = await generateCustomerId(connection);
    
    console.log('Generated Customer ID:', customerId);

    // Hash password
    const hashedPassword = await bcrypt.hash('customer123', 10);

    // Insert into users table with same ID
    await connection.query(
      'INSERT INTO users (id, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)',
      [customerId, 'testcustomer@marukawa.com', hashedPassword, 'customer', 1]
    );
    console.log('User created in users table with ID:', customerId);

    // Insert into customer table with SAME ID
    await connection.query(
      'INSERT INTO customer (CustomerID, Name, Email, Password, ContactNo, Address) VALUES (?, ?, ?, ?, ?, ?)',
      [customerId, 'Test Customer', 'testcustomer@marukawa.com', hashedPassword, '0771234567', 'Test Address']
    );
    console.log('Customer created in customer table with ID:', customerId);

    await connection.commit();
    console.log('\nTest customer account created successfully with unified ID');
    console.log('Email: testcustomer@marukawa.com');
    console.log('Password: customer123');
    console.log('Customer ID: ' + customerId);

  } catch (err) {
    await connection.rollback();
    console.error('Error:', err.message);
  } finally {
    await connection.release();
  }
})();
