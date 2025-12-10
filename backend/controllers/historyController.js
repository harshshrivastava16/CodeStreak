const StreakLog = require('../models/StreakLog');
const User = require('../models/User');
const axios = require('axios');

const getHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { platform, limit = 100 } = req.query;
    const q = { userId };
    if (platform) q.platform = platform;
    const items = await StreakLog.find(q).sort({ date: -1 }).limit(Math.min(Number(limit) || 100, 500));
    res.status(200).json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history', error: err.message });
  }
};

const getRecentSolves = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 5 } = req.query;
    const user = await User.findById(userId).select('platforms');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const leetcodePlatform = user.platforms.find(p => p.platform.toLowerCase() === 'leetcode');
    console.log(`[DEBUG] LeetCode platform for user ${userId}:`, leetcodePlatform);
    if (!leetcodePlatform || !leetcodePlatform.username) {
      return res.status(200).json({ items: [] });
    }

    const username = leetcodePlatform.username;
    console.log(`[DEBUG] Fetching solves for username: ${username}`);
    const submissionsRes = await axios.post('https://leetcode.com/graphql', {
      query: `
        query recentAcSubmissionList($username: String!) {
          recentAcSubmissionList(username: $username) {
            title
            titleSlug
            timestamp
          }
        }
      `,
      variables: { username },
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': `https://leetcode.com/${username}/`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });

    const submissions = submissionsRes.data?.data?.recentAcSubmissionList || [];
    console.log(`[DEBUG] Recent solves for ${username}:`, submissions);
    const items = submissions.slice(0, limit).map(sub => ({
      title: sub.title,
      timeAgo: new Date(sub.timestamp * 1000).toLocaleString(),
      type: 'solve'
    }));

    res.status(200).json({ items });
  } catch (err) {
    console.error('Error fetching recent solves:', err.message);
    res.status(200).json({ items: [] });
  }
};

module.exports = { getHistory, getRecentSolves };
