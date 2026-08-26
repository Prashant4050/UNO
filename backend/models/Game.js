const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  deck: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  }],
  discardPile: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  }],
  currentPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  direction: {
    type: String,
    enum: ['clockwise', 'counterclockwise'],
    default: 'clockwise'
  },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  currentColor: {
    type: String,
    enum: ['red', 'blue', 'yellow', 'green']
  },
  roomCode: {
    type: String,
    unique: true,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', gameSchema);