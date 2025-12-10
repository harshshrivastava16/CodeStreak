const cron = require('node-cron');
const User = require('../models/User');
const { sendEmailReminder } = require('../utils/notifier');

const shouldWarnPlatform = (user, platform) => {
  const isPro = user?.subscription?.tier === 'pro' && user?.subscription?.status === 'active';
  if (isPro) return true; // pro: all platforms
  return platform === 'leetcode'; // free: only leetcode
};

const runOnce = async () => {
  const users = await User.find();
  const now = new Date();
  const todayStr = now.toDateString();
  for (const user of users) {
    const selected = Array.isArray(user.selectedPlatforms) ? user.selectedPlatforms : [];
    for (const platform of selected) {
      try {
        if (!shouldWarnPlatform(user, platform)) continue;
        const lastUpdatedDate = user.lastUpdated?.[platform]
          ? new Date(user.lastUpdated[platform]).toDateString()
          : null;
        // If not updated today, warn about pending break
        if (lastUpdatedDate !== todayStr) {
          await sendEmailReminder(user.email, platform, false);
        }
      } catch (err) {
        console.error('warningNotifier error:', err?.message || String(err));
      }
    }
  }
};

const startWarningNotifier = () => {
  const schedule = process.env.WARNING_CRON_SCHEDULE || '45 22 * * *'; // 10:45 PM
  cron.schedule(schedule, runOnce);
};

module.exports = startWarningNotifier; 