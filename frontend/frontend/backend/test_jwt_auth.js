// test_jwt_auth.js
const http = require('http');

// Step 1: Login and get JWT token
function login(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const response = JSON.parse(body);
        console.log('\n🔐 LOGIN TEST');
        console.log('Email:', email);
        console.log('Status:', res.statusCode);
        console.log('Token:', response.token ? response.token.substring(0, 50) + '...' : 'None');
        console.log('User:', response.user);
        resolve(response);
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Step 2: Test protected route with token
function testProtectedRoute(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        console.log('\n🔒 PROTECTED ROUTE TEST');
        console.log('Endpoint: /api/products');
        console.log('Status:', res.statusCode);
        console.log('Token sent:', token ? 'Yes' : 'No');
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Step 3: Test without token (should fail)
function testWithoutToken() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        console.log('\n⛔ NO TOKEN TEST');
        console.log('Endpoint: /api/products');
        console.log('Status:', res.statusCode);
        console.log('Expected: 401 or data (if not protected)');
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Run tests
(async () => {
  try {
    console.log('🧪 JWT AUTHENTICATION TEST\n');
    console.log('=' .repeat(50));
    
    // Test 1: Login
    const loginResponse = await login('akindu789@gmail.com', 'Customer@123');
    
    if (!loginResponse.success) {
      console.log('\n❌ Login failed:', loginResponse.message);
      process.exit(1);
    }
    
    if (loginResponse.token === 'dummy-token-replace-with-jwt') {
      console.log('\n⚠️  WARNING: Still using dummy token!');
    } else {
      console.log('\n✅ Real JWT token generated!');
    }
    
    // Test 2: Use token on protected route
    await testProtectedRoute(loginResponse.token);
    
    // Test 3: Try without token
    await testWithoutToken();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ JWT Authentication Tests Complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
})();
