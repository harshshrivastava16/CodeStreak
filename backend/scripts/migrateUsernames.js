const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const migrateUsernames = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/notifier";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(" MongoDB connected");

    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    // First, ensure all users have unique usernames
    for (const user of users) {
      let needsUpdate = false;

      // If user has no name, generate one from email
      if (!user.name) {
        const emailPrefix = user.email.split('@')[0];
        let username = emailPrefix;
        let counter = 1;
        
        // Keep trying until we find a unique username
        while (await User.findOne({ name: username, _id: { $ne: user._id } })) {
          username = `${emailPrefix}${counter}`;
          counter++;
        }
        
        user.name = username;
        needsUpdate = true;
        console.log(` Generated username "${username}" for user: ${user.email}`);
      }

      // Ensure arrays are properly initialized
      if (!Array.isArray(user.friends)) { user.friends = []; needsUpdate = true; }
      if (!Array.isArray(user.friendRequests)) { user.friendRequests = []; needsUpdate = true; }
      if (!Array.isArray(user.pendingFriends)) { user.pendingFriends = []; needsUpdate = true; }
      if (!Array.isArray(user.platforms)) { user.platforms = []; needsUpdate = true; }

      if (needsUpdate) {
        await user.save();
        console.log(` Updated user: ${user.email} (${user.name})`);
      }
    }

    // Now migrate friend relationships from IDs to usernames
    console.log("\n Migrating friend relationships...");
    
    for (const user of users) {
      let needsUpdate = false;

      // Convert friend IDs to usernames
      if (user.friends && user.friends.length > 0) {
        const friendUsernames = [];
        for (const friendId of user.friends) {
          try {
            const friend = await User.findById(friendId);
            if (friend && friend.name) {
              friendUsernames.push(friend.name);
            }
          } catch (err) {
            console.log(`  Could not find friend with ID: ${friendId}`);
          }
        }
        user.friends = friendUsernames;
        needsUpdate = true;
      }

      // Convert friend request IDs to usernames
      if (user.friendRequests && user.friendRequests.length > 0) {
        const requestUsernames = [];
        for (const requestId of user.friendRequests) {
          try {
            const requester = await User.findById(requestId);
            if (requester && requester.name) {
              requestUsernames.push(requester.name);
            }
          } catch (err) {
            console.log(`  Could not find requester with ID: ${requestId}`);
          }
        }
        user.friendRequests = requestUsernames;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save();
        console.log(` Migrated friend relationships for: ${user.name}`);
      }
    }

    console.log("\n Username migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error(" Migration failed:", error);
    process.exit(1);
  }
};

migrateUsernames(); 