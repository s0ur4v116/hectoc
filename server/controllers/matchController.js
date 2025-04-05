// server/controllers/matchController.js
const Match = require('../models/Match');

// Get match details
exports.getMatchDetails = async (req, res) => {
  try {
    const matchId = req.params.matchId;
    
    const match = await Match.findById(matchId)
      .populate('players', 'username rating')
      .populate('winner', 'username');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user match history
exports.getUserMatches = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const matches = await Match.find({ 
      players: userId,
      status: 'completed'
    })
    .sort({ endTime: -1 })
    .skip(skip)
    .limit(limit)
    .populate('players', 'username rating')
    .populate('winner', 'username');
    
    const totalMatches = await Match.countDocuments({ 
      players: userId,
      status: 'completed'
    });
    
    res.json({
      matches,
      pagination: {
        total: totalMatches,
        page,
        pages: Math.ceil(totalMatches / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

