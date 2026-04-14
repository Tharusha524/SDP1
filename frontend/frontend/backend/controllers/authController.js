const { sendOTPEmail, sendPasswordResetOTP, generateOTP } = require('../utils/emailService');
// Handles authentication logic
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const LOG_PATH = path.join(__dirname, '..', 'debug_login.log');
const SALT_ROUNDS = 10; // Standard bcrypt salt rounds for password hashing
const JWT_SECRET = process.env.JWT_SECRET || 'marukawa-cement-secret-key-2026';
const JWT_EXPIRY = '7d'; // Token expires in 7 days

// Handles authentication logic
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const log = (msg) => {
      try {
        fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} ${msg}\n`);
      } catch (e) {
        console.error('Failed to write debug log', e);
      }
    };
    log(`Login attempt for: ${email}`);

    // Find user by email/username (role will be automatically retrieved from database)
    const user = await User.findByUsername(email);
    log(`User record from DB: ${JSON.stringify(user)}`);
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password using bcrypt (secure authentication)
    // Also support plain text passwords for backward compatibility
    let isPasswordValid = false;

    // Check if password is bcrypt hashed (starts with $2b$ or $2a$)
    if (user.Password.startsWith('$2b$') || user.Password.startsWith('$2a$')) {
      // Use bcrypt for hashed passwords
      isPasswordValid = await bcrypt.compare(password, user.Password);
    } else {
      // Plain text comparison for legacy passwords
      isPasswordValid = (password === user.Password);
    }

    log(`bcrypt-compare result for ${email}: ${isPasswordValid}`);
    if (!isPasswordValid) {
      log(`Password mismatch for: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Resolve a friendly display name (especially for customers)
    let displayName = user.username;
    if (user.role === 'customer') {
      try {
        const [rows] = await db.query('SELECT Name FROM customer WHERE CustomerID = ?', [user.id]);
        if (rows && rows.length > 0 && rows[0].Name) {
          displayName = rows[0].Name;
        }
      } catch (e) {
        log(`Failed to load customer name for ${email}: ${e.message}`);
      }
    }

    // Generate JWT token with user payload
    const tokenPayload = {
      id: user.id,
      username: displayName,
      email: user.Email || user.username,
      role: user.role
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    log(`JWT token generated for ${email}`);

    // Return user with real JWT token
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        name: displayName,
        email: user.Email || user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    try { fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} Login error: ${err.stack || err}\n`); } catch (e) { }
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.register = async (req, res) => {
  const { name, email, contact, password, role } = req.body;
  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Check if user exists (using email as username)
    const existingUser = await User.findByUsername(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Check if pending registration exists
    const pendingUser = await User.getPendingRegistration(email);
    if (pendingUser) {
      // Delete old pending registration
      await User.deletePendingRegistration(email);
    }

    // Hash password using bcrypt for secure storage
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log(`[SECURITY] Password hashed for user: ${email}`);

    // Generate Verification OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to pending_registrations table (NOT creating user yet)
    await User.savePendingRegistration({
      name,
      email,
      contact,
      password: hashedPassword,
      role,
      verification_token: otp,
      token_expires: otpExpiry
    });

    // Send Verification Email
    try {
      await sendOTPEmail(email, otp, name);
      console.log(`Verification OTP sent to ${email}: ${otp}`);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // If authentication with SMTP failed, return a helpful hint
      if (emailError && emailError.code === 'EAUTH') {
        return res.status(500).json({ success: false, message: 'Failed to send verification email due to mail authentication error. Please check backend email settings (EMAIL_USER / EMAIL_PASSWORD).' });
      }
      return res.status(500).json({ success: false, message: 'Failed to send verification email. Please try again later.' });
    }

    res.json({
      success: true,
      email: email,
      message: 'Registration initiated. Please verify your email with the OTP sent to complete registration.'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.verifyToken = (req, res) => {
  // Implement token verification logic
  res.send('Verify token endpoint');
};

// Verify OTP endpoint
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    console.log('=== OTP VERIFICATION REQUEST ===');
    console.log('Email:', email);
    console.log('OTP received:', otp);
    console.log('OTP type:', typeof otp);
    console.log('OTP length:', otp ? otp.length : 0);

    // Validate required fields
    if (!email || !otp) {
      console.log('❌ Missing email or OTP');
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    // Find pending registration. If none, try users table as a fallback
    let pendingUser = await User.getPendingRegistration(email);
    let source = 'pending_registrations';

    if (!pendingUser) {
      console.log('No pending registration found in pending_registrations, checking users table...');
      const userRecord = await User.findByUsername(email);
      if (userRecord && !userRecord.is_verified && (userRecord.verification_token || userRecord.token_expires)) {
        // Use the users table record as fallback
        pendingUser = userRecord;
        source = 'users';
      }
    }

    if (!pendingUser) {
      console.log('❌ No pending registration found for:', email);
      return res.status(404).json({ success: false, message: 'No pending registration found. Please register again.' });
    }

    console.log(`✓ Pending user found (source=${source}):`, pendingUser.email || pendingUser.Email || email);
    console.log('Stored OTP (raw):', pendingUser.verification_token || pendingUser.verificationToken || pendingUser.reset_code);
    console.log('Expiry:', pendingUser.token_expires || pendingUser.token_expires || pendingUser.token_expires);

    // Normalize OTPs: remove non-digit characters and trim
    const normalize = v => (v === null || v === undefined) ? '' : String(v).replace(/\D/g, '').trim();
    const receivedOTP = normalize(otp);
    const storedOTP = normalize(pendingUser.verification_token || pendingUser.verificationToken || pendingUser.reset_code || '');

    console.log('Comparing:');
    console.log(`  Received: "${receivedOTP}"`);
    console.log(`  Stored:   "${storedOTP}"`);
    console.log(`  Match: ${receivedOTP === storedOTP}`);

    if (!receivedOTP || receivedOTP.length < 4 || receivedOTP !== storedOTP) {
      console.log('❌ OTP mismatch');
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Check if OTP is expired
    const now = new Date();
    const otpExpiryDate = new Date(pendingUser.token_expires);
    console.log('Time check:');
    console.log(`  Now: ${now}`);
    console.log(`  Expiry: ${otpExpiryDate}`);
    console.log(`  Expired: ${now > otpExpiryDate}`);
    
    if (now > otpExpiryDate) {
      console.log('❌ OTP expired');
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // NOW create the actual user in the database
    const userId = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      contact: pendingUser.contact,
      password: pendingUser.password,
      role: pendingUser.role
    });

    // Delete pending registration
    await User.deletePendingRegistration(email);

    console.log(`User ${email} verified and created successfully with ID: ${userId}`);

    res.json({
      success: true,
      message: 'Email verified successfully! Your account has been created. You can now log in.'
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Resend OTP endpoint
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate required fields
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // First check pending_registrations (user may not be created yet)
    const pending = await User.getPendingRegistration(email);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (pending) {
      // Update pending registration OTP
      await User.updatePendingVerificationOTP(email, otp, otpExpiry);
      try {
        await sendOTPEmail(email, otp, pending.name || (pending.Email || email));
        console.log(`New OTP sent to pending registration ${email}: ${otp}`);
      } catch (emailError) {
        console.error('Error sending OTP email to pending registration:', emailError);
        if (emailError && emailError.code === 'EAUTH') {
          return res.status(500).json({ success: false, message: 'Failed to send OTP email due to mail authentication error. Check backend email settings.' });
        }
        return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
      }
    } else {
      // Fallback to users table
      const user = await User.findByUsername(email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Check if already verified
      if (user.is_verified) {
        return res.status(400).json({ success: false, message: 'Account already verified' });
      }

      // Update OTP in users table
      await User.updateVerificationOTP(email, otp, otpExpiry);

      try {
        await sendOTPEmail(email, otp, user.username || user.Email || email);
        console.log(`New OTP sent to ${email}: ${otp}`);
      } catch (emailError) {
        console.error('Error sending OTP email:', emailError);
        if (emailError && emailError.code === 'EAUTH') {
          return res.status(500).json({ success: false, message: 'Failed to send OTP email due to mail authentication error. Check backend email settings.' });
        }
        return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
      }
    }

    res.json({
      success: true,
      message: 'New OTP sent successfully! Please check your email.'
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findByUsername(email);
    if (!user) {
      // For security, do not reveal if user does not exist
      return res.json({ success: true, message: 'If that email exists, we have sent a reset code.' });
    }

    // Generate 6-digit OTP for password reset
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with reset OTP
    await User.updateResetOTP(email, otp, otpExpiry);

    // Send OTP email
    try {
      await sendPasswordResetOTP(email, otp, user.username);
      console.log(`Password reset OTP sent to ${email}: ${otp}`);
    } catch (emailError) {
      console.error('Error sending reset OTP email:', emailError);
      if (emailError && emailError.code === 'EAUTH') {
        return res.status(500).json({ success: false, message: 'Failed to send reset email due to mail authentication error. Check backend email settings.' });
      }
      return res.status(500).json({ success: false, message: 'Failed to send reset email' });
    }

    res.json({
      success: true,
      message: 'Password reset code sent to your email',
      email: email
    });
  } catch (err) {
    console.error('Forgot Password error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Verify password reset OTP
exports.verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findByUsername(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if OTP matches and is valid using User model method
    const validUser = await User.verifyResetCode(email, otp);

    if (!validUser) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    res.json({
      success: true,
      message: 'OTP verified. You can now reset your password.'
    });
  } catch (err) {
    console.error('Reset OTP verification error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Reset password with verified OTP
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const user = await User.findByUsername(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify OTP again (using reset code)
    const validUser = await User.verifyResetCode(email, otp);
    if (!validUser) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password and clear OTP using User model
    await User.resetPassword(email, hashedPassword);
    console.log(`Password reset successful for ${email}`);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Debug helper: return pending registration or users verification info (development use only)
exports.debugPending = async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ success: false, message: 'Email query param required' });
  try {
    const pending = await User.getPendingRegistration(email);
    if (pending) {
      return res.json({ success: true, source: 'pending_registrations', pending });
    }
    const user = await User.findByUsername(email);
    if (user) return res.json({ success: true, source: 'users', user });
    return res.status(404).json({ success: false, message: 'No record found' });
  } catch (err) {
    console.error('Debug pending error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
