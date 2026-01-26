// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const db = require('./config/db');

const app = express();

// Enable CORS for frontend
app.use(cors({
	origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5004'],
	credentials: true
}));

app.use(express.json());

// Root route
app.get('/', (req, res) => {
	res.send('<h1>Marukawa Cement Backend</h1><p>Server is running and connected to MySQL.</p>');
});

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
