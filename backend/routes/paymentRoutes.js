const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { confirmFakePayment } = require('../controllers/subscriptionController');

// Placeholder for payment routes
router.get('/', (req, res) => {
  res.json({ message: 'Payment routes placeholder' });
});

// Fake payment route (no auth for simplicity in fake mode)
router.post('/fake', confirmFakePayment);


module.exports = router;
