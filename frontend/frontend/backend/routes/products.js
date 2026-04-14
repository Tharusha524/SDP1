// products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Public routes (anyone can view products)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin-only routes (create, update, delete)
router.post('/', authenticateToken, authorizeRole('admin'), productController.createProduct);
router.put('/:id', authenticateToken, authorizeRole('admin'), productController.updateProduct);
router.delete('/:id', authenticateToken, authorizeRole('admin'), productController.deleteProduct);

module.exports = router;
