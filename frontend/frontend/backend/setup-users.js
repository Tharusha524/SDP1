const db = require('./config/db');

(async () => {
    try {
        console.log('Setting up users table and adding test users...\n');

        // Create users table if it doesn't exist
        await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff', 'storekeeper', 'customer') DEFAULT 'customer'
      )
    `);
        console.log('✓ Users table created/verified');

        // Check if users already exist
        const [existingUsers] = await db.query('SELECT COUNT(*) as count FROM users');

        if (existingUsers[0].count === 0) {
            // Insert test users
            await db.query(`
        INSERT INTO users (username, password, role) VALUES
        ('admin@marukawa.com', 'admin123', 'admin'),
        ('staff@marukawa.com', 'staff123', 'staff'),
        ('keeper@marukawa.com', 'keeper123', 'storekeeper'),
        ('customer@marukawa.com', 'customer123', 'customer')
      `);
            console.log('✓ Test users created\n');
        } else {
            console.log('✓ Users already exist in database\n');
        }

        // Display all users
        const [users] = await db.query('SELECT id, username, password, role FROM users');

        console.log('=== AVAILABLE LOGIN CREDENTIALS ===\n');
        users.forEach(user => {
            console.log(`${user.role.toUpperCase()}`);
            console.log(`  Email: ${user.username}`);
            console.log(`  Password: ${user.password}`);
            console.log('');
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();
