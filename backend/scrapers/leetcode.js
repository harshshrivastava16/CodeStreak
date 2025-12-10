// scrapers/leetcode.js
const axios = require('axios');

/**
 * Checks if the user submitted a solution to the LeetCode POTD today.
 * @param {string} username
 * @returns {Promise<boolean>} true if POTD solved today
 */
const checkLeetCodeActivityToday = async (username) => {
  try {
    // Validate username
    if (!username || typeof username !== 'string' || username.trim() === '') {
      console.error('Invalid username provided for LeetCode check');
      return false;
    }

    const trimmedUsername = username.trim();

    // 1. Get today's POTD slug with enhanced headers
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
        'Referer': 'https://leetcode.com/problemset/all/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });

    if (!potdRes.data?.data?.activeDailyCodingChallengeQuestion?.question?.titleSlug) {
      console.error('Failed to fetch POTD slug from LeetCode');
      return false;
    }

    const potdSlug = potdRes.data.data.activeDailyCodingChallengeQuestion.question.titleSlug;

    // 2. Get user's recent submissions with enhanced headers
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
      variables: { username: trimmedUsername },
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': `https://leetcode.com/${trimmedUsername}/`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });

    if (!submissionsRes.data?.data?.recentAcSubmissionList) {
      console.error(`Failed to fetch submissions for user ${trimmedUsername}`);
      return false;
    }

    const submissions = submissionsRes.data.data.recentAcSubmissionList || [];
    const now = new Date();
    const todayStart = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
    const todayEnd = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime() / 1000);

    // 3. Check if user submitted any problem today (LeetCode streak counts any solve, not just POTD)
    const didSolveAnyToday = submissions.some(sub =>
      sub.timestamp >= todayStart &&
      sub.timestamp <= todayEnd
    );

    // console.log(` LeetCode Debug for ${trimmedUsername}:`);
    // console.log(`  Today's POTD: ${potdSlug}`);
    // console.log(`  Today start: ${new Date(todayStart * 1000).toISOString()}`);
    // console.log(`  Today end: ${new Date(todayEnd * 1000).toISOString()}`);
    // console.log(`  Recent submissions:`, submissions.map(s => ({
    //   titleSlug: s.titleSlug,
    //   timestamp: new Date(s.timestamp * 1000).toISOString(),
    //   isToday: s.timestamp >= todayStart && s.timestamp <= todayEnd,
    //   isPOTD: s.titleSlug === potdSlug
    // })));
    // console.log(`  Did solve any problem today: ${didSolveAnyToday}`);

    return didSolveAnyToday;
  } catch (error) {
    if (error.response) {
      console.error(`LeetCode API error (${error.response.status}):`, error.response.data?.message || error.message);
      console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNABORTED') {
      console.error('LeetCode API request timeout');
    } else {
      console.error('Error checking POTD activity:', error.message);
    }
    return false;
  }
};

module.exports = { checkLeetCodeActivityToday };
