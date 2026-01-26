// orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Example routes
router.get('/', authenticateToken, authorizeRole('admin', 'staff'), orderController.getAllOrders);

module.exports = router;
