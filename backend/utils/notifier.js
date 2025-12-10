// utils/notifier.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASS, // use app password if Gmail
  },
});

function prettyPlatform(p) {
  if (!p) return 'Platform';
  const map = { leetcode: 'LeetCode', codeforces: 'Codeforces', gfg: 'GeeksforGeeks', hackerrank: 'HackerRank' };
  return map[p] || p;
}

/**
 * Send email to user
 * @param {string} toEmail - user's email
 * @param {string} platform - e.g., leetcode
 * @param {boolean} maintained - true if user maintained streak
 */
const sendEmailReminder = async (toEmail, platform, maintained) => {
  const name = prettyPlatform(platform);
  const subject = maintained
    ? ` ${name}: Streak maintained today`
    : ` ${name}: You missed your streak today`;

  const text = maintained
    ? `Great job! You submitted today on ${name}. Your streak continues. Keep going! 💪`
    : `It looks like you didn't submit today on ${name}. Your current streak has been reset. You got this—start again tomorrow! `;

  const mailOptions = {
    from: `"CodeStreak Notifier" <${process.env.EMAIL_ID}>`,
    to: toEmail,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${toEmail} - ${subject}`);
  } catch (error) {
    console.error(' Email Error:', error.message);
  }
};

/**
 * Send friend invitation email
 * @param {string} toEmail - recipient email
 * @param {string} fromUserName - name of the user sending the invitation
 */
const sendFriendInvitationEmail = async (toEmail, fromUserName) => {
  const subject = `${fromUserName} invited you to join CodeStreak!`;
  const text = `Hi there!\n\n${fromUserName} has sent you a friend request on CodeStreak. Join the platform to connect and track your coding streaks together!\n\nClick here to sign up: https://codestreak.example.com/signup\n\nHappy coding! `;

  const mailOptions = {
    from: `"CodeStreak Notifier" <${process.env.EMAIL_ID}>`,
    to: toEmail,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Friend invitation email sent to ${toEmail}`);
  } catch (error) {
    console.error(' Friend Invitation Email Error:', error.message);
  }
};

module.exports = { sendEmailReminder, sendFriendInvitationEmail };
