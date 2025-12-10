// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectToMongo = require('./config/mongo');
const cookieParser = require('cookie-parser');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const streakChecker = require('./jobs/streakChecker');
const startMlInsightsRefresher = require('./jobs/mlInsightsRefresher');
const startInstantActivityChecker = require('./jobs/instantActivityChecker');
const startWarningNotifier = require('./jobs/warningNotifier');
const contactRoutes = require('./routes/contactRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const mlRoutes = require('./routes/mlRoutes');
const historyRoutes = require('./routes/historyRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();
const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost on any port (including localhost:5174)
    if (origin && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }

    // Allow your deployed frontend domain
    if (origin === 'https://code-streak-lemon.vercel.app') {
      return callback(null, true);
    }

    // Allow localhost:5174 explicitly for frontend dev server
    if (origin === 'http://localhost:5174') {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Logging middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectToMongo();

// Health check route
app.get('/', (req, res) => res.send('API is running'));

// Simple test endpoint to verify server is reachable
app.get('/api/test', (req, res) => res.json({ message: 'Test endpoint working' }));

// Use imported routes
app.use('/api/users', userRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', contactRoutes);

// Start Cron Jobs
(async () => {
  await streakChecker(); // Daily streaks finalization
  startMlInsightsRefresher(); // Daily ML insights
  startInstantActivityChecker(); // Every 10 min instant updates
  startWarningNotifier(); // 10:45 PM warnings

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
})();
