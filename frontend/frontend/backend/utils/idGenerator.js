// ID Generator utility for generating formatted IDs
// Format: PREFIX-XXXX where XXXX is a 4-digit number

const generateId = (prefix, existingIds = [], padding = 4) => {
  // Extract numbers from existing IDs
  const numbers = existingIds
    .filter(id => id && id.startsWith(prefix))
    .map(id => {
      const match = id.match(/\d+$/);
      return match ? parseInt(match[0]) : 0;
    });

  // Get the highest number
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  
  // Generate new number (next in sequence)
  const newNumber = maxNumber + 1;
  
  // Format with leading zeros
  const formattedNumber = String(newNumber).padStart(padding, '0');
  
  return `${prefix}-${formattedNumber}`;
};

const generateSequentialId = async (db, table, column, prefix, padding = 4) => {
  try {
    const [rows] = await db.query(
      `SELECT ${column} AS id FROM ${table} WHERE ${column} REGEXP ?`,
      [`^${prefix}-[0-9]{${padding}}$`]
    );
    const existingIds = rows.map(row => row.id);
    return generateId(prefix, existingIds, padding);
  } catch (error) {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}-${randomNum}`;
  }
};

const generateOrderId = async (db) => {
  return generateSequentialId(db, 'orders', 'OrderID', 'ORD', 4);
};

const generateProductId = async (db) => {
  try {
    const [rows] = await db.query('SELECT ProductID FROM product ORDER BY ProductID DESC LIMIT 100');
    const existingIds = rows.map(row => row.ProductID);
    return generateId('PRD', existingIds);
  } catch (error) {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `PRD-${randomNum}`;
  }
};

const generateOrderItemId = async (db) => {
  try {
    const [rows] = await db.query('SELECT OrderItemID FROM orderitem ORDER BY OrderItemID DESC LIMIT 100');
    const existingIds = rows.map(row => row.OrderItemID);
    return generateId('OID', existingIds);
  } catch (error) {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `OID-${randomNum}`;
  }
};

const generateUserId = async (db) => {
  try {
    const [rows] = await db.query('SELECT id FROM users ORDER BY id DESC LIMIT 100');
    const existingIds = rows.map(row => row.id);
    return generateId('USR', existingIds);
  } catch (error) {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `USR-${randomNum}`;
  }
};

const generateTaskId = async (db) => {
  try {
    const [rows] = await db.query('SELECT TaskID FROM task ORDER BY TaskID DESC LIMIT 100');
    const existingIds = rows.map(row => row.TaskID);
    return generateId('T', existingIds, 3);
  } catch (error) {
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `T-${randomNum}`;
  }
};

const generateMaterialId = async (db) => {
  try {
    const [rows] = await db.query('SELECT id FROM materials ORDER BY id DESC LIMIT 100');
    const existingIds = rows.map(row => row.id);
    return generateId('MAT', existingIds);
  } catch (error) {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `MAT-${randomNum}`;
  }
};

const generateCustomerId = async (db) => {
  try {
    const [rows] = await db.query('SELECT CustomerID FROM Customer ORDER BY CustomerID DESC LIMIT 100');
    const existingIds = rows.map(row => row.CustomerID);
    return generateId('CUS', existingIds);
  } catch (error) {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `CUS-${randomNum}`;
  }
};

const generateStaffId = async (db) => {
  try {
    const [rows] = await db.query('SELECT StaffID FROM Staff ORDER BY StaffID DESC LIMIT 100');
    const existingIds = rows.map(row => row.StaffID);
    return generateId('S', existingIds);
  } catch (error) {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `S-${randomNum}`;
  }
};

const generateStorekeeperId = async (db) => {
  try {
    const [rows] = await db.query('SELECT StorekeeperID FROM Storekeeper ORDER BY StorekeeperID DESC LIMIT 100');
    const existingIds = rows.map(row => row.StorekeeperID);
    return generateId('SK', existingIds);
  } catch (error) {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `SK-${randomNum}`;
  }
};

const generateAdminId = async (db) => {
  try {
    const [rows] = await db.query('SELECT AdminID FROM Admin ORDER BY AdminID DESC LIMIT 100');
    const existingIds = rows.map(row => row.AdminID);
    return generateId('A', existingIds);
  } catch (error) {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `A-${randomNum}`;
  }
};

const generateNotificationId = async (db) => {
  try {
    const [rows] = await db.query('SELECT NotificationID FROM notification ORDER BY NotificationID DESC LIMIT 100');
    const existingIds = rows.map(row => row.NotificationID);
    return generateId('NO', existingIds, 3);
  } catch (error) {
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `NO-${randomNum}`;
  }
};

const generatePaymentId = async (db) => {
  return generateSequentialId(db, 'payment', 'PaymentID', 'PAY', 4);
};

module.exports = {
  generateId,
  generateOrderId,
  generateProductId,
  generateOrderItemId,
  generateUserId,
  generateTaskId,
  generateMaterialId,
  generateCustomerId,
  generateStaffId,
  generateStorekeeperId,
  generateAdminId,
  generateNotificationId,
  generatePaymentId
};
