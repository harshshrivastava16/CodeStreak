const { http, withRetries } = require('../utils/httpClient');

async function checkGfgActivityToday(username) {
  try {
    // Validate username
    if (!username || typeof username !== 'string' || username.trim() === '') {
      console.error('Invalid username provided for GFG check');
      return false;
    }

    const trimmedUsername = username.trim();
    const url = `https://auth.geeksforgeeks.org/user/${encodeURIComponent(trimmedUsername)}/practice/`;
    const res = await withRetries(() => http.get(url));

    if (typeof res.data !== 'string') {
      console.error(`Invalid response from GFG for user ${trimmedUsername}`);
      return false;
    }

    // Heuristic: look for 'Submissions' sections with today's date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${dd}-${mm}-${yyyy}`;
    return res.data.includes(dateStr);
  } catch (error) {
    console.error(`Error checking GFG activity for user ${username}:`, error.message);
    return false;
  }
}

module.exports = { checkGfgActivityToday };
