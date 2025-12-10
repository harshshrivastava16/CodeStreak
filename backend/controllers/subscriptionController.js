const User = require("../models/User");
const nodemailer = require("nodemailer");

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASS
  }
});

// Send subscription confirmation email
const sendSubscriptionEmail = async (user, subscription) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_ID,
      to: user.email,
      subject: 'Welcome to CodeStreak Pro! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4CAF50;">Thank you for upgrading to CodeStreak Pro!</h1>
          <p>Hi ${user.name},</p>
          <p>We're excited to have you as a Pro member! Your subscription is now active and you have access to all premium features.</p>
          
          <h2>Your Pro Features:</h2>
          <ul>
            <li>Unlimited Friends</li>
            <li>Advanced Leaderboard Stats</li>
            <li>Custom Streak Alerts</li>
            <li>Multi-Platform Syncing</li>
            <li>AI-Driven Insights</li>
          </ul>
          
          <p><strong>Subscription Details:</strong></p>
          <ul>
            <li>Started: ${subscription.startedAt.toDateString()}</li>
            <li>Expires: ${subscription.expiresAt.toDateString()}</li>
            <li>Duration: 30 days</li>
          </ul>
          
          <p>Start exploring your new features by logging into your dashboard!</p>
          
          <p>Best regards,<br>The CodeStreak Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Subscription confirmation email sent to:', user.email);
  } catch (error) {
    console.error('Failed to send subscription email:', error);
  }
};

// Start fake checkout
const startFakeCheckout = async (req, res) => {
  try {
    const { userId, plan } = req.body;
    if (!userId || !plan) return res.status(400).json({ message: "Missing userId or plan" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Simulate a payment intent id
    const paymentId = `fake_pay_${Date.now()}`;

    // Store last payment id for record; don't activate yet
    user.subscription = user.subscription || {};
    user.subscription.lastPaymentId = paymentId;
    user.subscription.paymentProvider = "fake";
    await user.save();

    return res.status(200).json({
      message: "Fake checkout started",
      paymentId,
      clientSecret: `secret_${paymentId}`,
    });
  } catch (err) {
    console.error("startFakeCheckout error:", err);
    return res.status(500).json({ message: "Failed to start checkout", error: err.message });
  }
};

// Confirm fake payment: immediately activates Pro for 30 days
const confirmFakePayment = async (req, res) => {
  try {
    const { paymentId, fakeCardNumber, userId } = req.body;
    if (!paymentId) return res.status(400).json({ message: "Missing paymentId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // For fake gateway, any data is accepted; optionally reject specific numbers to simulate failures
    if (fakeCardNumber && String(fakeCardNumber).endsWith("0000")) {
      return res.status(402).json({ message: "Payment declined by fake gateway" });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    user.subscription = {
      tier: "pro",
      status: "active",
      startedAt: now,
      expiresAt,
      cancelAtPeriodEnd: false,
      paymentProvider: "fake",
      lastPaymentId: paymentId,
    };

    await user.save();

    // Send confirmation email
    sendSubscriptionEmail(user, user.subscription);

    return res.status(200).json({
      message: "Subscription activated",
      subscription: user.subscription,
    });
  } catch (err) {
    console.error("confirmFakePayment error:", err);
    return res.status(500).json({ message: "Failed to confirm payment", error: err.message });
  }
};

// Get subscription status
const getSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("subscription");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ subscription: user.subscription || { tier: "free", status: "inactive" } });
  } catch (err) {
    console.error("getSubscription error:", err);
    return res.status(500).json({ message: "Failed to fetch subscription", error: err.message });
  }
};

// Cancel at period end
const cancelAtPeriodEnd = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.subscription = user.subscription || {};
    if (user.subscription.status !== "active") {
      return res.status(400).json({ message: "Subscription is not active" });
    }

    user.subscription.cancelAtPeriodEnd = true;
    await user.save();

    return res.status(200).json({ message: "Subscription will cancel at period end", subscription: user.subscription });
  } catch (err) {
    console.error("cancelAtPeriodEnd error:", err);
    return res.status(500).json({ message: "Failed to cancel subscription", error: err.message });
  }
};

module.exports = {
  startFakeCheckout,
  confirmFakePayment,
  getSubscription,
  cancelAtPeriodEnd,
}; 