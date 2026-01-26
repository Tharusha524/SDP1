// simple_jwt_test.js
const axios = require('axios');

async function test() {
  try {
    console.log('Testing JWT authentication...\n');
    
    // Login
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'akindu789@gmail.com',
      password: 'Customer@123'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', loginRes.data.token.substring(0, 50) + '...');
    console.log('User:', loginRes.data.user);
    console.log('\n🎉 JWT TOKEN IS WORKING!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

test();
