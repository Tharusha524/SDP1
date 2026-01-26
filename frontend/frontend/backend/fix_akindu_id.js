// fix_akindu_id.js
const db = require('./config/db');

async function fixAkinduId() {
  try {
    const newId = 'USR-0013';
    
    // Update Customer table
    await db.query('UPDATE Customer SET CustomerID = ? WHERE CustomerID = ?', [newId, 'CUS-0005']);
    console.log('✓ Updated Customer table');
    
    // Fix users table
    await db.query('DELETE FROM users WHERE username = ?', ['akindu789@gmail.com']);
    await db.query(
      'INSERT INTO users (id, username, password, role) SELECT ?, Email, Password, "customer" FROM Customer WHERE CustomerID = ?',
      [newId, newId]
    );
    console.log('✓ Updated users table');
    
    console.log(`\n✅ akindu perera ID migrated: CUS-0005 → ${newId}`);
    console.log('\n📋 All unified IDs:');
    
    const [admins] = await db.query('SELECT AdminID, Name FROM Admin');
    const [staff] = await db.query('SELECT StaffID, Name FROM Staff');
    const [customers] = await db.query('SELECT CustomerID, Name FROM Customer');
    const [keepers] = await db.query('SELECT StorekeeperID, Name FROM Storekeeper');
    
    console.log('\nAdmins:', admins.map(a => `${a.Name}(${a.AdminID})`).join(', '));
    console.log('Staff:', staff.map(s => `${s.Name}(${s.StaffID})`).join(', '));
    console.log('Customers:', customers.map(c => `${c.Name}(${c.CustomerID})`).join(', '));
    console.log('Storekeepers:', keepers.map(k => `${k.Name}(${k.StorekeeperID})`).join(', '));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
  }
}

fixAkinduId();
