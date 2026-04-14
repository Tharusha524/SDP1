// inventory.js
const express = require('express');
const router = express.Router();
const { getInventory, updateInventoryItem, allocateInventorySummary, getInventoryAllocations } = require('../controllers/inventoryController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getInventory);
router.patch('/:id', authenticateToken, authorizeRole('admin', 'staff', 'storekeeper'), updateInventoryItem);
router.post('/allocate', authenticateToken, authorizeRole('admin', 'staff', 'storekeeper'), allocateInventorySummary);
router.get('/allocations', authenticateToken, authorizeRole('admin', 'staff', 'storekeeper'), getInventoryAllocations);

module.exports = router;
