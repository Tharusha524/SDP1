const db = require('../config/db');
const { generateNotificationId, generateId } = require('../utils/idGenerator');

// GET /api/inventory
// Returns the three core raw-material inventory rows (cement, sand, stone powder)
exports.getInventory = async (req, res) => {
  try {
    const [inventory] = await db.query(`
      SELECT InventoryID,
             InventoryName,
             AvailableQuantity,
             MinimumThreshold,
             LastUpdated
      FROM inventory
      ORDER BY InventoryID
    `);
    res.json({ success: true, inventory });
  } catch (err) {
    console.error('Error loading inventory:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/inventory/:id
exports.updateInventoryItem = async (req, res) => {
  const qty = parseInt(req.body.quantity);
  if (isNaN(qty) || qty < 0) {
    return res.status(400).json({ success: false, error: 'Valid non-negative quantity required' });
  }
  try {
    const [result] = await db.query(
      'UPDATE inventory SET AvailableQuantity = ?, LastUpdated = NOW(), UpdatedBy = ? WHERE InventoryID = ?',
      [qty, req.user.id, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }

    // Check if new qty is at or below threshold -> insert one shared Low Stock Alert for admin dashboards
    const [[item]] = await db.query(
      'SELECT InventoryName, MinimumThreshold FROM inventory WHERE InventoryID = ?',
      [req.params.id]
    );
    if (item && qty <= item.MinimumThreshold) {
      const message = `Low stock alert: ${item.InventoryName} quantity (${qty}) is at or below threshold (${item.MinimumThreshold})`;

      const notifId = await generateNotificationId(db);
      await db.query(
        `INSERT INTO notification (NotificationID, Message, Type, ReceiverID, IsRead, RelatedID) VALUES (?, ?, 'Low Stock Alert', NULL, 0, ?)`,
        [
          notifId,
          message,
          req.params.id
        ]
      );
    }

    res.json({ success: true, message: 'Inventory updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Helper: generate AllocationID like RA-0001
const generateAllocationId = async () => {
  try {
    const [rows] = await db.query('SELECT AllocationID FROM inventory_allocation ORDER BY AllocationID DESC LIMIT 100');
    const existingIds = rows.map(r => r.AllocationID);
    return generateId('RA', existingIds, 4);
  } catch (err) {
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `RA-${random}`;
  }
};

// POST /api/inventory/allocate
// Body: { allocations: [ { orderId, cement, sand, stone } ] }
exports.allocateInventorySummary = async (req, res) => {
  const { allocations } = req.body || {};
  if (!Array.isArray(allocations) || allocations.length === 0) {
    return res.status(400).json({ success: false, error: 'allocations array is required' });
  }

  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    let savedCount = 0;

    for (const alloc of allocations) {
      const orderId = alloc.orderId;
      if (!orderId) continue;

      const cement = parseFloat(alloc.cement || 0) || 0;
      const sand = parseFloat(alloc.sand || 0) || 0;
      const stone = parseFloat(alloc.stone || 0) || 0;

      const materials = [];
      if (cement > 0) materials.push({ name: 'cement', qty: cement, unit: 'kg' });
      if (sand > 0) materials.push({ name: 'sand', qty: sand, unit: 'kg' });
      if (stone > 0) materials.push({ name: 'stone powder', qty: stone, unit: 'kg' });

      if (materials.length === 0) continue;

      const summaryText = `${orderId} - ` + materials
        .map(m => `${m.name} ${m.qty}${m.unit}`)
        .join(', ');

      // If an allocation already exists for this order, update it; otherwise insert new
      const [[existing]] = await db.query(
        'SELECT AllocationID FROM inventory_allocation WHERE OrderID = ? LIMIT 1',
        [orderId]
      );

      if (existing && existing.AllocationID) {
        await db.query(
          'UPDATE inventory_allocation SET SummaryText = ?, AllocatedBy = ?, UpdatedAt = NOW() WHERE AllocationID = ?',
          [summaryText, userId, existing.AllocationID]
        );
      } else {
        const allocationId = await generateAllocationId();
        await db.query(
            'INSERT INTO inventory_allocation (AllocationID, OrderID, SummaryText, Status, AllocatedBy) VALUES (?, ?, ?, ?, ?)',
            [allocationId, orderId, summaryText, 'Allocated', userId]
        );
      }

      savedCount += 1;
    }

    if (savedCount === 0) {
      return res.status(400).json({ success: false, error: 'No valid material quantities provided' });
    }
    // Return current list of allocated inventory summaries so UI can always show all allocations
    const [rows] = await db.query(
          `SELECT ia.AllocationID, ia.OrderID, ia.SummaryText, ia.Status,
            ia.AllocatedBy, ia.UpdatedAt,
            o.CustomerID,
            COALESCE(c.Name, 'Unknown') AS CustomerName
       FROM inventory_allocation ia
           LEFT JOIN orders o ON ia.OrderID = o.OrderID
           LEFT JOIN customer c ON o.CustomerID = c.CustomerID
       ORDER BY ia.UpdatedAt DESC`
    );

    return res.status(201).json({ success: true, savedCount, allocations: rows, message: 'Inventory allocation summaries saved' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/inventory/allocations
// Returns all allocated inventory summaries so admin can always see history
exports.getInventoryAllocations = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ia.AllocationID, ia.OrderID, ia.SummaryText, ia.Status,
              ia.AllocatedBy, ia.UpdatedAt,
              o.CustomerID,
              COALESCE(c.Name, 'Unknown') AS CustomerName
       FROM inventory_allocation ia
       LEFT JOIN orders o ON ia.OrderID = o.OrderID
       LEFT JOIN customer c ON o.CustomerID = c.CustomerID
       ORDER BY ia.UpdatedAt DESC`
    );
    return res.json({ success: true, allocations: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
