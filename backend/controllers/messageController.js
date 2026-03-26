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
    const { productId, sellerId, text, chatId: existingChatId, image_data } = req.body;

    let chatId = existingChatId;

    // If starting a new thread
    if (!chatId && productId && sellerId) {
      // Check if chat already exists
      let checkSql = 'SELECT id FROM chats WHERE product_id = $1 AND ((buyer_id = $2 AND seller_id = $3) OR (buyer_id = $3 AND seller_id = $2))';
      let checkParams = [productId, senderId, sellerId];
      if (dbType !== 'postgres') {
        checkSql = 'SELECT id FROM chats WHERE product_id = ? AND ((buyer_id = ? AND seller_id = ?) OR (buyer_id = ? AND seller_id = ?))';
        checkParams = [productId, senderId, sellerId, sellerId, senderId];
      }
      const existing = await query(checkSql, checkParams);

      if (existing.length > 0) {
        chatId = existing[0].id;
      } else {
        const productRows = await query('SELECT user_id FROM products WHERE id = $1', [productId]);
        const actualSellerId = productRows.length > 0 ? productRows[0].user_id : sellerId;
        const actualBuyerId = senderId === actualSellerId ? sellerId : senderId;

        let createChatSql = 'INSERT INTO chats (buyer_id, seller_id, product_id) VALUES ($1, $2, $3) RETURNING id';
        let createChatParams = [actualBuyerId, actualSellerId, productId];
        if (dbType !== 'postgres') {
          createChatSql = 'INSERT INTO chats (buyer_id, seller_id, product_id) VALUES (?, ?, ?)';
        }
        const newChat = await query(createChatSql, createChatParams);
        chatId = newChat.insertId || (newChat[0] ? newChat[0].id : null);
      }
    }

    if (!chatId) return res.status(400).json({ message: 'Missing chat context' });

    let imageUrl = null;
    
    // Handle base64 image data for messages
    if (image_data) {
      try {
        const fs = require('fs');
        const path = require('path');
        const crypto = require('crypto');
        
        let base64Data = image_data;
        let ext = 'jpg';
        
        if (image_data.startsWith('data:image')) {
          const matches = image_data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            ext = matches[1];
            base64Data = matches[2];
          }
        }
        
        if (ext === 'jpeg') ext = 'jpg';
        
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
        
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
        
        imageUrl = `/uploads/${fileName}`;
      } catch (uploadError) {
        console.error('Error saving message image:', uploadError);
      }
    }

    // Insert message with optional image_url
    let sql = 'INSERT INTO messages (chat_id, sender_id, text, image_url) VALUES ($1, $2, $3, $4) RETURNING *';
    let params = [chatId, senderId, text || null, imageUrl];
    if (dbType !== 'postgres') {
      sql = 'INSERT INTO messages (chat_id, sender_id, text, image_url) VALUES (?, ?, ?, ?)';
    }

    const message = await query(sql, params);
    res.status(201).json(message[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
