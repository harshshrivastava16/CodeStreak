const { http, withRetries } = require('./httpClient');

module.exports = async function validateCodeforcesUsername(username) {
  try {
    const url = `https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`;
    const res = await withRetries(() => http.get(url));
    return res.data && res.data.status === 'OK' && res.data.result && res.data.result.length > 0;
  } catch {
    return false;
  }
}; 