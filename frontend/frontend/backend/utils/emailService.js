require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');

const fs = require('fs');
const path = require('path');

console.log('Email Service Configuration:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '****' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');

// Configure primary email transporter for Gmail
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER || 'marukawacements@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'tacmfvpwdbhrjnfw'
  }
});

// Fallback: stream transport that writes emails to disk (for development)
let useFallback = false;
const EMAIL_LOG_PATH = path.join(__dirname, '..', 'emails.log');

const fallbackTransport = nodemailer.createTransport({
  streamTransport: true,
  newline: 'unix',
  buffer: true
});

// Verify transporter immediately to catch auth/config issues at startup
transporter.verify().then(() => {
  console.log('Email transporter verified successfully. Ready to send emails.');
}).catch(err => {
  console.error('Email transporter verification failed. Falling back to local log transport.');
  console.error('Verify that `EMAIL_USER` and `EMAIL_PASSWORD` in backend/.env are correct.');
  console.error('If using Gmail, ensure 2FA is enabled and use an App Password: https://support.google.com/accounts/answer/185833');
  console.error('Detailed error:', err && (err.message || err));
  transporter = fallbackTransport;
  useFallback = true;
  try { fs.appendFileSync(EMAIL_LOG_PATH, `${new Date().toISOString()} - Email transporter fallback enabled due to auth error\n`); } catch (e) {}
  console.log('Using fallback stream transport; outgoing emails will be written to', EMAIL_LOG_PATH);
});
// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: `"Marukawa Cement Works" <${process.env.EMAIL_USER || 'marukawacements@gmail.com'}>`,
    to: email,
    subject: 'Verify Your Marukawa Account - OTP',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #c0a062, #d4b886);
            padding: 30px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .content p {
            color: #555;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .otp-box {
            background: #f8f9fa;
            border: 2px dashed #c0a062;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #c0a062;
            letter-spacing: 8px;
            margin: 10px 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #777;
            font-size: 14px;
          }
          .warning {
            color: #dc3545;
            font-size: 14px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Marukawa Cement Works</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for registering with Marukawa Cement Works. To complete your registration, please verify your email address using the OTP below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #666; font-size: 14px;">Your Verification Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Valid for 10 minutes</p>
            </div>
            
            <p>Enter this code on the verification page to activate your account.</p>
            <p class="warning">⚠️ Do not share this code with anyone!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Marukawa Cement Works, Molagoda, Kegalle, Sri Lanka</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${email}`);
    // If we're using the fallback transport, also write a simple record to emails.log for easy lookup
    if (useFallback) {
      try { fs.appendFileSync(EMAIL_LOG_PATH, `${new Date().toISOString()} | OTP email to: ${email} | OTP: ${otp} | Name: ${name}\n`); } catch (e) {}
    }
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    // Provide clearer error details for auth failures
    if (error && error.code === 'EAUTH') {
      console.error('Authentication failed when sending email. Check EMAIL_USER/EMAIL_PASSWORD and Gmail app password settings.');
    }
    // If not in production, fall back to logging the email and return success so dev flow can continue
    if (error && error.code === 'EAUTH' && process.env.NODE_ENV !== 'production') {
      try { fs.appendFileSync(EMAIL_LOG_PATH, `${new Date().toISOString()} | FAILED AUTH - Saved OTP for: ${email} | OTP: ${otp} | Name: ${name}\n`); console.log('Saved OTP to', EMAIL_LOG_PATH); return true; } catch (e) { }
    }
    // Re-throw the original error so callers (controllers) can handle it
    throw error;
  }
};

// Send Password Reset OTP email
const sendPasswordResetOTP = async (email, otp, name) => {
  const mailOptions = {
    from: `"Marukawa Cement Works" <${process.env.EMAIL_USER || 'marukawacements@gmail.com'}>`,
    to: email,
    subject: 'Reset Your Marukawa Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          .header { background: #111827; padding: 30px; text-align: center; color: white; }
          .content { padding: 40px 30px; text-align: center; }
          .otp-box { background: #f8f9fa; border: 2px dashed #111827; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .otp-code { font-size: 36px; font-weight: bold; color: #111827; letter-spacing: 8px; margin: 10px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #777; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Marukawa Cement Works</h1></div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password. Use the code below to complete the process:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p>This code expires in 10 minutes.</p>
          </div>
          <div class="footer"><p>&copy; ${new Date().getFullYear()} Marukawa Cement Works</p></div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reset OTP sent successfully to ${email}`);
    if (useFallback) { try { fs.appendFileSync(EMAIL_LOG_PATH, `${new Date().toISOString()} | Reset OTP to: ${email} | OTP: ${otp} | Name: ${name}\n`); } catch (e) {} }
    return true;
  } catch (error) {
    console.error('Error sending Reset OTP email:', error);
    if (error && error.code === 'EAUTH') {
      console.error('Authentication failed when sending reset email. Check EMAIL_USER/EMAIL_PASSWORD and Gmail app password settings.');
    }
    if (error && error.code === 'EAUTH' && process.env.NODE_ENV !== 'production') { try { fs.appendFileSync(EMAIL_LOG_PATH, `${new Date().toISOString()} | FAILED AUTH - Saved Reset OTP for: ${email} | OTP: ${otp} | Name: ${name}\n`); console.log('Saved Reset OTP to', EMAIL_LOG_PATH); return true; } catch (e) {} }
    throw error;
  }
};

// Send Low Stock Alert email to admin(s)
const sendLowStockAlertEmail = async ({ inventoryId, inventoryName, quantity, threshold, toEmail }) => {
  const targetEmail = toEmail || process.env.LOW_STOCK_ALERT_EMAIL || 'marukawacements724@gmail.com';

  const mailOptions = {
    from: `"Marukawa Cement Works" <${process.env.EMAIL_USER || 'marukawacements@gmail.com'}>`,
    to: targetEmail,
    subject: `Low Stock Alert - ${inventoryName} (${inventoryId})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; background-color: #0b1120; margin: 0; padding: 0; color: #e5e7eb; }
          .wrapper { max-width: 640px; margin: 24px auto; background: #020617; border-radius: 12px; overflow: hidden; border: 1px solid #1f2937; }
          .header { padding: 20px 24px; background: linear-gradient(135deg, #c0a062, #d4b886); color: #0b1120; }
          .header h1 { margin: 0; font-size: 20px; }
          .content { padding: 24px; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #b91c1c; color: #fee2e2; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { padding: 8px 6px; font-size: 13px; text-align: left; }
          th { color: #9ca3af; font-weight: 600; text-transform: uppercase; font-size: 11px; }
          tr:nth-child(even) td { background: #020617; }
          .footer { padding: 16px 24px; font-size: 11px; color: #6b7280; background: #020617; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>Low Stock Alert - ${inventoryName}</h1>
          </div>
          <div class="content">
            <span class="badge">Low Stock Threshold Reached</span>
            <p style="margin-top: 16px; line-height: 1.6;">
              The following inventory item has reached its configured low-stock threshold in the Marukawa system.
            </p>
            <table>
              <tr><th>Inventory ID</th><td>${inventoryId}</td></tr>
              <tr><th>Material</th><td>${inventoryName}</td></tr>
              <tr><th>Current Stock</th><td>${quantity} kg</td></tr>
              <tr><th>Threshold</th><td>${threshold} kg</td></tr>
            </table>
            <p style="margin-top: 18px; font-size: 13px; color: #9ca3af;">
              Please review stock levels and plan for replenishment.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Marukawa Cement Works 
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Low stock alert email sent for ${inventoryName} (${inventoryId}) to ${targetEmail}`);
    if (useFallback) {
      try {
        fs.appendFileSync(
          EMAIL_LOG_PATH,
          `${new Date().toISOString()} | LOW STOCK email to: ${targetEmail} | ${inventoryId} ${inventoryName} qty=${quantity} threshold=${threshold}\n`
        );
      } catch (e) {}
    }
    return true;
  } catch (error) {
    console.error('Error sending low stock alert email:', error);
    if (error && error.code === 'EAUTH' && process.env.NODE_ENV !== 'production') {
      try {
        fs.appendFileSync(
          EMAIL_LOG_PATH,
          `${new Date().toISOString()} | FAILED AUTH - LOW STOCK for: ${targetEmail} | ${inventoryId} ${inventoryName} qty=${quantity} threshold=${threshold}\n`
        );
        return true;
      } catch (e) {}
    }
    throw error;
  }
};

// Send Order Status Update email to customer
const sendOrderStatusUpdateEmail = async ({ toEmail, name, orderId, status, details, estimatedCompletionDate }) => {
  if (!toEmail) {
    console.error('sendOrderStatusUpdateEmail called without toEmail');
    return false;
  }

  const safeName = name || 'Valued Customer';
  const subject = `Update on Your Order ${orderId} - Status: ${status}`;
  const estText = estimatedCompletionDate
    ? `<p><strong>Estimated Completion Date:</strong> ${new Date(estimatedCompletionDate).toLocaleDateString()}</p>`
    : '';
  const detailsText = details
    ? `<p><strong>Update Details from Staff:</strong><br/>${details}</p>`
    : '';

  const mailOptions = {
    from: `"Marukawa Cement Works" <${process.env.EMAIL_USER || 'marukawacements@gmail.com'}>`,
    to: toEmail,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
          .wrapper { max-width: 640px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(15,23,42,0.12); }
          .header { background: linear-gradient(135deg, #c0a062, #d4b886); padding: 20px 24px; color: #111827; }
          .header h1 { margin: 0; font-size: 20px; }
          .content { padding: 24px; color: #111827; }
          .status-pill { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #e5e7eb; color: #111827; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
          .footer { padding: 16px 24px; font-size: 12px; color: #6b7280; background: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>Order Status Updated</h1>
          </div>
          <div class="content">
            <p>Dear ${safeName},</p>
            <p>Your order <strong>${orderId}</strong> has been updated by our staff.</p>
            <p>Current status:</p>
            <p><span class="status-pill">${status}</span></p>
            ${estText}
            ${detailsText}
            <p>If you have any questions, please reply to this email or contact our support team.</p>
            <p>Thank you for choosing Marukawa Cement Works.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Marukawa Cement Works, Molagoda, Kegalle, Sri Lanka</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order status update email sent to ${toEmail} for order ${orderId}`);
    if (useFallback) {
      try {
        fs.appendFileSync(EMAIL_LOG_PATH, `${new Date().toISOString()} | Order update email to: ${toEmail} | OrderID: ${orderId} | Status: ${status}\n`);
      } catch (e) {}
    }
    return true;
  } catch (error) {
    console.error('Error sending order status update email:', error);
    if (error && error.code === 'EAUTH' && process.env.NODE_ENV !== 'production') {
      try {
        fs.appendFileSync(EMAIL_LOG_PATH, `${new Date().toISOString()} | FAILED AUTH - Saved order update for: ${toEmail} | OrderID: ${orderId} | Status: ${status}\n`);
        console.log('Saved order update email record to', EMAIL_LOG_PATH);
        return true;
      } catch (e) {}
    }
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendPasswordResetOTP,
  sendLowStockAlertEmail,
  sendOrderStatusUpdateEmail
};
