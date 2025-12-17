const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // Load env vars immediately
const cors = require('cors');
const connectDB = require('./config/db');

// 1. IMPORT ROUTES
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes'); // 👈 Make sure this is here
const startScheduler = require('./scheduler');
const path = require('path');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// 2. USE ROUTES
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes); // 👈 This creates '/api/workouts'
startScheduler();

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));