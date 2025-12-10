# CodeStreak Notifier - Complete Project Explanation

## Overview

CodeStreak Notifier is a full-stack web application designed to help users maintain their LeetCode Problem of the Day (POTD) solving streaks. It tracks daily progress, sends email reminders for missed days, and provides a dashboard for streak visualization. The app supports Google authentication and is built for cloud deployment without relying on browser automation or scraping for core functionality.

## Tech Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js (v5.1.0)
- **Database:** MongoDB with Mongoose (v8.16.3) for data modeling and queries
- **Authentication:** Firebase Admin SDK (v13.4.0) for Google OAuth and token verification
- **Email Service:** Nodemailer (v7.0.5) for sending reminders
- **Scheduling:** Node-cron (v4.2.1) for daily jobs
- **HTTP Client:** Axios (v1.10.0) for API calls
- **Web Scraping:** Puppeteer (v24.14.0) for fetching data from platforms (though the README notes no scraping for core functionality)
- **Other:** Zod (v3.25.76) for validation, Multer for file uploads, CORS for cross-origin requests

### Frontend

- **Framework:** React (v19.1.0) with Vite (v7.0.4) for build tooling
- **State Management:** Redux Toolkit (v2.8.2) for global state
- **Routing:** React Router DOM (v7.6.3)
- **Styling:** Tailwind CSS (v3.4.17) with PostCSS and Autoprefixer
- **Charts:** Chart.js (v4.5.0) and React-ChartJS-2 (v5.3.0), Recharts (v3.5.0) for data visualization
- **Authentication:** Firebase SDK (v11.10.0)
- **HTTP Client:** Axios (v1.10.0)
- **UI Enhancements:** Framer Motion (v12.23.6) for animations, React Hot Toast (v2.5.2) for notifications, Lucide React (v0.525.0) for icons
- **Other:** React Circular Progressbar, React Calendar Heatmap for streak displays

### Deployment & DevOps

- **Containerization:** Docker (Dockerfile in backend and ml directories)
- **Orchestration:** Docker Compose for multi-service setup
- **ML Component:** Python Flask app (backend/ml/) with requirements.txt for insights generation
- **Cloud Ready:** Designed for platforms like Vercel, Render, Railway

## Architecture

### Backend Structure

- **Entry Point:** `server.js` - Sets up Express app, middleware (CORS, JSON parsing, cookie parsing), connects to MongoDB, registers routes, and initializes cron jobs.
- **Routes:** Modular routing in `/routes` (userRoutes, subscriptionRoutes, mlRoutes, historyRoutes, paymentRoutes, contactRoutes).
- **Controllers:** Business logic in `/controllers` (userController, subscriptionController, mlController, historyController).
- **Models:** Mongoose schemas in `/models` (User, StreakLog, MlInsight).
- **Jobs/Cron:** Background tasks in `/jobs` (streakChecker for daily checks, mlInsightsRefresher, instantActivityChecker, warningNotifier).
- **Utils:** Helper functions in `/utils` (fetchers for platform data, validators, notifier for emails).
- **Scrapers:** Platform-specific scrapers in `/scrapers` (codeforces, gfg, hackerrank, leetcode) using Puppeteer.
- **Middleware:** Auth middleware for protected routes.
- **Config:** MongoDB connection in `/config/mongo.js`.

### Frontend Structure

- **Entry Point:** `main.jsx` - Renders the React app.
- **App Structure:** `App.jsx` with routing via `AppRoutes.jsx`.
- **Pages:** Various pages in `/pages` (Dashboard, Login, Profile, Insights, etc.).
- **Components:** Reusable UI in `/components` (Navbar, Sidebar, Loader, etc.).
- **Context:** UserContext and DataCacheContext for state management.
- **API:** Axios instance in `/api/axiosInstance.js` for backend communication.
- **Assets:** Static assets in `/assets` and `/public`.

### Database

- **MongoDB Collections:** Users (with usernames, streaks), StreakLogs (daily records), MlInsights (generated insights).
- **No SQL Schema:** Flexible document-based storage.

### ML Component

- Separate Python service for generating insights, likely using machine learning models on user data.

## Backend Routes

All backend routes are prefixed with `/api` in the main server.js.

### User Routes (`/api/users`)

- **GET /test-route**: Test route to verify router is working. Returns a JSON message.
- **POST /register**: Registers a new user. Expects user data in request body.
- **POST /login**: Logs in a user. Expects credentials in request body.
- **POST /auth/google**: Verifies Google OAuth token for authentication. Used for Google login.
- **PUT /update-platforms/:id**: Updates user platforms (usernames for LeetCode, GFG, etc.). Requires user ID in URL.
- **GET /streaks/:id**: Retrieves user streaks from the database. Requires user ID.
- **GET /validate/:platform/:username**: Validates a username for a specific platform (e.g., LeetCode or GFG). Checks if the username exists.
- **GET /direct-streaks/:uid**: Gets the direct LeetCode streak for a user. Fetches real-time data.
- **GET /profile/:id**: Retrieves user profile information by user ID.
- **POST /add-friend**: Adds a friend to the user's friend list. Expects friend data.
- **GET /friends/:userId**: Gets friends list with their streaks for a user.
- **GET /global**: Retrieves the global leaderboard of users by streaks.
- **PUT /update-profile/:id**: Updates user profile fields, including file upload for profile photo using Multer.
- **PUT /users/:id/streak**: Manually updates a user's streak. Admin or user-specific.
- **GET /search**: Searches users by name or email. Query parameters for search terms.
- **PUT /alerts/:id**: Updates alert settings for a user (premium feature).
- **POST /instant-check/:id**: Triggers an instant check for the current user's streak.
- **GET /user/:username**: Retrieves user data by username.
- **POST /send-friend-request**: Sends a friend request to another user.
- **POST /accept-friend-request**: Accepts a pending friend request.
- **POST /decline-friend-request**: Declines a pending friend request.
- **POST /remove-friend/:id**: Removes a friend from the user's list.
- **GET /streak-history/:userId**: Gets the user's streak history for chart visualization.

### Subscription Routes (`/api/subscription`)

- **POST /checkout/start**: Starts a fake checkout process for subscription.
- **POST /checkout/confirm**: Confirms a fake payment for subscription.
- **GET /:userId**: Retrieves subscription details for a user.
- **POST /cancel**: Cancels subscription at the end of the period.

### ML Routes (`/api/ml`)

- **GET /:userId**: Retrieves cached ML insights for a user.
- **POST /:userId/refresh**: Manually refreshes ML insights for a user.
- **POST /:userId/recommended/solve**: Marks a recommended problem as solved, updating insights.

### Payment Routes (`/api/payments`)

- **GET /**: Placeholder route for payment-related endpoints. Returns a message.
- **POST /fake**: Processes a fake payment (for testing/demo purposes).

### Contact Routes (`/api`)

- **POST /contact**: Sends a contact us message via email. Expects name, email, and message in request body. Uses Nodemailer to send to admin email.

### History Routes (`/api/history`)

- **GET /:userId**: Retrieves the history of activities for a user.
- **GET /:userId/solves**: Gets recent problem solves for a user.

## Frontend Routes

Frontend routes are defined in `AppRoutes.jsx` using React Router DOM. Public routes are accessible without authentication, protected routes require a logged-in user.

### Public Routes

- **/**: Landing page - Introduction to the app, features overview.
- **/login**: Login page - User authentication with Google OAuth.
- **/register**: Register page - User registration form.
- **/features**: Features page - Detailed list of app features.
- **/pricing**: Pricing page - Subscription plans and pricing.
- **/contact-us**: Contact Us page - Form to send messages to developers.

### Protected Routes (Require Authentication)

- **/home**: Home page - Main dashboard after login, shows streak summary.
- **/dashboard**: Dashboard page - Detailed streak tracking with charts and heatmaps.
- **/leaderboard**: Leaderboard page - Global ranking of users by streaks.
- **/friends**: Friends page - Manage friends, view their streaks, send requests.
- **/profile**: Profile page - View and edit user profile information.
- **/edit-profile**: Edit Profile page - Form to update profile details and photo.
- **/help-center**: Help Center page - FAQs and support information.
- **/checkout**: Checkout page - Subscription payment process.
- **/insights**: Insights page - ML-generated insights on user performance.
- **/history**: History page - Detailed history of solves and streaks.
- **/compare**: Compare page - Compare streaks with friends or other users.
- **/setup/step1**: Setup Step 1 - Onboarding: Enter LeetCode username.
- **/setup/step2**: Setup Step 2 - Onboarding: Configure platforms.
- **/setup/step3**: Setup Step 3 - Onboarding: Final setup and welcome.
- **/fake-payment**: Fake Payment page - Demo payment confirmation.

### Catch-All Route

- **\***: Redirects to appropriate page based on user status (onboarded or not).

## Components Explanation

### Frontend Pages/Components

- **Landing**: Introductory page with hero section, features, and call-to-action.
- **Login**: Form for Google OAuth login.
- **Register**: Registration form (though primarily Google auth).
- **Features**: Showcase of app capabilities.
- **Pricing**: Displays subscription tiers.
- **ContactUs**: Contact form for user inquiries.
- **Home**: Post-login home with streak overview and quick actions.
- **Dashboard**: Comprehensive view with streak charts, heatmaps, and stats.
- **Leaderboard**: Table of top users by streak length.
- **Friends**: List of friends with their streaks, add/remove friends.
- **Profile**: User profile display with stats and settings.
- **EditProfile**: Form to edit profile, upload photo.
- **HelpCenter**: Help articles and FAQs.
- **Checkout**: Subscription selection and payment.
- **Insights**: AI/ML insights on solving patterns.
- **History**: Timeline of past solves and streak changes.
- **Compare**: Side-by-side comparison of user streaks.
- **SetupStep1/2/3**: Multi-step onboarding wizard.
- **FakePayment**: Mock payment success page.

### Reusable Components

- **Navbar**: Top navigation bar with links and user menu.
- **PublicNavbar**: Simplified navbar for public pages.
- **Sidebar**: Side menu for navigation in protected areas.
- **Layout/Appshell**: Main layout wrapper with navbar and sidebar.
- **Loader**: Loading spinner for async operations.
- **BackgroundGlow**: Animated background effect.
- **PlatformCard**: Card displaying platform-specific data.
- **StreakDisplay**: Component showing current streak with progress bar.

### Context and State

- **UserContext**: Manages user authentication state and profile data.
- **DataCacheContext**: Caches API data to reduce redundant requests.

## Database Models

- **User**: Stores user info (name, email, usernames for platforms, streaks, friends, subscription).
- **StreakLog**: Daily logs of streak status (solved or not).
- **MlInsight**: Cached ML-generated insights for users.

## Jobs/Cron

- **streakChecker**: Runs daily at 11 PM to finalize streaks and send reminders.
- **mlInsightsRefresher**: Daily refresh of ML insights.
- **instantActivityChecker**: Every 10 minutes for real-time updates.
- **warningNotifier**: 10:45 PM warnings if streak at risk.

## Utils

- **fetchers**: API clients for platforms (LeetCode, GFG, etc.).
- **validators**: Username validation for platforms.
- **notifier**: Email sending utility.
- **httpClient**: Axios wrapper for requests.

## Scrapers

- **leetcode.js**: Scrapes LeetCode data using Puppeteer.
- **gfg.js**: For GeeksforGeeks.
- **codeforces.js**: For Codeforces.
- **hackerrank.js**: For HackerRank.

## Deployment

- **Backend**: Node.js app deployable to Railway, Render, etc.
- **Frontend**: React app built with Vite, deployable to Vercel.
- **ML**: Containerized Flask app.
- **Docker Compose**: For local multi-service development.

## How It Works

1. User registers/logs in with Google.
2. Sets up usernames for coding platforms.
3. Cron jobs check daily solves.
4. Streaks update; emails sent on misses.
5. Dashboard visualizes progress.
6. Friends and leaderboards for competition.
7. ML insights provide personalized tips.

This comprehensive README covers all routes, components, and project aspects for your interview preparation.
