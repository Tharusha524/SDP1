// Migration script: drop Priority column from task table if it exists

const db = require('./config/db');

async function migrate() {
  try {
    console.log('Starting migration: drop Priority column from task table...');

    const [cols] = await db.query("SHOW COLUMNS FROM task LIKE 'Priority'");
    if (cols.length > 0) {
      console.log('Priority column found on task table. Dropping...');
      await db.query('ALTER TABLE task DROP COLUMN Priority');
      console.log('Priority column dropped successfully.');
    } else {
      console.log('Priority column not found on task table. Nothing to do.');
    }

    console.log('Migration completed.');
  } catch (err) {
    console.error('Error during migration:', err.message || err);
  } finally {
    await db.end();
  }
}

migrate();
