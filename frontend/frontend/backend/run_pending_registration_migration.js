const db = require('./config/db');

async function createPendingRegistrationsTable() {
  try {
    console.log('Creating pending_registrations table...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS pending_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        contact VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        verification_token VARCHAR(6) NOT NULL,
        token_expires DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_token (verification_token),
        INDEX idx_expires (token_expires)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    console.log('✅ pending_registrations table created successfully!');
    
    // Clean up expired pending registrations
    await db.query(`
      DELETE FROM pending_registrations 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    
    console.log('✅ Cleaned up expired pending registrations');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createPendingRegistrationsTable();
