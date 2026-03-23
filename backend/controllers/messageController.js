const { query, dbType } = require('../config/db');

// @desc    Get all active chats for user
// @route   GET /api/messages/chats
exports.getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    let sql = `
      SELECT c.*, 
        p.title as product_title, p.image_url as product_image,
        u_other.name as other_user_name, u_other.avatar as other_user_avatar,
        (SELECT text FROM messages m WHERE m.chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages m WHERE m.chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM chats c
      JOIN products p ON c.product_id = p.id
      JOIN users u_other ON (c.buyer_id = u_other.id OR c.seller_id = u_other.id) AND u_other.id != $1
      WHERE c.buyer_id = $1 OR c.seller_id = $1
      ORDER BY last_message_time DESC NULLS LAST
    `;
    let params = [userId];

    if (dbType !== 'postgres') {
      sql = sql.replace(/\$1/g, '?');
    }

    const chats = await query(sql, params);
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get messages for a specific chat
// @route   GET /api/messages/:chatId
exports.getMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    let sql = 'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC';
    let params = [chatId];

    if (dbType !== 'postgres') sql = sql.replace('$1', '?');

    const messages = await query(sql, params);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Initiate chat or send message
// @route   POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { productId, sellerId, text, chatId: existingChatId } = req.body;

    let chatId = existingChatId;

    // If starting a new thread from "Ask for best price"
    if (!chatId && productId && sellerId) {
      if (senderId == sellerId) {
        return res.status(400).json({ message: 'You cannot message yourself' });
      }

      // Check if chat already exists
      let checkSql = 'SELECT id FROM chats WHERE buyer_id = $1 AND product_id = $2';
      let checkParams = [senderId, productId];
      if (dbType !== 'postgres') {
        checkSql = checkSql.replace('$1', '?').replace('$2', '?');
      }
      const existing = await query(checkSql, checkParams);

      if (existing.length > 0) {
        chatId = existing[0].id;
      } else {
        // Create new chat
        let createChatSql = 'INSERT INTO chats (buyer_id, seller_id, product_id) VALUES ($1, $2, $3) RETURNING id';
        let createChatParams = [senderId, sellerId, productId];
        if (dbType !== 'postgres') {
          createChatSql = 'INSERT INTO chats (buyer_id, seller_id, product_id) VALUES (?, ?, ?)';
        }
        const newChat = await query(createChatSql, createChatParams);
        chatId = newChat[0].id;
      }
    }

    if (!chatId) return res.status(400).json({ message: 'Missing chat context' });

    // Insert message
    let sql = 'INSERT INTO messages (chat_id, sender_id, text) VALUES ($1, $2, $3) RETURNING *';
    let params = [chatId, senderId, text];
    if (dbType !== 'postgres') {
      sql = 'INSERT INTO messages (chat_id, sender_id, text) VALUES (?, ?, ?)';
    }

    const message = await query(sql, params);
    res.status(201).json(message[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
