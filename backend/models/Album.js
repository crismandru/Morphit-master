const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverPhoto: {
    type: String,
    default: null
  },
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poza'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Album', albumSchema); 