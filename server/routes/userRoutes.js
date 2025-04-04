// server/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/profile/:userId?', authenticate, userController.getUserProfile);
router.get('/leaderboard', userController.getLeaderboard);

module.exports = router;

