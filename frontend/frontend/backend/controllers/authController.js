const { sendOTPEmail, sendPasswordResetOTP, generateOTP } = require('../utils/emailService');
// Handles authentication logic
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
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

    // Generate JWT token with user payload
    const tokenPayload = {
      id: user.id,
      username: user.username,
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
        name: user.username,
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
      return res.status(500).json({ success: false, message: 'Failed to send verification email. Please try again.' });
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

    // Find pending registration
    const pendingUser = await User.getPendingRegistration(email);
    if (!pendingUser) {
      console.log('❌ No pending registration found for:', email);
      return res.status(404).json({ success: false, message: 'No pending registration found. Please register again.' });
    }

    console.log('✓ Pending user found:', pendingUser.email);
    console.log('Stored OTP:', pendingUser.verification_token);
    console.log('Stored OTP type:', typeof pendingUser.verification_token);
    console.log('Expiry:', pendingUser.token_expires);

    // Check if OTP matches (convert both to strings and trim)
    const receivedOTP = String(otp).trim();
    const storedOTP = String(pendingUser.verification_token).trim();
    
    console.log('Comparing:');
    console.log(`  Received: "${receivedOTP}"`);
    console.log(`  Stored:   "${storedOTP}"`);
    console.log(`  Match: ${receivedOTP === storedOTP}`);

    if (receivedOTP !== storedOTP) {
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

    // Find user by email
    const user = await User.findByUsername(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if already verified
    if (user.is_verified) {
      return res.status(400).json({ success: false, message: 'Account already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update OTP in database (using verification_token)
    await User.updateVerificationOTP(email, otp, otpExpiry);

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, user.username);
      console.log(`New OTP sent to ${email}: ${otp}`);
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
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
