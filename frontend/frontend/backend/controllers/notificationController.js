const db = require('../config/db');

// GET /api/notifications — returns notifications for the logged-in user
exports.getMyNotifications = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const query = isAdmin
      ? `SELECT NotificationID, Message, Type, IsRead, RelatedID, DateTime
         FROM notification
         WHERE ReceiverID = ? OR (ReceiverID IS NULL AND Type = 'Low Stock Alert')
         ORDER BY DateTime DESC`
      : `SELECT NotificationID, Message, Type, IsRead, RelatedID, DateTime
         FROM notification
         WHERE ReceiverID = ?
         ORDER BY DateTime DESC`;

    const [notifications] = await db.query(query, [req.user.id]);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/notifications/:id/read — mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const query = isAdmin
      ? `UPDATE notification SET IsRead = 1
         WHERE NotificationID = ?
           AND (ReceiverID = ? OR (ReceiverID IS NULL AND Type = 'Low Stock Alert'))`
      : 'UPDATE notification SET IsRead = 1 WHERE NotificationID = ? AND ReceiverID = ?';

    await db.query(query, [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/notifications/read-all — mark all as read for this user
exports.markAllAsRead = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const query = isAdmin
      ? `UPDATE notification SET IsRead = 1
         WHERE ReceiverID = ? OR (ReceiverID IS NULL AND Type = 'Low Stock Alert')`
      : 'UPDATE notification SET IsRead = 1 WHERE ReceiverID = ?';

    await db.query(query, [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
