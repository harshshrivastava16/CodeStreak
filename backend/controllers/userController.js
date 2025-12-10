const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const fetchLeetCodeStreak = require("../utils/fetchers/leetcode");
const { fetchLeetCodeStats, fetchLeetCodeCalendar } = require("../utils/fetchers/leetcodeAlt");
const { fetchCodeforcesStats } = require("../utils/fetchers/codeforces");
const { fetchGfgStats } = require("../utils/fetchers/gfg");
const { fetchHackerRankStats } = require("../utils/fetchers/hackerrank");
const validateLeetcodeUsername = require("../utils/validateLeetcodeUsername");
const validateCodeforcesUsername = require("../utils/validateCodeforcesUsername");
const validateGfgUsername = require("../utils/validateGfgUsername");
const validateHackerRankUsername = require("../utils/validateHackerRankUsername");
const { checkLeetCodeActivityToday } = require("../scrapers/leetcode");
const { checkCodeforcesActivityToday } = require("../scrapers/codeforces");
const { checkGfgActivityToday } = require("../scrapers/gfg");
const { checkHackerRankActivityToday } = require("../scrapers/hackerrank");

// Helper function to check if user is pro
const isProUser = (user) => {
  return user?.subscription?.tier === "pro" && user?.subscription?.status === "active";
};

// REGISTER USER
const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

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
      phone,
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

    // Fetch full user data
    const fullUser = await User.findById(user._id).select("-password");

    // Create JWT token
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: fullUser,
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

// LOGIN USER
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

    // Fetch full user data
    const fullUser = await User.findById(user._id).select("-password");

    // Create JWT token
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Login successful",
      user: fullUser,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// GOOGLE AUTH
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
        platforms: [], // No platforms initially, user needs to add them
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

    // Fetch full user data
    const fullUser = await User.findById(user._id).select("-password");

    // Create JWT token
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Login successful",
      user: fullUser,
      token
    });
  } catch (err) {
    console.error('Google auth error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

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

    // Initialize streaks for all platforms
    if (username) {
      user.currentStreaks = user.currentStreaks || {};
      user.longestStreaks = user.longestStreaks || {};
      user.lastUpdated = user.lastUpdated || {};

      if (platform === "leetcode") {
        user.leetcodeUsernameValid = true;
      }
      // Initialize streaks to 0 for all platforms (streak fetching will happen later)
      // Ensure values are numbers to avoid casting errors
      const currentStreak = user.currentStreaks[platform];
      user.currentStreaks[platform] = (typeof currentStreak === 'number' && !isNaN(currentStreak)) ? currentStreak : 0;

      const longestStreak = user.longestStreaks[platform];
      user.longestStreaks[platform] = (typeof longestStreak === 'number' && !isNaN(longestStreak)) ? longestStreak : 0;

      user.lastUpdated[platform] = user.lastUpdated[platform] || new Date();
    }

    await user.save();
    res.status(200).json({ message: "Platform updated", platforms: user.platforms, leetcodeUsernameValid: user.leetcodeUsernameValid });
  } catch (err) {
    console.error('Update platform error:', err);
    res.status(500).json({ message: "Failed to update platform", error: err.message });
  }
};

// STREAK CALCULATION
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

// PROFILE VALIDATION
const validateUserProfile = async (req, res) => {
  const { platform, username } = req.params;

  try {
    if (platform === "leetcode") {
      console.log(`Validating LeetCode username: "${username}"`);
      const isValid = await validateLeetcodeUsername(username);
      console.log(`Validation result for "${username}": ${isValid}`);
      return res.status(200).json({ valid: isValid });
    } else if (platform === "codeforces") {
      const isValid = await validateCodeforcesUsername(username);
      return res.status(200).json({ valid: isValid });
    } else if (platform === "gfg") {
      const isValid = await validateGfgUsername(username);
      return res.status(200).json({ valid: isValid });
    } else if (platform === "hackerrank") {
      const isValid = await validateHackerRankUsername(username);
      return res.status(200).json({ valid: isValid });
    }

    res.status(400).json({ message: "Unsupported platform" });
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({ message: "Validation failed", error: err.message });
  }
};

//  DIRECT STREAK FETCH
const getDirectStreaks = async (req, res) => {
  const userId = req.params.uid;

  try {
    const user = await User.findById(userId);
    const result = [];

    if (user.platforms && user.platforms.length > 0) {
      for (const platform of user.platforms) {
        const { platform: platformName, username } = platform;
        let stats = { totalSolved: 0, easy: 0, medium: 0, hard: 0, accuracy: 0, currentStreak: 0, longestStreak: 0 };
        if (platformName === "leetcode" && username) {
          try {
            const fetchedStats = await fetchLeetCodeStats(username);
            if (fetchedStats) {
              stats = {
                totalSolved: fetchedStats.totalSolved || 0,
                easy: fetchedStats.easy || 0,
                medium: fetchedStats.medium || 0,
                hard: fetchedStats.hard || 0,
                accuracy: fetchedStats.accuracy || 0,
                currentStreak: fetchedStats.currentStreak || 0,
                longestStreak: fetchedStats.longestStreak || 0,
              };
            }
          } catch (error) {
            console.error(`Failed to fetch LeetCode stats for ${username}:`, error);
          }
        } else if (platformName === "codeforces" && username) {
          try {
            const fetchedStats = await fetchCodeforcesStats(username);
            if (fetchedStats) {
              stats = {
                totalSolved: fetchedStats.totalSolved || 0,
                easy: fetchedStats.easy || 0,
                medium: fetchedStats.medium || 0,
                hard: fetchedStats.hard || 0,
                accuracy: fetchedStats.accuracy || 0,
                currentStreak: fetchedStats.currentStreak || 0,
                longestStreak: fetchedStats.longestStreak || 0,
              };
            }
          } catch (error) {
            console.error(`Failed to fetch Codeforces stats for ${username}:`, error);
          }
        } else if (platformName === "gfg" && username) {
          try {
            const fetchedStats = await fetchGfgStats(username);
            if (fetchedStats) {
              stats = {
                totalSolved: fetchedStats.totalSolved || 0,
                easy: fetchedStats.easy || 0,
                medium: fetchedStats.medium || 0,
                hard: fetchedStats.hard || 0,
                accuracy: fetchedStats.accuracy || 0,
                currentStreak: fetchedStats.currentStreak || 0,
                longestStreak: fetchedStats.longestStreak || 0,
              };
            }
          } catch (error) {
            console.error(`Failed to fetch GFG stats for ${username}:`, error);
          }
        } else if (platformName === "hackerrank" && username) {
          try {
            const fetchedStats = await fetchHackerRankStats(username);
            if (fetchedStats) {
              stats = {
                totalSolved: fetchedStats.totalSolved || 0,
                easy: fetchedStats.easy || 0,
                medium: fetchedStats.medium || 0,
                hard: fetchedStats.hard || 0,
                accuracy: fetchedStats.accuracy || 0,
                currentStreak: fetchedStats.currentStreak || 0,
                longestStreak: fetchedStats.longestStreak || 0,
              };
            }
          } catch (error) {
            console.error(`Failed to fetch HackerRank stats for ${username}:`, error);
          }
        }
        result.push({ platform: platformName, username, ...stats });
      }
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
};

//  GET PROFILE
const getUserProfile = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Calculate total problems solved and update platforms with detailed stats
    if (user.platforms && user.platforms.length > 0) {
      user.platforms = await Promise.all(user.platforms.map(async (platform) => {
        const { platform: platformName, username } = platform;
        let stats = { totalSolved: 0, easy: 0, medium: 0, hard: 0, accuracy: 0 };
        if (platformName === "leetcode" && username) {
          try {
            const fetchedStats = await fetchLeetCodeStats(username);
            if (fetchedStats) {
              stats = {
                totalSolved: fetchedStats.totalSolved || 0,
                easy: fetchedStats.easy || 0,
                medium: fetchedStats.medium || 0,
                hard: fetchedStats.hard || 0,
                accuracy: fetchedStats.accuracy || 0,
              };
            }
          } catch (error) {
            console.error(`Failed to fetch LeetCode stats for ${username}:`, error);
          }
        } else if (platformName === "codeforces" && username) {
          try {
            const fetchedStats = await fetchCodeforcesStats(username);
            if (fetchedStats) {
              stats = {
                totalSolved: fetchedStats.totalSolved || 0,
                easy: fetchedStats.easy || 0,
                medium: fetchedStats.medium || 0,
                hard: fetchedStats.hard || 0,
                accuracy: fetchedStats.accuracy || 0,
              };
              // Update lastUpdated for the platform
              if (fetchedStats.lastActive) {
                user.lastUpdated = user.lastUpdated || {};
                user.lastUpdated[platformName] = fetchedStats.lastActive;
              }
            }
          } catch (error) {
            console.error(`Failed to fetch Codeforces stats for ${username}:`, error);
          }
        } else if (platformName === "gfg" && username) {
          try {
            const fetchedStats = await fetchGfgStats(username);
            if (fetchedStats) {
              stats = {
                totalSolved: fetchedStats.totalSolved || 0,
                easy: fetchedStats.easy || 0,
                medium: fetchedStats.medium || 0,
                hard: fetchedStats.hard || 0,
                accuracy: fetchedStats.accuracy || 0,
              };
              // Update lastUpdated for the platform
              if (fetchedStats.lastActive) {
                user.lastUpdated = user.lastUpdated || {};
                user.lastUpdated[platformName] = fetchedStats.lastActive;
              }
            }
          } catch (error) {
            console.error(`Failed to fetch GFG stats for ${username}:`, error);
          }
        } else if (platformName === "hackerrank" && username) {
          try {
            const fetchedStats = await fetchHackerRankStats(username);
            if (fetchedStats) {
              stats = {
                totalSolved: fetchedStats.totalSolved || 0,
                easy: fetchedStats.easy || 0,
                medium: fetchedStats.medium || 0,
                hard: fetchedStats.hard || 0,
                accuracy: fetchedStats.accuracy || 0,
              };
              // Update lastUpdated for the platform
              if (fetchedStats.lastActive) {
                user.lastUpdated = user.lastUpdated || {};
                user.lastUpdated[platformName] = fetchedStats.lastActive;
              }
            }
          } catch (error) {
            console.error(`Failed to fetch HackerRank stats for ${username}:`, error);
          }
        }
        // For other platforms, set defaults
        return { ...platform, ...stats };
      }));
      user.markModified('platforms'); // Ensure platforms array changes are detected
      let saveAttempts = 0;
      const maxSaveAttempts = 3;
      while (saveAttempts < maxSaveAttempts) {
        try {
          await user.save(); // Save the updated platforms with stats
          break; // Success, exit loop
        } catch (saveErr) {
          saveAttempts++;
          if (saveErr.name === 'VersionError' && saveAttempts < maxSaveAttempts) {
            // Refetch the user to get the latest version
            const freshUser = await User.findById(user._id);
            if (freshUser) {
              // Reapply the platforms update
              freshUser.platforms = user.platforms;
              freshUser.markModified('platforms');
              user = freshUser; // Update reference for next attempt
            } else {
              console.error('Failed to refetch user for retry:', user._id);
              break;
            }
          } else {
            // Re-throw if not VersionError or max attempts reached
            throw saveErr;
          }
        }
      }
    }

    // Filter platforms based on subscription: only LeetCode for free users
    const isPro = isProUser(user);
    if (!isPro) {
      user.platforms = user.platforms.filter(p => p.platform === 'leetcode');
    }

    const totalProblems = user.platforms.reduce((sum, p) => sum + (p.totalSolved || 0), 0);
    user.totalProblems = totalProblems;
    // totalProblemsSolvedSinceJoin is maintained separately in streakChecker.js

    // Calculate achievements
    const achievements = [];
    const currentStreak = user.currentStreaks?.leetcode || 0;
    const longestStreak = user.longestStreaks?.leetcode || 0;
    const problems = totalProblems;

    // Define achievements
    const achievementDefinitions = [
      { id: 'first_problem', name: 'First Steps', description: 'Solved your first problem', icon: 'school', condition: problems >= 1, rarity: 'common' },
      { id: 'ten_problems', name: 'Getting Started', description: 'Solved 10 problems', icon: 'code', condition: problems >= 10, rarity: 'common' },
      { id: 'fifty_problems', name: 'Problem Solver', description: 'Solved 50 problems', icon: 'lightbulb', condition: problems >= 50, rarity: 'rare' },
      { id: 'hundred_problems', name: 'Century Club', description: 'Solved 100 problems', icon: 'emoji_events', condition: problems >= 100, rarity: 'rare' },
      { id: 'streak_7', name: 'Week Warrior', description: 'Maintained a 7-day streak', icon: 'local_fire_department', condition: longestStreak >= 7, rarity: 'rare' },
      { id: 'streak_30', name: 'Month Master', description: 'Maintained a 30-day streak', icon: 'local_fire_department', condition: longestStreak >= 30, rarity: 'epic' },
      { id: 'streak_100', name: 'Century Streak', description: 'Maintained a 100-day streak', icon: 'local_fire_department', condition: longestStreak >= 100, rarity: 'legendary' },
      { id: 'current_streak_10', name: 'On Fire', description: 'Current streak of 10 days', icon: 'whatshot', condition: currentStreak >= 10, rarity: 'rare' },
    ];

    for (const def of achievementDefinitions) {
      if (def.condition) {
        const existing = user.achievements?.find(a => a.id === def.id);
        if (!existing) {
          achievements.push({
            id: def.id,
            name: def.name,
            description: def.description,
            icon: def.icon,
            earnedAt: new Date(),
            rarity: def.rarity
          });
        } else {
          achievements.push(existing);
        }
      }
    }
    user.achievements = achievements;

    // Calculate user's global rank based on current streak
    const allUsers = await User.find({ 'platforms.platform': 'leetcode' }).select('currentStreaks');
    let rank = 1;
    const currentUserStreak = user.currentStreaks?.leetcode || 0;
    for (const u of allUsers) {
      const userStreak = u.currentStreaks?.leetcode || 0;
      if (userStreak > currentUserStreak) rank++;
    }
    user.rank = rank;

    // Populate recent activity from StreakLog
    const StreakLog = require('../models/StreakLog');
    const recentLogs = await StreakLog.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(10);

    const recentActivity = recentLogs.map(log => ({
      description: log.maintained ? `Maintained streak on ${log.platform}` : `Streak broken on ${log.platform}`,
      timestamp: log.date,
      type: log.maintained ? 'streak' : 'streak'
    }));

    // Add achievement activities
    const recentAchievements = achievements.filter(a => {
      const daysSince = (new Date() - new Date(a.earnedAt)) / (1000 * 60 * 60 * 24);
      return daysSince <= 30; // Recent achievements
    }).map(a => ({
      description: `Earned achievement: ${a.name}`,
      timestamp: a.earnedAt,
      type: 'achievement'
    }));

    user.recentActivity = [...recentActivity, ...recentAchievements]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    console.log("User profile platforms with stats:", user.platforms);
    res.status(200).json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//  SEND FRIEND REQUEST
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

    // Enforce free friend limit of 3 unless Pro
    const isPro = user?.subscription?.tier === "pro" && user?.subscription?.status === "active";
    if (!isPro && Array.isArray(user.friends) && user.friends.length >= 3) {
      return res.status(403).json({ message: "Upgrade to Pro for unlimited friends" });
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

//  GLOBAL LEADERBOARD
const getGlobalLeaderboard = async (req, res) => {
  const { timeFilter = 'all' } = req.query; // all, month, week

  try {
    // Calculate date filter for time-based streaks
    let dateFilter = null;
    const now = new Date();
    if (timeFilter === 'month') {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeFilter === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      dateFilter = weekStart;
    }

    // Get all users with platforms
    const allUsers = await User.find({ 'platforms.platform': 'leetcode' }).select('name photo email platforms currentStreaks longestStreaks').limit(100); // Limit to top 100 for performance

    // Function to get filtered streak for a user
    const getFilteredStreak = async (userData) => {
      if (timeFilter === 'all') {
        // Fetch real-time current streak
        let currentStreak = 0;
        let longestStreak = userData.longestStreaks?.leetcode || 0;
        if (userData.platforms && userData.platforms.length > 0) {
          for (const platform of userData.platforms) {
            if (platform.platform === 'leetcode' && platform.username) {
              try {
                currentStreak = await fetchLeetCodeStreak(platform.username);
              } catch (error) {
                console.error(`Failed to fetch real-time streak for ${platform.username}:`, error);
                currentStreak = userData.currentStreaks?.leetcode || 0;
              }
              break;
            }
          }
        }
        return { currentStreak, longestStreak };
      }

      // For time-filtered data, we need to calculate based on historical logs
      const StreakLog = require('../models/StreakLog');
      const logs = await StreakLog.find({
        userId: userData._id,
        platform: 'leetcode',
        date: { $gte: dateFilter }
      }).sort({ date: 1 });

      if (logs.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
      }

      // Calculate current streak from recent logs
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      for (const log of logs) {
        if (log.maintained) {
          tempStreak++;
          currentStreak = tempStreak;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      return { currentStreak, longestStreak };
    };

    // Get streaks for all users
    const usersWithStreaks = [];
    for (const user of allUsers) {
      const streaks = await getFilteredStreak(user);
      const isPro = isProUser(user);
      let totalProblems = 0;
      if (isPro && user.platforms && user.platforms.length > 0) {
        // Calculate total problems solved across all platforms for Pro users
        const platformsWithStats = await Promise.all(user.platforms.map(async (platform) => {
          const { platform: platformName, username } = platform;
          let stats = { totalSolved: 0 };
          if (platformName === "leetcode" && username) {
            try {
              const fetchedStats = await fetchLeetCodeStats(username);
              if (fetchedStats) {
                stats.totalSolved = fetchedStats.totalSolved || 0;
              }
            } catch (error) {
              console.error(`Failed to fetch LeetCode stats for ${username}:`, error);
            }
          } else if (platformName === "codeforces" && username) {
            try {
              const fetchedStats = await fetchCodeforcesStats(username);
              if (fetchedStats) {
                stats.totalSolved = fetchedStats.totalSolved || 0;
              }
            } catch (error) {
              console.error(`Failed to fetch Codeforces stats for ${username}:`, error);
            }
          } else if (platformName === "gfg" && username) {
            try {
              const fetchedStats = await fetchGfgStats(username);
              if (fetchedStats) {
                stats.totalSolved = fetchedStats.totalSolved || 0;
              }
            } catch (error) {
              console.error(`Failed to fetch GFG stats for ${username}:`, error);
            }
          } else if (platformName === "hackerrank" && username) {
            try {
              const fetchedStats = await fetchHackerRankStats(username);
              if (fetchedStats) {
                stats.totalSolved = fetchedStats.totalSolved || 0;
              }
            } catch (error) {
              console.error(`Failed to fetch HackerRank stats for ${username}:`, error);
            }
          }
          return stats;
        }));
        totalProblems = platformsWithStats.reduce((sum, p) => sum + (p.totalSolved || 0), 0);
      }
      usersWithStreaks.push({
        id: user._id,
        name: user.name || "Unknown",
        photo: user.photo || "",
        email: user.email || "",
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
        totalProblems: isPro ? totalProblems : undefined, // Only include for Pro users
        isCurrentUser: false // Will be set later if needed
      });
    }

    // Sort by currentStreak descending
    usersWithStreaks.sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0));

    res.status(200).json({
      friends: usersWithStreaks,
      timeFilter,
    });
  } catch (err) {
    console.error('Get global leaderboard error:', err);
    res.status(500).json({ message: "Failed to fetch global leaderboard", error: err.message });
  }
};

//  FRIENDS WITH STREAKS (INCLUDES CURRENT USER)
const getFriendsWithStreaks = async (req, res) => {
  const { userId } = req.params;
  const { timeFilter = 'all' } = req.query; // all, month, week

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Calculate date filter for time-based streaks
    let dateFilter = null;
    const now = new Date();
    if (timeFilter === 'month') {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeFilter === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      dateFilter = weekStart;
    }

    // Function to get filtered streak for a user
    const getFilteredStreak = async (userData, isCurrentUser = false) => {
      if (timeFilter === 'all') {
        // Fetch real-time current streak
        let currentStreak = 0;
        let longestStreak = userData.longestStreaks?.leetcode || 0;
        if (userData.platforms && userData.platforms.length > 0) {
          for (const platform of userData.platforms) {
            if (platform.platform === 'leetcode' && platform.username) {
              try {
                currentStreak = await fetchLeetCodeStreak(platform.username);
              } catch (error) {
                console.error(`Failed to fetch real-time streak for ${platform.username}:`, error);
                currentStreak = userData.currentStreaks?.leetcode || 0;
              }
              break;
            }
          }
        }
        return { currentStreak, longestStreak };
      }

      // For time-filtered data, we need to calculate based on historical logs
      const StreakLog = require('../models/StreakLog');
      const logs = await StreakLog.find({
        userId: userData._id,
        platform: 'leetcode',
        date: { $gte: dateFilter }
      }).sort({ date: 1 });

      if (logs.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
      }

      // Calculate current streak from recent logs
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      for (const log of logs) {
        if (log.maintained) {
          tempStreak++;
          currentStreak = tempStreak;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      return { currentStreak, longestStreak };
    };

    // Include current user in the friends list
    const currentUserStreaks = await getFilteredStreak(user, true);
    const isProCurrent = isProUser(user);
    let totalProblemsCurrent = 0;
    if (isProCurrent && user.platforms && user.platforms.length > 0) {
      // Calculate total problems solved across all platforms for Pro users
      const platformsWithStats = await Promise.all(user.platforms.map(async (platform) => {
        const { platform: platformName, username } = platform;
        let stats = { totalSolved: 0 };
        if (platformName === "leetcode" && username) {
          try {
            const fetchedStats = await fetchLeetCodeStats(username);
            if (fetchedStats) {
              stats.totalSolved = fetchedStats.totalSolved || 0;
            }
          } catch (error) {
            console.error(`Failed to fetch LeetCode stats for ${username}:`, error);
          }
        } else if (platformName === "codeforces" && username) {
          try {
            const fetchedStats = await fetchCodeforcesStats(username);
            if (fetchedStats) {
              stats.totalSolved = fetchedStats.totalSolved || 0;
            }
          } catch (error) {
            console.error(`Failed to fetch Codeforces stats for ${username}:`, error);
          }
        } else if (platformName === "gfg" && username) {
          try {
            const fetchedStats = await fetchGfgStats(username);
            if (fetchedStats) {
              stats.totalSolved = fetchedStats.totalSolved || 0;
            }
          } catch (error) {
            console.error(`Failed to fetch GFG stats for ${username}:`, error);
          }
        } else if (platformName === "hackerrank" && username) {
          try {
            const fetchedStats = await fetchHackerRankStats(username);
            if (fetchedStats) {
              stats.totalSolved = fetchedStats.totalSolved || 0;
            }
          } catch (error) {
            console.error(`Failed to fetch HackerRank stats for ${username}:`, error);
          }
        }
        return stats;
      }));
      totalProblemsCurrent = platformsWithStats.reduce((sum, p) => sum + (p.totalSolved || 0), 0);
    }
    const currentUser = {
      id: user._id,
      name: user.name || "Unknown",
      photo: user.photo || "",
      email: user.email || "",
      currentStreak: currentUserStreaks.currentStreak,
      longestStreak: currentUserStreaks.longestStreak,
      totalProblems: isProCurrent ? totalProblemsCurrent : undefined, // Only include for Pro users
      isCurrentUser: true
    };

    // Get friends by usernames
    const friendsWithStreaks = [];
    if (user.friends && user.friends.length > 0) {
      const friendUsers = await User.find({ name: { $in: user.friends } });
      for (const friend of friendUsers) {
        const friendStreaks = await getFilteredStreak(friend);
        const isProFriend = isProUser(friend);
        let totalProblemsFriend = 0;
        if (isProFriend && friend.platforms && friend.platforms.length > 0) {
          // Calculate total problems solved across all platforms for Pro users
          const platformsWithStats = await Promise.all(friend.platforms.map(async (platform) => {
            const { platform: platformName, username } = platform;
            let stats = { totalSolved: 0 };
            if (platformName === "leetcode" && username) {
              try {
                const fetchedStats = await fetchLeetCodeStats(username);
                if (fetchedStats) {
                  stats.totalSolved = fetchedStats.totalSolved || 0;
                }
              } catch (error) {
                console.error(`Failed to fetch LeetCode stats for ${username}:`, error);
              }
            } else if (platformName === "codeforces" && username) {
              try {
                const fetchedStats = await fetchCodeforcesStats(username);
                if (fetchedStats) {
                  stats.totalSolved = fetchedStats.totalSolved || 0;
                }
              } catch (error) {
                console.error(`Failed to fetch Codeforces stats for ${username}:`, error);
              }
            } else if (platformName === "gfg" && username) {
              try {
                const fetchedStats = await fetchGfgStats(username);
                if (fetchedStats) {
                  stats.totalSolved = fetchedStats.totalSolved || 0;
                }
              } catch (error) {
                console.error(`Failed to fetch GFG stats for ${username}:`, error);
              }
            } else if (platformName === "hackerrank" && username) {
              try {
                const fetchedStats = await fetchHackerRankStats(username);
                if (fetchedStats) {
                  stats.totalSolved = fetchedStats.totalSolved || 0;
                }
              } catch (error) {
                console.error(`Failed to fetch HackerRank stats for ${username}:`, error);
              }
            }
            return stats;
          }));
          totalProblemsFriend = platformsWithStats.reduce((sum, p) => sum + (p.totalSolved || 0), 0);
        }
        friendsWithStreaks.push({
          id: friend._id,
          name: friend.name || "Unknown",
          photo: friend.photo || "",
          email: friend.email || "",
          currentStreak: friendStreaks.currentStreak,
          longestStreak: friendStreaks.longestStreak,
          totalProblems: isProFriend ? totalProblemsFriend : undefined, // Only include for Pro users
          isCurrentUser: false
        });
      }
    }

    // Add current user to the list
    const allUsers = [currentUser, ...friendsWithStreaks];

    // Advanced stats for Pro users
    const isPro = user?.subscription?.tier === "pro" && user?.subscription?.status === "active";
    let advanced = null;
    if (isPro && allUsers.length > 0) {
      const sorted = [...allUsers].sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0));
      const rank = sorted.findIndex(u => u.id?.toString() === user._id.toString()) + 1;
      const percentile = Math.round(((sorted.length - rank) / sorted.length) * 100);
      const avgCurrent = Math.round(sorted.reduce((s, u) => s + (u.currentStreak || 0), 0) / sorted.length);
      const topStreak = sorted[0]?.currentStreak || 0;
      advanced = { rank, percentile, avgCurrent, topStreak };
    }

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
      currentUser,
      advanced,
      timeFilter,
    });
  } catch (err) {
    console.error('Get friends error:', err);
    res.status(500).json({ message: "Failed to fetch friends", error: err.message });
  }
};

//  UPDATE PROFILE (WITH USERNAME UNIQUENESS CHECK)
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

    // Add selected platforms based on provided platform entries
    if (Array.isArray(updateData.platforms) && updateData.platforms.length > 0) {
      const user = await User.findById(id);
      if (user) {
        const providedPlatforms = updateData.platforms
          .filter(p => p && p.platform && p.username)
          .map(p => p.platform);
        const set = new Set([...(user.selectedPlatforms || []), ...providedPlatforms]);
        user.selectedPlatforms = Array.from(set);
        await user.save();
      }
    }

    // Handle settings and alertSettings updates
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (updateData.settings) {
      user.settings = { ...user.settings, ...updateData.settings };
    }

    if (updateData.alertSettings) {
      user.alertSettings = { ...user.alertSettings, ...updateData.alertSettings };
    }

    if (updateData.dailyGoalType !== undefined) {
      user.dailyGoalType = updateData.dailyGoalType;
    }

    if (updateData.dailyGoalNumber !== undefined) {
      user.dailyGoalNumber = updateData.dailyGoalNumber;
    }

    await user.save();

    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

//  UPDATE STREAK MANUALLY
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

//  SEARCH USERS
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

//  Get user by username for friend requests
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

//  FRIEND REQUEST FLOW
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

const removeFriend = async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.user?._id || req.params.id; // Assuming middleware sets req.user

  try {
    const currentUser = await User.findById(currentUserId);
    const friendToRemove = await User.findById(userId);

    if (!currentUser || !friendToRemove) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.friends.includes(friendToRemove.name)) {
      return res.status(400).json({ message: "Not friends with this user" });
    }

    // Remove from both users' friends lists
    await User.updateOne(
      { _id: currentUserId },
      { $pull: { friends: friendToRemove.name } }
    );

    await User.updateOne(
      { _id: userId },
      { $pull: { friends: currentUser.name } }
    );

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (err) {
    console.error('Remove friend error:', err);
    res.status(500).json({ message: "Remove friend failed", error: err.message });
  }
};

//  UPDATE ALERT SETTINGS (PRO ONLY)
const updateAlertSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPro = user?.subscription?.tier === "pro" && user?.subscription?.status === "active";
    if (!isPro) return res.status(403).json({ message: "Pro subscription required" });

    user.alertSettings = {
      ...user.alertSettings?.toObject?.(),
      ...updates,
    };

    await user.save();
    return res.status(200).json({ message: "Alert settings updated", alertSettings: user.alertSettings });
  } catch (err) {
    console.error('Update alert settings error:', err);
    res.status(500).json({ message: "Failed to update alert settings", error: err.message });
  }
};

//  TRIGGER INSTANT CHECK
const platformCheckersImmediate = {
  leetcode: checkLeetCodeActivityToday,
  codeforces: checkCodeforcesActivityToday,
  gfg: checkGfgActivityToday,
  hackerrank: checkHackerRankActivityToday,
};

const triggerInstantCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const selected = Array.isArray(user.selectedPlatforms) ? user.selectedPlatforms : [];
    const now = new Date();
    const todayStr = now.toDateString();
    let updated = [];

    for (const platform of selected) {
      const checker = platformCheckersImmediate[platform];
      if (!checker) continue;
      const entry = Array.isArray(user.platforms) ? user.platforms.find(p => p.platform === platform) : null;
      const username = entry?.username;
      if (!username) continue;

      const didSubmit = await checker(username);
      const lastUpdatedDate = user.lastUpdated?.[platform]
        ? new Date(user.lastUpdated[platform]).toDateString()
        : null;
      if (didSubmit && lastUpdatedDate !== todayStr) {
        user.currentStreaks[platform] = (user.currentStreaks[platform] || 0) + 1;
        if (!user.longestStreaks[platform] || user.currentStreaks[platform] > user.longestStreaks[platform]) {
          user.longestStreaks[platform] = user.currentStreaks[platform];
        }
        user.lastUpdated[platform] = now;
        updated.push(platform);
      }
    }

    await user.save();
    return res.status(200).json({ message: "Checked", updated });
  } catch (err) {
    return res.status(500).json({ message: "Instant check failed", error: err.message });
  }
};

//  GET USER STREAK HISTORY FOR CHART
const getUserStreakHistory = async (req, res) => {
  const { userId } = req.params;
  const { days = 30, platform = 'leetcode' } = req.query;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const StreakLog = require('../models/StreakLog');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    const logs = await StreakLog.find({
      userId: userId,
      platform: platform,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Group by date and get the streak value for each day
    const streakData = {};
    logs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0]; // YYYY-MM-DD format
      streakData[dateKey] = log.currentStreak;
    });

    // Fill in missing dates with the last known streak
    const result = [];
    let lastStreak = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const streak = streakData[dateKey] !== undefined ? streakData[dateKey] : lastStreak;
      result.push({
        date: dateKey,
        streak: streak
      });
      lastStreak = streak;
    }

    res.status(200).json({ streakHistory: result });
  } catch (err) {
    console.error('Get streak history error:', err);
    res.status(500).json({ message: "Failed to fetch streak history", error: err.message });
  }
};

//  GET LEETCODE CALENDAR
const getLeetCodeCalendar = async (req, res) => {
  const { username } = req.params;

  try {
    const calendar = await fetchLeetCodeCalendar(username);
    res.status(200).json({ calendar });
  } catch (err) {
    console.error('Get calendar error:', err);
    res.status(500).json({ message: "Failed to fetch calendar", error: err.message });
  }
};

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
  getGlobalLeaderboard,
  updateUserProfile,
  updateUserStreak,
  searchUsers,
  getUserByUsername,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getUserStreakHistory,
  getLeetCodeCalendar,
};

module.exports.updateAlertSettings = updateAlertSettings;
module.exports.triggerInstantCheck = triggerInstantCheck;
