// update_passwords.js
// Script to update all user passwords with formal hashed passwords
const bcrypt = require('bcrypt');
const db = require('./config/db');

const SALT_ROUNDS = 10;

async function updatePasswords() {
  console.log('Starting password update process...\n');

  try {
    // 1. Update Admin passwords
    console.log('Updating Admin passwords...');
    const [admins] = await db.query('SELECT AdminID, Name FROM admin ORDER BY AdminID');
    for (let i = 0; i < admins.length; i++) {
      const password = `Admin@12${3 + i}`;
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await db.query('UPDATE admin SET Password = ? WHERE AdminID = ?', [hashedPassword, admins[i].AdminID]);
      console.log(`  ✓ ${admins[i].Name} (${admins[i].AdminID}): "${password}" -> hashed`);
    }

    // 2. Update Staff passwords
    console.log('\nUpdating Staff passwords...');
    const [staff] = await db.query('SELECT StaffID, Name FROM staff ORDER BY StaffID');
    for (let i = 0; i < staff.length; i++) {
      const password = `Staff@12${3 + i}`;
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await db.query('UPDATE staff SET Password = ? WHERE StaffID = ?', [hashedPassword, staff[i].StaffID]);
      console.log(`  ✓ ${staff[i].Name} (${staff[i].StaffID}): "${password}" -> hashed`);
    }

    // 3. Update Customer passwords
    console.log('\nUpdating Customer passwords...');
    const [customers] = await db.query('SELECT CustomerID, Name FROM customer ORDER BY CustomerID');
    for (let i = 0; i < customers.length; i++) {
      const password = `Customer@12${3 + i}`;
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await db.query('UPDATE customer SET Password = ? WHERE CustomerID = ?', [hashedPassword, customers[i].CustomerID]);
      console.log(`  ✓ ${customers[i].Name} (${customers[i].CustomerID}): "${password}" -> hashed`);
    }

    // 4. Update Storekeeper passwords
    console.log('\nUpdating Storekeeper passwords...');
    const [storekeepers] = await db.query('SELECT StorekeeperID, Name FROM storekeeper ORDER BY StorekeeperID');
    for (let i = 0; i < storekeepers.length; i++) {
      const password = `Storekeeper@12${3 + i}`;
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await db.query('UPDATE storekeeper SET Password = ? WHERE StorekeeperID = ?', [hashedPassword, storekeepers[i].StorekeeperID]);
      console.log(`  ✓ ${storekeepers[i].Name} (${storekeepers[i].StorekeeperID}): "${password}" -> hashed`);
    }

    // 5. Update unified users table if it has records
    console.log('\nUpdating unified users table...');
    const [users] = await db.query('SELECT id, username, role FROM users ORDER BY id');
    for (let user of users) {
      let password;
      const roleCount = users.filter(u => u.role === user.role).indexOf(user);
      
      switch(user.role.toLowerCase()) {
        case 'admin':
          password = `Admin@12${3 + roleCount}`;
          break;
        case 'staff':
          password = `Staff@12${3 + roleCount}`;
          break;
        case 'customer':
          password = `Customer@12${3 + roleCount}`;
          break;
        case 'storekeeper':
          password = `Storekeeper@12${3 + roleCount}`;
          break;
        default:
          password = `User@123`;
      }
      
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
      console.log(`  ✓ ${user.username} (${user.id}, ${user.role}): "${password}" -> hashed`);
    }

    console.log('\n✅ All passwords updated successfully!');
    console.log('\n📋 Password Summary:');
    console.log('   Admins: Admin@123, Admin@124, Admin@125...');
    console.log('   Staff: Staff@123, Staff@124, Staff@125...');
    console.log('   Customers: Customer@123, Customer@124, Customer@125...');
    console.log('   Storekeepers: Storekeeper@123, Storekeeper@124, Storekeeper@125...');
    console.log('\n⚠️  All passwords are now securely hashed using bcrypt!');

  } catch (error) {
    console.error('❌ Error updating passwords:', error);
    throw error;
  } finally {
    await db.end();
  }
}

// Run the script
updatePasswords()
  .then(() => {
    console.log('\n✨ Password update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to update passwords:', error);
    process.exit(1);
  });
