const axios = require('axios');

async function testPaymentAPI() {
  try {
    // First, we need to login to get a token
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'akindu',
      password: 'password123'
    });

    console.log('Login successful:', loginRes.data);
    const token = loginRes.data.token;

    // Now test the payment endpoint
    const paymentRes = await axios.post(
      'http://localhost:5000/api/payments/card-direct',
      {
        productId: 'PROD001',
        quantity: 2,
        details: 'Test payment'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Payment successful:', paymentRes.data);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testPaymentAPI();
