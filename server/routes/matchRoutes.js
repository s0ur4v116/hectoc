// server/routes/matchRoutes.js
const express = require('express');
const matchController = require('../controllers/matchController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/details/:matchId', matchController.getMatchDetails);
router.get('/user/:userId?', authenticate, matchController.getUserMatches);

module.exports = router;

