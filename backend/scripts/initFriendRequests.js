const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const initFriendRequests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      { friendRequests: { $exists: false } },
      { $set: { friendRequests: [] } }
    );

    console.log(`Updated ${result.modifiedCount} user(s) to initialize friendRequests field.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error initializing friendRequests:', err);
    process.exit(1);
  }
};

initFriendRequests();
