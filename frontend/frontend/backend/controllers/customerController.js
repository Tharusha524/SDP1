// Purpose: customerController
// This file contains API handlers for customer actions.
// It provides endpoints used by the customer-facing UI, for example:
// - getMyProfile: return the logged-in customer's profile details.
// Keep comments simple so reviewers can quickly understand each handler's role.
const db = require('../config/db');

// GET /api/customers/me - profile for logged-in customer
exports.getMyProfile = async (req, res) => {
  try {
    // read user object that passport/auth middleware put on req
    const user = req.user;
    // if not logged in or not a customer, deny access
    if (!user || user.role !== 'customer') {
      return res.status(403).json({ success: false, error: 'Only customers can view their profile' });
    }

    // query the customer table by the authenticated user's id
    const [rows] = await db.query(
      'SELECT CustomerID, Name, Email, ContactNo, Address, CreatedAt, UpdatedAt FROM customer WHERE CustomerID = ?',
      [user.id]
    );

    // if no row found, return not found
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer profile not found' });
    }

    // return the single customer row as JSON
    return res.json({ success: true, customer: rows[0] });
  } catch (err) {
    // log error and return a simple error message
    console.error('Error fetching customer profile:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch customer profile' });
  }
};
