const db = require('./frontend/frontend/backend/config/db');
const bcrypt = require('bcrypt');
const { generateUserId, generateCustomerId } = require('./frontend/frontend/backend/utils/idGenerator');

(async () => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Generate IDs  
    const userId = await generateUserId(connection);
    const customerId = await generateCustomerId(connection);
    
    console.log('Generated User ID:', userId);
    console.log('Generated Customer ID:', customerId);

    // Hash password
    const hashedPassword = await bcrypt.hash('customer123', 10);

    // Insert into users table
    await connection.query(
      'INSERT INTO users (id, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)',
      [userId, 'testcustomer@marukawa.com', hashedPassword, 'customer', 1]
    );
    console.log('User created in users table');

    // Insert into customer table
    await connection.query(
      'INSERT INTO customer (CustomerID, Name, Email, Password, ContactNo, Address) VALUES (?, ?, ?, ?, ?, ?)',
      [customerId, 'Test Customer', 'testcustomer@marukawa.com', hashedPassword, '0771234567', 'Test Address']
    );
    console.log('Customer created in customer table');

    await connection.commit();
    console.log('\n✓ Test customer account created successfully');
    console.log('Email: testcustomer@marukawa.com');
    console.log('Password: customer123');

  } catch (err) {
    await connection.rollback();
    console.error('Error:', err.message);
  } finally {
    await connection.release();
  }
})();
