const db = require('./config/db');
const { generateProductId } = require('./utils/idGenerator');

(async () => {
  const connection = await db.getConnection();
  try {
    const productId = await generateProductId(connection);
    
    console.log('Creating test product with ID:', productId);
    
    await connection.query(
      `INSERT INTO product (ProductID, Name, Description, Price) 
       VALUES (?, ?, ?, ?)`,
      [productId, 'Test Cement Bag', 'High quality cement for testing', 5000.00]
    );
    
    console.log('Product created successfully');
    console.log('Product ID:', productId);
    console.log('Name: Test Cement Bag');
    console.log('Price: Rs. 5000.00');
    
  } catch (err) {
    console.error('Error creating product:', err.message);
  } finally {
    await connection.release();
  }
})();
