const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting:', err);
    return;
  }
  console.log('✅ Connected to MySQL!');
  
  connection.query('SELECT * FROM users', (err, results) => {
    if (err) console.error(err);
    else console.log('Users:', results);
    connection.end();
  });
});