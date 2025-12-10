// jobs/streakChecker.js
const cron = require('node-cron');
const User = require('../models/User');
const StreakLog = require('../models/StreakLog');
const { checkLeetCodeActivityToday } = require('../scrapers/leetcode');
const { checkCodeforcesActivityToday } = require('../scrapers/codeforces');
const { checkGfgActivityToday } = require('../scrapers/gfg');
const { checkHackerRankActivityToday } = require('../scrapers/hackerrank');
const { sendEmailReminder } = require('../utils/notifier');

const platformCheckers = {
  leetcode: checkLeetCodeActivityToday,
  codeforces: checkCodeforcesActivityToday,
  gfg: checkGfgActivityToday,
  hackerrank: checkHackerRankActivityToday,
};

const updatePlatformStreak = async (user, platform, checkActivityFn, forceUpdate = false) => {
  // platforms stored as array of objects [{ platform, username }]
  const entry = Array.isArray(user.platforms) ? user.platforms.find(p => p.platform === platform) : null;
  const username = entry?.username;
  if (!username) {
    console.log(`  No username found for ${platform} platform for user ${user.name || user.email}`);
    return;
  }

  console.log(` Checking ${platform} activity for ${username}...`);
  const didSubmit = await checkActivityFn(username);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStr = now.toDateString();
  const lastUpdatedDate = user.lastUpdated?.[platform]
    ? new Date(user.lastUpdated[platform]).toDateString()
    : null;

  // Skip update if already updated today AND not forcing update (for cron jobs)
  if (!forceUpdate && lastUpdatedDate === todayStr) {
    console.log(`  Already updated ${platform} streak for ${username} today`);
    return; // Already updated today
  }

  // For forced updates (server startup), only proceed if user actually solved today
  if (forceUpdate && lastUpdatedDate === todayStr && !didSubmit) {
    console.log(`  ${platform} already updated for ${username} today and no new activity`);
    return; // Already updated today and no new submission
  }

  const previousStreak = user.currentStreaks[platform] || 0;

  if (didSubmit) {
    user.currentStreaks[platform] = (user.currentStreaks[platform] || 0) + 1;
    if (
      !user.longestStreaks[platform] ||
      user.currentStreaks[platform] > user.longestStreaks[platform]
    ) {
      user.longestStreaks[platform] = user.currentStreaks[platform];
    }
    user.lastUpdated[platform] = now;
    // Increment total problems solved since join only if new problems were solved
    try {
      let currentStats;
      if (platform === 'leetcode') {
        const fetcher = require('../utils/fetchers/leetcode');
        currentStats = await fetcher.fetchLeetCodeStats(username);
      } else if (platform === 'codeforces') {
        const fetcher = require('../utils/fetchers/codeforces');
        currentStats = await fetcher.fetchCodeforcesStats(username);
      } else if (platform === 'gfg') {
        const fetcher = require('../utils/fetchers/gfg');
        currentStats = await fetcher.fetchGfgStats(username);
      } else if (platform === 'hackerrank') {
        const fetcher = require('../utils/fetchers/hackerrank');
        currentStats = await fetcher.fetchHackerRankStats(username);
      }
      if (currentStats && currentStats.totalSolved !== undefined) {
        const lastTotal = user.lastTotalSolved?.[platform] || 0;
        const newProblems = currentStats.totalSolved - lastTotal;
        if (newProblems > 0) {
          user.totalProblemsSolvedSinceJoin = (user.totalProblemsSolvedSinceJoin || 0) + newProblems;
          user.lastTotalSolved[platform] = currentStats.totalSolved;
        }
      }
    } catch (error) {
      console.error(`Failed to update totalProblemsSolvedSinceJoin for ${platform}:`, error);
    }
    console.log(` ${platform} streak maintained for ${username}: ${previousStreak} → ${user.currentStreaks[platform]} days`);
    await sendEmailReminder(user.email, platform, true);
  } else {
    // Missed streak: reset current streak and send reminder for that platform
    user.currentStreaks[platform] = 0;
    user.lastUpdated[platform] = now;
    console.log(` ${platform} streak broken for ${username}: ${previousStreak} → 0 days`);
    await sendEmailReminder(user.email, platform, false);
  }

  await user.save();

  try {
    await StreakLog.updateOne(
      { userId: user._id, platform, date: today },
      {
        $set: {
          username,
          maintained: didSubmit,
          currentStreak: user.currentStreaks[platform] || 0,
          longestStreak: user.longestStreaks[platform] || 0,
        },
      },
      { upsert: true }
    );
  } catch (e) {
    console.error('Failed to write StreakLog:', e?.message || String(e));
  }
};

const startStreakChecker = async () => {
  // Default 11:00 PM; can be overridden by env CRON_SCHEDULE
  const schedule = process.env.CRON_SCHEDULE || '0 23 * * *';

  // Function to run streak checks
  const runStreakChecks = async (forceUpdate = false) => {
    console.log(` Starting streak update check...${forceUpdate ? ' (forced recalculation)' : ''}`);
    const users = await User.find();
    console.log(` Found ${users.length} users to check`);

    for (const user of users) {
      try {
        const selected = Array.isArray(user.selectedPlatforms) ? user.selectedPlatforms : [];
        console.log(` Checking user: ${user.name || user.email} (${selected.length} platforms)`);

        for (const platform of selected) {
          const checker = platformCheckers[platform];
          if (checker) {
            console.log(` Checking ${platform} activity for user ${user.name || user.email}`);
            await updatePlatformStreak(user, platform, checker, forceUpdate);
          }
        }
      } catch (err) {
        console.error(` Streak update failed for user ${user._id}:`, err?.message || String(err));
      }
    }
    console.log(' All platform streaks checked and updated');
  };

  // Run immediately on server start for testing
  console.log(' Running initial streak check on server startup...');

  // Also log current streaks for all users
  const logCurrentStreaks = async () => {
    const users = await User.find();
    console.log('\n Current Streaks:');
    users.forEach(user => {
      console.log(` ${user.name || user.email}:`);
      if (user.currentStreaks) {
        Object.entries(user.currentStreaks).forEach(([platform, streak]) => {
          console.log(`  ${platform}: ${streak} days`);
        });
      } else {
        console.log('  No streaks recorded yet');
      }
    });
    console.log('');
  };

  await logCurrentStreaks();
  // Don't force recalculation on server startup - only check if needed
  await runStreakChecks(false);

  // Log updated streaks after recalculation
  console.log('\n Updated Streaks after recalculation:');
  await logCurrentStreaks();

  // Schedule regular checks
  cron.schedule(schedule, runStreakChecks);
};

module.exports = startStreakChecker;
