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

// Helper: generate AllocationItemID like RAI-0001
const generateAllocationItemId = async () => {
  try {
    const [rows] = await db.query('SELECT AllocationItemID FROM inventory_allocation_item ORDER BY AllocationItemID DESC LIMIT 100');
    const existingIds = rows.map(r => r.AllocationItemID);
    return generateId('RAI', existingIds, 4);
  } catch (err) {
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `RAI-${random}`;
  }
};

const buildAllocationSelectQuery = () => `
      SELECT ia.AllocationID,
             ia.OrderID,
             NULLIF(
               GROUP_CONCAT(
                 CONCAT(
                   LOWER(inv.InventoryName),
                   ' ',
                   CAST(iai.Quantity AS CHAR),
                   'kg'
                 )
                 ORDER BY inv.InventoryName SEPARATOR ', '
               ),
               ''
             ) AS SummaryText,
             ia.Status,
             ia.AllocatedBy,
             ia.UpdatedAt,
             o.CustomerID,
             COALESCE(c.Name, 'Unknown') AS CustomerName
      FROM inventory_allocation ia
      LEFT JOIN inventory_allocation_item iai ON ia.AllocationID = iai.AllocationID
      LEFT JOIN inventory inv ON iai.InventoryID = inv.InventoryID
      LEFT JOIN orders o ON ia.OrderID = o.OrderID
      LEFT JOIN customer c ON o.CustomerID = c.CustomerID
      GROUP BY ia.AllocationID, ia.OrderID, ia.Status, ia.AllocatedBy, ia.UpdatedAt, o.CustomerID, c.Name
      ORDER BY ia.UpdatedAt DESC
    `;

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

    const [inventoryRows] = await db.query('SELECT InventoryID, LOWER(InventoryName) AS InventoryName FROM inventory');
    const materialInventoryMap = {
      cement: (inventoryRows.find(r => String(r.InventoryName).includes('cement')) || {}).InventoryID,
      sand: (inventoryRows.find(r => String(r.InventoryName).includes('sand')) || {}).InventoryID,
      'stone powder': (inventoryRows.find(r => String(r.InventoryName).includes('stone') || String(r.InventoryName).includes('powder')) || {}).InventoryID
    };

    let savedCount = 0;

    for (const alloc of allocations) {
      const orderId = alloc.orderId;
      if (!orderId) continue;

      // Quantities must be integers in the DB; round any fractional input to nearest integer
      const cement = Math.max(0, Math.round(parseFloat(alloc.cement || 0) || 0));
      const sand = Math.max(0, Math.round(parseFloat(alloc.sand || 0) || 0));
      const stone = Math.max(0, Math.round(parseFloat(alloc.stone || 0) || 0));

      const materials = [];
      if (cement > 0) materials.push({ name: 'cement', qty: cement });
      if (sand > 0) materials.push({ name: 'sand', qty: sand });
      if (stone > 0) materials.push({ name: 'stone powder', qty: stone });

      if (materials.length === 0) continue;

      // If an allocation already exists for this order, update it; otherwise insert new
      const [[existing]] = await db.query(
        'SELECT AllocationID FROM inventory_allocation WHERE OrderID = ? LIMIT 1',
        [orderId]
      );

      let allocationId;
      if (existing && existing.AllocationID) {
        allocationId = existing.AllocationID;
        await db.query(
          'UPDATE inventory_allocation SET AllocatedBy = ?, UpdatedAt = NOW() WHERE AllocationID = ?',
          [userId, allocationId]
        );
      } else {
        allocationId = await generateAllocationId();
        await db.query(
            'INSERT INTO inventory_allocation (AllocationID, OrderID, Status, AllocatedBy) VALUES (?, ?, ?, ?)',
            [allocationId, orderId, 'Allocated', userId]
        );
      }

      await db.query('DELETE FROM inventory_allocation_item WHERE AllocationID = ?', [allocationId]);

      for (const material of materials) {
        const inventoryId = materialInventoryMap[material.name];
        if (!inventoryId) continue;

        const allocationItemId = await generateAllocationItemId();
        const qtyInt = Math.max(0, Math.round(Number(material.qty) || 0));
        await db.query(
          'INSERT INTO inventory_allocation_item (AllocationItemID, AllocationID, InventoryID, Quantity) VALUES (?, ?, ?, ?)',
          [allocationItemId, allocationId, inventoryId, qtyInt]
        );
      }

      savedCount += 1;
    }

    if (savedCount === 0) {
      return res.status(400).json({ success: false, error: 'No valid material quantities provided' });
    }
    // Return current list of allocated inventory summaries so UI can always show all allocations
    const [rows] = await db.query(buildAllocationSelectQuery());

    return res.status(201).json({ success: true, savedCount, allocations: rows, message: 'Inventory allocation summaries saved' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/inventory/allocations
// Returns all allocated inventory summaries so admin can always see history
exports.getInventoryAllocations = async (req, res) => {
  try {
    const [rows] = await db.query(buildAllocationSelectQuery());
    return res.json({ success: true, allocations: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
