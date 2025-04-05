// server/controllers/userController.js
const User = require('../models/User');
const Match = require('../models/Match');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get recent matches
    const recentMatches = await Match.find({ 
      players: userId,
      status: 'completed'
    })
    .sort({ endTime: -1 })
    .limit(10)
    .populate('players', 'username rating')
    .populate('winner', 'username');
    
    res.json({
      user,
      recentMatches
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const topUsers = await User.find()
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit)
      .select('username rating matchesPlayed matchesWon');
    
    const totalUsers = await User.countDocuments();
    
    res.json({
      users: topUsers,
      pagination: {
        total: totalUsers,
        page,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

