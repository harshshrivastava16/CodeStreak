// controllers/mlController.js

const User = require("../models/User");
const MlInsight = require("../models/MlInsight");
const StreakLog = require("../models/StreakLog");



const getColorForWeakScore = (score) => {
  if (score >= 90) return "red";
  if (score >= 70) return "yellow";
  return "green";
};

const generateStaticWeakTopics = () => {
  const r = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

  const defs = [
    { name: "Dynamic Programming", min: 90, max: 100 },
    { name: "Trees", min: 90, max: 100 },
    { name: "Graphs", min: 70, max: 90 },
    { name: "Sorting", min: 70, max: 90 },
    { name: "Arrays", min: 50, max: 60 },
    { name: "Strings", min: 50, max: 60 },
  ];

  return defs
    .map((t) => {
      const score = r(t.min, t.max);
      return {
        name: t.name,
        score,
        color: getColorForWeakScore(score),
      };
    })
    .sort((a, b) => b.score - a.score);
};


const PROBLEM_BANK = {
  "Dynamic Programming": [
    {
      title: "Coin Change",
      platform: "LeetCode",
      url: "https://leetcode.com/problems/coin-change/",
    },
    {
      title: "Climbing Stairs",
      platform: "LeetCode",
      url: "https://leetcode.com/problems/climbing-stairs/",
    },
    {
      title: "Vacation",
      platform: "Codeforces",
      url: "https://codeforces.com/problemset/problem/698/A",
    },
    {
      title: "Longest Increasing Subsequence",
      platform: "GFG",
      url: "https://www.geeksforgeeks.org/longest-increasing-subsequence-dp-3/",
    },
  ],

  Trees: [
    {
      title: "Binary Tree Level Order Traversal",
      platform: "LeetCode",
      url: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    },
    {
      title: "Diameter of Binary Tree",
      platform: "LeetCode",
      url: "https://leetcode.com/problems/diameter-of-binary-tree/",
    },
    {
      title: "Xenia and Tree",
      platform: "Codeforces",
      url: "https://codeforces.com/problemset/problem/342/E",
    },
    {
      title: "Lowest Common Ancestor in a Binary Tree",
      platform: "GFG",
      url: "https://www.geeksforgeeks.org/lowest-common-ancestor-binary-tree-set-1/",
    },
  ],

  Graphs: [
    {
      title: "Number of Islands",
      platform: "LeetCode",
      url: "https://leetcode.com/problems/number-of-islands/",
    },
    {
      title: "Course Schedule",
      platform: "LeetCode",
      url: "https://leetcode.com/problems/course-schedule/",
    },
    {
      title: "Fox And Two Dots",
      platform: "Codeforces",
      url: "https://codeforces.com/problemset/problem/510/B",
    },
    {
      title: "Detect cycle in an undirected graph",
      platform: "GFG",
      url: "https://www.geeksforgeeks.org/detect-cycle-undirected-graph/",
    },
  ],

  Sorting: [
    {
      title: "Sort Colors",
      platform: "LeetCode",
      url: "https://leetcode.com/problems/sort-colors/",
    },
    {
      title: "Merge Intervals",
      platform: "LeetCode",
      url: "https://leetcode.com/problems/merge-intervals/",
    },
    {
      title: "Little Elephant and Sort",
      platform: "Codeforces",
      url: "https://codeforces.com/problemset/problem/258/A",
    },
    {
      title: "Merge Sort",
      platform: "GFG",
      url: "https://www.geeksforgeeks.org/merge-sort/",
    },
  ],

  Arrays: [
    {
      title: "Two Sum",
      platform: "LeetCode",
      url: "https://leetcode.com/problems/two-sum/",
    },
    {
      title: "Maximum Subarray",
      platform: "LeetCode",
      url: "https://leetcode.com/problems/maximum-subarray/",
    },
    {
      title: "Kefa and First Steps",
      platform: "Codeforces",
      url: "https://codeforces.com/problemset/problem/580/A",
    },
    {
      title: "Kadane's Algorithm",
      platform: "GFG",
      url: "https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/",
    },
  ],

  Strings: [
    {
      title: "Valid Parentheses",
      platform: "LeetCode",
      url: "https://leetcode.com/problems/valid-parentheses/",
    },
    {
      title: "Longest Substring Without Repeating Characters",
      platform: "LeetCode",
      url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    },
    {
      title: "Beautiful Year",
      platform: "Codeforces",
      url: "https://codeforces.com/problemset/problem/271/A",
    },
    {
      title: "Anagram",
      platform: "GFG",
      url: "https://www.geeksforgeeks.org/check-whether-two-strings-are-anagram-of-each-other/",
    },
  ],
};

const buildProblemKey = (p) => `${p.platform}|${p.title}`;

const pickRandomProblemForTopic = (topicName, current = []) => {
  const bank = PROBLEM_BANK[topicName];
  if (!bank) return null;

  const used = new Set(current.map(buildProblemKey));
  const available = bank.filter((p) => !used.has(buildProblemKey(p)));

  if (available.length === 0) return null;

  const chosen = available[Math.floor(Math.random() * available.length)];
  return { ...chosen, topic: topicName };
};



const generateWeightedRecommendations = (weakTopics, count = 5) => {
  const recs = [];
  const valid = weakTopics.filter((t) => PROBLEM_BANK[t.name]);
  const totalWeight = valid.reduce((a, b) => a + b.score, 0);

  const chooseTopic = () => {
    let r = Math.random() * totalWeight;
    for (const t of valid) {
      if (r < t.score) return t;
      r -= t.score;
    }
    return valid[0];
  };

  let safe = 0;
  while (recs.length < count && safe < 40) {
    safe++;
    const topic = chooseTopic();
    const p = pickRandomProblemForTopic(topic.name, recs);
    if (p) recs.push(p);
  }
  return recs;
};


const computeTimeInsights = (activities) => {
  if (!activities.length)
    return { peakHours: "Not available", reminderWindow: "Not available" };

  const hourStats = {};
  activities.forEach((a) => {
    const h = new Date(a.date).getHours();
    if (!hourStats[h]) hourStats[h] = { success: 0, total: 0 };
    hourStats[h].total++;
    if (a.success === 1) hourStats[h].success++;
  });

  let peak = null;
  let maxRate = -1;

  Object.entries(hourStats).forEach(([hour, { success, total }]) => {
    const rate = success / total;
    if (rate > maxRate) {
      maxRate = rate;
      peak = parseInt(hour);
    }
  });

  if (peak === null)
    return { peakHours: "Not available", reminderWindow: "Not available" };

  const period = peak < 12 ? "AM" : "PM";
  const display = peak === 0 ? 12 : peak > 12 ? peak - 12 : peak;
  const part =
    peak < 6 ? "Night" : peak < 12 ? "Morning" : peak < 18 ? "Afternoon" : "Evening";

  const peakHours = `${part} (${display} ${period})`;

  const format = (h) => {
    const p = h < 12 ? "AM" : "PM";
    const d = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${d} ${p}`;
  };

  const start = Math.max(0, peak - 1);
  const end = Math.min(23, peak + 1);

  return {
    peakHours,
    reminderWindow: `${format(start)} - ${format(end)}`,
  };
};

const buildDynamicParts = (activities) => {
  if (!activities.length)
    return {
      predictions: { potdSuccess: 0, riskOfDrop: 0 },
      performanceHistory: { data: [] },
      timeInsights: computeTimeInsights([]),
    };

  const total = activities.length;
  const successCount = activities.filter((a) => a.success === 1).length;
  const successRate = successCount / total;

  const potdSuccess = Math.round(successRate * 100);
  const riskOfDrop = 100 - potdSuccess;

  const monthly = {};
  activities.forEach((a) => {
    const d = new Date(a.date);
    const key =
      d.toLocaleString("default", { month: "short" }) + " " + d.getFullYear();
    if (!monthly[key]) monthly[key] = { total: 0, success: 0 };
    monthly[key].total++;
    if (a.success === 1) monthly[key].success++;
  });

  const performanceHistory = {
    data: Object.entries(monthly).map(([month, { total, success }]) => ({
      month,
      consistency: Math.round((success / total) * 100),
    })),
  };

  return {
    predictions: { potdSuccess, riskOfDrop },
    performanceHistory,
    timeInsights: computeTimeInsights(activities),
  };
};


const generateInsightsFromActivities = (activities, userId, existing = {}) => {
  let weakTopics = existing.weakTopics;
  const expectedTopics = ["Dynamic Programming", "Trees", "Graphs", "Sorting", "Arrays", "Strings"];
  const isValidWeakTopics = weakTopics && weakTopics.length === 6 && weakTopics.every(t => expectedTopics.includes(t.name));
  if (!isValidWeakTopics) {
    weakTopics = generateStaticWeakTopics();
  }

  let recommendedProblems = existing.recommendedProblems;
  if (!recommendedProblems || recommendedProblems.length < 5)
    recommendedProblems = generateWeightedRecommendations(weakTopics, 5);

  const dynamic = buildDynamicParts(activities);

  return {
    weakTopics,
    recommendedProblems,
    predictions: dynamic.predictions,
    performanceHistory: dynamic.performanceHistory,
    timeInsights: dynamic.timeInsights,
    lastUpdated: new Date().toLocaleString(),
  };
};

/* -----------------------------------------------------------------------------
   INGEST ACTIVITY (stub)
----------------------------------------------------------------------------- */

const ingestActivity = async (req, res) => {
  try {
    const { userId, activities } = req.body;
    if (!userId || !Array.isArray(activities)) {
      return res.status(400).json({ message: "userId and activities[] required" });
    }

    return res.status(202).json({ message: "Activity accepted for processing" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to ingest" });
  }
};

/* -----------------------------------------------------------------------------
   BUILD ACTIVITIES FROM STREAK LOGS
----------------------------------------------------------------------------- */

const buildActivitiesFromLogs = async (userId, limit = 180) => {
  try {
    const logs = await StreakLog.find({ userId, platform: "leetcode" })
      .sort({ date: -1 })
      .limit(limit);

    const topics = ["Dynamic Programming", "Trees", "Graphs", "Sorting", "Arrays", "Strings"];

    return logs.map((l) => ({
      platform: l.platform,
      topic: topics[Math.floor(Math.random() * topics.length)],
      success: l.maintained ? 1 : 0,
      time_spent: 1.0,
      date: new Date(l.date).toISOString(),
    }));
  } catch (error) {
    console.error(`Error fetching streak logs for user ${userId}:`, error.message);
    // Return empty array if database query fails
    return [];
  }
};



const generateAndCacheInsights = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const existing = await MlInsight.findOne({ userId });
  const activities = await buildActivitiesFromLogs(userId);

  const insights = generateInsightsFromActivities(
    activities,
    userId,
    existing?.data || {}
  );

  await MlInsight.updateOne(
    { userId },
    { $set: { userId, data: insights, updatedAt: new Date() } },
    { upsert: true }
  );

  return insights;
};

const getCachedInsights = async (req, res) => {
  try {
    const { userId } = req.params;

    let doc = await MlInsight.findOne({ userId });
    if (!doc) {
      const data = await generateAndCacheInsights(userId);
      return res.status(200).json(data);
    }

    // Validate existing data
    const existing = doc.data || {};
    const expectedTopics = ["Dynamic Programming", "Trees", "Graphs", "Sorting", "Arrays", "Strings"];
    const isValidWeakTopics = existing.weakTopics && existing.weakTopics.length === 6 && existing.weakTopics.every(t => expectedTopics.includes(t.name));
    const isValidRecommendations = existing.recommendedProblems && existing.recommendedProblems.length >= 5;

    if (!isValidWeakTopics || !isValidRecommendations) {
      // Regenerate if invalid
      const data = await generateAndCacheInsights(userId);
      return res.status(200).json(data);
    }

    return res.status(200).json(doc.data);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch cached insights" });
  }
};



const manualRefreshInsights = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existing = await MlInsight.findOne({ userId });
    const activities = await buildActivitiesFromLogs(userId);

    const insights = generateInsightsFromActivities(
      activities,
      userId,
      existing?.data || {}
    );

    await MlInsight.updateOne(
      { userId },
      { $set: { userId, data: insights, updatedAt: new Date() } },
      { upsert: true }
    );

    return res.status(200).json({ message: "Refreshed", data: insights });
  } catch (err) {
    return res.status(500).json({ message: "Manual refresh failed" });
  }
};


const markProblemSolved = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, platform } = req.body;

    const doc = await MlInsight.findOne({ userId });
    if (!doc) return res.status(404).json({ message: "No insights found" });

    let recs = doc.data.recommendedProblems || [];
    const index = recs.findIndex(
      (p) => p.title === title && p.platform === platform
    );

    if (index === -1)
      return res.status(404).json({ message: "Problem not found" });

    const removed = recs.splice(index, 1)[0];
    const topic = removed.topic;

    const replacement = pickRandomProblemForTopic(topic, recs);
    if (replacement) recs.push(replacement);

    doc.data.recommendedProblems = recs;
    doc.data.lastUpdated = new Date().toLocaleString();
    await doc.save();

    return res.status(200).json({ recommendedProblems: recs });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update recommendations" });
  }
};



module.exports = {
  ingestActivity,
  getCachedInsights,
  manualRefreshInsights,
  markProblemSolved,
};
