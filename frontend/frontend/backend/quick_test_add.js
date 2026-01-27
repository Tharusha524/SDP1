// Quick test to add a product via API
const axios = require('axios');

async function testAddProduct() {
  try {
    console.log('Testing product creation...');
    
    const testProduct = {
      name: 'Test Product',
      description: 'Test description',
      price: 100.00,
      category: 'Test Category',
      image: null  // No image for now
    };

    const response = await axios.post('http://localhost:5000/api/products', testProduct);
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Full error:', error.response.data);
    }
  }
}

testAddProduct();
