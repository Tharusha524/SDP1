-- Create table for pending user registrations (before email verification)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional: Clean up expired pending registrations (older than 24 hours)
DELETE FROM pending_registrations WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);
