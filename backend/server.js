const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

dotenv.config();

const app = express();

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(mongoSanitize());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
});

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost',
      'http://localhost:3000',
      'http://localhost:80',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

app.use('/api/auth/login', authLimiter);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Algonix API is running!' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/questions', require('./routes/questions'));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch all handler: send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/algonix')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const streakService = require('./services/streakService');

// Weekly leaderboard reset
cron.schedule('0 0 * * 0', () => {
  console.log('Resetting weekly leaderboard...');
  // Reset logic will be implemented in leaderboard service
});

// Daily streak check
cron.schedule('0 1 * * *', () => {
  console.log('Checking daily streaks...');
  streakService.checkDailyStreaks();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});