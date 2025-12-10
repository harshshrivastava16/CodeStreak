const cron = require('node-cron');
const User = require('../models/User');
const { checkLeetCodeActivityToday } = require('../scrapers/leetcode');
const { checkCodeforcesActivityToday } = require('../scrapers/codeforces');
const { checkGfgActivityToday } = require('../scrapers/gfg');
const { checkHackerRankActivityToday } = require('../scrapers/hackerrank');

const platformCheckers = {
  leetcode: checkLeetCodeActivityToday,
  codeforces: checkCodeforcesActivityToday,
  gfg: checkGfgActivityToday,
  hackerrank: checkHackerRankActivityToday,
};

const runOnce = async () => {
  console.log('Running instant activity check...');
  const users = await User.find();
  console.log(`Instant check: Found ${users.length} users`);

  for (const user of users) {
    const selected = Array.isArray(user.selectedPlatforms) ? user.selectedPlatforms : [];
    for (const platform of selected) {
      try {
        const entry = Array.isArray(user.platforms) ? user.platforms.find(p => p.platform === platform) : null;
        const username = entry?.username;
        if (!username) continue;
        const checker = platformCheckers[platform];
        if (!checker) continue;

        console.log(`Instant check: ${platform} for ${username}`);
        const didSubmit = await checker(username);
        const now = new Date();
        const todayStr = now.toDateString();
        const lastUpdatedDate = user.lastUpdated?.[platform]
          ? new Date(user.lastUpdated[platform]).toDateString()
          : null;

        // Only increment if there's a new submission and we haven't updated today
        if (didSubmit && lastUpdatedDate !== todayStr) {
          const previousStreak = user.currentStreaks[platform] || 0;
          user.currentStreaks[platform] = (user.currentStreaks[platform] || 0) + 1;
          if (
            !user.longestStreaks[platform] ||
            user.currentStreaks[platform] > user.longestStreaks[platform]
          ) {
            user.longestStreaks[platform] = user.currentStreaks[platform];
          }
          user.lastUpdated[platform] = now;
          await user.save();
          console.log(` Instant update: ${platform} streak for ${username}: ${previousStreak} → ${user.currentStreaks[platform]} days`);
        } else if (didSubmit) {
          console.log(` Instant check: ${platform} already updated for ${username} today`);
        } else {
          console.log(` Instant check: No ${platform} activity for ${username} today`);
        }
      } catch (err) {
        console.error('instantActivityChecker error:', err?.message || String(err));
      }
    }
  }
  console.log(' Instant activity check completed');
};

const startInstantActivityChecker = () => {
  const schedule = process.env.INSTANT_CRON_SCHEDULE || '*/10 * * * *'; // every 10 minutes
  cron.schedule(schedule, runOnce);
};

module.exports = startInstantActivityChecker; 