const express = require('express');
const { getChats, getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/chats', protect, getChats);
router.get('/:chatId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;
