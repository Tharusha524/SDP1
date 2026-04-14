const db = require('../config/db');

// GET /api/staff/tasks — tasks assigned to the logged-in staff member
exports.getMyTasks = async (req, res) => {
  try {
    const staffId = req.user.id;
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
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/staff/tasks/:id/complete — mark a task as completed
exports.completeTask = async (req, res) => {
  try {
    const staffId = req.user.id;
    const [result] = await db.query(
      "UPDATE task SET Status = 'Completed', CompletedDate = NOW() WHERE TaskID = ? AND StaffID = ?",
      [req.params.id, staffId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Task not found or not assigned to you' });
    }
    res.json({ success: true, message: 'Task marked as completed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const { generateNotificationId } = require('../utils/idGenerator');
const { sendOrderStatusUpdateEmail } = require('../utils/emailService');

// PATCH /api/staff/orders/:id/status — update an order's status (and optionally estimated date)
exports.updateOrderStatus = async (req, res) => {
  const { status, estimatedCompletionDate } = req.body;
  const VALID_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status. Use: Pending, In Progress, Completed, or Cancelled' });
  }
  try {
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
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
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
        console.error('Failed to create customer order update notification:', e.message || e);
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
          console.error('Failed to send order status update email:', e.message || e);
        }
      }
    }

    res.json({ success: true, message: `Order ${req.params.id} updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
