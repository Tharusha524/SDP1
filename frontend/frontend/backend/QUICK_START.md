# 🚀 Quick Start - OTP Email Verification

## ⚡ 3-Minute Setup

### 1. Create .env file (1 minute)
```bash
cd E:\SDP1\frontend\frontend\backend
copy .env.example .env
```

Edit `.env` and add your email:
```env
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

**Get Gmail App Password**: https://myaccount.google.com/apppasswords
(Requires 2FA enabled → Security → App Passwords → Mail → Generate)

---

### 2. Run Database Migration (30 seconds)
Open MySQL Workbench or CLI and run:

```sql
USE your_database_name;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS otp VARCHAR(6),
ADD COLUMN IF NOT EXISTS otp_expiry DATETIME;
```

---

### 3. Test the System (30 seconds)
```bash
cd E:\SDP1\frontend\frontend\backend
node test_otp_system.js
```

Should see: `✅ All tests passed!`

---

### 4. Start Servers (1 minute)
```bash
# Terminal 1 - Backend
cd E:\SDP1\frontend\frontend\backend
node server.js

# Terminal 2 - Frontend  
cd E:\SDP1\frontend\frontend
npm start
```

---

### 5. Test Registration
1. Go to http://localhost:3000/register
2. Register with your **real email**
3. Check email for 6-digit OTP
4. Enter OTP on verification page
5. Login with credentials

---

## 🎯 Done!

Your OTP email verification system is now live!

**Need help?** Check:
- [OTP_IMPLEMENTATION_SUMMARY.md](./OTP_IMPLEMENTATION_SUMMARY.md) - Complete implementation details
- [EMAIL_VERIFICATION_SETUP.md](./EMAIL_VERIFICATION_SETUP.md) - Detailed setup guide

---

## 🔥 Test Email Command

```bash
cd E:\SDP1\frontend\frontend\backend
node -e "require('dotenv').config(); const {sendOTPEmail} = require('./utils/emailService'); sendOTPEmail('test@example.com', '123456', 'Test').then(() => console.log('✅ Email sent!')).catch(e => console.error('❌ Error:', e.message));"
```

Replace `test@example.com` with your email to test.
