const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const customerController = require('../controllers/customerController');

// Logged-in customer profile
router.get('/me', authenticateToken, authorizeRole('customer'), customerController.getMyProfile);

module.exports = router;
