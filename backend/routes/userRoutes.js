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
} = require("../controllers/userController");
const { updateAlertSettings, triggerInstantCheck } = require("../controllers/userController");


router.get("/test-route", (req, res) => {
  res.status(200).json({ message: "User routes are working" });
});


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/auth/google", verifyGoogleToken);

router.put("/update-platforms/:id", updateUserPlatforms);

router.get("/streaks/:id", getUserStreaks);

router.get("/validate/:platform/:username", validateUserProfile);

router.get("/direct-streaks/:uid", getDirectStreaks);

router.get("/profile/:id", getUserProfile);

router.post("/add-friend", addFriend);

router.get("/friends/:userId", getFriendsWithStreaks);

router.get("/global", getGlobalLeaderboard);

router.put("/update-profile/:id", upload.single("photo"), updateUserProfile);

router.put("/users/:id/streak", updateUserStreak);

router.get("/search", searchUsers);

router.put("/alerts/:id", updateAlertSettings);

router.post("/instant-check/:id", triggerInstantCheck);

router.get("/user/:username", getUserByUsername);

router.post("/send-friend-request", sendFriendRequest);

router.post("/accept-friend-request", acceptFriendRequest);

router.post("/decline-friend-request", declineFriendRequest);


router.post("/remove-friend/:id", removeFriend);

router.get("/streak-history/:userId", getUserStreakHistory);

module.exports = router;
