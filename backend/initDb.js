const { pool, dbType } = require('./config/db');

async function createTables() {
  if (dbType !== 'postgres') {
    console.error('This initialization script is strictly for PostgreSQL.');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    console.log('Starting Database Initialization...');
    
    // 1. Create Users Table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created/verified');

    // 2. Alter Users Table to add profile columns (for safety/backward compat)
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS avatar VARCHAR(500),
      ADD COLUMN IF NOT EXISTS university VARCHAR(255) DEFAULT 'VCET',
      ADD COLUMN IF NOT EXISTS graduation_year INT DEFAULT 2025,
      ADD COLUMN IF NOT EXISTS active_listings INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS items_sold INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 5.0,
      ADD COLUMN IF NOT EXISTS department VARCHAR(255),
      ADD COLUMN IF NOT EXISTS student_year VARCHAR(50),
      ADD COLUMN IF NOT EXISTS batch VARCHAR(50),
      ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(255) DEFAULT 'Campus Main Library';
    `);
    console.log('✅ Users table profile fields verified');

    // 3. Create Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        price_type VARCHAR(50) DEFAULT 'fixed',
        category VARCHAR(100) NOT NULL,
        condition VARCHAR(100) DEFAULT 'Good',
        image_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'AVAILABLE',
        pickup_location VARCHAR(255) DEFAULT 'Campus Main Library',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Ensure pickup_location exists
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(255) DEFAULT 'Campus Main Library';
    `);
    console.log('✅ Products table created/verified');

    // 4. Create Chats Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        buyer_id INT REFERENCES users(id) ON DELETE CASCADE,
        seller_id INT REFERENCES users(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(buyer_id, seller_id, product_id)
      );
    `);
    console.log('✅ Chats table created');

    // 5. Create Messages Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id INT REFERENCES chats(id) ON DELETE CASCADE,
        sender_id INT REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Messages table created');

    // 6. Create Bids Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        buyer_id INT REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Bids table created');

    // 7. Create Notifications Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Notifications table created');

    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    client.release();
    process.exit();
  }
}

createTables();
