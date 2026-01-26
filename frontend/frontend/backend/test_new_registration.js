// test_new_registration.js
const User = require('./models/User');
const bcrypt = require('bcrypt');

async function testNewRegistration() {
  try {
    console.log('🧪 Testing NEW registration with unified ID system...\n');
    
    const testUser = {
      name: 'Test Unified User',
      email: 'testunified@example.com',
      contact: '0771234567',
      password: await bcrypt.hash('TestUser@123', 10),
      role: 'customer'
    };

    console.log('Registering:', testUser.name);
    console.log('Email:', testUser.email);
    console.log('Role:', testUser.role);
    
    const userId = await User.create(testUser);
    
    console.log('\n✅ Registration successful!');
    console.log(`📝 Generated ID: ${userId}`);
    console.log('🔑 Login credentials:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: TestUser@123`);
    
    // Verify in both tables
    const userRecord = await User.findByUsername(testUser.email);
    console.log('\n✓ Verified in users table:', userRecord.id);
    
    const db = require('./config/db');
    const [customer] = await db.query('SELECT CustomerID FROM Customer WHERE Email = ?', [testUser.email]);
    console.log('✓ Verified in Customer table:', customer[0].CustomerID);
    console.log('\n🎉 BOTH TABLES USE THE SAME ID!');
    
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testNewRegistration();
