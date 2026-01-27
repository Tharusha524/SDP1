// products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Public routes (anyone can view products)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin-only routes (create, update, delete)
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
