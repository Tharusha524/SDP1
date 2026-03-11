// inventory.js
const express = require('express');
const router = express.Router();
const { getInventory, updateInventoryItem } = require('../controllers/inventoryController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getInventory);
router.patch('/:id', authenticateToken, authorizeRole('admin', 'staff', 'storekeeper'), updateInventoryItem);

module.exports = router;
