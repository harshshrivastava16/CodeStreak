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

/**
 * Send email to user
 * @param {string} toEmail - user's email
 * @param {string} platform - e.g., leetcode
 * @param {boolean} maintained - true if user maintained streak
 */
const sendEmailReminder = async (toEmail, platform, maintained) => {
  const subject = maintained
    ? `✅ Streak Maintained on ${platform.toUpperCase()}`
    : `⚠️ You Missed Your ${platform.toUpperCase()} Streak`;

  const text = maintained
    ? `Great job! You've solved a problem today on ${platform}. Keep the streak alive! 💪`
    : `You didn’t submit anything today on ${platform}. Your streak has been reset. Don’t give up! 🚀`;

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
    console.error('❌ Email Error:', error.message);
  }
};

/**
 * Send friend invitation email
 * @param {string} toEmail - recipient email
 * @param {string} fromUserName - name of the user sending the invitation
 */
const sendFriendInvitationEmail = async (toEmail, fromUserName) => {
  const subject = `${fromUserName} invited you to join CodeStreak!`;
  const text = `Hi there!\n\n${fromUserName} has sent you a friend request on CodeStreak. Join the platform to connect and track your coding streaks together!\n\nClick here to sign up: https://codestreak.example.com/signup\n\nHappy coding! 🚀`;

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
    console.error('❌ Friend Invitation Email Error:', error.message);
  }
};

module.exports = { sendEmailReminder, sendFriendInvitationEmail };
