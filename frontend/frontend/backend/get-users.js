const db = require('./config/db');

(async () => {
    try {
        console.log('Fetching all users from database...\n');

        // Get all users
        const [users] = await db.query('SELECT id, username, password, role FROM users');

        console.log('=== ALL USERS IN DATABASE ===\n');
        users.forEach(user => {
            console.log(`Role: ${user.role}`);
            console.log(`Username/Email: ${user.username}`);
            console.log(`Password: ${user.password}`);
            console.log(`ID: ${user.id}`);
            console.log('---');
        });

        console.log(`\nTotal users found: ${users.length}`);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();
