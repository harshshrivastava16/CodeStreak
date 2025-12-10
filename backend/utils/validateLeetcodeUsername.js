// utils/validateLeetcodeUsername.js

const axios = require("axios");

const validateLeetcodeUsername = async (username) => {
  if (!username || typeof username !== "string") {
    console.warn(" Invalid input: Username must be a non-empty string.");
    return false;
  }

  // Normalize username: trim only, keep case-sensitive
  const normalizedUsername = username.trim();

  const query = `
    query userProfileCalendar($username: String!) {
      matchedUser(username: $username) {
        username
      }
    }
  `;

  const variables = { username: normalizedUsername };

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      { query, variables },
      {
        headers: {
          "Content-Type": "application/json",
          Referer: `https://leetcode.com/${normalizedUsername}/`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        },
      }
    );

    if (response.data?.data?.matchedUser?.username === normalizedUsername) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(" Error validating LeetCode username with GraphQL API:", error.message);
    return false;
  }
};

module.exports = validateLeetcodeUsername;
