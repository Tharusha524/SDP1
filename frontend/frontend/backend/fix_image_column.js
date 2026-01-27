// Fix Image column size in product table
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixImageColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'marukawa_concrete_db'
  });

  try {
    console.log('Fixing Image column in product table...');
    
    // Change Image column from VARCHAR(255) to LONGTEXT
    await connection.query(`
      ALTER TABLE product 
      MODIFY COLUMN Image LONGTEXT
    `);
    
    console.log('✅ Image column updated to LONGTEXT successfully!');
    console.log('   You can now store large base64 encoded images.');
    
  } catch (error) {
    console.error('❌ Error updating Image column:', error.message);
  } finally {
    await connection.end();
  }
}

fixImageColumn();
