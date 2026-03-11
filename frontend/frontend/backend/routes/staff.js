const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Get tasks assigned to logged-in staff member
router.get('/tasks', authenticateToken, authorizeRole('staff', 'admin'), staffController.getMyTasks);

// Mark a task as completed
router.patch('/tasks/:id/complete', authenticateToken, authorizeRole('staff', 'admin'), staffController.completeTask);

// Update order status
router.patch('/orders/:id/status', authenticateToken, authorizeRole('staff', 'admin'), staffController.updateOrderStatus);

module.exports = router;
