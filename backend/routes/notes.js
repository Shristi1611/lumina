const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const ShelfItem = require('../models/ShelfItem');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route GET /api/notes/:bookId
router.get('/:bookId', async (req, res) => {
  try {
    const shelfItem = await ShelfItem.findOne({ user: req.user._id, bookId: req.params.bookId });
    if (!shelfItem) return res.status(404).json({ message: 'Book not on shelf' });

    const notes = await Note.find({ user: req.user._id, bookId: req.params.bookId }).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/notes
router.post('/', async (req, res) => {
  try {
    const { bookId, content, page, color } = req.body;
    const shelfItem = await ShelfItem.findOne({ user: req.user._id, bookId });
    if (!shelfItem) return res.status(404).json({ message: 'Add book to shelf first' });

    const note = await Note.create({
      user: req.user._id,
      book: shelfItem._id,
      bookId, content, page,
      color: color || 'pink'
    });
    res.status(201).json({ note });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/notes/:id
router.put('/:id', async (req, res) => {
  try {
    const { content, page, color } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { content, page, color },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ note });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
