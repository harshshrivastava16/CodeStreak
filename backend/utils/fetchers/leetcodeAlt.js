const axios = require("axios");

const fetchLeetcodeStreakAlt = async (username) => {
  try {
    const response = await axios.get(`https://leetcode-api-faisalshohag.vercel.app/${username}`, {
      timeout: 30000,
    });
    const data = response.data;

    console.log(` Alt API response for ${username}:`, data);

    if (!data || data.status !== "success") {
      throw new Error("Invalid response from alt API");
    }

    const calendar = data.submissionCalendar;
    if (!calendar) {
      throw new Error("No submission calendar found");
    }

    // Calculate streak from submissionCalendar (UNIX timestamps)
    const dates = Object.keys(calendar).map((t) => parseInt(t)).sort((a, b) => b - a); // Descending

    let streak = 0;
    let currentDate = Math.floor(Date.now() / 1000); // current day in UNIX time

    for (let i = 0; i < dates.length; i++) {
      const day = dates[i];
      const daysDiff = Math.floor((currentDate - day) / 86400);

      if (daysDiff === 0 || daysDiff === 1) {
        streak++;
        currentDate -= 86400; // move to previous day
      } else if (daysDiff > 1) {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error(` Error fetching from updated alt API:`, error.message);
    return null;
  }
};

const fetchLeetCodeStats = async (username) => {
  try {
    // Use the alt API for more reliable stats fetching
    const response = await axios.get(`https://leetcode-api-faisalshohag.vercel.app/${username}`, {
      timeout: 30000,
    });

    const data = response.data;

    console.log(` Alt API stats response for ${username}:`, data);

    if (!data || !data.matchedUserStats) {
      throw new Error("Invalid response from alt API");
    }

    const { acSubmissionNum, totalSubmissionNum } = data.matchedUserStats;

    if (!acSubmissionNum || !totalSubmissionNum) {
      throw new Error("Missing submission data");
    }

    // Parse accepted submissions by difficulty
    const totalSolved = acSubmissionNum.find(d => d.difficulty === 'All')?.count || 0;
    const easy = acSubmissionNum.find(d => d.difficulty === 'Easy')?.count || 0;
    const medium = acSubmissionNum.find(d => d.difficulty === 'Medium')?.count || 0;
    const hard = acSubmissionNum.find(d => d.difficulty === 'Hard')?.count || 0;

    // Parse total submissions for accuracy
    const totalSubs = totalSubmissionNum.find(d => d.difficulty === 'All')?.submissions || 0;
    const accuracy = totalSolved > 0 ? Math.round((totalSolved / totalSubs) * 100) : 0;

    // Note: The alt API doesn't provide beats stats, so set to 0

    // Calculate lastActive from submissionCalendar
    let lastActive = null;
    if (data.submissionCalendar) {
      const timestamps = Object.keys(data.submissionCalendar)
        .filter(ts => data.submissionCalendar[ts] > 0)
        .map(ts => parseInt(ts));
      if (timestamps.length > 0) {
        const maxTs = Math.max(...timestamps);
        lastActive = new Date(maxTs * 1000);
      }
    }

    const result = {
      totalSolved,
      easy,
      medium,
      hard,
      accuracy,
      beats: { easy: 0, medium: 0, hard: 0 },
      lastActive,
    };

    console.log(`Returning LeetCode stats for ${username}:`, result);

    return result;
  } catch (error) {
    console.error(` Error fetching LeetCode stats for ${username}:`, error.message);
    return { totalSolved: 0, easy: 0, medium: 0, hard: 0, accuracy: 0, beats: { easy: 0, medium: 0, hard: 0 } };
  }
};

const fetchLeetCodeCalendar = async (username) => {
  try {
    const response = await axios.get(`https://leetcode-api-faisalshohag.vercel.app/${username}`, {
      timeout: 30000,
    });
    const data = response.data;

    console.log(` Calendar response for ${username}:`, data);

    if (!data || data.status !== "success") {
      throw new Error("Invalid response from alt API");
    }

    const calendar = data.submissionCalendar;
    if (!calendar) {
      throw new Error("No submission calendar found");
    }

    const result = [];
    for (const [timestamp, count] of Object.entries(calendar)) {
      const date = new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0];
      result.push({ date, count });
    }

    return result;
  } catch (error) {
    console.error(` Error fetching calendar for ${username}:`, error.message);
    return [];
  }
};

module.exports = { fetchLeetcodeStreakAlt, fetchLeetCodeStats, fetchLeetCodeCalendar };
