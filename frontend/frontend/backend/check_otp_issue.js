const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'marukawa_concrete_db'
    });

    console.log('=== CHECKING PENDING REGISTRATIONS ===\n');
    
    const [pending] = await conn.query('SELECT * FROM pending_registrations ORDER BY created_at DESC LIMIT 5');
    
    if (pending.length === 0) {
      console.log('No pending registrations found.\n');
      console.log('Try registering a new user first, then check the OTP sent to email.');
    } else {
      console.log('Recent pending registrations:');
      console.table(pending.map(p => ({
        email: p.email,
        name: p.name,
        role: p.role,
        otp: p.verification_token,
        expires: p.token_expires,
        created: p.created_at,
        expired: new Date() > new Date(p.token_expires) ? 'YES' : 'NO'
      })));
      
      console.log('\n=== OTP VERIFICATION TEST ===\n');
      const testUser = pending[0];
      console.log(`Test with:`);
      console.log(`  Email: ${testUser.email}`);
      console.log(`  OTP: ${testUser.verification_token}`);
      console.log(`  Expires: ${testUser.token_expires}`);
      console.log(`  Is Expired: ${new Date() > new Date(testUser.token_expires) ? 'YES ❌' : 'NO ✓'}`);
      
      // Check OTP format
      console.log(`\n  OTP Type: ${typeof testUser.verification_token}`);
      console.log(`  OTP Length: ${testUser.verification_token ? testUser.verification_token.length : 0}`);
      console.log(`  OTP Value: "${testUser.verification_token}"`);
      
      // Test comparison
      const testOTP = testUser.verification_token;
      console.log(`\n  Test comparison:`);
      console.log(`    "${testOTP}" === "${testUser.verification_token}": ${testOTP === testUser.verification_token}`);
      console.log(`    String comparison: ${String(testOTP) === String(testUser.verification_token)}`);
      console.log(`    Trimmed comparison: ${String(testOTP).trim() === String(testUser.verification_token).trim()}`);
    }

    console.log('\n=== CHECKING USERS TABLE ===\n');
    const [users] = await conn.query('SELECT id, email, role, is_verified FROM users ORDER BY id DESC LIMIT 5');
    console.log('Recent users:');
    console.table(users);

    await conn.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
