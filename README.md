# Notifier - Competitive Programming Streak Tracker

A full-stack application that tracks competitive programming streaks across multiple platforms (LeetCode, Codeforces, etc.) and sends notifications to keep users motivated.

## 🚀 Features

- **Multi-platform Support**: Track progress across LeetCode, Codeforces, and other platforms
- **Streak Tracking**: Monitor daily coding streaks with visual progress indicators
- **Smart Notifications**: Get reminded via email/Discord when you're about to break your streak
- **Friend System**: Connect with friends and see their progress
- **Leaderboards**: Compete with friends and global users
- **Profile Analytics**: Detailed insights into your coding journey
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend

- **React** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Firebase** for authentication

### Backend

- **Node.js** with Express
- **MongoDB** for data storage
- **Firebase Admin** for server-side authentication
- **Puppeteer** for web scraping
- **Node-cron** for scheduled jobs
- **Nodemailer** for email notifications

## 📁 Project Structure

```
Notifier/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── cron/           # Scheduled jobs
│   ├── jobs/           # Background tasks
│   ├── middleware/     # Authentication middleware
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── scrapers/       # Platform scrapers
│   ├── scripts/        # Utility scripts
│   ├── uploads/        # User profile pictures
│   └── utils/          # Helper functions
├── frontend/
│   ├── src/
│   │   ├── api/        # API service layer
│   │   ├── components/ # Reusable components
│   │   ├── context/    # React context providers
│   │   ├── layouts/    # Page layouts
│   │   ├── pages/      # Route pages
│   │   └── assets/     # Static assets
│   └── public/         # Public assets
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Firebase project

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd Notifier
```

2. **Backend Setup**

```bash
cd backend
npm install
```

3. **Frontend Setup**

```bash
cd ../frontend
npm install
```

4. **Environment Variables**
   Create `.env` files in both backend and frontend directories:

5. **Start Development Servers**

**Backend**

```bash
cd backend
npm start
```

**Frontend**

```bash
cd frontend
npm run dev
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/leaderboard` - Get leaderboard data

### Platform Integration

- `POST /api/platforms/connect` - Connect coding platform account
- `GET /api/platforms/streaks` - Get streak data
- `PUT /api/platforms/update` - Update platform data

### Friends System

- `POST /api/friends/add` - Send friend request
- `GET /api/friends/requests` - Get pending requests
- `PUT /api/friends/accept` - Accept friend request
- `GET /api/friends/list` - Get friends list

## 📊 Database Schema

- **Notification Sender** (`backend/jobs/streakChecker.js`): Sends notifications for streak warnings

## 🧪 Testing

Run tests for both frontend and backend:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Backend (Render/Heroku)

1. Add production MongoDB URI
2. Set environment variables
3. Deploy using Git

### Frontend (Vercel/Netlify)

1. Build the project
2. Configure environment variables
3. Deploy the build folder

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contact

- Email: your-email@example.com
- Discord: YourDiscord#1234
- LinkedIn: [Your LinkedIn Profile]

## 🙏 Acknowledgments

- LeetCode API for problem data
- Codeforces API for contest information
- Firebase for authentication services
- Tailwind CSS for beautiful UI components
