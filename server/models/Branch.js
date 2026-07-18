const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Branch', BranchSchema);
