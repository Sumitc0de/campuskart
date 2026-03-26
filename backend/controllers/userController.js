const { query, dbType } = require('../config/db');

// @desc    Get user profile (by ID)
// @route   GET /api/users/:id
exports.getUserProfile = async (req, res) => {
  try {
    let sql = `
      SELECT id, name, email, avatar, university, department, student_year, batch, graduation_year, pickup_location, active_listings, items_sold, created_at 
      FROM users WHERE id = $1
    `;
    let params = [req.params.id];
    
    if (dbType !== 'postgres') {
      sql = sql.replace('$1', '?');
    }

    const users = await query(sql, params);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's products
    let prodSql = 'SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC';
    if (dbType !== 'postgres') prodSql = prodSql.replace('$1', '?');
    
    const products = await query(prodSql, params);

    res.json({
      profile: users[0],
      listings: products
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update my profile
// @route   PUT /api/users/profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, avatar, university, department, student_year, batch, pickup_location, avatar_data } = req.body;

    let finalAvatarUrl = avatar;

    // Handle base64 avatar upload
    if (avatar_data && avatar_data.startsWith('data:image')) {
      try {
        const fs = require('fs');
        const path = require('path');
        const crypto = require('crypto');
        
        const matches = avatar_data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const base64Data = matches[2];
          const fileName = `avatar_${crypto.randomUUID()}.${ext}`;
          const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
          
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const filePath = path.join(uploadsDir, fileName);
          fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
          finalAvatarUrl = `/uploads/${fileName}`;
        }
      } catch (uploadError) {
        console.error('Error saving profile avatar:', uploadError);
      }
    }

    let sql = `
      UPDATE users 
      SET 
        name = COALESCE($1, name), 
        avatar = COALESCE($2, avatar), 
        university = COALESCE($3, university), 
        department = COALESCE($4, department),
        student_year = COALESCE($5, student_year),
        batch = COALESCE($6, batch),
        pickup_location = COALESCE($7, pickup_location)
      WHERE id = $8 
      RETURNING id, name, email, avatar, university, department, student_year, batch, graduation_year, pickup_location, active_listings, items_sold
    `;
    let params = [name, finalAvatarUrl, university, department, student_year, batch, pickup_location, userId];

    if (dbType !== 'postgres') {
      sql = `
        UPDATE users SET 
          name = ?, avatar = ?, university = ?, department = ?, student_year = ?, batch = ?, pickup_location = ? 
        WHERE id = ?
      `;
    }

    const updatedUser = await query(sql, params);
    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/users/profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    let sql = `
      SELECT id, name, email, avatar, university, department, student_year, batch, graduation_year, pickup_location, active_listings, items_sold, created_at 
      FROM users WHERE id = $1
    `;
    let params = [userId];
    
    if (dbType !== 'postgres') {
      sql = sql.replace('$1', '?');
    }

    const users = await query(sql, params);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    let prodSql = 'SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC';
    if (dbType !== 'postgres') prodSql = prodSql.replace('$1', '?');
    
    const products = await query(prodSql, params);

    res.json({
      profile: users[0],
      listings: products
    });
  } catch (error) {
    console.error('Error fetching my profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
