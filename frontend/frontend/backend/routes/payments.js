const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// Customer starts legacy PayHere 40% advance payment (kept for reference)
router.post('/payhere-init', authenticateToken, authorizeRole('customer'), paymentController.payhereInit);

// Customer completes direct in-app card payment (no PayHere redirect)
router.post(
	'/card-direct',
	authenticateToken,
	authorizeRole('customer'),
	paymentController.cardDirectPayment
);

// PayHere sandbox return URL (no auth; called by PayHere after payment)
// PayHere may redirect with GET (browser) or POST; support both.
router.post('/payhere-return', paymentController.payhereReturn);
router.get('/payhere-return', paymentController.payhereReturn);
// Finalize order after successful PayHere return (called from frontend UI)
router.post('/finalize', authenticateToken, authorizeRole('customer'), paymentController.finalizeOrder);

module.exports = router;
