// jobs/streakChecker.js
const cron = require('node-cron');
const User = require('../models/User');
const { checkLeetCodeActivityToday } = require('../scrapers/leetcode');
const { sendEmailReminder } = require('../utils/notifier');

const updatePlatformStreak = async (user, platform, checkActivityFn) => {
  const username = user.platforms?.[platform];
  if (!username) return;

  const didSubmit = await checkActivityFn(username);

  const now = new Date();
  const todayStr = now.toDateString();
  const lastUpdatedDate = user.lastUpdated?.[platform]
    ? new Date(user.lastUpdated[platform]).toDateString()
    : null;

  if (lastUpdatedDate === todayStr) return; // Already updated today

  if (didSubmit) {
    user.currentStreaks[platform] = (user.currentStreaks[platform] || 0) + 1;
    if (
      !user.longestStreaks[platform] ||
      user.currentStreaks[platform] > user.longestStreaks[platform]
    ) {
      user.longestStreaks[platform] = user.currentStreaks[platform];
    }
    user.lastUpdated[platform] = now;
  } else {
    // Missed streak: reset current streak and send reminder only for LeetCode
    user.currentStreaks[platform] = 0;
    user.lastUpdated[platform] = now;
    if (platform === 'leetcode') {
      await sendEmailReminder(user.email, username);
    }
  }

  await user.save();
};

const startStreakChecker = () => {
  // Runs every day at 11:00 PM
  cron.schedule('0 23 * * *', async () => {
    const users = await User.find();
    for (const user of users) {
      if (user.selectedPlatforms?.includes('leetcode')) {
        await updatePlatformStreak(user, 'leetcode', checkLeetCodeActivityToday);
      }
    }
    console.log('✅ All platform streaks checked and updated');
  });
};

module.exports = startStreakChecker;
