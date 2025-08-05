const axios = require("axios");

const fetchLeetcodeStreakAlt = async (username) => {
  try {
    const response = await axios.get(`https://leetcode-api-faisalshohag.vercel.app/${username}`);
    const data = response.data;

    console.log(`✅ Alt API response for ${username}:`, data);

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
    console.error(`❌ Error fetching from updated alt API:`, error.message);
    return null;
  }
};

module.exports = { fetchLeetcodeStreakAlt };
