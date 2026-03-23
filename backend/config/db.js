const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const dbType = 'postgres'; // Hardcode to postgres since we are using Neon

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test connection
pool.connect()
  .then((client) => {
    console.log('✅ Neon PostgreSQL connected successfully');
    client.release();
  })
  .catch((err) => {
    console.error('❌ Neon PostgreSQL connection error:', err.message);
  });

/**
 * Execute a database query
 * @param {string} sql - SQL query string (use $1, $2...)
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} - Query result rows
 */
const query = async (sql, params = []) => {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (err) {
    console.error('Database query error:', err.message);
    throw err;
  }
};

module.exports = { pool, query, dbType };