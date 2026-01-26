-- Add email verification columns to users table
-- Run this SQL script in your MySQL database

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS otp VARCHAR(6),
ADD COLUMN IF NOT EXISTS otp_expiry DATETIME;

-- Optional: Create index for faster lookups
CREATE INDEX idx_users_otp ON users(otp);
CREATE INDEX idx_users_is_verified ON users(is_verified);

-- Set existing users as verified (optional - for backward compatibility)
UPDATE users SET is_verified = TRUE WHERE otp IS NULL;
