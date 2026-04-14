const db = require('../config/db');

// GET /api/customers/me - profile for logged-in customer
exports.getMyProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'customer') {
      return res.status(403).json({ success: false, error: 'Only customers can view their profile' });
    }

    const [rows] = await db.query(
      'SELECT CustomerID, Name, Email, ContactNo, Address, CreatedAt, UpdatedAt FROM customer WHERE CustomerID = ?',
      [user.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer profile not found' });
    }

    return res.json({ success: true, customer: rows[0] });
  } catch (err) {
    console.error('Error fetching customer profile:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch customer profile' });
  }
};
