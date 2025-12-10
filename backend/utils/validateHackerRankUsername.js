const { http, withRetries } = require('./httpClient');

module.exports = async function validateHackerRankUsername(username) {
  try {
    // Try the REST API first
    const restUrl = `https://www.hackerrank.com/rest/hackers/${encodeURIComponent(username)}/profile`;
    const res = await withRetries(() => http.get(restUrl), { retries: 1, backoffMs: 1000 });

    if (res.status === 200 && res.data && res.data.model && res.data.model.username) {
      return true;
    }
  } catch (error) {
    console.log(`REST API failed for HackerRank user ${username}:`, error.message);
  }

  try {
    // Fallback: Try the web profile page
    const webUrl = `https://www.hackerrank.com/profile/${encodeURIComponent(username)}`;
    const res = await withRetries(() => http.get(webUrl), { retries: 1, backoffMs: 1000 });

    // Check if the page contains the username (basic validation)
    if (res.status === 200 && res.data && typeof res.data === 'string') {
      const hasUsername = res.data.includes(username) || res.data.includes(username.toLowerCase());
      const hasProfileIndicators = res.data.includes('hackerrank.com/profile') || res.data.includes('HackerRank');

      return hasUsername && hasProfileIndicators;
    }
  } catch (error) {
    console.log(`Web fallback failed for HackerRank user ${username}:`, error.message);
  }

  return false;
};
