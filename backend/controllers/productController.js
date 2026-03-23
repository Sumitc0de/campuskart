const { query, dbType } = require('../config/db');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res) => {
  try {
    let sql = 'SELECT p.*, u.name as seller_name, u.avatar as seller_avatar, u.university as seller_university FROM products p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC';
    const products = await query(sql);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    let sql = 'SELECT p.*, u.name as seller_name, u.avatar as seller_avatar, u.university as seller_university, u.rating as seller_rating, u.department as seller_department, u.student_year as seller_year FROM products p JOIN users u ON p.user_id = u.id WHERE p.id = $1';
    
    // Quick dbType check just in case MySQL is used later instead of Postgres
    const params = [productId];
    if (dbType !== 'postgres') {
      sql = sql.replace('$1', '?');
    }

    const products = await query(sql, params);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(products[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new product
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, price_type, category, condition, image_url, image_data } = req.body;
    const userId = req.user.id; // From authMiddleware

    if (!title || !price || !category) {
      return res.status(400).json({ message: 'Please provide title, price, and category' });
    }

    let finalImageUrl = image_url || null;
    
    // Handle base64 image data upload
    if (image_data) {
      try {
        const fs = require('fs');
        const path = require('path');
        const crypto = require('crypto');
        
        // Process data URI if present
        let base64Data = image_data;
        let ext = 'jpg';
        
        if (image_data.startsWith('data:image')) {
          const matches = image_data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            ext = matches[1];
            base64Data = matches[2];
          }
        }
        
        // E.g., jpeg -> jpg mapping
        if (ext === 'jpeg') ext = 'jpg';
        
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
        
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
        
        finalImageUrl = `/uploads/${fileName}`;
      } catch (uploadError) {
        console.error('Error saving uploaded image:', uploadError);
      }
    }

    let sql = 'INSERT INTO products (user_id, title, description, price, price_type, category, condition, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
    const params = [userId, title, description, price, price_type || 'fixed', category, condition, finalImageUrl];
    
    if (dbType !== 'postgres') {
      sql = 'INSERT INTO products (user_id, title, description, price, price_type, category, condition, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    }

    const result = await query(sql, params);
    
    // Update active_listings count for user
    let updateSql = 'UPDATE users SET active_listings = active_listings + 1 WHERE id = $1';
    if (dbType !== 'postgres') updateSql = updateSql.replace('$1', '?');
    await query(updateSql, [userId]);

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
