// Database connection setup
// - purpose: configure and export a reusable MySQL connection pool
// - notes: uses environment variables for credentials and host. The pool
//   improves performance by reusing connections instead of opening a
//   new socket for each request.
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'SDP',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Quick connection test on startup: logs success or a concise error.
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the MySQL database.');
    connection.release();
  } catch (err) {
    console.error('Error connecting to the database:', err.message);
  }
})();

// Export the pool for use by controllers and other backend modules
module.exports = pool;
