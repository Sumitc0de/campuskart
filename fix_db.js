const { pool } = require('./backend/config/db');

(async () => {
  try {
    console.log("Checking and fixing database schema...");
    
    // 1. Add image_url to chats if missing (was done for products/users, check messages)
    await pool.query(`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
    `);
    console.log("✅ Verified image_url column on messages");

    // 2. Make text column nullable (to allow image-only messages)
    await pool.query(`
      ALTER TABLE messages 
      ALTER COLUMN text DROP NOT NULL;
    `);
    console.log("✅ Made text column optional for image messages");

    // Print columns for verification
    const res = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'messages'");
    console.log("Current columns:", res.rows);

  } catch (error) {
    console.error("Database schema fix failed:", error);
  } finally {
    pool.end();
  }
})();
