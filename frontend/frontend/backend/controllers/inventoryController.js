const db = require('../config/db');
const { generateNotificationId } = require('../utils/idGenerator');

// GET /api/inventory
exports.getInventory = async (req, res) => {
  try {
    const [inventory] = await db.query(`
      SELECT i.InventoryID,
             i.InventoryName,
             i.AvailableQuantity,
             i.MinimumThreshold,
             i.LastUpdated
      FROM inventory i
      ORDER BY i.InventoryID
    `);
    res.json({ success: true, inventory });
  } catch (err) {
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

    // Check if new qty is at or below threshold -> insert Low Stock Alert notification for all admins
    const [[item]] = await db.query(
      'SELECT InventoryName, MinimumThreshold FROM inventory WHERE InventoryID = ?',
      [req.params.id]
    );
    if (item && qty <= item.MinimumThreshold) {
      const [admins] = await db.query("SELECT ID FROM users WHERE Role = 'admin'");
      for (const admin of admins) {
        const notifId = await generateNotificationId(db);
        await db.query(
          `INSERT INTO notification (NotificationID, Message, Type, ReceiverID, IsRead, RelatedID) VALUES (?, ?, 'Low Stock Alert', ?, 0, ?)`,
          [
            notifId,
            `Low stock alert: ${item.InventoryName} quantity (${qty}) is at or below threshold (${item.MinimumThreshold})`,
            admin.ID,
            req.params.id
          ]
        );
      }
    }

    res.json({ success: true, message: 'Inventory updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
