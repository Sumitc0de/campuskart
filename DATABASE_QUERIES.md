# CampusKart MySQL Query Documentation

## 1. Database Overview
The CampusKart database serves as the core data engine for a university-based marketplace. It securely stores student profiles, product listings, real-time chat messages, bidding systems, and marketplace notifications, ensuring a seamless buying and selling experience within the campus.

## 2. Tables Overview
Here is a complete list of tables in the database with their respective purposes:

- `users` – stores registered student profiles and authentication details
- `products` – stores items listed by students for sale or exchange
- `chats` – manages active conversation threads between buyers and sellers
- `messages` – stores individual chat messages within a specific thread
- `bids` – tracks offers made by buyers on specific products
- `notifications` – stores alerts sent to users regarding bids and messages
- `reviews` – (Optional/Legacy) ratings and feedback for sellers or products

## 3. Table Schema Examples

Below are the foundational schemas for the core tables (using MySQL `AUTO_INCREMENT` and standard types):

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  university VARCHAR(255) DEFAULT 'VCET',
  department VARCHAR(255),
  student_year VARCHAR(50),
  batch VARCHAR(50),
  pickup_location VARCHAR(255) DEFAULT 'Campus Main Library',
  avatar VARCHAR(500),
  active_listings INT DEFAULT 0,
  items_sold INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  price_type VARCHAR(50) DEFAULT 'fixed',
  category VARCHAR(100) NOT NULL,
  condition VARCHAR(100) DEFAULT 'Good',
  image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'AVAILABLE',
  pickup_location VARCHAR(255) DEFAULT 'Campus Main Library',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 4. Basic Queries

### Insert Data
Creating a new notification:
```sql
INSERT INTO notifications (user_id, type, title, message)
VALUES (2, 'WELCOME', 'Welcome to CampusKart', 'Get started by listing your first item!');
```

### Select Data
Fetching all available products:
```sql
SELECT * FROM products WHERE status = 'AVAILABLE';
```

### Update Data
Updating a user's avatar and department:
```sql
UPDATE users
SET avatar = 'https://imagekit.io/path/to/avatar.jpg', department = 'Computer Science'
WHERE id = 3;
```

### Delete Data
Deleting a product listing:
```sql
DELETE FROM products
WHERE id = 5 AND user_id = 3; 
```

## 5. Authentication Queries

Finding a user by email during login:
```sql
SELECT id, name, email, password, university, is_verified 
FROM users 
WHERE email = 'student@vcet.edu.in';
```

Registering a new user:
```sql
INSERT INTO users (name, email, password, university, pickup_location, is_verified)
VALUES ('Rahul Sharma', 'rahul@vcet.edu.in', 'hashed_password_string', 'VCET', 'Library', true);
```

## 6. Marketplace Queries

### Get all products (with seller info)
```sql
SELECT p.*, u.name as seller_name, u.avatar as seller_avatar, u.university as seller_university 
FROM products p 
JOIN users u ON p.user_id = u.id 
WHERE p.status = 'AVAILABLE' 
ORDER BY p.created_at DESC;
```

### Search products
Searching for books or specific item titles:
```sql
SELECT * FROM products
WHERE title LIKE '%Engineering Mathematics%' AND status = 'AVAILABLE';
```

### Products by user
Getting a specific student's active listings:
```sql
SELECT * FROM products
WHERE user_id = 1 AND status = 'AVAILABLE'
ORDER BY created_at DESC;
```

## 7. Chat System Queries

### Initiate or check for an existing chat thread
```sql
SELECT id FROM chats 
WHERE product_id = 12 
AND ((buyer_id = 4 AND seller_id = 1) OR (buyer_id = 1 AND seller_id = 4));
```

### Send a message
```sql
INSERT INTO messages (chat_id, sender_id, text, image_url) 
VALUES (24, 4, 'Is the price negotiable?', NULL);
```

### Fetch all messages in a chat thread
```sql
SELECT * FROM messages
WHERE chat_id = 24
ORDER BY created_at ASC;
```

## 8. Reviews (and Bids) Queries

### Insert a Review/Rating (If implemented)
```sql
INSERT INTO reviews (user_id, product_id, rating, comment)
VALUES (1, 5, 5, 'Great condition, highly recommended seller!');
```

### Insert a Bid (CampusKart uses Bids)
```sql
INSERT INTO bids (product_id, buyer_id, amount) 
VALUES (12, 4, 350.00);
```

## 9. Advanced Queries

### Top sellers in the marketplace
```sql
SELECT user_id, COUNT(*) as total_sales
FROM products
WHERE status = 'SOLD'
GROUP BY user_id
ORDER BY total_sales DESC
LIMIT 10;
```

### Most active chats with recent message preview
```sql
SELECT c.id, c.product_id, p.title,
  (SELECT text FROM messages m WHERE m.chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
  (SELECT created_at FROM messages m WHERE m.chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
FROM chats c
JOIN products p ON c.product_id = p.id
WHERE c.buyer_id = 4 OR c.seller_id = 4
ORDER BY last_message_time DESC;
```

## 10. Optimization Tips

1. **Indexing:** Add an index on `products(category)` and `products(status)` since a lot of search queries filter by these fields. Add an index on `messages(chat_id)` for faster chat loading.
   ```sql
   CREATE INDEX idx_products_status ON products(status);
   CREATE INDEX idx_messages_chat_id ON messages(chat_id);
   ```
2. **Pagination:** Instead of fetching all products, use `LIMIT` and `OFFSET` to paginate the main feed.
   ```sql
   SELECT * FROM products ORDER BY created_at DESC LIMIT 20 OFFSET 0;
   ```
3. **Avoid N+1 Queries:** When fetching chats, leverage `JOIN`s to get user names and product titles instead of making separate queries per chat.
4. **Use Connection Pooling:** Keep database connection overhead low by maintaining a pool of connections instead of opening/closing on every request.

## 11. Example Sample Data

You can run these queries to populate a clean database for testing:

```sql
-- 1. Insert a Test User
INSERT INTO users (id, name, email, password, university, is_verified) 
VALUES (1, 'Alice Smith', 'alice@vcet.edu.in', 'hashed_pw_here', 'VCET', true);

INSERT INTO users (id, name, email, password, university, is_verified) 
VALUES (2, 'Bob Jones', 'bob@vcet.edu.in', 'hashed_pw_here', 'VCET', true);

-- 2. Insert a Test Product
INSERT INTO products (id, user_id, title, description, price, category, condition)
VALUES (1, 1, 'Scientific Calculator CASIO FX-991EX', 'Used for 1 semester, perfectly working.', 850.00, 'Electronics', 'Like New');

-- 3. Insert a Mock Bid
INSERT INTO bids (product_id, buyer_id, amount)
VALUES (1, 2, 700.00);

-- 4. Initiate a Chat and Insert a Message
INSERT INTO chats (id, buyer_id, seller_id, product_id)
VALUES (1, 2, 1, 1);

INSERT INTO messages (chat_id, sender_id, text)
VALUES (1, 2, 'Hi Alice, would you accept 700 for the calculator?');
```
