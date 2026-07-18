const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  city: {
    type: String
  },
  affiliatingUniversity: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('College', CollegeSchema);
