const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'marukawa_concrete_db'
    });

    console.log('=== LOGIN CREDENTIALS DIAGNOSTIC ===\n');

    // Check all user tables for login credentials
    console.log('1. Checking USERS table (main authentication):');
    const [users] = await conn.query('SELECT id, username, LEFT(password, 20) as pwd_preview, role, is_verified FROM users LIMIT 10');
    console.table(users);

    console.log('\n2. Checking ADMIN table:');
    const [admins] = await conn.query('SELECT AdminID as id, Name, Email, LEFT(Password, 20) as pwd_preview FROM admin LIMIT 5');
    console.table(admins);

    console.log('\n3. Checking STAFF table:');
    const [staff] = await conn.query('SELECT StaffID as id, Name, Email, LEFT(Password, 20) as pwd_preview FROM staff LIMIT 5');
    console.table(staff);

    console.log('\n4. Checking CUSTOMER table:');
    const [customers] = await conn.query('SELECT CustomerID as id, Name, Email, LEFT(Password, 20) as pwd_preview FROM customer LIMIT 5');
    console.table(customers);

    console.log('\n5. Checking STOREKEEPER table:');
    const [storekeepers] = await conn.query('SELECT StorekeeperID as id, Name, Email, LEFT(Password, 20) as pwd_preview FROM storekeeper LIMIT 5');
    console.table(storekeepers);

    console.log('\n=== PASSWORD FORMAT ANALYSIS ===\n');

    // Check if passwords are bcrypt hashed
    const allUsers = [
      ...users.map(u => ({ table: 'users', email: u.username, pwd: u.pwd_preview })),
      ...admins.map(a => ({ table: 'admin', email: a.Email, pwd: a.pwd_preview })),
      ...staff.map(s => ({ table: 'staff', email: s.Email, pwd: s.pwd_preview })),
      ...customers.map(c => ({ table: 'customer', email: c.Email, pwd: c.pwd_preview })),
      ...storekeepers.map(k => ({ table: 'storekeeper', email: k.Email, pwd: k.pwd_preview }))
    ].filter(u => u.pwd);

    console.log('Password format by table:');
    allUsers.forEach(u => {
      const isBcrypt = u.pwd.startsWith('$2b$') || u.pwd.startsWith('$2a$');
      console.log(`  ${u.table.padEnd(15)} ${u.email.padEnd(30)} ${isBcrypt ? '✓ HASHED' : '✗ PLAIN TEXT'}`);
    });

    console.log('\n=== TEST LOGIN SCENARIOS ===\n');

    // Test with a sample user from each table
    const testEmail = admins.length > 0 ? admins[0].Email : (staff.length > 0 ? staff[0].Email : null);
    
    if (testEmail) {
      console.log(`Testing login flow for: ${testEmail}\n`);

      // Simulate findByUsername function
      console.log('Step 1: Finding user by email...');
      
      // Check users table first
      const [userCheck] = await conn.query(
        'SELECT id, username, password as Password, role FROM users WHERE username = ?',
        [testEmail]
      );
      
      if (userCheck.length > 0) {
        console.log('  ✓ Found in USERS table:', userCheck[0]);
      } else {
        console.log('  ✗ Not found in USERS table');
        
        // Check admin table
        const [adminCheck] = await conn.query(
          'SELECT AdminID as id, Email, Password, "admin" as role FROM admin WHERE Email = ?',
          [testEmail]
        );
        
        if (adminCheck.length > 0) {
          console.log('  ✓ Found in ADMIN table:', adminCheck[0]);
        }
      }

      console.log('\nStep 2: Password comparison test...');
      console.log('  Try logging in with:');
      console.log(`    Email: ${testEmail}`);
      console.log(`    Password: (test with both hashed and plain text)`);
    }

    console.log('\n=== COMMON ISSUES TO CHECK ===\n');
    console.log('1. Password Mismatch:');
    console.log('   - Passwords in role-specific tables (admin, staff, etc.) might be PLAIN TEXT');
    console.log('   - But login code expects HASHED passwords');
    console.log('   - Solution: Hash all passwords OR update login logic');
    
    console.log('\n2. Table Inconsistency:');
    console.log('   - User might exist in role-specific table but NOT in users table');
    console.log('   - findByUsername checks users table FIRST');
    
    console.log('\n3. Email Case Sensitivity:');
    console.log('   - Email might be stored with different case');
    
    console.log('\n=== RECOMMENDED FIX ===\n');
    console.log('Run this query to check if user exists and password format:');
    console.log(`SELECT 'users' as source, id, username as email, LEFT(password,10) as pwd FROM users WHERE username = 'YOUR_EMAIL'`);
    console.log(`UNION`);
    console.log(`SELECT 'admin', AdminID, Email, LEFT(Password,10) FROM admin WHERE Email = 'YOUR_EMAIL'`);
    console.log(`UNION`);
    console.log(`SELECT 'staff', StaffID, Email, LEFT(Password,10) FROM staff WHERE Email = 'YOUR_EMAIL'`);
    console.log(`UNION`);
    console.log(`SELECT 'customer', CustomerID, Email, LEFT(Password,10) FROM customer WHERE Email = 'YOUR_EMAIL'`);

    await conn.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
