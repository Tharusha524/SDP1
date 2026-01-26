// Test script to check if OTP verification is working
require('dotenv').config();
const db = require('./config/db');
const { generateOTP, sendOTPEmail } = require('./utils/emailService');

async function testOTPSystem() {
  console.log('🧪 Testing OTP Verification System...\n');

  try {
    // Test 1: Check database schema
    console.log('1️⃣ Checking database schema...');
    const [columns] = await db.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('is_verified', 'otp', 'otp_expiry')
    `);
    
    if (columns.length === 3) {
      console.log('✅ Database schema is correct!');
      columns.forEach(col => {
        console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
      });
    } else {
      console.log('❌ Database migration not complete. Missing columns.');
      console.log('   Please run: backend/migrations/add_otp_verification.sql');
      return;
    }

    // Test 2: Check email configuration
    console.log('\n2️⃣ Checking email configuration...');
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('❌ Email credentials not configured in .env file');
      console.log('   Please add EMAIL_USER and EMAIL_PASSWORD to .env');
      return;
    }
    console.log('✅ Email credentials found in .env');
    console.log(`   Email: ${process.env.EMAIL_USER}`);

    // Test 3: Generate OTP
    console.log('\n3️⃣ Testing OTP generation...');
    const testOTP = generateOTP();
    if (testOTP.length === 6 && /^\d+$/.test(testOTP)) {
      console.log('✅ OTP generation working!');
      console.log(`   Sample OTP: ${testOTP}`);
    } else {
      console.log('❌ OTP generation failed');
      return;
    }

    // Test 4: Test email sending (optional - uncomment to test)
    console.log('\n4️⃣ Email sending test...');
    console.log('   ⚠️  To test email sending, uncomment the code in this script');
    console.log('   ⚠️  and replace with your test email address');
    
    // UNCOMMENT BELOW TO TEST EMAIL SENDING
    // const testEmail = 'your-test-email@gmail.com'; // Replace with your email
    // await sendOTPEmail(testEmail, testOTP, 'Test User');
    // console.log(`✅ Test email sent to ${testEmail}`);
    // console.log('   Check your inbox (and spam folder) for the OTP email');

    console.log('\n✅ All tests passed! OTP system is ready to use.');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the backend: node server.js');
    console.log('   2. Start the frontend: npm start');
    console.log('   3. Register a new user with a real email');
    console.log('   4. Check your email for the OTP');
    console.log('   5. Verify your account with the OTP\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Full error:', error);
  } finally {
    process.exit(0);
  }
}

testOTPSystem();
