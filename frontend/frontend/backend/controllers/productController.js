const Product = require('../models/Product');

// Handles product logic
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  const { name, price, stock } = req.body;
  try {
    const productId = await Product.create({ name, price, stock });
    res.json({ success: true, productId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
