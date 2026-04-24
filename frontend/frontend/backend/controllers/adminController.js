// Database pool used to run SQL queries.
const db = require('../config/db');
// Utility to create unique IDs for tasks and notifications.
const { generateTaskId } = require('../utils/idGenerator');

/*
  Purpose: Dashboard statistics endpoint
  - Returns summary numbers for admin dashboard such as total orders,
    pending orders, revenue, pending tasks and inventory total.
  - Also returns a short list of recent orders with line-item summaries.
  - Used by the admin UI to show high-level system health and recent activity.
*/
// GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ totalOrders }]] = await db.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ pendingOrders }]] = await db.query("SELECT COUNT(*) AS pendingOrders FROM orders WHERE Status = 'Pending'");
    const [[{ completedOrders }]] = await db.query("SELECT COUNT(*) AS completedOrders FROM orders WHERE Status = 'Completed'");
    const [[{ totalRevenue }]] = await db.query(`
      SELECT COALESCE(SUM(oi.Quantity * oi.UnitPriceAtPurchase), 0) AS totalRevenue
      FROM orders o
      LEFT JOIN orderitem oi ON o.OrderID = oi.OrderID
    `);
    const [[{ pendingTasks }]] = await db.query("SELECT COUNT(*) AS pendingTasks FROM task WHERE Status = 'Pending'");
    const [[{ activeInventory }]] = await db.query('SELECT COALESCE(SUM(AvailableQuantity), 0) AS activeInventory FROM inventory');

    const [recentOrders] = await db.query(`
      SELECT o.OrderID,
             COALESCE(c.Name, 'Unknown') AS CustomerName,
             o.CreatedAt AS OrderDate,
             o.Status,
             COALESCE(SUM(oi.Quantity * oi.UnitPriceAtPurchase), 0) AS TotalPrice,
             GROUP_CONCAT(CONCAT(p.Name, ' x', oi.Quantity) ORDER BY p.Name SEPARATOR ', ') AS Items
      FROM orders o
      LEFT JOIN customer c ON o.CustomerID = c.CustomerID
      LEFT JOIN orderitem oi ON o.OrderID = oi.OrderID
      LEFT JOIN product p ON oi.ProductID = p.ProductID
      GROUP BY o.OrderID, c.Name, o.CreatedAt, o.Status
      ORDER BY o.CreatedAt DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        totalOrders: Number(totalOrders),
        pendingOrders: Number(pendingOrders),
        completedOrders: Number(completedOrders),
        totalRevenue: Number(totalRevenue),
        pendingTasks: Number(pendingTasks),
        activeInventory: Number(activeInventory)
      },
      recentOrders
    });
  } catch (err) {
    console.error('createTask error:', err);
    if (err && (err.errno === 1452 || err.code === 'ER_NO_REFERENCED_ROW_2')) {
      const msg = (err.sqlMessage && err.sqlMessage.includes('OrderID')) ? 'Invalid OrderID' : 'Invalid reference data';
      return res.status(400).json({ success: false, error: msg });
    }
    res.status(500).json({ success: false, error: 'Server error while assigning task' });
  }
};

/*
  Purpose: Staff list endpoint
  - Returns a simple list of staff members (id, name, contact, status).
  - Used to display staff in admin screens where assignments are done.
*/
// GET /api/admin/staff
exports.getAllStaff = async (req, res) => {
  try {
    const [staff] = await db.query('SELECT StaffID, Name, ContactNo, Status FROM staff ORDER BY Name');
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/*
  Purpose: Tasks list endpoint
  - Returns all task rows with staff names and status.
  - Used by admins to review and manage task assignments.
*/
// GET /api/admin/tasks
exports.getAllTasks = async (req, res) => {
  try {
    const [tasks] = await db.query(`
      SELECT t.TaskID,
             t.StaffID,
             t.OrderID,
             COALESCE(s.Name, t.StaffID) AS StaffName,
             t.Description,
             t.Status,
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

/*
  Purpose: Create a new task and assign it to a staff member
  - Validates required fields, generates a TaskID, inserts the task,
    and marks the staff member as 'Busy'.
  - Used when admin assigns a work task related to an order.
*/
// POST /api/admin/tasks
exports.createTask = async (req, res) => {
  const { staffId, description, orderId } = req.body;
  if (!staffId || !description || !description.trim()) {
    return res.status(400).json({ success: false, error: 'staffId and description are required' });
  }
  try {
    const taskId = await generateTaskId(db);
    const adminId = req.user.id || null;
    await db.query(
      "INSERT INTO task (TaskID, AdminID, StaffID, OrderID, Description, Status) VALUES (?, ?, ?, ?, ?, 'Pending')",
      [taskId, adminId, staffId, orderId || null, description.trim()]
    );
    await db.query(
      "UPDATE staff SET Status = 'Busy', UpdatedAt = NOW() WHERE StaffID = ?",
      [staffId]
    );
    res.status(201).json({ success: true, taskId, message: 'Task assigned successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/*
  Purpose: Inventory listing endpoint
  - Returns current inventory items, available quantities and thresholds.
  - Used to display inventory status for admin/storeroom views.
*/
// GET /api/admin/inventory
exports.getInventory = async (req, res) => {
  try {
    const [inventory] = await db.query(`
      SELECT InventoryID,
             InventoryName AS ProductName,
             AvailableQuantity,
             MinimumThreshold,
             LastUpdated
      FROM inventory
      ORDER BY InventoryID
    `);
    res.json({ success: true, inventory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/*
  Purpose: Orders report endpoint
  - Returns orders along with payment and item summaries.
  - Useful for exports, reporting, and detailed admin views.
*/
// GET /api/admin/reports/orders
exports.getOrdersReport = async (req, res) => {
  try {
    const [ordersWithPayments] = await db.query(`
      SELECT o.OrderID,
             o.CustomerID,
             COALESCE(c.Name, 'Unknown') AS CustomerName,
             o.CreatedAt AS OrderDate,
             o.UpdatedAt AS UpdatedAt,
             o.Status,
             COALESCE(SUM(oi.Quantity * oi.UnitPriceAtPurchase), 0) AS TotalPrice,
             COALESCE(SUM(oi.Quantity), 0) AS TotalQuantity,
             GROUP_CONCAT(CONCAT(p.Name, ' x', oi.Quantity) ORDER BY p.Name SEPARATOR ', ') AS Items,
             COALESCE(SUM(CASE WHEN pay.Status = 'Paid' THEN pay.Amount ELSE 0 END), 0) AS AdvancePaid
      FROM orders o
      LEFT JOIN customer c ON o.CustomerID = c.CustomerID
      LEFT JOIN orderitem oi ON o.OrderID = oi.OrderID
      LEFT JOIN product p ON oi.ProductID = p.ProductID
      LEFT JOIN payment pay ON pay.OrderID = o.OrderID
      GROUP BY o.OrderID, o.CustomerID, c.Name, o.CreatedAt, o.UpdatedAt, o.Status
      ORDER BY o.CreatedAt DESC
    `);
    res.json({ success: true, orders: ordersWithPayments || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/*
  Purpose: Inventory usage report
  - Calculates how much of each inventory item was used in completed orders.
  - Helps with stock analysis and restocking decisions.
*/
// GET /api/admin/reports/inventory-usage
// Returns total allocated quantity per inventory item for Completed orders
exports.getInventoryUsageReport = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        inv.InventoryID,
        inv.InventoryName,
        COALESCE(SUM(ai.Quantity), 0) AS UsedQuantity,
        COUNT(DISTINCT ia.OrderID) AS CompletedOrders
      FROM inventory_allocation ia
      JOIN orders o ON o.OrderID = ia.OrderID
      JOIN inventory_allocation_item ai ON ai.AllocationID = ia.AllocationID
      JOIN inventory inv ON inv.InventoryID = ai.InventoryID
      WHERE o.Status = 'Completed'
        AND (ia.Status IS NULL OR ia.Status = 'Allocated')
      GROUP BY inv.InventoryID, inv.InventoryName
      ORDER BY UsedQuantity DESC
    `);

    res.json({ success: true, usage: rows || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/*
  Purpose: Customer-product preference report
  - Shows how many unique customers bought each product and total quantity.
  - Useful for marketing and assortment planning.
*/
// GET /api/admin/reports/customer-product-preferences
// Returns how many distinct customers purchased each product (with product category) for Completed orders.
exports.getCustomerProductPreferencesReport = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.Category AS ProductType,
        p.ProductID,
        p.Name AS ProductName,
        COUNT(DISTINCT o.CustomerID) AS CustomerCount,
        COALESCE(SUM(oi.Quantity), 0) AS TotalQuantity
      FROM orders o
      JOIN orderitem oi ON oi.OrderID = o.OrderID
      JOIN product p ON p.ProductID = oi.ProductID
      WHERE o.Status <> 'Cancelled'
      GROUP BY p.Category, p.ProductID, p.Name
      ORDER BY CustomerCount DESC, TotalQuantity DESC, p.Name ASC
    `);

    res.json({ success: true, preferences: rows || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Utilities for notifications and emails used when order status changes.
const { generateNotificationId } = require('../utils/idGenerator');
const { sendOrderStatusUpdateEmail } = require('../utils/emailService');

/*
  Purpose: Update order status endpoint
  - Validates the requested status, updates orders table, then
    creates in-app notification and sends an email to the customer if available.
  - This keeps customers informed when admin updates an order's progress.
*/
// PATCH /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  const { status, estimatedCompletionDate } = req.body;
  const VALID_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status value' });
  }
  try {
    let sql = 'UPDATE orders SET Status = ?';
    const params = [status];

    if (estimatedCompletionDate) {
      sql += ', EstimatedCompletionDate = ?';
      params.push(estimatedCompletionDate);
    }

    sql += ' WHERE OrderID = ?';
    params.push(req.params.id);

    const [result] = await db.query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Order not found' });

    // Fetch customer user + order info for notification/email
    const [[orderRow]] = await db.query(
      `SELECT o.OrderID, o.CustomerID, o.Status, o.Details, o.EstimatedCompletionDate,
              u.id AS UserID, u.email AS Email, COALESCE(c.Name, u.email) AS CustomerName
       FROM orders o
       LEFT JOIN customer c ON o.CustomerID = c.CustomerID
       LEFT JOIN users u ON o.CustomerID = u.id
       WHERE o.OrderID = ?
       LIMIT 1`,
      [req.params.id]
    );

    if (orderRow && orderRow.UserID) {
      // In-app notification for customer
      try {
        const notifId = await generateNotificationId(db);
        const message = `Your order ${orderRow.OrderID} status has been updated to ${status}.`;
        await db.query(
          `INSERT INTO notification (NotificationID, Message, Type, ReceiverID, IsRead, RelatedID)
           VALUES (?, ?, 'Order Update', ?, 0, ?)`,
          [notifId, message, orderRow.UserID, orderRow.OrderID]
        );
      } catch (e) {
        console.error('Failed to create customer order update notification (admin):', e.message || e);
      }

      // Email notification for customer
      if (orderRow.Email) {
        try {
          await sendOrderStatusUpdateEmail({
            toEmail: orderRow.Email,
            name: orderRow.CustomerName,
            orderId: orderRow.OrderID,
            status,
            details: orderRow.Details,
            estimatedCompletionDate: orderRow.EstimatedCompletionDate || estimatedCompletionDate
          });
        } catch (e) {
          console.error('Failed to send order status update email (admin):', e.message || e);
        }
      }
    }

    res.json({ success: true, message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
