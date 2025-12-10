const { sendEmailReminder } = require('./utils/notifier');

async function testEmail() {
  try {
    // Replace with a test email
    await sendEmailReminder('test@example.com', 'leetcode', false);
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Test email failed:', error.message);
  }
}

testEmail();
