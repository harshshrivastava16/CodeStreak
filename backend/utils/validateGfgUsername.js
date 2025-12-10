const { http, withRetries } = require('./httpClient');

module.exports = async function validateGfgUsername(username) {
  try {
    const url = `https://www.geeksforgeeks.org/user/${encodeURIComponent(username)}/`;
    const res = await withRetries(() => http.get(url));

    // Check if response is successful
    if (res.status !== 200) {
      return false;
    }

    // Check if the page contains user-specific content
    // Look for indicators that this is a valid user profile
    const data = res.data;
    const hasUserContent = data.includes(username) &&
                          (data.includes('Problems Solved') ||
                           data.includes('Coding Score') ||
                           data.includes('Current Streak') ||
                           data.includes('user-profile') ||
                           data.includes('profile-stats'));

    // Check if it's a 404 or error page
    const isErrorPage = data.includes('404') ||
                       data.includes('Page Not Found') ||
                       data.includes('User not found') ||
                       data.includes('No such user exists');

    return hasUserContent && !isErrorPage;
  } catch {
    return false;
  }
};
