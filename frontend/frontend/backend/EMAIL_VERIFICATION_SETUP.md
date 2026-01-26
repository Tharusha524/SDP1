# Email Verification Setup Guide

## 📧 OTP-Based Email Verification System

This system sends a 6-digit OTP to users during registration for email verification.

---

## 🔧 Setup Instructions

### 1. Configure Email Credentials

Create a `.env` file in the `backend` directory:

```bash
cd backend
copy .env.example .env
```

Edit the `.env` file with your email credentials:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-database-password
DB_NAME=your-database-name

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Server
PORT=5000
```

---

### 2. Gmail App Password Setup (Recommended)

For Gmail users, you need to create an **App Password** (not your regular Gmail password):

#### Steps to Create Gmail App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** tab
3. Enable **2-Step Verification** (required for App Passwords)
4. Once 2FA is enabled, return to **Security** tab
5. Under "Signing in to Google", click **App passwords**
6. Select app: **Mail**
7. Select device: **Other (Custom name)** → Enter "Marukawa Verification"
8. Click **Generate**
9. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
10. Paste it into your `.env` file as `EMAIL_PASSWORD` (without spaces)

**Example `.env` entry:**
```env
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

---

### 3. Database Migration

Run the SQL migration to add OTP fields to the users table:

```bash
# In your MySQL client or MySQL Workbench, run:
cd backend/migrations
# Open and execute: add_otp_verification.sql
```

Or via MySQL CLI:
```bash
mysql -u root -p your_database_name < backend/migrations/add_otp_verification.sql
```

The migration adds these columns:
- `is_verified` (BOOLEAN, default FALSE)
- `otp` (VARCHAR(6))
- `otp_expiry` (DATETIME)

---

### 4. Restart Backend Server

After configuring `.env`, restart your backend:

```bash
cd backend
node server.js
```

You should see:
```
Server running on port 5000
MySQL connected successfully
```

---

## 🎯 How It Works

### Registration Flow:

1. **User Registers** → Fills registration form
2. **Account Created** → `is_verified = false`, OTP generated (6 digits)
3. **Email Sent** → OTP sent via NodeMailer to user's email
4. **OTP Storage** → OTP + expiry (10 minutes) stored in database
5. **Redirect** → User redirected to verification page
6. **User Enters OTP** → 6-digit code input
7. **Verification** → Backend checks OTP validity and expiry
8. **Success** → `is_verified = true`, user can now login

### Login Flow:

- **Verified Users**: Login normally
- **Unverified Users**: Login blocked with message "Please verify your email with the OTP sent to you"

---

## 🔍 API Endpoints

### POST `/api/auth/register`
Creates user account and sends OTP email.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "contact": "0771234567",
  "password": "SecurePass123",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "U00001",
  "message": "Registration successful! Please check your email for the OTP to verify your account.",
  "email": "john@example.com"
}
```

---

### POST `/api/auth/verify-otp`
Verifies the OTP code.

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now log in."
}
```

**Error Cases:**
- Invalid OTP: `{ "success": false, "message": "Invalid OTP" }`
- Expired OTP: `{ "success": false, "message": "OTP has expired. Please request a new one." }`
- Already verified: `{ "success": false, "message": "Account already verified" }`

---

### POST `/api/auth/resend-otp`
Resends a new OTP to the user's email.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "New OTP sent successfully! Please check your email."
}
```

---

## 🎨 Frontend Components

### VerifyEmail.jsx
- **6-digit OTP input boxes** with auto-focus
- **Paste support** for easy OTP entry
- **Resend OTP** with 60-second cooldown
- **Real-time validation** and error display
- **Success animation** on verification

### Register.jsx
- After successful registration, redirects to `/verify-email` with email in state
- Success message: "Registration successful! Please check your email for the OTP"

---

## 🧪 Testing

### Test the Email System:

1. **Register a new user** with a real email address
2. **Check your email** for the OTP (check spam folder too)
3. **Enter the OTP** on the verification page
4. **Try logging in** - should work after verification
5. **Try logging in before verification** - should be blocked

### Test Resend OTP:
1. Wait for OTP to expire (10 minutes) or use wrong OTP
2. Click "Resend OTP"
3. Check email for new code
4. Verify with new OTP

---

## 🛡️ Security Features

- ✅ **OTP Expiry**: Codes expire after 10 minutes
- ✅ **Bcrypt Password Hashing**: All passwords encrypted
- ✅ **Rate Limiting**: Resend OTP has 60-second cooldown
- ✅ **Login Protection**: Unverified users cannot login
- ✅ **Single-Use OTP**: OTP cleared after successful verification

---

## 🐛 Troubleshooting

### Email Not Sending:

1. **Check `.env` file** - Ensure EMAIL_USER and EMAIL_PASSWORD are correct
2. **Check Gmail settings** - App Password must be generated (not regular password)
3. **Check 2FA** - Must be enabled for App Passwords
4. **Check server logs** - Look for nodemailer errors in terminal
5. **Test email config**:
   ```javascript
   // In backend, run this test:
   const { sendOTPEmail } = require('./utils/emailService');
   sendOTPEmail('your-email@gmail.com', '123456', 'Test User');
   ```

### OTP Not Working:

1. **Check database** - Ensure migration ran successfully:
   ```sql
   DESC users;
   -- Should show: is_verified, otp, otp_expiry columns
   ```
2. **Check OTP expiry** - OTP expires after 10 minutes
3. **Check for typos** - OTP is case-sensitive (numbers only)

### Login Still Blocked After Verification:

1. **Check database** - Verify `is_verified` is TRUE:
   ```sql
   SELECT username, is_verified FROM users WHERE username = 'your-email@example.com';
   ```
2. **Clear browser cache** - Try incognito mode
3. **Restart backend** - Ensure latest code is running

---

## 📝 Alternative Email Providers

### For Outlook/Hotmail:

```env
EMAIL_USER=yourname@outlook.com
EMAIL_PASSWORD=your-outlook-password
```

Update `emailService.js`:
```javascript
const transporter = nodemailer.createTransporter({
  service: 'outlook',  // Change from 'gmail' to 'outlook'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### For Other Providers (SMTP):

```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.example.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

---

## ✅ Checklist

- [ ] `.env` file created with email credentials
- [ ] Gmail App Password generated (if using Gmail)
- [ ] Database migration executed
- [ ] Backend server restarted
- [ ] Test registration with real email
- [ ] OTP received in email
- [ ] OTP verification successful
- [ ] Login works after verification
- [ ] Login blocked before verification

---

## 📞 Support

If you encounter issues:
1. Check backend console for errors
2. Check browser console for frontend errors
3. Verify `.env` configuration
4. Ensure database migration completed
5. Test email sending separately

**Email sending test:**
```bash
node -e "const {sendOTPEmail} = require('./utils/emailService'); sendOTPEmail('test@example.com', '123456', 'Test').then(() => console.log('Sent!')).catch(console.error);"
```
