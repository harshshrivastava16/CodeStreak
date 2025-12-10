const { http, withRetries } = require('../utils/httpClient');

async function checkCodeforcesActivityToday(username) {
  try {
    // Validate username
    if (!username || typeof username !== 'string' || username.trim() === '') {
      console.error('Invalid username provided for Codeforces check');
      return false;
    }

    const trimmedUsername = username.trim();
    const url = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(trimmedUsername)}&from=1&count=100`;
    const res = await withRetries(() => http.get(url));

    if (res.data?.status !== 'OK') {
      console.error(`Codeforces API error for user ${trimmedUsername}: ${res.data?.comment || 'Unknown error'}`);
      return false;
    }

    const submissions = res.data.result || [];
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dayEpoch = Math.floor(startOfDay.getTime() / 1000);
    return submissions.some(s => (s.verdict === 'OK') && s.creationTimeSeconds >= dayEpoch);
  } catch (error) {
    console.error(`Error checking Codeforces activity for user ${username}:`, error.message);
    return false;
  }
}

module.exports = { checkCodeforcesActivityToday };
