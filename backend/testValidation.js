const validateHackerRankUsername = require('./utils/validateHackerRankUsername.js');

async function test() {
  const username = 'harshdurg1611';
  console.log(`Testing validation for ${username}...`);
  try {
    const result = await validateHackerRankUsername(username);
    console.log('Validation result:', result);
  } catch (error) {
    console.error('Error during validation:', error.message);
  }
}

test();
