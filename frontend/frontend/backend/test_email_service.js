require('dotenv').config();
const { sendOTPEmail } = require('./utils/emailService');

const testEmail = async () => {
    console.log('DEBUG: EMAIL_USER check:', process.env.EMAIL_USER ? 'Present' : 'MISSING');
    console.log('DEBUG: EMAIL_PASSWORD check:', process.env.EMAIL_PASSWORD ? 'Present' : 'MISSING');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('FAILURE: Environment variables not loaded correctly.');
        process.exit(1);
    }
    const email = 'pererasandaruwan075@gmail.com'; // Testing to the same email
    const otp = '123456';
    const name = 'Test User';

    console.log(`Attempting to send test email to ${email}...`);
    try {
        await sendOTPEmail(email, otp, name);
        console.log('SUCCESS: Email sent successfully!');
    } catch (error) {
        console.error('FAILURE: Error sending email:', error.message);
        if (error.message.includes('Invalid login')) {
            console.error('TIP: Double-check your EMAIL_USER and EMAIL_PASSWORD in .env. Make sure it is an APP PASSWORD.');
        }
    }
    process.exit(0);
};

testEmail();
