const validateGfgUsername = require('./utils/validateGfgUsername');

async function debugValidation() {
  const username = 'harshshrivastava16';
  console.log(`Testing validation for username: ${username}`);

  try {
    const result = await validateGfgUsername(username);
    console.log(`Validation result: ${result}`);
  } catch (error) {
    console.error('Validation error:', error);
  }
}

debugValidation();
