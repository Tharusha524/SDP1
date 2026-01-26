// direct_register_test.js
const db = require('./config/db');
const bcrypt = require('bcrypt');
const { generateUserId } = require('./utils/idGenerator');

const SALT_ROUNDS = 10;

async function testRegistration() {
  const connection = await db.getConnection();
  
  try {
    console.log('Testing registration for: akindu perera');
    console.log('Email: akindu789@gmail.com');
    console.log('Role: customer\n');

    // Check if user exists
    const [existing] = await connection.query(
      'SELECT * FROM users WHERE username = ?',
      ['akindu789@gmail.com']
    );
    
    if (existing.length > 0) {
      console.log('❌ User already exists!');
      console.log('Existing user:', existing[0]);
      connection.release();
      await db.end();
      return;
    }

    await connection.beginTransaction();

    // Generate user ID
    const userId = await generateUserId(connection);
    console.log('Generated User ID:', userId);

    // Hash password
    const hashedPassword = await bcrypt.hash('Akindu@123', SALT_ROUNDS);
    console.log('Password hashed: ✓');

    // Insert into users table
    await connection.query(
      'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
      [userId, 'akindu789@gmail.com', hashedPassword, 'customer']
    );
    console.log('Inserted into users table: ✓');

    // Insert into Customer table
    await connection.query(
      'INSERT INTO Customer (Name, Email, Password, ContactNo, Address) VALUES (?, ?, ?, ?, ?)',
      ['akindu perera', 'akindu789@gmail.com', hashedPassword, '0778597745', 'TBD']
    );
    console.log('Inserted into Customer table: ✓');

    await connection.commit();
    console.log('\n✅ Registration successful!');
    console.log('User ID:', userId);
    console.log('\nYou can now login with:');
    console.log('  Email: akindu789@gmail.com');
    console.log('  Password: Akindu@123');

  } catch (error) {
    await connection.rollback();
    console.error('\n❌ Registration failed!');
    console.error('Error:', error.message);
  } finally {
    connection.release();
    await db.end();
  }
}

testRegistration();
