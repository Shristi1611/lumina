const express = require('express');
const router = express.Router();
const { PomodoroSession, PomodoroSettings } = require('../models/Pomodoro');
const ShelfItem = require('../models/ShelfItem');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route GET /api/pomodoro/settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await PomodoroSettings.findOne({ user: req.user._id });
    if (!settings) {
      settings = await PomodoroSettings.create({ user: req.user._id });
    }
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/pomodoro/settings
router.put('/settings', async (req, res) => {
  try {
    const { workDuration, shortBreakDuration, longBreakDuration, sessionsBeforeLongBreak, autoStartBreaks, soundEnabled } = req.body;
    const settings = await PomodoroSettings.findOneAndUpdate(
      { user: req.user._id },
      { workDuration, shortBreakDuration, longBreakDuration, sessionsBeforeLongBreak, autoStartBreaks, soundEnabled },
      { new: true, upsert: true }
    );
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/pomodoro/session
router.post('/session', async (req, res) => {
  try {
    const { bookId, bookTitle, type, duration, completed } = req.body;

    let shelfBook = null;
    if (bookId) {
      shelfBook = await ShelfItem.findOne({ user: req.user._id, _id: bookId });
    }

    const session = await PomodoroSession.create({
      user: req.user._id,
      book: shelfBook?._id || null,
      bookTitle: bookTitle || shelfBook?.title || '',
      type: type || 'work',
      duration,
      completed
    });

    // If it's a completed work session, update reading minutes
    if (completed && type === 'work') {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalReadingMinutes: duration }
      });
      if (shelfBook) {
        await ShelfItem.findByIdAndUpdate(shelfBook._id, {
          $inc: { totalReadingMinutes: duration }
        });
      }
    }

    res.status(201).json({ session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/pomodoro/stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const [totalSessions, weekSessions, completedSessions, byBook] = await Promise.all([
      PomodoroSession.countDocuments({ user: userId, type: 'work' }),
      PomodoroSession.countDocuments({ user: userId, type: 'work', date: { $gte: startOfWeek } }),
      PomodoroSession.countDocuments({ user: userId, type: 'work', completed: true }),
      PomodoroSession.aggregate([
        { $match: { user: userId, type: 'work', completed: true, bookTitle: { $ne: '' } } },
        { $group: { _id: '$bookTitle', sessions: { $sum: 1 }, minutes: { $sum: '$duration' } } },
        { $sort: { minutes: -1 } },
        { $limit: 5 }
      ])
    ]);

    const totalMinutes = await PomodoroSession.aggregate([
      { $match: { user: userId, type: 'work', completed: true } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    res.json({
      stats: {
        totalSessions,
        weekSessions,
        completedSessions,
        totalReadingMinutes: totalMinutes[0]?.total || 0,
        topBooks: byBook
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/pomodoro/history
router.get('/history', async (req, res) => {
  try {
    const sessions = await PomodoroSession.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(50);
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
