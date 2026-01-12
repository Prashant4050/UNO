const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  socketId: {
    type: String,
    required: true
  },
  hand: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  }
});

module.exports = mongoose.model('Player', playerSchema);