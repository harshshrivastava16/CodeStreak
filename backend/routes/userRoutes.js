const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    }
  }),
  limits: {
    fields: 10,
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  // Remove any file type filtering to allow all file types
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

const {
  registerUser,
  loginUser,
  verifyGoogleToken,
  updateUserPlatforms,
  validateUserProfile,
  getUserStreaks,
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
} = require("../controllers/userController");

// Test route to verify router is working
router.get("/test-route", (req, res) => {
  res.status(200).json({ message: "User routes are working" });
});

// ✅ Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/auth/google", verifyGoogleToken);

// ✅ Update user platforms
router.put("/update-platforms/:id", updateUserPlatforms);

// ✅ Get user streaks from DB
router.get("/streaks/:id", getUserStreaks);

// ✅ Validate LeetCode/GFG username
router.get("/validate/:platform/:username", validateUserProfile);

// ✅ Get direct LeetCode streak
router.get("/direct-streaks/:uid", getDirectStreaks);

// ✅ Get user profile by UID
router.get("/profile/:id", getUserProfile);

// ✅ Add friend
router.post("/add-friend", addFriend);

// ✅ Get friends with streaks
router.get("/friends/:userId", getFriendsWithStreaks);

// ✅ Update user profile fields with multer middleware for multipart/form-data
router.put("/update-profile/:id", upload.single("photo"), updateUserProfile);

// ✅ Manual update user streak
router.put("/users/:id/streak", updateUserStreak);

// ✅ Search users by name or email
router.get("/search", searchUsers);

// ✅ Get user by username
router.get("/user/:username", getUserByUsername);

// ✅ Send friend request (invitation)
// ✅ Send friend request (invitation)
router.post("/send-friend-request", sendFriendRequest);

// ✅ Accept friend request
router.post("/accept-friend-request", acceptFriendRequest);

// ✅ Decline friend request
router.post("/decline-friend-request", declineFriendRequest);

module.exports = router;
