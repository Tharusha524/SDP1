// Controller for product-related HTTP handlers.
// Exposes CRUD endpoints used by the API to manage product records.
const Product = require('../models/Product');

// Get all products
// Returns a JSON array of products. Simple passthrough to the model.
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json({ success: true, products });
  } catch (err) {
    // Unexpected error -> 500
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single product
// Finds a product by `id` param and returns it, or 404 when missing.
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      // No matching product -> 404
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    // Unexpected error -> 500
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create new product
// Validates request body, enforces business constraints (min price, required image)
// and delegates creation to the Product model. Returns 201 with new productId.
exports.createProduct = async (req, res) => {
  const { name, description, price, image } = req.body;
  
  console.log('Creating product with data:', { name, price, hasImage: !!image });

  // Basic sanitization and normalization
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanDescription = typeof description === 'string' ? description.trim() : '';
  const numericPrice = Number(price);
  const cleanImage = typeof image === 'string' ? image.trim() : '';

  // Validate required string fields
  if (!cleanName || !cleanDescription) {
    console.error('Validation failed: Missing name or description');
    return res.status(400).json({ success: false, error: 'Name and description are required' });
  }

  // Validate numeric price
  if (!Number.isFinite(numericPrice)) {
    console.error('Validation failed: Invalid price');
    return res.status(400).json({ success: false, error: 'Valid price is required' });
  }

  // Business rule: minimum price enforced
  if (numericPrice < 1000) {
    console.error('Validation failed: Price below minimum');
    return res.status(400).json({ success: false, error: 'Price must be at least Rs. 1000.00' });
  }

  // Image is required for product listings
  if (!cleanImage) {
    console.error('Validation failed: Missing image');
    return res.status(400).json({ success: false, error: 'Product image is required' });
  }

  try {
    // Delegate creation to model layer and return 201 on success
    const productId = await Product.create({ name: cleanName, description: cleanDescription, price: numericPrice, image: cleanImage });
    console.log('Product created successfully:', productId);
    res.status(201).json({ success: true, productId, message: 'Product created successfully' });
  } catch (err) {
    // Log error and return generic 500 response
    console.error('Error creating product:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update product
// Validates input similarly to creation, then updates the product by id.
exports.updateProduct = async (req, res) => {
  const { name, description, price, image } = req.body;

  // Normalize inputs
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanDescription = typeof description === 'string' ? description.trim() : '';
  const numericPrice = Number(price);
  const cleanImage = typeof image === 'string' ? image.trim() : '';

  // Validate required fields
  if (!cleanName || !cleanDescription) {
    return res.status(400).json({ success: false, error: 'Name and description are required' });
  }

  if (!Number.isFinite(numericPrice)) {
    return res.status(400).json({ success: false, error: 'Valid price is required' });
  }

  if (numericPrice < 1000) {
    return res.status(400).json({ success: false, error: 'Price must be at least Rs. 1000.00' });
  }

  if (!cleanImage) {
    return res.status(400).json({ success: false, error: 'Product image is required' });
  }

  try {
    // Attempt update and return 404 when the product does not exist
    const updated = await Product.update(req.params.id, { name: cleanName, description: cleanDescription, price: numericPrice, image: cleanImage });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete product
// Uses a `safeDelete` helper in the model to avoid breaking foreign key
// constraints: attempt hard delete if unused, otherwise mark as inactive.
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
