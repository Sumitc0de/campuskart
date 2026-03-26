const { query } = require('../config/db');

// Place a new bid
exports.createBid = async (req, res) => {
  const { productId, amount } = req.body;
  const buyerId = req.user.id;

  try {
    // 1. Save the bid
    const bidRows = await query(
      'INSERT INTO bids (product_id, buyer_id, amount) VALUES ($1, $2, $3) RETURNING *',
      [productId, buyerId, amount]
    );
    const newBid = bidRows[0];

    // 2. Get product details to find the seller
    const productRows = await query(
      'SELECT title, user_id FROM products WHERE id = $1',
      [productId]
    );
    const product = productRows[0];

    if (product) {
      // 3. Create a notification for the seller
      await query(
        `INSERT INTO notifications (user_id, type, title, message, data) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          product.user_id,
          'BID_RECEIVED',
          'New Bid Received!',
          `Someone placed a bid of ₹${amount} on your item: ${product.title}`,
          JSON.stringify({ productId, bidId: newBid.id, buyerId })
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      bid: newBid
    });
  } catch (error) {
    console.error('Error creating bid:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all bids for a product
exports.getProductBids = async (req, res) => {
  const { productId } = req.params;
  try {
    const rows = await query(
      `SELECT b.*, u.name as buyer_name 
       FROM bids b 
       JOIN users u ON b.buyer_id = u.id 
       WHERE b.product_id = $1 
       ORDER BY b.amount DESC`,
      [productId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching product bids:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
