//require('dotenv').config({ path: __dirname + '/.env' });
require('dotenv').config();
console.log("JWT:", process.env.JWT_SECRET);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');



const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/shelf', require('./routes/shelf'));
app.use('/api/pomodoro', require('./routes/pomodoro'));
app.use('/api/notes', require('./routes/notes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Lumina API running 💅' }));

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI
mongoose.connect("mongoURI")
  .then(() => {
    console.log('✨ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`💅 Lumina server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
