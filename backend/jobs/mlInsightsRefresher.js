const cron = require('node-cron');
const axios = require('axios');
const User = require('../models/User');
const StreakLog = require('../models/StreakLog');
const MlInsight = require('../models/MlInsight');

// Build activity logs for a user
 
const buildActivities = async (userId) => {
  // Fetch streak logs for the last 365 entries
  const logs = await StreakLog.find({
    userId,
    platform: 'leetcode'
  })
    .sort({ date: -1 })
    .limit(365)
    .lean();

  if (!logs || logs.length === 0) return [];

  return logs.map((l) => ({
    platform: l.platform || 'leetcode',
    topic: l.problem?.tags?.[0] || 'general',
    success: l.maintained ? 1 : 0,
    time_spent: 1.0, // placeholder, upgrade later
    date: new Date(l.date).toISOString()
  })).filter((a) => a.topic); // Only include if topic exists
  };
  


/**
 * Run ML refresh task for all eligible users
 */
const runOnce = async () => {
  const mlBase = process.env.ML_SERVICE_URL || 'http://localhost:8000';

  console.log(`[ML] Refresh starting at ${new Date().toISOString()}`);

  let users;
  try {
    users = await User.find({
      'subscription.tier': 'pro',
      'subscription.status': 'active'
    })
      .select('_id')
      .lean();
  } catch (e) {
    console.error('[ML] Failed to fetch users:', e.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log('[ML] No eligible users found.');
    return;
  }

  // Process users sequentially to avoid overwhelming the ML server
  for (const user of users) {
    const userId = String(user._id);

    try {
      const activities = await buildActivities(userId);

      if (!activities || activities.length === 0) {
        console.log(`[ML] Skipped user ${userId} — no streak logs.`);
        continue;
      }

      // Call the ML microservice
      const res = await axios.post(
        `${mlBase}/insights`,
        { user_id: userId, activities },
        { timeout: 15000 }
      );

      const data = res?.data ?? null;

      if (!data) {
        console.warn(`[ML] Warning: No insights returned for user ${userId}.`);
        continue;
      }

      // Store insights
      await MlInsight.updateOne(
        { userId },
        {
          $set: {
            userId,
            data,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      console.log(`[ML] Insights updated for user ${userId}.`);
    } catch (err) {
      console.error(
        `[ML] Failed for user ${userId}:`,
        err?.response?.data || err?.message || err
      );
    }
  }

  console.log(`[ML] Refresh finished at ${new Date().toISOString()}`);
};

/**
 * Start cron schedule
 */
const startMlInsightsRefresher = () => {
  const schedule = process.env.ML_CRON_SCHEDULE || '15 23 * * *';

  try {
    cron.schedule(schedule, runOnce, {
      scheduled: true,
      timezone: 'Asia/Kolkata' // adjust if needed
    });

    console.log(`[ML] Cron scheduled: ${schedule}`);
  } catch (e) {
    console.error('[ML] Invalid cron schedule:', schedule, e.message);
  }
};

module.exports = startMlInsightsRefresher;
