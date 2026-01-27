const db = require('../config/db');
const { generateUserId } = require('../utils/idGenerator');

const User = {
  // Save pending registration (before email verification)
  savePendingRegistration: async (userData) => {
    const { name, email, contact, password, role, verification_token, token_expires } = userData;
    try {
      await db.query(
        'INSERT INTO pending_registrations (name, email, contact, password, role, verification_token, token_expires) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, contact, password, role || 'customer', verification_token, token_expires]
      );
      return true;
    } catch (error) {
      console.error('Error saving pending registration:', error);
      throw error;
    }
  },

  // Get pending registration by email
  getPendingRegistration: async (email) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM pending_registrations WHERE email = ?',
        [email]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error getting pending registration:', error);
      throw error;
    }
  },

  // Delete pending registration
  deletePendingRegistration: async (email) => {
    try {
      await db.query('DELETE FROM pending_registrations WHERE email = ?', [email]);
      return true;
    } catch (error) {
      console.error('Error deleting pending registration:', error);
      throw error;
    }
  },

  // Create verified user (after OTP confirmation)
  create: async (userData) => {
    const { name, email, contact, password, role } = userData;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Generate formatted user ID
      const userId = await generateUserId(connection);

      // 1. Insert into centralized users table with formatted ID (use 'email' column, not 'username')
      await connection.query(
        'INSERT INTO users (id, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)',
        [userId, email, password, role || 'customer', 1]
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
          [userId, name, email, password, contact, 'TBD']
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
      // Check Unified Users table (Primary) - include verification fields
      const [userRows] = await db.query(
        'SELECT id, email, email as Email, password as Password, role, is_verified, verification_token, token_expires, reset_code, reset_expiry FROM users WHERE email = ?',
        [email]
      );
      if (userRows.length > 0) {
        // Return with username field for compatibility
        return {
          ...userRows[0],
          username: userRows[0].email
        };
      }

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
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Get user data including pending registration details
      const [userRows] = await connection.query(
        'SELECT id, email, password, role, pending_data FROM users WHERE email = ?',
        [email]
      );

      if (userRows.length === 0) {
        throw new Error('User not found during verification');
      }

      const user = userRows[0];

      // 1. Mark as verified and clear temporary fields
      await connection.query(
        'UPDATE users SET is_verified = TRUE, verification_token = NULL, token_expires = NULL, pending_data = NULL WHERE email = ?',
        [email]
      );

      // 2. Populate role-specific table from pending data
      if (user.pending_data) {
        const data = JSON.parse(user.pending_data);
        const userId = user.id;
        const { name, contactNo, contact, address, password } = data;
        const targetRole = user.role ? user.role.toLowerCase() : 'customer';

        // Map fields correctly (contact vs contactNo)
        const finalContact = contact || contactNo || '';

        if (targetRole === 'admin') {
          await connection.query(
            'INSERT INTO Admin (AdminID, Name, Email, Password) VALUES (?, ?, ?, ?)',
            [userId, name, email, password]
          );
        } else if (targetRole === 'staff') {
          await connection.query(
            'INSERT INTO Staff (StaffID, Name, Email, Password, ContactNo, Status) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, name, email, password, finalContact, 'Available']
          );
        } else if (targetRole === 'storekeeper') {
          await connection.query(
            'INSERT INTO Storekeeper (StorekeeperID, Name, Email, Password, ContactNo) VALUES (?, ?, ?, ?, ?)',
            [userId, name, email, password, finalContact]
          );
        } else if (targetRole === 'customer') {
          await connection.query(
            'INSERT INTO Customer (CustomerID, Name, Email, Password, ContactNo, Address) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, name, email, password, finalContact, address || 'TBD']
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error verifying user:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // Update Verification OTP (uses verification_token)
  updateVerificationOTP: async (email, otp, expiry) => {
    try {
      await db.query(
        'UPDATE users SET verification_token = ?, token_expires = ? WHERE email = ?',
        [otp, expiry, email]
      );
      return true;
    } catch (error) {
      console.error('Error updating Verification OTP:', error);
      throw error;
    }
  },

  // Update Password Reset OTP (uses reset_code)
  updateResetOTP: async (email, otp, expiry) => {
    try {
      await db.query(
        'UPDATE users SET reset_code = ?, reset_expiry = ? WHERE email = ?',
        [otp, expiry, email]
      );
      return true;
    } catch (error) {
      console.error('Error updating Reset OTP:', error);
      throw error;
    }
  },

  // Verify Reset Code
  verifyResetCode: async (email, code) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ? AND reset_code = ? AND reset_expiry > NOW()',
        [email, code]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error verifying reset code:', error);
      throw error;
    }
  },

  // Reset Password
  resetPassword: async (email, hashedPassword) => {
    try {
      await db.query(
        'UPDATE users SET password = ?, reset_code = NULL, reset_expiry = NULL WHERE email = ?',
        [hashedPassword, email]
      );
      // Also update role specific tables if needed, but 'users' table is the source of truth for auth
      // For consistency, we might need to update role tables too, but login checks 'users' table mostly?
      // Actually login checks 'users' table first.

      // Update specific tables just in case
      const user = await User.findByUsername(email);
      if (user) {
        const role = user.role;
        if (role === 'admin') {
          await db.query('UPDATE Admin SET Password = ? WHERE Email = ?', [hashedPassword, email]);
        } else if (role === 'staff') {
          await db.query('UPDATE Staff SET Password = ? WHERE Email = ?', [hashedPassword, email]);
        } else if (role === 'storekeeper') {
          await db.query('UPDATE Storekeeper SET Password = ? WHERE Email = ?', [hashedPassword, email]);
        } else if (role === 'customer') {
          await db.query('UPDATE Customer SET Password = ? WHERE Email = ?', [hashedPassword, email]);
        }
      }

      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
};

module.exports = User;



