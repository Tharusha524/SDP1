// Test script for Product CRUD operations
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/products';

// Test data
const testProduct = {
  name: 'Test Cement Block',
  description: 'High quality cement block for construction',
  price: 250.00,
  category: 'Construction Materials',
  image: 'https://example.com/cement-block.jpg'
};

async function testProductCRUD() {
  console.log('🧪 Starting Product CRUD Tests...\n');

  try {
    // 1. CREATE - Add new product
    console.log('1️⃣ Testing CREATE (POST /api/products)...');
    const createResponse = await axios.post(BASE_URL, testProduct);
    console.log('✅ Product created:', createResponse.data);
    const productId = createResponse.data.productId;
    console.log(`   Product ID: ${productId}\n`);

    // 2. READ - Get all products
    console.log('2️⃣ Testing READ ALL (GET /api/products)...');
    const getAllResponse = await axios.get(BASE_URL);
    console.log(`✅ Found ${getAllResponse.data.products.length} products`);
    console.log(`   First product: ${getAllResponse.data.products[0]?.Name}\n`);

    // 3. READ - Get single product
    console.log(`3️⃣ Testing READ ONE (GET /api/products/${productId})...`);
    const getOneResponse = await axios.get(`${BASE_URL}/${productId}`);
    console.log('✅ Product retrieved:', getOneResponse.data.product.Name);
    console.log(`   Price: Rs. ${getOneResponse.data.product.Price}\n`);

    // 4. UPDATE - Modify product
    console.log(`4️⃣ Testing UPDATE (PUT /api/products/${productId})...`);
    const updateData = {
      name: 'Updated Cement Block',
      description: 'Premium grade cement block',
      price: 300.00,
      category: 'Premium Materials',
      image: testProduct.image
    };
    const updateResponse = await axios.put(`${BASE_URL}/${productId}`, updateData);
    console.log('✅ Product updated:', updateResponse.data);

    // Verify update
    const verifyUpdate = await axios.get(`${BASE_URL}/${productId}`);
    console.log(`   Updated name: ${verifyUpdate.data.product.Name}`);
    console.log(`   Updated price: Rs. ${verifyUpdate.data.product.Price}\n`);

    // 5. DELETE - Remove product
    console.log(`5️⃣ Testing DELETE (DELETE /api/products/${productId})...`);
    const deleteResponse = await axios.delete(`${BASE_URL}/${productId}`);
    console.log('✅ Product deleted:', deleteResponse.data);

    // Verify deletion
    const verifyDelete = await axios.get(BASE_URL);
    const stillExists = verifyDelete.data.products.find(p => p.ProductID === productId);
    if (!stillExists) {
      console.log('   ✅ Product successfully removed from active products\n');
    } else {
      console.log('   ⚠️ Product still appears in active products\n');
    }

    console.log('🎉 All CRUD tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run tests
testProductCRUD();
