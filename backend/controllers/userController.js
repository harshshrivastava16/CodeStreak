const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const fetchLeetCodeStreak = require("../utils/fetchers/leetcode");
const { fetchLeetCodeStats } = require("../utils/fetchers/leetcodeAlt");
const validateLeetcodeUsername = require("../utils/validateLeetcodeUsername");
const { checkLeetCodeActivityToday } = require("../scrapers/leetcode");

// ✅ REGISTER USER
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Check if username is already taken
    const existingUserByName = await User.findOne({ name });
    if (existingUserByName) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // Validate username format
    if (!name || name.length < 3 || name.length > 20) {
      return res.status(400).json({ message: "Username must be between 3 and 20 characters" });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      password: hashedPassword,
      platforms: [],
      friends: [],
      friendRequests: [],
      pendingFriends: [],
      currentStreaks: { leetcode: 0 },
      longestStreaks: { leetcode: 0 },
      lastUpdated: { leetcode: new Date() },
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo
      },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Username or email already exists" });
    }
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// ✅ LOGIN USER
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user has password (not Google-only user)
    if (!user.password) {
      return res.status(400).json({ message: "Please login with Google" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// ✅ GOOGLE AUTH
const verifyGoogleToken = async (req, res) => {
  const { _id, email, name, photo, googleId } = req.body;

  if (!_id || !email) {
    return res.status(400).json({ message: "Missing required fields: _id or email" });
  }

  console.log('Google auth request:', { _id, email, name, photo, googleId });

  try {
    let user = await User.findOne({ email });

    if (!user) {
      console.log('Creating new user with _id:', _id);

      // Generate unique username from email if name is not provided
      let username = name || email.split('@')[0];
      let counter = 1;
      let originalUsername = username;

      // Ensure username is unique
      while (await User.findOne({ name: username })) {
        username = `${originalUsername}${counter}`;
        counter++;
      }

      user = new User({
        _id,
        email,
        name: username,
        photo,
        googleId,
        platforms: [{ platform: "google", username: email }], // Initialize with valid platform object
        friends: [],
        friendRequests: [],
        pendingFriends: [],
        currentStreaks: { leetcode: 0 },
        longestStreaks: { leetcode: 0 },
        lastUpdated: { leetcode: new Date() },
      });

      // Defensive: Remove any invalid platform entries before save
      if (user.platforms && user.platforms.length > 0) {
        user.platforms = user.platforms.filter(p => p.platform);
      }

      await user.save();
      console.log('User created successfully with username:', username);
    } else {
      // Update Google ID if not present
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        await user.save();
      }

      // Update name if not set
      if (!user.name && name) {
        // Generate unique username from name
        let username = name;
        let counter = 1;
        let originalUsername = username;

        // Ensure username is unique
        while (await User.findOne({ name: username, _id: { $ne: user._id } })) {
          username = `${originalUsername}${counter}`;
          counter++;
        }

        user.name = username;
        await user.save();
        console.log('Updated name for existing user:', username);
      }

      console.log('User found:', user._id);
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo
      },
      token
    });
  } catch (err) {
    console.error('Google auth error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// ✅ UPDATE PLATFORM ARRAY
const updateUserPlatforms = async (req, res) => {
  const userId = req.params.id;
  const { platform, username } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user.platforms) {
      user.platforms = [];
    }
    
    const existingPlatform = user.platforms.find((p) => p.platform === platform);

    if (existingPlatform) {
      existingPlatform.username = username;
    } else {
      user.platforms.push({ platform, username });
    }

    await user.save();
    res.status(200).json({ message: "Platform updated", platforms: user.platforms });
  } catch (err) {
    console.error('Update platform error:', err);
    res.status(500).json({ message: "Failed to update platform", error: err.message });
  }
};

// ✅ STREAK CALCULATION
const getUserStreaks = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    const streaks = {};

    if (user.platforms && user.platforms.length > 0) {
      for (const platform of user.platforms) {
        const { platform: platformName, username } = platform;

        if (platformName === "leetcode") {
          const streak = await fetchLeetCodeStreak(username);
          streaks[platformName] = streak;
        }
      }
    }

    res.status(200).json(streaks);
  } catch (err) {
    console.error('Get streaks error:', err);
    res.status(500).json({ message: "Failed to fetch streaks", error: err.message });
  }
};

// ✅ PROFILE VALIDATION
const validateUserProfile = async (req, res) => {
  const { platform, username } = req.params;

  try {
    if (platform === "leetcode") {
      console.log(`Validating LeetCode username: "${username}"`);
      const isValid = await validateLeetcodeUsername(username);
      console.log(`Validation result for "${username}": ${isValid}`);
      return res.status(200).json({ valid: isValid });
    }

    res.status(400).json({ message: "Unsupported platform" });
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({ message: "Validation failed", error: err.message });
  }
};

// ✅ DIRECT STREAK FETCH
const getDirectStreaks = async (req, res) => {
  const userId = req.params.uid;

  try {
    const user = await User.findById(userId);
    const result = [];

    if (user.platforms && user.platforms.length > 0) {
      for (const platform of user.platforms) {
        const { platform: platformName, username } = platform;

        if (platformName === "leetcode") {
          const data = await fetchLeetCodeStats(username);
          result.push({ platform: platformName, ...data });
        }
      }
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
};

// ✅ GET PROFILE
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ SEND FRIEND REQUEST
const addFriend = async (req, res) => {
  const { userName, friendName } = req.body;

  console.log("addFriend called with:", { userName, friendName });

  try {
    // Search user by name only
    const user = await User.findOne({ name: userName });

    const friend = await User.findOne({ name: friendName });

    console.log("Found user:", user);
    console.log("Found friend:", friend);

    if (!user || !friend) {
      console.error("User or friend not found");
      return res.status(404).json({ message: "User or friend not found" });
    }

    if (user.name === friend.name) {
      return res.status(400).json({ message: "You cannot add yourself as a friend" });
    }

    if (user.friends.includes(friend.name)) {
      return res.status(400).json({ message: "Already friends with this user" });
    }

    if (user.friendRequests.includes(friend.name)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Send friend request using updateOne to avoid validation errors
    if (!friend.friendRequests.includes(user.name)) {
      await User.updateOne(
        { _id: friend._id },
        { $addToSet: { friendRequests: user.name } }
      );
    }

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (err) {
    console.error('Add friend error:', err);
    res.status(500).json({ message: "Failed to send friend request", error: err.message });
  }
};

// ✅ FRIENDS WITH STREAKS (INCLUDES CURRENT USER)
const getFriendsWithStreaks = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Include current user in the friends list
    const currentUser = {
      id: user._id,
      name: user.name || "Unknown",
      photo: user.photo || "",
      email: user.email || "",
      currentStreak: user.currentStreaks?.leetcode || 0,
      longestStreak: user.longestStreaks?.leetcode || 0,
      isCurrentUser: true
    };

    // Get friends by usernames
    const friendsWithStreaks = [];
    if (user.friends && user.friends.length > 0) {
      const friendUsers = await User.find({ name: { $in: user.friends } });
      friendsWithStreaks.push(...friendUsers.map((friend) => ({
        id: friend._id,
        name: friend.name || "Unknown",
        photo: friend.photo || "",
        email: friend.email || "",
        currentStreak: friend.currentStreaks?.leetcode || 0,
        longestStreak: friend.longestStreaks?.leetcode || 0,
        isCurrentUser: false
      })));
    }

    // Add current user to the list
    const allUsers = [currentUser, ...friendsWithStreaks];

    // Get incoming friend requests by usernames
    const incomingRequests = [];
    if (user.friendRequests && user.friendRequests.length > 0) {
      const incomingUsers = await User.find({ name: { $in: user.friendRequests } });
      incomingRequests.push(...incomingUsers.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo
      })));
    }

    // Get outgoing friend requests (users who have this user in their friendRequests)
    const outgoingRequests = [];
    const outgoingUsers = await User.find({ friendRequests: { $in: [user.name] } });
    outgoingRequests.push(...outgoingUsers.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo
    })));

    res.status(200).json({
      friends: allUsers,
      incomingRequests,
      outgoingRequests,
      currentUser
    });
  } catch (err) {
    console.error('Get friends error:', err);
    res.status(500).json({ message: "Failed to fetch friends", error: err.message });
  }
};

// ✅ UPDATE PROFILE (WITH USERNAME UNIQUENESS CHECK)
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = req.body;

    // If platforms is a string (from multipart/form-data), parse it
    if (typeof updateData.platforms === "string") {
      try {
        updateData.platforms = JSON.parse(updateData.platforms);
      } catch (e) {
        return res.status(400).json({ message: "Invalid platforms format" });
      }
    }

    // Handle photo upload
    if (req.file) {
      // Save the relative path to the photo in updateData.photo
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    if (updateData.name) {
      const existingUser = await User.findOne({ name: updateData.name });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Add "leetcode" to selectedPlatforms if LeetCode username is verified
    if (updateData.platforms) {
      const hasLeetCode = updateData.platforms.some(p => p.platform === "leetcode" && p.username);
      if (hasLeetCode) {
        const user = await User.findById(id);
        if (user) {
          if (!user.selectedPlatforms.includes("leetcode")) {
            user.selectedPlatforms.push("leetcode");
            await user.save();
          }
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// ✅ UPDATE STREAK MANUALLY
const updateUserStreak = async (req, res) => {
  try {
    const { id } = req.params;
    const { streak } = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, { streak }, { new: true });

    res.status(200).json({ message: "Streak updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Streak update failed", error: err.message });
  }
};

// ✅ SEARCH USERS
const searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("name email photo _id");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
};

// ✅ Get user by username for friend requests
const getUserByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ name: username }).select("name email photo _id");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to find user", error: err.message });
  }
};

// ✅ FRIEND REQUEST FLOW
const sendFriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver.friendRequests.includes(senderId)) {
      receiver.friendRequests.push(senderId);
      await receiver.save();
    }

    res.status(200).json({ message: "Request sent" });
  } catch (err) {
    res.status(500).json({ message: "Request failed", error: err.message });
  }
};

const acceptFriendRequest = async (req, res) => {
  const { receiverId, senderId } = req.body;

  try {
    // Check existence with lean to avoid loading full documents
    const receiver = await User.findById(receiverId).lean();
    const sender = await User.findById(senderId).lean();

    if (!receiver || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update friends and friendRequests arrays without loading full documents
    await User.updateOne(
      { _id: receiverId },
      {
        $addToSet: { friends: sender.name },
        $pull: { friendRequests: sender.name }
      }
    );

    await User.updateOne(
      { _id: senderId },
      {
        $addToSet: { friends: receiver.name }
      }
    );

    res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    console.error('Accept friend request error:', err);
    res.status(500).json({ message: "Accept failed", error: err.message });
  }
};

const declineFriendRequest = async (req, res) => {
  const { receiverId, senderId } = req.body;

  try {
    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from friend requests
    receiver.friendRequests = receiver.friendRequests.filter(
      (username) => username !== sender.name
    );
    await receiver.save();

    res.status(200).json({ message: "Friend request declined" });
  } catch (err) {
    console.error('Decline friend request error:', err);
    res.status(500).json({ message: "Decline failed", error: err.message });
  }
};

// ✅ EXPORT CONTROLLERS
module.exports = {
  registerUser,
  loginUser,
  verifyGoogleToken,
  updateUserPlatforms,
  getUserStreaks,
  validateUserProfile,
  getDirectStreaks,
  getUserProfile,
  addFriend,
  getFriendsWithStreaks,
  updateUserProfile,
  updateUserStreak,
  searchUsers,
  getUserByUsername,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
};
