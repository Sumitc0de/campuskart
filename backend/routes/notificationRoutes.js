const express = require('express');
const { getNotifications, markAsRead, clearAll } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.delete('/all', protect, clearAll);

module.exports = router;
