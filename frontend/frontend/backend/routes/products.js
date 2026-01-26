// products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Example: Get all products (protected route)
router.get('/', authenticateToken, authorizeRole('admin', 'staff', 'storekeeper'), productController.getAllProducts);

// Add more product routes as needed

module.exports = router;
