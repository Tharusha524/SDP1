const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// Customer starts PayHere 40% advance payment
router.post('/payhere-init', authenticateToken, authorizeRole('customer'), paymentController.payhereInit);

// PayHere sandbox return URL (no auth; called by PayHere after payment)
// PayHere may redirect with GET (browser) or POST; support both.
router.post('/payhere-return', paymentController.payhereReturn);
router.get('/payhere-return', paymentController.payhereReturn);

module.exports = router;
