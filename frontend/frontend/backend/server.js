// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const db = require('./config/db');
const ensurePaymentTable = require('./utils/ensurePaymentTable');
const ensureOrderEstimatedDate = require('./utils/ensureOrderEstimatedDate');

const app = express();

// Enable CORS for frontend
app.use(cors({
	origin: [
		'http://localhost:3000',
		'http://localhost:3001',
		'http://localhost:5004',
		'http://127.0.0.1:3000',
		'http://127.0.0.1:3001',
		'http://127.0.0.1:5004'
	],
	credentials: true
}));

// Increase payload size limit for base64 images (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root route
app.get('/', (req, res) => {
	res.send('<h1>Marukawa Cement Backend</h1><p>Server is running and connected to MySQL.</p>');
});

// Ensure payment table and order estimated date column exist on startup
ensurePaymentTable();
ensureOrderEstimatedDate();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const notificationRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payments');
const customerRoutes = require('./routes/customers');

// Test SQL connection route
app.get('/api/test-db', async (req, res) => {
	try {
		const [rows] = await db.query('SELECT 1 + 1 AS result');
		res.json({ success: true, result: rows[0].result });
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customers', customerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
