const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  bunnyVideoId: {
    type: String,
    required: true
  },
  durationMinutes: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Video', VideoSchema);
