const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const migrateUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/notifier";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(" MongoDB connected");

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      let needsUpdate = false;

      // Ensure platforms is an array
      if (!Array.isArray(user.platforms)) {
        user.platforms = [];
        needsUpdate = true;
      }

      // Ensure friends arrays exist
      if (!Array.isArray(user.friends)) {
        user.friends = [];
        needsUpdate = true;
      }

      if (!Array.isArray(user.friendRequests)) {
        user.friendRequests = [];
        needsUpdate = true;
      }

      if (!Array.isArray(user.pendingFriends)) {
        user.pendingFriends = [];
        needsUpdate = true;
      }

      // Ensure streak objects exist
      if (!user.currentStreaks) {
        user.currentStreaks = { leetcode: 0 };
        needsUpdate = true;
      }

      if (!user.longestStreaks) {
        user.longestStreaks = { leetcode: 0 };
        needsUpdate = true;
      }

      if (!user.lastUpdated) {
        user.lastUpdated = { leetcode: new Date() };
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save();
        console.log(` Migrated user: ${user.email}`);
      }
    }

    console.log(" Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error(" Migration failed:", error);
    process.exit(1);
  }
};

migrateUsers(); 