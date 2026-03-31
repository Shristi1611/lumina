const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShelfItem',
    required: true
  },
  bookId: { type: String, required: true },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    maxlength: [2000, 'Note cannot exceed 2000 characters']
  },
  page: {
    type: Number,
    default: null
  },
  color: {
    type: String,
    enum: ['pink', 'yellow', 'mint', 'lavender'],
    default: 'pink'
  }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
