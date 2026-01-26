// fix_storekeepers.js
const db = require('./config/db');

async function fixStorekeepers() {
  try {
    // Update Storekeepers
    await db.query('UPDATE Storekeeper SET StorekeeperID = ? WHERE StorekeeperID = ?', ['USR-0014', 'SK-0001']);
    await db.query('UPDATE Storekeeper SET StorekeeperID = ? WHERE StorekeeperID = ?', ['USR-0015', 'SK-0002']);
    console.log('✓ Updated Storekeeper IDs');
    
    // Fix users table
    const [keepers] = await db.query('SELECT Email FROM Storekeeper');
    for (const k of keepers) {
      await db.query('DELETE FROM users WHERE username = ?', [k.Email]);
    }
    
    await db.query('INSERT INTO users (id, username, password, role) SELECT StorekeeperID, Email, Password, "storekeeper" FROM Storekeeper');
    console.log('✓ Updated users table');
    
    console.log('\n✅ ALL IDs NOW USE UNIFIED USR-XXXX FORMAT!');
    console.log('\n📋 Complete user list:');
    
    const [all] = await db.query('SELECT id, username, role FROM users ORDER BY id');
    all.forEach(u => console.log(`  ${u.id} - ${u.role.padEnd(12)} - ${u.username}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
  }
}

fixStorekeepers();
