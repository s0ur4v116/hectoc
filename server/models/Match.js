// server/models/Match.js
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  puzzles: [{
    digits: String,
    solution: String,
    timeToSolve: Number
  }],
  playerResults: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: Number,
    puzzlesSolved: Number,
    averageTime: Number
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);

