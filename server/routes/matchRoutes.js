const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { swipeUser, getMatches } = require('../controllers/matchController');

router.post('/swipe', protect, swipeUser);
router.get('/', protect, getMatches);

module.exports = router;
