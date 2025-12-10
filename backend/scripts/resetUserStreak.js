const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function resetUserStreak() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/notifier');

    // First, list all users and their platforms to debug
    const allUsers = await User.find({});
    console.log('All users in database:');
    allUsers.forEach(user => {
      console.log(`- Name: ${user.name}, Email: ${user.email}`);
      if (user.platforms && user.platforms.length > 0) {
        user.platforms.forEach(p => {
          console.log(`  Platform: ${p.platform}, Username: ${p.username}`);
        });
      } else {
        console.log('  No platforms configured');
      }
    });

    // Reset streak for 16Harsh11
    const user1 = await User.findOne({
      'platforms': {
        $elemMatch: {
          platform: 'leetcode',
          username: '16Harsh11'
        }
      }
    });

    if (user1) {
      console.log('Resetting streak for 16Harsh11:');
      console.log(`Name: ${user1.name}`);
      console.log(`Current LeetCode streak: ${user1.currentStreaks?.leetcode || 0}`);

      user1.currentStreaks = user1.currentStreaks || {};
      user1.currentStreaks.leetcode = 1;
      user1.lastUpdated = user1.lastUpdated || {};
      user1.lastUpdated.leetcode = new Date();
      await user1.save();

      console.log(`Updated to: ${user1.currentStreaks.leetcode}`);
    } else {
      console.log('User with LeetCode username 16Harsh11 not found');
    }

    // Reset streak for Namn27
    const user2 = await User.findOne({
      'platforms': {
        $elemMatch: {
          platform: 'leetcode',
          username: 'Namn27'
        }
      }
    });

    if (user2) {
      console.log('\nResetting streak for Namn27:');
      console.log(`Name: ${user2.name}`);
      console.log(`Current LeetCode streak: ${user2.currentStreaks?.leetcode || 0}`);

      user2.currentStreaks = user2.currentStreaks || {};
      user2.currentStreaks.leetcode = 8;
      user2.lastUpdated = user2.lastUpdated || {};
      user2.lastUpdated.leetcode = new Date();
      await user2.save();

      console.log(`Updated to: ${user2.currentStreaks.leetcode}`);
    } else {
      console.log('User with LeetCode username Namn27 not found');
    }

    console.log('\nAll streaks reset successfully!');

  } catch (error) {
    console.error('Error resetting streak:', error);
  } finally {
    await mongoose.disconnect();
  }
}

resetUserStreak();
