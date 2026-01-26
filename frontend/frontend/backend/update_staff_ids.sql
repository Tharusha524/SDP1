-- ============================================================================
-- UPDATE STAFF TABLE - Change StaffID to S-XXXX Format
-- ============================================================================
-- This script converts StaffID from INT to VARCHAR and updates to S-0001 format
-- Execute each section carefully and check results before proceeding
-- ============================================================================

-- STEP 1: Find and drop foreign key constraints referencing Staff(StaffID)
-- Run this query first to identify constraints:
SELECT 
    CONSTRAINT_NAME, 
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME = 'Staff'
AND REFERENCED_COLUMN_NAME = 'StaffID'
AND TABLE_SCHEMA = DATABASE();

-- Based on results above, drop the foreign keys (example):
-- ALTER TABLE Task DROP FOREIGN KEY task_ibfk_2;
-- ALTER TABLE Orders DROP FOREIGN KEY orders_ibfk_2;
-- (Adjust table/constraint names based on your actual schema)

-- ============================================================================
-- STEP 2: Modify StaffID column from INT to VARCHAR(20)
-- ============================================================================

-- First remove AUTO_INCREMENT if present
ALTER TABLE Staff MODIFY COLUMN StaffID INT;

-- Drop primary key temporarily
ALTER TABLE Staff DROP PRIMARY KEY;

-- Change column type to VARCHAR
ALTER TABLE Staff MODIFY COLUMN StaffID VARCHAR(20);

-- Add primary key back
ALTER TABLE Staff ADD PRIMARY KEY (StaffID);

-- ============================================================================
-- STEP 3: Update related tables (convert their StaffID columns to VARCHAR)
-- ============================================================================

-- Update Task table if it has StaffID
ALTER TABLE Task MODIFY COLUMN StaffID VARCHAR(20);

-- Update Orders table if it has StaffID
-- ALTER TABLE Orders MODIFY COLUMN StaffID VARCHAR(20);

-- (Add more tables as needed based on your schema)

-- ============================================================================
-- STEP 4: Create temporary table for mapping old IDs to new IDs
-- ============================================================================

CREATE TEMPORARY TABLE staff_id_mapping (
    old_id VARCHAR(20),
    new_id VARCHAR(20),
    staff_name VARCHAR(100)
);

-- Populate mapping table with current staff records
INSERT INTO staff_id_mapping (old_id, new_id, staff_name)
SELECT 
    StaffID,
    CONCAT('S-', LPAD(StaffID, 4, '0')) as new_id,
    Name
FROM Staff
ORDER BY CAST(StaffID AS UNSIGNED);

-- View the mapping to verify
SELECT * FROM staff_id_mapping;

-- ============================================================================
-- STEP 5: Set temporary emails to avoid unique constraint violations
-- ============================================================================

UPDATE Staff 
SET Email = CONCAT('__tmp_', StaffID, '@local.invalid');

-- ============================================================================
-- STEP 6: Update related tables first (if any)
-- ============================================================================

-- Update Task table
UPDATE Task t
JOIN staff_id_mapping m ON t.StaffID = m.old_id
SET t.StaffID = m.new_id;

-- Update Orders table if needed
-- UPDATE Orders o
-- JOIN staff_id_mapping m ON o.StaffID = m.old_id
-- SET o.StaffID = m.new_id;

-- (Add more tables as needed)

-- ============================================================================
-- STEP 7: Insert new staff records with formatted IDs
-- ============================================================================

INSERT INTO Staff (StaffID, Name, Email, Password, ContactNo, Address, CreatedAt, UpdatedAt)
SELECT 
    m.new_id,
    s.Name,
    REPLACE(s.Email, CONCAT('__tmp_', s.StaffID, '@local.invalid'), s.Email),
    s.Password,
    s.ContactNo,
    s.Address,
    s.CreatedAt,
    NOW()
FROM Staff s
JOIN staff_id_mapping m ON s.StaffID = m.old_id;

-- ============================================================================
-- STEP 8: Delete old records
-- ============================================================================

DELETE FROM Staff 
WHERE StaffID IN (SELECT old_id FROM staff_id_mapping);

-- ============================================================================
-- STEP 9: Verify the updates
-- ============================================================================

SELECT StaffID, Name, Email FROM Staff ORDER BY StaffID;

-- ============================================================================
-- STEP 10: Restore foreign key constraints
-- ============================================================================

-- Restore Task table foreign key
-- ALTER TABLE Task 
-- ADD CONSTRAINT task_ibfk_2
-- FOREIGN KEY (StaffID) REFERENCES Staff(StaffID);

-- Restore Orders table foreign key if needed
-- ALTER TABLE Orders
-- ADD CONSTRAINT orders_ibfk_2
-- FOREIGN KEY (StaffID) REFERENCES Staff(StaffID);

-- (Adjust constraint names based on your actual schema)

-- ============================================================================
-- CLEANUP
-- ============================================================================

DROP TEMPORARY TABLE IF EXISTS staff_id_mapping;

-- ============================================================================
-- DONE! All Staff IDs should now be in S-XXXX format
-- ============================================================================
