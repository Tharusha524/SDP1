const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'marukawa_concrete_db'
    });

    console.log('=== CHECKING USERS TABLE STRUCTURE ===\n');
    const [usersCols] = await conn.query('DESCRIBE users');
    console.table(usersCols);

    console.log('\n=== SAMPLE USERS DATA ===\n');
    const [usersData] = await conn.query('SELECT * FROM users LIMIT 5');
    console.table(usersData);

    console.log('\n=== CHECKING ADMIN TABLE ===\n');
    const [adminData] = await conn.query('SELECT AdminID, Name, Email, LEFT(Password, 30) as Password FROM admin LIMIT 5');
    console.table(adminData);

    console.log('\n=== CHECKING STAFF TABLE ===\n');
    const [staffData] = await conn.query('SELECT StaffID, Name, Email, LEFT(Password, 30) as Password FROM staff LIMIT 5');
    console.table(staffData);

    console.log('\n=== CHECKING CUSTOMER TABLE ===\n');
    const [customerData] = await conn.query('SELECT CustomerID, Name, Email, LEFT(Password, 30) as Password FROM customer LIMIT 5');
    console.table(customerData);

    console.log('\n=== TEST: Simulating Login for First Admin ===\n');
    if (adminData.length > 0) {
      const testEmail = adminData[0].Email;
      const testPassword = adminData[0].Password;
      
      console.log(`Testing with Email: ${testEmail}`);
      console.log(`Password starts with: ${testPassword.substring(0, 10)}`);
      console.log(`Is Bcrypt Hash: ${testPassword.startsWith('$2b$') || testPassword.startsWith('$2a$')}\n`);

      // Simulate findByUsername
      const [userCheck] = await conn.query(
        'SELECT id, email, password, role FROM users WHERE email = ?',
        [testEmail]
      );

      if (userCheck.length > 0) {
        console.log('✓ Found in USERS table');
        console.log(`  Password in users table: ${userCheck[0].password.substring(0, 30)}`);
      } else {
        console.log('✗ NOT found in USERS table - checking role tables...');
        
        const [adminCheck] = await conn.query(
          'SELECT AdminID, Email, Password FROM admin WHERE Email = ?',
          [testEmail]
        );
        
        if (adminCheck.length > 0) {
          console.log('✓ Found in ADMIN table');
          console.log(`  Password in admin table: ${adminCheck[0].Password.substring(0, 30)}`);
          console.log('\n⚠️  PROBLEM: User exists in ADMIN table but not in USERS table!');
          console.log('   Login will check USERS table first and might not find the user.');
        }
      }
    }

    console.log('\n=== DIAGNOSIS ===\n');
    console.log('Please provide these details for debugging:');
    console.log('1. What email are you using to login?');
    console.log('2. What role is this user (admin/staff/customer)?');
    console.log('3. Check if the user exists in the tables above');

    await conn.end();
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
})();
