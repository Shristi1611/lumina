const mongoose = require('mongoose');

const pomodoroSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShelfItem',
    default: null
  },
  bookTitle: { type: String, default: '' },
  type: {
    type: String,
    enum: ['work', 'short-break', 'long-break'],
    default: 'work'
  },
  duration: {
    type: Number,  // in minutes
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const pomodoroSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  workDuration: { type: Number, default: 25 },
  shortBreakDuration: { type: Number, default: 5 },
  longBreakDuration: { type: Number, default: 15 },
  sessionsBeforeLongBreak: { type: Number, default: 4 },
  autoStartBreaks: { type: Boolean, default: false },
  soundEnabled: { type: Boolean, default: true }
}, { timestamps: true });

const PomodoroSession = mongoose.model('PomodoroSession', pomodoroSessionSchema);
const PomodoroSettings = mongoose.model('PomodoroSettings', pomodoroSettingsSchema);

module.exports = { PomodoroSession, PomodoroSettings };
