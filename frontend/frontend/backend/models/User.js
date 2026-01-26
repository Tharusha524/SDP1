const db = require('../config/db');
const bcrypt = require('bcrypt');
const { generateUserId } = require('../utils/idGenerator');
const SALT_ROUNDS = 10;

const User = {
  create: async (userData) => {
    const { name, email, contact, password, role } = userData;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Generate formatted user ID
      const userId = await generateUserId(connection);

      // 1. Insert into centralized users table with formatted ID
      await connection.query(
        'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
        [userId, email, password, role || 'customer']
      );

      // 2. Insert into role-specific table using SAME userId (unified ID system)
      const targetRole = role ? role.toLowerCase() : 'customer';

      if (targetRole === 'admin') {
        await connection.query(
          'INSERT INTO Admin (AdminID, Name, Email, Password) VALUES (?, ?, ?, ?)',
          [userId, name, email, password]
        );
      } else if (targetRole === 'staff') {
        await connection.query(
          'INSERT INTO Staff (StaffID, Name, Email, Password, ContactNo, Status) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, name, email, password, contact, 'Available']
        );
      } else if (targetRole === 'storekeeper') {
        await connection.query(
          'INSERT INTO Storekeeper (StorekeeperID, Name, Email, Password, ContactNo) VALUES (?, ?, ?, ?, ?)',
          [userId, name, email, password, contact]
        );
      } else if (targetRole === 'customer') {
        await connection.query(
          'INSERT INTO Customer (CustomerID, Name, Email, Password, ContactNo, Address) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, name, email, password, contact, 'TBD'] // Default address
        );
      }

      await connection.commit();
      return userId;

    } catch (error) {
      await connection.rollback();
      console.error('Transaction Error in User.create:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  findByUsername: async (email) => {
    // Try to find user in each role-specific table
    try {
      // Check Unified Users table (Primary)
      const [userRows] = await db.query(
        'SELECT id, username, username as Email, password as Password, role FROM users WHERE username = ?', 
        [email]
      );
      if (userRows.length > 0) return userRows[0];

      // Check Admin table
      const [adminRows] = await db.query('SELECT AdminID as id, Name as username, Email, Password, "admin" as role FROM Admin WHERE Email = ?', [email]);
      if (adminRows.length > 0) return adminRows[0];

      // Check Staff table
      const [staffRows] = await db.query('SELECT StaffID as id, Name as username, Email, Password, "staff" as role FROM Staff WHERE Email = ?', [email]);
      if (staffRows.length > 0) return staffRows[0];

      // Check Storekeeper table
      const [keeperRows] = await db.query('SELECT StorekeeperID as id, Name as username, Email, Password, "storekeeper" as role FROM Storekeeper WHERE Email = ?', [email]);
      if (keeperRows.length > 0) return keeperRows[0];

      // Check Customer table
      const [customerRows] = await db.query('SELECT CustomerID as id, Name as username, Email, Password, "customer" as role FROM Customer WHERE Email = ?', [email]);
      if (customerRows.length > 0) return customerRows[0];

      return null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  // Verify user by email
  verifyUser: async (email) => {
    try {
      await db.query(
        'UPDATE users SET is_verified = TRUE, otp = NULL, otp_expiry = NULL WHERE username = ?',
        [email]
      );
      return true;
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  },

  // Update OTP for user
  updateOTP: async (email, otp, otpExpiry) => {
    try {
      await db.query(
        'UPDATE users SET otp = ?, otp_expiry = ? WHERE username = ?',
        [otp, otpExpiry, email]
      );
      return true;
    } catch (error) {
      console.error('Error updating OTP:', error);
      throw error;
    }
  }
};

module.exports = User;



