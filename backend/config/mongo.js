// backend/config/mongo.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectToMongo = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/notifier";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(" MongoDB connected");
  } catch (err) {
    console.error(" MongoDB connection error:", err.message);
    console.log("Please make sure MongoDB is running or set MONGO_URI environment variable");
    process.exit(1);
  }
};

module.exports = connectToMongo;
