const express = require('express');
const router = express.Router();
const ShelfItem = require('../models/ShelfItem');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

// @route GET /api/shelf
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const shelf = await ShelfItem.find(query).sort({ updatedAt: -1 });
    res.json({ shelf });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/shelf
router.post('/', async (req, res) => {
  try {
    const { bookId, title, author, cover, description, pageCount, genre, publishedYear, status } = req.body;

    const existing = await ShelfItem.findOne({ user: req.user._id, bookId });
    if (existing) {
      return res.status(400).json({ message: 'Book already on your shelf' });
    }

    const item = await ShelfItem.create({
      user: req.user._id,
      bookId, title, author, cover, description, pageCount, genre, publishedYear,
      status: status || 'want-to-read',
      startedAt: status === 'reading' ? new Date() : undefined
    });

    res.status(201).json({ item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/shelf/:id
router.put('/:id', async (req, res) => {
  try {
    const { status, currentPage, rating } = req.body;
    const item = await ShelfItem.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Shelf item not found' });

    if (status) {
      if (status === 'reading' && !item.startedAt) item.startedAt = new Date();
      if (status === 'finished' && !item.finishedAt) item.finishedAt = new Date();
      item.status = status;
    }
    if (currentPage !== undefined) item.currentPage = currentPage;
    if (rating !== undefined) item.rating = rating;

    await item.save();
    res.json({ item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/shelf/:id
router.delete('/:id', async (req, res) => {
  try {
    await ShelfItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Removed from shelf' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/shelf/stats
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, reading, finished, wantToRead] = await Promise.all([
      ShelfItem.countDocuments({ user: userId }),
      ShelfItem.countDocuments({ user: userId, status: 'reading' }),
      ShelfItem.countDocuments({ user: userId, status: 'finished' }),
      ShelfItem.countDocuments({ user: userId, status: 'want-to-read' })
    ]);

    const totalMinutes = await ShelfItem.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$totalReadingMinutes' } } }
    ]);

    res.json({
      stats: {
        total,
        reading,
        finished,
        wantToRead,
        totalReadingMinutes: totalMinutes[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
