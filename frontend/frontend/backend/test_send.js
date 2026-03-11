const { sendOTPEmail } = require('./utils/emailService');

(async () => {
  try {
    console.log('Starting test send...');
    await sendOTPEmail(process.env.EMAIL_USER || 'test@example.com', '123456', 'Dev Tester');
    console.log('Test send completed successfully');
  } catch (err) {
    console.error('Test send failed:');
    console.error(err);
    if (err.response) console.error('SMTP response:', err.response);
    if (err.code) console.error('Error code:', err.code);
  }
})();
