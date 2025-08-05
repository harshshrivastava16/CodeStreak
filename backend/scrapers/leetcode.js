// scrapers/leetcode.js
const axios = require('axios');

/**
 * Checks if the user submitted a solution to the LeetCode POTD today.
 * @param {string} username
 * @returns {Promise<boolean>} true if POTD solved today
 */
const checkLeetCodeActivityToday = async (username) => {
  try {
    // 1. Get today's POTD slug
    const potdRes = await axios.post('https://leetcode.com/graphql', {
      query: `
        query questionOfToday {
          activeDailyCodingChallengeQuestion {
            date
            question {
              titleSlug
            }
          }
        }
      `
    }, {
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com/problemset/all/',
      },
    });

    const potdSlug = potdRes.data.data.activeDailyCodingChallengeQuestion.question.titleSlug;

    // 2. Get user's recent submissions
    const submissionsRes = await axios.post('https://leetcode.com/graphql', {
      query: `
        query recentSubmissions($username: String!) {
          recentSubmissions(username: $username) {
            title
            titleSlug
            timestamp
            statusDisplay
          }
        }
      `,
      variables: { username },
    }, {
      headers: {
        'Content-Type': 'application/json',
        Referer: `https://leetcode.com/${username}/`,
      },
    });

    const submissions = submissionsRes.data.data.recentSubmissions || [];
    const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
    const todayEnd = Math.floor(new Date().setHours(23, 59, 59, 999) / 1000);

    // 3. Check if user submitted POTD today
    const didSolvePOTD = submissions.some(sub =>
      sub.titleSlug === potdSlug &&
      sub.timestamp >= todayStart &&
      sub.timestamp <= todayEnd &&
      sub.statusDisplay === 'Accepted'
    );

    return didSolvePOTD;
  } catch (error) {
    console.error('Error checking POTD activity:', error.message);
    return false;
  }
};

module.exports = { checkLeetCodeActivityToday };
