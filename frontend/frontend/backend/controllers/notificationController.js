const db = require('../config/db');

// GET /api/notifications — returns notifications for the logged-in user
exports.getMyNotifications = async (req, res) => {
  try {
    const [notifications] = await db.query(
      `SELECT NotificationID, Message, Type, IsRead, RelatedID, DateTime
       FROM notification
       WHERE ReceiverID = ?
       ORDER BY DateTime DESC`,
      [req.user.id]
    );
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/notifications/:id/read — mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE notification SET IsRead = 1 WHERE NotificationID = ? AND ReceiverID = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/notifications/read-all — mark all as read for this user
exports.markAllAsRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE notification SET IsRead = 1 WHERE ReceiverID = ?',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
