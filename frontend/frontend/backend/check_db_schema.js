const db = require('./config/db');

async function checkSchema() {
    try {
        const [tables] = await db.query('SHOW TABLES');
        console.log('--- TABLES ---');
        console.log(tables.map(t => Object.values(t)[0]));

        const targetTables = ['users', 'Admin', 'Staff', 'Storekeeper', 'Customer'];
        for (const table of targetTables) {
            try {
                const [columns] = await db.query(`DESCRIBE ${table}`);
                console.log(`\n--- SCHEMA FOR ${table} ---`);
                console.table(columns.map(c => ({ Field: c.Field, Type: c.Type })));
            } catch (e) {
                console.log(`\nTable ${table} not found or error.`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
