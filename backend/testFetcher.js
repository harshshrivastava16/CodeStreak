const { fetchHackerRankStats } = require('./utils/fetchers/hackerrank');

async function test() {
  const username = 'harshdurg1611';
  console.log(`Testing fetcher for ${username}...`);
  try {
    const stats = await fetchHackerRankStats(username);
    console.log('Stats:', stats);
  } catch (error) {
    console.error('Error during fetching:', error.message);
  }
}

test();
