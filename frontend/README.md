# CodeStreak Notifier

This project tracks your LeetCode **Problem of the Day (POTD)** streak and sends you email reminders if you miss a day.

## Features

- **Google/Firebase Authentication**
- **LeetCode Username Registration**
- **POTD Streak Tracking**: Only counts if you solve the LeetCode POTD each day
- **Daily Cron Job**: Runs every day at 11:00 PM to check if you solved the POTD
- **Email Reminders**: If you miss the POTD, you get an email notification
- **Dashboard**: View your current and longest LeetCode POTD streaks
- **Cloud Deployable**: Works on Vercel, Render, Railway, etc. (no scraping, no Puppeteer)

## How It Works

1. Register/login with Google.
2. Enter your LeetCode username in Settings.
3. The backend checks every day at 11:00 PM if you solved the POTD.
4. If you did, your streak increases. If not, your streak resets and you get an email reminder.

## Limitations

- **Only the LeetCode Problem of the Day (POTD) counts toward your streak.**
- **Historical streaks are not imported.** Streak tracking starts from the day you register your username in the app.
- **Email reminders require valid Gmail credentials in your backend `.env` file.**

## Future Work

- Add support for more platforms (GFG, Codeforces, GitHub, etc.)
- Add friend/competition features
- Import historical streaks (if LeetCode allows)

## Deployment

- This project is ready for free deployment on Vercel, Render, Railway, or any Node.js host.
- No browser automation or scraping is used—just public APIs.

---

**Enjoy keeping your LeetCode POTD streak alive! **
