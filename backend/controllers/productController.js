const { query, dbType } = require('../config/db');
const imagekit = require('../utils/imagekit');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res) => {
  try {
    let sql = `
      SELECT p.*, u.name as seller_name, u.avatar as seller_avatar, u.university as seller_university 
      FROM products p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.status = 'AVAILABLE' 
      ORDER BY p.created_at DESC
    `;
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
    let sql = 'SELECT p.*, u.name as seller_name, u.avatar as seller_avatar, u.university as seller_university, u.department as seller_department, u.student_year as seller_year FROM products p JOIN users u ON p.user_id = u.id WHERE p.id = $1';
    
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
    const { title, description, price, price_type, category, condition, image_url, image_data, pickup_location } = req.body;
    const userId = req.user.id; // From authMiddleware

    if (!title || !price || !category) {
      return res.status(400).json({ message: 'Please provide title, price, and category' });
    }

    let finalImageUrl = image_url || null;
    
    // Handle base64 image data upload
    if (image_data) {
      try {
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
        
        const uploadResponse = await imagekit.upload({
          file: base64Data, // required
          fileName: fileName, // required
          useUniqueFileName: false, // We are already providing UUID
          folder: "/products" // Optional: organize in a folder
        });
        
        finalImageUrl = uploadResponse.url;
      } catch (uploadError) {
        console.error('Error uploading image to ImageKit:', uploadError);
      }
    }

    let sql = 'INSERT INTO products (user_id, title, description, price, price_type, category, condition, image_url, pickup_location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
    const params = [userId, title, description, price, price_type || 'fixed', category, condition, finalImageUrl, pickup_location];
    
    if (dbType !== 'postgres') {
      sql = 'INSERT INTO products (user_id, title, description, price, price_type, category, condition, image_url, pickup_location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
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

// @desc    Update product status (Mark as Sold/Available)
// @route   PATCH /api/products/:id/status
exports.updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    if (!['AVAILABLE', 'SOLD'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Check ownership first
    let checkSql = 'SELECT * FROM products WHERE id = $1 AND user_id = $2';
    if (dbType !== 'postgres') checkSql = checkSql.replace('$1', '?').replace('$2', '?');
    const products = await query(checkSql, [productId, userId]);

    if (products.length === 0) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const oldStatus = products[0].status;

    let updateSql = 'UPDATE products SET status = $1 WHERE id = $2 RETURNING *';
    if (dbType !== 'postgres') updateSql = 'UPDATE products SET status = ? WHERE id = ?';
    const result = await query(updateSql, [status, productId]);

    // Update items_sold count if status changed to SOLD
    if (oldStatus !== 'SOLD' && status === 'SOLD') {
      let userUpdateSql = 'UPDATE users SET items_sold = items_sold + 1, active_listings = GREATEST(0, active_listings - 1) WHERE id = $1';
      if (dbType !== 'postgres') userUpdateSql = userUpdateSql.replace('$1', '?');
      await query(userUpdateSql, [userId]);
    } else if (oldStatus === 'SOLD' && status === 'AVAILABLE') {
      let userUpdateSql = 'UPDATE users SET items_sold = GREATEST(0, items_sold - 1), active_listings = active_listings + 1 WHERE id = $1';
      if (dbType !== 'postgres') userUpdateSql = userUpdateSql.replace('$1', '?');
      await query(userUpdateSql, [userId]);
    }

    res.json(result[0] || { success: true, status });
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    // Check ownership
    let checkSql = 'SELECT status FROM products WHERE id = $1 AND user_id = $2';
    if (dbType !== 'postgres') checkSql = checkSql.replace('$1', '?').replace('$2', '?');
    const products = await query(checkSql, [productId, userId]);

    if (products.length === 0) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    const status = products[0].status;

    let deleteSql = 'DELETE FROM products WHERE id = $1';
    if (dbType !== 'postgres') deleteSql = deleteSql.replace('$1', '?');
    await query(deleteSql, [productId]);

    // Update active_listings count if the product was available
    if (status === 'AVAILABLE') {
      let userUpdateSql = 'UPDATE users SET active_listings = GREATEST(0, active_listings - 1) WHERE id = $1';
      if (dbType !== 'postgres') userUpdateSql = userUpdateSql.replace('$1', '?');
      await query(userUpdateSql, [userId]);
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update product details
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    const { title, description, price, price_type, category, condition, image_url, image_data, pickup_location } = req.body;

    // Check ownership
    let checkSql = 'SELECT * FROM products WHERE id = $1 AND user_id = $2';
    if (dbType !== 'postgres') checkSql = checkSql.replace('$1', '?').replace('$2', '?');
    const products = await query(checkSql, [productId, userId]);

    if (products.length === 0) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    let finalImageUrl = image_url || products[0].image_url;
    
    // Handle new image upload
    if (image_data && image_data.startsWith('data:image')) {
      try {
        const crypto = require('crypto');
        
        const matches = image_data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const base64Data = matches[2];
          const fileName = `${crypto.randomUUID()}.${ext}`;
          
          const uploadResponse = await imagekit.upload({
            file: base64Data, 
            fileName: fileName,
            useUniqueFileName: false,
            folder: "/products"
          });
          
          finalImageUrl = uploadResponse.url;
        }
      } catch (uploadError) {
        console.error('Error uploading updated image to ImageKit:', uploadError);
      }
    }

    let sql = `
      UPDATE products 
      SET 
        title = COALESCE($1, title), 
        description = COALESCE($2, description), 
        price = COALESCE($3, price), 
        price_type = COALESCE($4, price_type), 
        category = COALESCE($5, category), 
        condition = COALESCE($6, condition), 
        image_url = $7,
        pickup_location = COALESCE($8, pickup_location)
      WHERE id = $9 AND user_id = $10
      RETURNING *
    `;
    let params = [title, description, price, price_type, category, condition, finalImageUrl, pickup_location, productId, userId];

    if (dbType !== 'postgres') {
      sql = `
        UPDATE products SET 
          title = ?, description = ?, price = ?, price_type = ?, category = ?, condition = ?, image_url = ?, pickup_location = ?
        WHERE id = ? AND user_id = ?
      `;
    }

    const result = await query(sql, params);
    res.json(result[0] || { success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
