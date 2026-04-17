const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  const { name, description, price, image } = req.body;
  
  console.log('Creating product with data:', { name, price, hasImage: !!image });
  
  if (!name || !price) {
    console.error('Validation failed: Missing name or price');
    return res.status(400).json({ success: false, error: 'Name and price are required' });
  }

  try {
    const productId = await Product.create({ name, description, price, image });
    console.log('Product created successfully:', productId);
    res.status(201).json({ success: true, productId, message: 'Product created successfully' });
  } catch (err) {
    console.error('Error creating product:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  const { name, description, price, image } = req.body;
  
  try {
    const updated = await Product.update(req.params.id, { name, description, price, image });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    console.log('Deleting product:', req.params.id);
    // Safely delete: hard delete if not used in any order items,
    // otherwise soft delete to avoid foreign key constraint errors.
    const deleted = await Product.safeDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    console.log('✅ Product deleted (hard or soft, depending on usage)');
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
