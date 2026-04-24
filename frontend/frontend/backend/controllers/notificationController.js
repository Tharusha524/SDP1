const db = require('../config/db');

// Notification controller
// Purpose: provide basic notification retrieval and update endpoints used by
// the frontend. Notifications are stored in the `notification` table. Handlers
// below return notifications for the current user (or include global
// low-stock alerts for admins), and allow marking single or all
// notifications as read.

// GET /api/notifications — return notifications for the logged-in user
// Behavior: admins see their notifications plus global "Low Stock Alert"
// entries (ReceiverID IS NULL). Regular users see only notifications addressed
// to their user id.
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

// PATCH /api/notifications/:id/read — mark a single notification as read
// Behavior: updates the `IsRead` flag for the given NotificationID. Admins
// may mark their own notifications or global low-stock alerts; regular users
// may mark only notifications addressed to them.
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

// PATCH /api/notifications/read-all — mark all notifications as read
// Behavior: sets `IsRead` = 1 for all notifications visible to the current
// user. For admins this includes global low-stock alerts; for regular users
// only notifications with their ReceiverID are updated.
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
