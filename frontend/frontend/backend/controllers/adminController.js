const db = require('../config/db');
const { generateTaskId } = require('../utils/idGenerator');

// GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ totalOrders }]] = await db.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ totalRevenue }]] = await db.query('SELECT COALESCE(SUM(Quantity * Price), 0) AS totalRevenue FROM orderitem');
    const [[{ pendingTasks }]] = await db.query("SELECT COUNT(*) AS pendingTasks FROM task WHERE Status = 'Pending'");
    const [[{ activeInventory }]] = await db.query('SELECT COALESCE(SUM(AvailableQuantity), 0) AS activeInventory FROM inventory');

    const [recentOrders] = await db.query(`
      SELECT o.OrderID,
             COALESCE(c.Name, 'Unknown') AS CustomerName,
             o.OrderDate,
             o.Status,
             COALESCE(SUM(oi.Quantity * oi.Price), 0) AS TotalPrice,
             GROUP_CONCAT(CONCAT(p.Name, ' x', oi.Quantity) ORDER BY p.Name SEPARATOR ', ') AS Items
      FROM orders o
      LEFT JOIN customer c ON o.CustomerID = c.CustomerID
      LEFT JOIN orderitem oi ON o.OrderID = oi.OrderID
      LEFT JOIN product p ON oi.ProductID = p.ProductID
      GROUP BY o.OrderID, c.Name, o.OrderDate, o.Status
      ORDER BY o.OrderDate DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        totalOrders: Number(totalOrders),
        totalRevenue: Number(totalRevenue),
        pendingTasks: Number(pendingTasks),
        activeInventory: Number(activeInventory)
      },
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/staff
exports.getAllStaff = async (req, res) => {
  try {
    const [staff] = await db.query('SELECT StaffID, Name, ContactNo, Status FROM staff ORDER BY Name');
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/tasks
exports.getAllTasks = async (req, res) => {
  try {
    const [tasks] = await db.query(`
      SELECT t.TaskID,
             t.StaffID,
             COALESCE(s.Name, t.StaffID) AS StaffName,
             t.Description,
             t.Status,
             t.Priority,
             t.AssignedDate
      FROM task t
      LEFT JOIN staff s ON t.StaffID = s.StaffID
      ORDER BY t.AssignedDate DESC
    `);
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/admin/tasks
exports.createTask = async (req, res) => {
  const { staffId, description, priority } = req.body;
  if (!staffId || !description || !description.trim()) {
    return res.status(400).json({ success: false, error: 'staffId and description are required' });
  }
  try {
    const taskId = await generateTaskId(db);
    const adminId = req.user.id || null;
    await db.query(
      "INSERT INTO task (TaskID, AdminID, StaffID, Description, Status, Priority) VALUES (?, ?, ?, ?, 'Pending', ?)",
      [taskId, adminId, staffId, description.trim(), priority || 'Medium']
    );
    res.status(201).json({ success: true, taskId, message: 'Task assigned successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/inventory
exports.getInventory = async (req, res) => {
  try {
    const [inventory] = await db.query(`
      SELECT i.InventoryID,
             COALESCE(p.Name, 'Unknown') AS ProductName,
             i.AvailableQuantity,
             i.MinimumThreshold,
             i.LastUpdated
      FROM inventory i
      LEFT JOIN product p ON i.ProductID = p.ProductID
      ORDER BY i.InventoryID
    `);
    res.json({ success: true, inventory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/reports/orders
exports.getOrdersReport = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.OrderID,
             COALESCE(c.Name, 'Unknown') AS CustomerName,
             o.OrderDate,
             o.Status,
             COALESCE(SUM(oi.Quantity * oi.Price), 0) AS TotalPrice,
             GROUP_CONCAT(CONCAT(p.Name, ' x', oi.Quantity) ORDER BY p.Name SEPARATOR ', ') AS Items
      FROM orders o
      LEFT JOIN customer c ON o.CustomerID = c.CustomerID
      LEFT JOIN orderitem oi ON o.OrderID = oi.OrderID
      LEFT JOIN product p ON oi.ProductID = p.ProductID
      GROUP BY o.OrderID, c.Name, o.OrderDate, o.Status
      ORDER BY o.OrderDate DESC
    `);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const VALID_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status value' });
  }
  try {
    const [result] = await db.query('UPDATE orders SET Status = ? WHERE OrderID = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
