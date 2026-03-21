// orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Customer creates an order
router.post('/', authenticateToken, authorizeRole('customer'), orderController.createOrder);

// Customer views their own orders
router.get('/my', authenticateToken, authorizeRole('customer'), orderController.getMyOrders);

// Customer views a specific order summary
router.get('/:orderId', authenticateToken, authorizeRole('customer'), orderController.getOrderById);

// Admin and staff can view all orders
router.get('/', authenticateToken, authorizeRole('admin', 'staff'), orderController.getAllOrders);

module.exports = router;
