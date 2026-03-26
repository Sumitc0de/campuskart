const express = require('express');
const { createBid, getProductBids } = require('../controllers/bidController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createBid);
router.get('/product/:productId', getProductBids);

module.exports = router;
