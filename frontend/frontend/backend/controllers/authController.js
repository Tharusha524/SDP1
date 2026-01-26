// authController.js
// Handles authentication logic
const User = require('../models/User');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const LOG_PATH = path.join(__dirname, '..', 'debug_login.log');
const SALT_ROUNDS = 10; // Standard bcrypt salt rounds for password hashing

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

    // Return user with role automatically detected from database
    res.json({
      success: true,
      token: 'dummy-token-replace-with-jwt',
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

    // Hash password using bcrypt for secure storage
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log(`[SECURITY] Password hashed for user: ${email}`);

    // Create user (no OTP needed)
    const userId = await User.create({ 
      name, 
      email, 
      contact, 
      password: hashedPassword, 
      role
    });

    res.json({ 
      success: true, 
      userId, 
      message: 'User registered successfully'
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
    // Validate required fields
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
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

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Check if OTP is expired
    const now = new Date();
    const otpExpiryDate = new Date(user.otp_expiry);
    if (now > otpExpiryDate) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Mark user as verified and clear OTP
    await User.verifyUser(email);
    console.log(`User ${email} verified successfully`);

    res.json({ 
      success: true, 
      message: 'Email verified successfully! You can now log in.' 
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

    // Update OTP in database
    await User.updateOTP(email, otp, otpExpiry);

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
    await User.updateOTP(email, otp, otpExpiry);

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

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Check if OTP is expired
    const now = new Date();
    const otpExpiryDate = new Date(user.otp_expiry);
    if (now > otpExpiryDate) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
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

    // Verify OTP again
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const now = new Date();
    const otpExpiryDate = new Date(user.otp_expiry);
    if (now > otpExpiryDate) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password and clear OTP
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
