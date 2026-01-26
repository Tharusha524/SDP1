const db = require('./config/db');

async function check() {
    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = "teststaff5@example.com"');
        console.log('User Record:', users);

        const [staff] = await db.query('SELECT * FROM Staff WHERE Email = "teststaff5@example.com"');
        console.log('Staff Record:', staff);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

check();
