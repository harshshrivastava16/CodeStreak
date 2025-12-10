const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const connectToMongo = require("../config/mongo");
const User = require("../models/User");
const fetchLeetcodeData = require("../utils/fetchers/leetcode");

const calculateCurrentStreak = (submissionCalendar) => {
  const dates = Object.keys(submissionCalendar)
    .filter((timestamp) => submissionCalendar[timestamp] > 0)
    .map((timestamp) => {
      const date = new Date(parseInt(timestamp) * 1000);
      date.setUTCHours(0, 0, 0, 0);
      return date.getTime();
    });

  const dateSet = new Set(dates);
  let streak = 0;

  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let currentDay = today.getTime();

  while (dateSet.has(currentDay)) {
    streak++;
    currentDay -= 86400000; // subtract 1 day in ms
  }

  return streak;
};

const updateLeetcodeStreaks = async () => {
  try {
    await connectToMongo();
    const users = await User.find({});

    for (const user of users) {
      // Find the LeetCode platform object
      const leetcodePlatform = user.platforms?.find(p => p.platform === "leetcode");
      const leetcodeUsername = leetcodePlatform?.username;

      if (!user.selectedPlatforms?.includes("leetcode") || !leetcodeUsername) {
        continue;
      }

      let currentStreakDays = 0;

      try {
        const userCalendar = await fetchLeetcodeData(leetcodeUsername);
        const rawCalendar = userCalendar?.submissionCalendar;

        if (rawCalendar) {
          const submissionCalendar = JSON.parse(rawCalendar);
          currentStreakDays = calculateCurrentStreak(submissionCalendar);
        } else {
          throw new Error("Invalid or empty submission calendar");
        }

        user.currentStreaks.leetcode = currentStreakDays;

        if (
          !user.longestStreaks.leetcode ||
          currentStreakDays > user.longestStreaks.leetcode
        ) {
          user.longestStreaks.leetcode = currentStreakDays;
        }

        user.lastUpdated.leetcode = new Date();
        await user.save({ validateBeforeSave: false });

        console.log(
          ` Updated LeetCode streak for ${leetcodeUsername}: ${currentStreakDays} days`
        );
      } catch (err) {
        console.error(
          ` Error updating LeetCode streak for ${leetcodeUsername}:`,
          err.message
        );
        user.currentStreaks.leetcode = 0;
        user.lastUpdated.leetcode = new Date();
        await user.save({ validateBeforeSave: false });
      }
    }

    console.log(" All user streaks updated for all users.");
    process.exit(0);
  } catch (err) {
    console.error(" Unexpected error:", err.message);
    process.exit(1);
  }
};

updateLeetcodeStreaks();
