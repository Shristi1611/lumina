require('dotenv').config({ path: __dirname + '/.env' });

console.log("JWT:", process.env.JWT_SECRET);


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');



const app = express();

// Middleware
app.use(cors({
  origin: ['https://lumina-c90p.onrender.com'],
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
// Replace process.env.MONGO_URI with the actual string
mongoose.connect(process.env.MONGO_URI)
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
