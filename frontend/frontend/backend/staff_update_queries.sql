-- ============================================================================
-- QUICK STAFF ID UPDATE - Step-by-step queries for run_query.py
-- ============================================================================
-- Copy and paste each query one at a time into run_query.py
-- Wait for success before proceeding to the next query
-- ============================================================================

-- QUERY 1: Check current staff records
SELECT StaffID, Name, Email FROM Staff ORDER BY StaffID;

-- QUERY 2: Find foreign key constraints
SELECT CONSTRAINT_NAME, TABLE_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_NAME = 'Staff' AND REFERENCED_COLUMN_NAME = 'StaffID' AND TABLE_SCHEMA = DATABASE();

-- QUERY 3: Drop foreign keys (adjust based on QUERY 2 results)
-- Example: ALTER TABLE Task DROP FOREIGN KEY task_ibfk_2;

-- QUERY 4: Modify StaffID to VARCHAR
ALTER TABLE Staff MODIFY COLUMN StaffID INT;

-- QUERY 5: Drop primary key
ALTER TABLE Staff DROP PRIMARY KEY;

-- QUERY 6: Change to VARCHAR(20)
ALTER TABLE Staff MODIFY COLUMN StaffID VARCHAR(20);

-- QUERY 7: Add primary key back
ALTER TABLE Staff ADD PRIMARY KEY (StaffID);

-- QUERY 8: Update related table columns (if Task table exists)
ALTER TABLE Task MODIFY COLUMN StaffID VARCHAR(20);

-- QUERY 9: Create temp mapping table
CREATE TEMPORARY TABLE staff_mapping (old_id VARCHAR(20), new_id VARCHAR(20));

-- QUERY 10: Populate mapping
INSERT INTO staff_mapping SELECT StaffID, CONCAT('S-', LPAD(StaffID, 4, '0')) FROM Staff;

-- QUERY 11: View mapping
SELECT * FROM staff_mapping;

-- QUERY 12: Set temp emails
UPDATE Staff SET Email = CONCAT('__tmp_', StaffID, '@local.invalid');

-- QUERY 13: Update Task table IDs
UPDATE Task t JOIN staff_mapping m ON t.StaffID = m.old_id SET t.StaffID = m.new_id;

-- QUERY 14: Insert new staff records
INSERT INTO Staff (StaffID, Name, Email, Password, ContactNo, Address, CreatedAt, UpdatedAt) SELECT m.new_id, s.Name, CONCAT(s.Name, s.StaffID, '@gmail.com'), s.Password, s.ContactNo, s.Address, s.CreatedAt, NOW() FROM Staff s JOIN staff_mapping m ON s.StaffID = m.old_id;

-- QUERY 15: Delete old records
DELETE FROM Staff WHERE StaffID IN (SELECT old_id FROM staff_mapping);

-- QUERY 16: Verify results
SELECT StaffID, Name, Email FROM Staff ORDER BY StaffID;

-- QUERY 17: Drop temp table
DROP TEMPORARY TABLE IF EXISTS staff_mapping;

-- QUERY 18: Restore foreign keys (adjust constraint name)
-- Example: ALTER TABLE Task ADD CONSTRAINT task_ibfk_2 FOREIGN KEY (StaffID) REFERENCES Staff(StaffID);
