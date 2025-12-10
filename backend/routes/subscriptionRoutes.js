const express = require("express");
const router = express.Router();

const {
  startFakeCheckout,
  confirmFakePayment,
  getSubscription,
  cancelAtPeriodEnd,
} = require("../controllers/subscriptionController");

// Start fake checkout
router.post("/checkout/start", startFakeCheckout);

// Confirm fake payment
router.post("/checkout/confirm", confirmFakePayment);

// Get subscription
router.get("/:userId", getSubscription);

// Cancel at period end
router.post("/cancel", cancelAtPeriodEnd);

module.exports = router; 