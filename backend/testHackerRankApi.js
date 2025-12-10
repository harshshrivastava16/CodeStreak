const { fetchHackerRankStats } = require('./utils/fetchers/hackerrank');

async function testHackerRank() {
  const username = 'harshdurg1611'; // Test username from user report
  console.log(`Testing HackerRank stats for ${username}...`);
  const stats = await fetchHackerRankStats(username);
  console.log('Stats:', stats);
}

testHackerRank();
