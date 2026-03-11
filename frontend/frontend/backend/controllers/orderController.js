const db = require('../config/db');

// GET /api/orders — all orders with customer name, items, totals
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.OrderID,
             COALESCE(c.Name, o.CustomerID) AS CustomerName,
             o.OrderDate,
             o.Status,
             COALESCE(SUM(oi.Quantity * oi.Price), 0)   AS TotalPrice,
             COALESCE(SUM(oi.Quantity), 0)               AS TotalQuantity,
             GROUP_CONCAT(CONCAT(p.Name, ' x', oi.Quantity) ORDER BY p.Name SEPARATOR ', ') AS Items
      FROM orders o
      LEFT JOIN customer c  ON o.CustomerID  = c.CustomerID
      LEFT JOIN orderitem oi ON o.OrderID    = oi.OrderID
      LEFT JOIN product p   ON oi.ProductID  = p.ProductID
      GROUP BY o.OrderID, c.Name, o.CustomerID, o.OrderDate, o.Status
      ORDER BY o.OrderDate DESC
    `);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};

