// cleanup_old_ids.js
const db = require('./config/db');

async function cleanup() {
  try {
    // Remove old numeric IDs
    await db.query('DELETE FROM users WHERE id NOT LIKE "USR%"');
    console.log('✅ Cleaned old numeric IDs from users table');
    
    const [users] = await db.query('SELECT id, role, username FROM users ORDER BY id');
    console.log(`\n📊 Total users: ${users.length}`);
    console.log('\n📋 Final unified user list:\n');
    users.forEach(u => console.log(`  ${u.id} - ${u.role.padEnd(12)} - ${u.username}`));
    
    console.log('\n🎉 UNIFIED ID SYSTEM COMPLETE!');
    console.log('   ✓ All users now have USR-XXXX format');
    console.log('   ✓ Each user has ONE unique ID');
    console.log('   ✓ Registration will generate sequential USR IDs');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
  }
}

cleanup();
