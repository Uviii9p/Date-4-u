const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getChats, getMessages, sendMessage, sendMedia, deleteMessage, upload } = require('../controllers/chatController');

router.get('/', protect, getChats);
router.get('/:userId', protect, getMessages);
router.post('/send', protect, sendMessage);
router.post('/send-media', protect, upload.single('media'), sendMedia);
router.delete('/:chatId/message/:messageId', protect, deleteMessage);

module.exports = router;
