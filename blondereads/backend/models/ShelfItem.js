const mongoose = require('mongoose');

const shelfItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: String,
    required: true
  },
  title: { type: String, required: true },
  author: { type: String, default: 'Unknown Author' },
  cover: { type: String, default: '' },
  description: { type: String, default: '' },
  pageCount: { type: Number, default: 0 },
  genre: { type: String, default: '' },
  publishedYear: { type: String, default: '' },
  status: {
    type: String,
    enum: ['want-to-read', 'reading', 'finished'],
    default: 'want-to-read'
  },
  currentPage: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  startedAt: { type: Date },
  finishedAt: { type: Date },
  totalReadingMinutes: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compound unique index: one entry per user per book
shelfItemSchema.index({ user: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model('ShelfItem', shelfItemSchema);
