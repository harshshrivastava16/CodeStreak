const axios = require('axios');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function withRetries(requestFn, { retries = 2, backoffMs = 500 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await requestFn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await sleep(backoffMs * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

const http = axios.create({ timeout: 10000, headers: { 'User-Agent': 'CodeStreak/1.0' } });

module.exports = { http, withRetries }; 