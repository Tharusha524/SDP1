// final_test_login.js
const http = require('http');

const testLogin = (email, password) => {
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
        console.log(`\n🔐 Login Test for: ${email}`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response:`, JSON.parse(body));
        resolve();
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

(async () => {
  try {
    await testLogin('akindu789@gmail.com', 'Akindu@123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
