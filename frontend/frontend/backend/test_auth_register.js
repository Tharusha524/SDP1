// test_auth_register.js
const User = require('./models/User');

async function testRegistration() {
  try {
    console.log('Testing registration with User model...\n');
    
    const userData = {
      name: 'akindu perera',
      email: 'akindu789@gmail.com',
      contact: '0778597745',
      password: '$2b$10$hashedPasswordExample', // Already hashed
      role: 'customer'
    };

    console.log('User data:', userData);
    
    // Check if exists
    const existing = await User.findByUsername(userData.email);
    if (existing) {
      console.log('\n❌ User already exists!');
      console.log('Existing user:', existing);
      process.exit(0);
    }

    const userId = await User.create(userData);
    
    console.log('\n✅ Registration successful!');
    console.log('User ID:', userId);
    console.log('\nYou can now login with:');
    console.log('  Email: akindu789@gmail.com');
    console.log('  Password: Akindu@123');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Registration failed!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testRegistration();
