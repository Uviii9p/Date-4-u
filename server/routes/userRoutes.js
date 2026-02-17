const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile, getDiscoveryUsers, searchUsers, getUserById } = require('../controllers/userController');
const { upload } = require('../utils/cloudinary');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.array('images', 6), updateProfile);
router.get('/discovery', protect, getDiscoveryUsers);
router.get('/search', protect, searchUsers);
router.get('/:id', protect, getUserById);

module.exports = router;
