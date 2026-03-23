const { query, dbType } = require('../config/db');

const User = {
  /**
   * Find a user by email
   * @param {string} email
   * @returns {Promise<Object|null>} User object or null
   */
  findByEmail: async (email) => {
    let sql;
    if (dbType === 'postgres') {
      sql = 'SELECT * FROM users WHERE email = $1';
    } else {
      sql = 'SELECT * FROM users WHERE email = ?';
    }
    const rows = await query(sql, [email]);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Create a new user
   * @param {string} name
   * @param {string} email
   * @param {string} hashedPassword
   * @param {string} college
   * @returns {Promise<Object>} Created user info
   */
  create: async (name, email, hashedPassword, university, department, student_year, batch) => {
    let sql;
    if (dbType === 'postgres') {
      sql = `INSERT INTO users (name, email, password, university, department, student_year, batch)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, name, email, university, department, student_year, batch, is_verified, created_at`;
    } else {
      sql = `INSERT INTO users (name, email, password, university, department, student_year, batch)
             VALUES (?, ?, ?, ?, ?, ?, ?)`;
    }

    const result = await query(sql, [name, email, hashedPassword, university, department, student_year, batch]);

    if (dbType === 'postgres') {
      return result[0];
    } else {
      // For MySQL, we need to fetch the created user
      const user = await User.findByEmail(email);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        college: user.college,
        is_verified: user.is_verified,
        created_at: user.created_at,
      };
    }
  },

  /**
   * Find a user by ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  findById: async (id) => {
    let sql;
    if (dbType === 'postgres') {
      sql = 'SELECT id, name, email, college, is_verified, created_at FROM users WHERE id = $1';
    } else {
      sql = 'SELECT id, name, email, college, is_verified, created_at FROM users WHERE id = ?';
    }
    const rows = await query(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  },
};

module.exports = User;
