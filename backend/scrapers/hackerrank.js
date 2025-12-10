const { http, withRetries } = require('../utils/httpClient');

async function checkHackerRankActivityToday(username) {
  try {
    // Validate username
    if (!username || typeof username !== 'string' || username.trim() === '') {
      console.error('Invalid username provided for HackerRank check');
      return false;
    }

    const trimmedUsername = username.trim();
    const url = `https://www.hackerrank.com/rest/hackers/${encodeURIComponent(trimmedUsername)}/recent_challenges?limit=10`;
    const res = await withRetries(() => http.get(url));

    const items = res.data?.models || res.data?.data || [];
    if (!Array.isArray(items)) {
      console.error(`Invalid response from HackerRank for user ${trimmedUsername}`);
      return false;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startMs = startOfDay.getTime();
    // items may include created_at or updated_at (ms)
    return items.some(i => {
      const t = (i.created_at || i.createdAt || i.updated_at || i.updatedAt);
      if (!t) return false;
      const ts = typeof t === 'number' ? t : Date.parse(t);
      return ts && ts >= startMs;
    });
  } catch (error) {
    console.error(`Error checking HackerRank activity for user ${username}:`, error.message);
    return false;
  }
}

module.exports = { checkHackerRankActivityToday };
