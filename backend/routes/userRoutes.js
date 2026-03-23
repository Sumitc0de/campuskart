const express = require('express');
const { getUserProfile, updateUserProfile, getMyProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getMyProfile);
router.get('/:id', getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
