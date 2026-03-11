const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Dashboard stats (admin + staff can view)
router.get('/stats', authenticateToken, authorizeRole('admin', 'staff'), adminController.getDashboardStats);

// Staff directory (admin + staff can view)
router.get('/staff', authenticateToken, authorizeRole('admin', 'staff'), adminController.getAllStaff);

// Tasks (view: admin + staff; create: admin only)
router.get('/tasks', authenticateToken, authorizeRole('admin', 'staff'), adminController.getAllTasks);
router.post('/tasks', authenticateToken, authorizeRole('admin'), adminController.createTask);

// Inventory overview (admin + staff can view)
router.get('/inventory', authenticateToken, authorizeRole('admin', 'staff'), adminController.getInventory);

// Reports (admin only)
router.get('/reports/orders', authenticateToken, authorizeRole('admin'), adminController.getOrdersReport);

// Update order status (admin only)
router.patch('/orders/:id/status', authenticateToken, authorizeRole('admin'), adminController.updateOrderStatus);

module.exports = router;
