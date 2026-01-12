const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  color: {
    type: String,
    enum: ['red', 'blue', 'yellow', 'green', 'wild'],
    required: true
  },
  value: {
    type: String,
    enum: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2', 'wild', 'wild4'],
    required: true
  },
  type: {
    type: String,
    enum: ['number', 'action', 'wild'],
    required: true
  }
});

module.exports = mongoose.model('Card', cardSchema);