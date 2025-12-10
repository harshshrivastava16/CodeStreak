// utils/fetchers/leetcode.js
const axios = require("axios");

const fetchLeetcodeData = async (username) => {
  const query = `
    query userProfileCalendar($username: String!) {
      matchedUser(username: $username) {
        username
        userCalendar {
          submissionCalendar
          streak
          totalActiveDays
        }
      }
    }
  `;

  const variables = { username };

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      { query, variables },
      {
        headers: {
          "Content-Type": "application/json",
          Referer: `https://leetcode.com/${username}/`,
        },
        timeout: 30000,
      }
    );

    // 🛠️ FIX: return only the `userCalendar` object
    return response.data?.data?.matchedUser?.userCalendar || null;
  } catch (error) {
    console.error(`Error fetching data from Leetcode GraphQL:`, error.message);
    return null;
  }
};

module.exports = fetchLeetcodeData;
