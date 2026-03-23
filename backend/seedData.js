const { query } = require('./config/db');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    console.log('🌱 Starting Seeding Process...');

    // Cleanup existing seed data to avoid duplicates on rerun
    console.log('🧹 Cleaning up existing seed data...');
    await query("DELETE FROM users WHERE email LIKE '%@vcet.edu'");
    console.log('✅ Cleanup complete.');

    const saltRounds = 10;
    const defaultPassword = await bcrypt.hash('password123', saltRounds);

    const users = [
      { name: 'Rahul Sharma', email: 'rahul@vcet.edu', gender: 'male', dept: 'Computer Science', year: '3rd Year', avatar: 'https://i.pravatar.cc/150?u=rahul' },
      { name: 'Ananya Iyer', email: 'ananya@vcet.edu', gender: 'female', dept: 'Information Technology', year: '1st Year', avatar: 'https://i.pravatar.cc/150?u=ananya' },
      { name: 'Siddharth Malhotra', email: 'sid@vcet.edu', gender: 'male', dept: 'EXTC', year: '3rd Year', avatar: 'https://i.pravatar.cc/150?u=sid' },
      { name: 'Priya Deshmukh', email: 'priya@vcet.edu', gender: 'female', dept: 'Mechanical Engineering', year: '1st Year', avatar: 'https://i.pravatar.cc/150?u=priya' },
      { name: 'Arjun Das', email: 'arjun@vcet.edu', gender: 'male', dept: 'Civil Engineering', year: '3rd Year', avatar: 'https://i.pravatar.cc/150?u=arjun' },
      { name: 'Sneha Patil', email: 'sneha@vcet.edu', gender: 'female', dept: 'Computer Science', year: '1st Year', avatar: 'https://i.pravatar.cc/150?u=sneha' },
      { name: 'Vikram Singh', email: 'vikram@vcet.edu', gender: 'male', dept: 'Information Technology', year: '3rd Year', avatar: 'https://i.pravatar.cc/150?u=vikram' },
      { name: 'Isha Gupta', email: 'isha@vcet.edu', gender: 'female', dept: 'EXTC', year: '1st Year', avatar: 'https://i.pravatar.cc/150?u=isha' },
      { name: 'Karan Mehra', email: 'karan@vcet.edu', gender: 'male', dept: 'Mechanical Engineering', year: '3rd Year', avatar: 'https://i.pravatar.cc/150?u=karan' },
      { name: 'Tanvi Joshi', email: 'tanvi@vcet.edu', gender: 'female', dept: 'Computer Science', year: '3rd Year', avatar: 'https://i.pravatar.cc/150?u=tanvi' },
    ];

    const insertedUsers = [];

    for (const u of users) {
      const sql = `
        INSERT INTO users (name, email, password, avatar, university, department, student_year)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name
      `;
      const res = await query(sql, [u.name, u.email, defaultPassword, u.avatar, 'VCET', u.dept, u.year]);
      insertedUsers.push(res[0]);
      console.log(`✅ User created: ${u.name}`);
    }

    const products = [
      { user_id: insertedUsers[0].id, title: 'Engineering Physics Textbook', price: 250, cat: 'Books', cond: 'Like New', loc: 'VCET Library Lobby' },
      { user_id: insertedUsers[0].id, title: 'USB-C Hub 7-in-1', price: 1200, cat: 'Electronics', cond: 'Good', loc: 'Hostel A Gate' },
      
      { user_id: insertedUsers[1].id, title: 'Scientific Calculator Casio', price: 800, cat: 'Electronics', cond: 'Brand New', loc: 'VCET Canteen' },
      
      { user_id: insertedUsers[2].id, title: 'Calculus Made Easy', price: 150, cat: 'Books', cond: 'Fair', loc: 'Main Gate' },
      { user_id: insertedUsers[2].id, title: 'Dell Wireless Mouse', price: 500, cat: 'Electronics', cond: 'Good', loc: 'EXTC Dept Lab' },
      
      { user_id: insertedUsers[3].id, title: 'Lab Coat (Large)', price: 300, cat: 'Others', cond: 'Used', loc: 'Mechanical Workshop' },
      
      { user_id: insertedUsers[4].id, title: 'Drafter set with board', price: 1500, cat: 'Others', cond: 'Good', loc: 'Civil Dept Office' },
      { user_id: insertedUsers[4].id, title: 'Blue Study Lamp', price: 400, cat: 'Hostel', cond: 'Good', loc: 'Hostel B, Room 204' },
      
      { user_id: insertedUsers[5].id, title: 'Java Programming Guide', price: 350, cat: 'Books', cond: 'Like New', loc: 'Library' },
      
      { user_id: insertedUsers[6].id, title: 'TP-Link Router', price: 900, cat: 'Electronics', cond: 'Working', loc: 'IT Dept Corridor' },
      { user_id: insertedUsers[6].id, title: 'Whiteboard Marker Set', price: 100, cat: 'Others', cond: 'New', loc: 'VCET Stationery' },
      
      { user_id: insertedUsers[7].id, title: 'Digital Multimeter', price: 550, cat: 'Electronics', cond: 'Good', loc: 'Electronics Lab 1' },
      
      { user_id: insertedUsers[8].id, title: 'Protractor & Scales', price: 80, cat: 'Others', cond: 'Used', loc: 'Canteen' },
      { user_id: insertedUsers[8].id, title: 'Hydraulic Press Kit', price: 500, cat: 'Others', cond: 'Miniature model', loc: 'Main Office' },
      
      { user_id: insertedUsers[9].id, title: 'Smart Watch Series 3', price: 4500, cat: 'Electronics', cond: 'Excellent', loc: 'VCET Ground' },
    ];

    for (const p of products) {
      const sql = `
        INSERT INTO products (user_id, title, price, category, condition, pickup_location, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await query(sql, [p.user_id, p.title, p.price, p.cat, p.cond, p.loc, 'AVAILABLE']);
      
      // Update user active listings count
      const updateSql = 'UPDATE users SET active_listings = active_listings + 1 WHERE id = $1';
      await query(updateSql, [p.user_id]);
      
      console.log(`✅ Product created: ${p.title}`);
    }

    console.log('🎉 Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
  }
}

seed();
