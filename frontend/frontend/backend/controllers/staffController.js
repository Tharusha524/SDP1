const db = require('../config/db');

// GET /api/staff/tasks — tasks assigned to the logged-in staff member
exports.getMyTasks = async (req, res) => {
  try {
    const staffId = req.user.id;
    const [tasks] = await db.query(`
      SELECT t.TaskID,
             t.Description,
             t.Status,
             t.Priority,
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

// PATCH /api/staff/orders/:id/status — update an order's status
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const VALID_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status. Use: Pending, In Progress, Completed, or Cancelled' });
  }
  try {
    const [result] = await db.query(
      'UPDATE orders SET Status = ?, UpdatedAt = NOW() WHERE OrderID = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, message: `Order ${req.params.id} updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
