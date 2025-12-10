const { fetchCodeforcesStats } = require('./utils/fetchers/codeforces');

async function testCodeforces() {
  const username = 'tourist'; // Example username
  console.log(`Testing Codeforces stats for ${username}...`);
  const stats = await fetchCodeforcesStats(username);
  console.log('Stats:', stats);
}

testCodeforces();
