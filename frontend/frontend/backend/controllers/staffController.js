// Database connection / query helper (MySQL pool wrapper)
const db = require('../config/db');

// GET /api/staff/tasks — return tasks assigned to the authenticated staff user
// Loads recent tasks for the staff member and returns them as JSON.
exports.getMyTasks = async (req, res) => {
  try {
    const staffId = req.user.id;
    // Query tasks for this staff, most recent first
    const [tasks] = await db.query(`
      SELECT t.TaskID,
             t.Description,
             t.Status,
             t.AssignedDate,
             t.OrderID
      FROM task t
      WHERE t.StaffID = ?
      ORDER BY t.AssignedDate DESC
    `, [staffId]);
    res.json({ success: true, tasks });
  } catch (err) {
    // Return 500 on unexpected DB errors
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/staff/tasks/:id/complete — mark a task as completed
// Ensures the task belongs to the staff member, marks it completed and
// updates the staff's availability status depending on remaining open tasks.
exports.completeTask = async (req, res) => {
  try {
    const staffId = req.user.id;
    // Mark the task completed if it is assigned to the current staff
    const [result] = await db.query(
      "UPDATE task SET Status = 'Completed', CompletedDate = NOW() WHERE TaskID = ? AND StaffID = ?",
      [req.params.id, staffId]
    );
    if (result.affectedRows === 0) {
      // No rows updated -> task not found or not assigned to this user
      return res.status(404).json({ success: false, error: 'Task not found or not assigned to you' });
    }

    // Recompute the staff workload: count open tasks to set status
    const [[{ openTasks }]] = await db.query(
      "SELECT COUNT(*) AS openTasks FROM task WHERE StaffID = ? AND Status IN ('Pending', 'In Progress')",
      [staffId]
    );

    const nextStatus = Number(openTasks) > 0 ? 'Busy' : 'Available';
    await db.query(
      "UPDATE staff SET Status = ?, UpdatedAt = NOW() WHERE StaffID = ?",
      [nextStatus, staffId]
    );

    res.json({ success: true, message: 'Task marked as completed' });
  } catch (err) {
    // Unexpected DB error
    res.status(500).json({ success: false, error: err.message });
  }
};

const { generateNotificationId } = require('../utils/idGenerator');
const { sendOrderStatusUpdateEmail } = require('../utils/emailService');

// PATCH /api/staff/orders/:id/status — update an order's status (and optionally estimated date)
// Validates the supplied status, updates the order row, then notifies the
// customer via in-app notification and email (if available).
exports.updateOrderStatus = async (req, res) => {
  const { status, estimatedCompletionDate } = req.body;
  const VALID_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
  if (!VALID_STATUSES.includes(status)) {
    // Guard against invalid status values
    return res.status(400).json({ success: false, error: 'Invalid status. Use: Pending, In Progress, Completed, or Cancelled' });
  }
  try {
    // Build dynamic SQL to optionally include estimated completion date
    let sql = 'UPDATE orders SET Status = ?, UpdatedAt = NOW()';
    const params = [status];

    if (estimatedCompletionDate) {
      sql += ', EstimatedCompletionDate = ?';
      params.push(estimatedCompletionDate);
    }

    sql += ' WHERE OrderID = ?';
    params.push(req.params.id);

    const [result] = await db.query(sql, params);
    if (result.affectedRows === 0) {
      // Order not found
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Load order + customer contact info to inform the customer
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
        // Log notification failures but don't block the request
        console.error('Failed to create customer order update notification:', e.message || e);
      }

      // Email notification for customer (best-effort)
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
          console.error('Failed to send order status update email:', e.message || e);
        }
      }
    }

    res.json({ success: true, message: `Order ${req.params.id} updated to ${status}` });
  } catch (err) {
    // Unexpected error
    res.status(500).json({ success: false, error: err.message });
  }
};
