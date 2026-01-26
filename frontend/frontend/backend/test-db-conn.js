require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    // Try connecting to the specified database first
    let conn;
    try {
      conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
    } catch (err) {
      if (err && err.message && err.message.includes('Unknown database')) {
        console.log(`Database ${process.env.DB_NAME} not found — attempting to create it...`);
        // connect without database to create it
        const adminConn = await mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD
        });
        await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        await adminConn.end();
        conn = await mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME
        });
      } else {
        throw err;
      }
    }
    const [rows] = await conn.query('SELECT 1 + 1 AS result');
    console.log('DB test result:', rows[0]);
    await conn.end();
  } catch (err) {
    console.error('DB connection test failed:', err.message);
    process.exitCode = 1;
  }
})();
