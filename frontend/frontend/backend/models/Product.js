const db = require('../config/db');
const { generateProductId } = require('../utils/idGenerator');

const Product = {
  // Create new product
  create: async (productData) => {
    const { name, description, price, image } = productData;
    const productId = await generateProductId(db);
    
    const [result] = await db.query(
      'INSERT INTO product (ProductID, Name, Description, Price, Image, IsActive) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, name, description, price, image || null, 1]
    );
    return productId;
  },

  // Get all products
  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM product WHERE IsActive = 1 ORDER BY CreatedAt DESC');
    return rows;
  },

  // Get product by ID
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM product WHERE ProductID = ?', [id]);
    return rows[0];
  },

  // Update product
  update: async (id, productData) => {
    const { name, description, price, image } = productData;
    const [result] = await db.query(
      'UPDATE product SET Name = ?, Description = ?, Price = ?, Image = ? WHERE ProductID = ?',
      [name, description, price, image, id]
    );
    return result.affectedRows > 0;
  },

  // Delete product (permanent delete from database)
  delete: async (id) => {
    const [result] = await db.query(
      'DELETE FROM product WHERE ProductID = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // Soft delete (if needed - keeps data but marks inactive)
  softDelete: async (id) => {
    const [result] = await db.query(
      'UPDATE product SET IsActive = 0 WHERE ProductID = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // Hard delete (if needed)
  hardDelete: async (id) => {
    const [result] = await db.query(
      'DELETE FROM product WHERE ProductID = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // Safely delete product: remove related order items first, then delete product row
  safeDelete: async (id) => {
    // Delete any order items that reference this product to avoid FK constraint errors
    await db.query(
      'DELETE FROM orderitem WHERE ProductID = ?',
      [id]
    );

    const [hardRes] = await db.query(
      'DELETE FROM product WHERE ProductID = ?',
      [id]
    );
    return hardRes.affectedRows > 0;
  }
};

module.exports = Product;
