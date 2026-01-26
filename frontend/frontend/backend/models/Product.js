const db = require('../config/db');
const { generateProductId } = require('../utils/idGenerator');

const Product = {
  create: async (productData) => {
    const { name, price, stock } = productData;
    const productId = await generateProductId(db);
    
    const [result] = await db.query(
      'INSERT INTO products (id, name, price, stock) VALUES (?, ?, ?, ?)',
      [productId, name, price, stock]
    );
    return productId;
  },

  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM products');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  },

  updateStock: async (id, quantity) => {
    const [result] = await db.query(
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [quantity, id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Product;
