const { pool } = require('./config/db');

async function resetDb() {
  const client = await pool.connect();
  try {
    console.log('🚮 Starting Database Reset (Dropping all tables)...');
    
    // Drop tables in reverse order of dependency
    await client.query('DROP TABLE IF EXISTS notifications CASCADE;');
    await client.query('DROP TABLE IF EXISTS messages CASCADE;');
    await client.query('DROP TABLE IF EXISTS bids CASCADE;');
    await client.query('DROP TABLE IF EXISTS chats CASCADE;');
    await client.query('DROP TABLE IF EXISTS products CASCADE;');
    await client.query('DROP TABLE IF EXISTS users CASCADE;');
    
    console.log('✅ All tables dropped successfully!');
    
    // Now call the initialization logic from initDb.js or just run the create script again
    console.log('🏗️ Recreating tables...');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    client.release();
    // We will run initDb.js after this
  }
}

resetDb();
