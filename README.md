# CampusKart 🛒

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React Native](https://img.shields.io/badge/React_Native-Expo-02569B?logo=react)
![NodeJS](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![Database](https://img.shields.io/badge/Database-MySQL%20%2F%20Postgres-00758F)

## 2. Project Description
CampusKart is an exclusive, safe, and dynamic university-based student marketplace. Designed to solve the issue of expensive textbooks and dorm essentials, the app allows verified students to seamlessly buy, sell, and bid on second-hand campus items locally, bypassing the noise and risks of public marketplaces.

## 3. Features
- **Exclusive Access:** JWT authentication paired with university-specific email check (`@vcet.edu.in`).
- **Product Marketplace:** View, search, and list products securely with fully integrated Cloud/ImageKit image hosting.
- **Real-Time Notifications & Bidding:** Buyers can place bids on active products, triggering notifications directly to seller dashboards.
- **Integrated Chat System:** Secure peer-to-peer messaging system linked to specific items, facilitating safe price negotiations.
- **Seller Dashboard:** Robust panel for students to manage their active listings, profile information, and track successfully sold items.

## 4. Tech Stack

### Frontend
- **Framework:** React Native (managed by Expo)
- **Navigation:** React Navigation (Native Stack & Bottom Tabs)
- **State/Requests:** Axios, React Hooks, Async Storage
- **Media:** Expo Image Picker

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Security:** bcrypt (Password Hashing), jsonwebtoken (JWT)
- **Storage:** ImageKit SDK for Media

### Database
- **Primary Database:** Dual-support for PostgreSQL (`pg`) and MySQL (`mysql2`)
- **Query Method:** Native parameterised SQL queries

### Tools / Libraries
- Cross-Origin Resource Sharing (`cors`)
- Environment management (`dotenv`)

## 5. UI / UX Screenshots & Pages

<p align="center">
  <img src="assets/screenshots/Screenshot%202026-03-29%20203010.png" width="200" />
  <img src="assets/screenshots/Screenshot%202026-03-29%20203044.png" width="200" />
  <img src="assets/screenshots/Screenshot%202026-03-29%20203100.png" width="200" />
  <img src="assets/screenshots/Screenshot%202026-03-29%20203326.png" width="200" />
  <img src="assets/screenshots/Screenshot%202026-03-29%20203340.png" width="200" />
  <img src="assets/screenshots/Screenshot%202026-03-29%20203349.png" width="200" />
  <img src="assets/screenshots/Screenshot%202026-03-29%20203438.png" width="200" />
  <img src="assets/screenshots/Screenshot%202026-03-29%20203450.png" width="200" />
  <img src="assets/screenshots/Screenshot%202026-03-29%20203458.png" width="200" />
  <img src="assets/screenshots/Screenshot%202026-03-29%20203506.png" width="200" />
  <img src="assets/screenshots/Screenshot%202026-03-29%20203518.png" width="200" />
  <img src="assets/screenshots/Screenshot%202026-03-29%20203531.png" width="200" />
  <img src="assets/screenshots/Screenshot%202026-03-29%20203605.png" width="200" />
</p>

### Pages Overview
- **Home** – The main discovery feed featuring newly listed electronics, books, and campus essentials.
- **Login / Signup** – Gatekeeping screens handling JWT authentication and university verification.
- **Profile / Dashboard** – A user hub to track metrics like active listings, items sold, and manage account details.
- **Sell Item (Add Product)** – Form screen accepting product details, base64 image encoding, and price metadata.
- **Listings Screen** – Allows sellers to manage their own products (mark as SOLD, delete, or edit).
- **Product Detail** – Comprehensive display of the product, including seller badge, description, and dynamic bidding UI.
- **Chat / Messages** – Dedicated inbox rendering ongoing secure negotiations and real-time message sending.

## 6. Project Structure
```text
project-root
 ┣ backend
 ┃ ┣ config
 ┃ ┣ controllers
 ┃ ┣ middleware
 ┃ ┣ models
 ┃ ┣ routes
 ┃ ┣ utils
 ┃ ┣ initDb.js
 ┃ ┣ server.js
 ┃ ┗ package.json
 ┣ src
 ┃ ┣ components
 ┃ ┣ screens
 ┃ ┣ services
 ┃ ┗ utils
 ┣ scripts
 ┣ assets
 ┣ App.js
 ┣ app.json
 ┣ package.json
 ┗ README.md
```

## 7. Installation Guide

**Step 1: Clone the repository**  
```bash
git clone https://github.com/yourusername/campuskart.git
cd campuskart
```

**Step 2: Install dependencies**  
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

**Step 3: Setup environment variables**  
For the backend, copy `.env.example` into a `.env` file within the `backend/` directory:
```bash
cp .env.example .env
```
Fill out the variables as described in the Environment Variables section.

**Step 4: Setup database**  
Assuming you are running a local MySQL or Postgres server, initialize the tables by strictly running:
```bash
node initDb.js
```
*(Optionally populate sample items utilizing `node seedData.js`)*

**Step 5: Run backend**  
```bash
npm run dev
# Server runs gracefully at http://localhost:5000 
```

**Step 6: Run frontend**  
Open a new terminal session in the project root path.
```bash
npm start
```
Use the Expo Go app on iOS/Android or the 'w' key to open in a web browser.

## 8. Environment Variables

Your `backend/.env` file requires the following structure:
```env
# Server
PORT=5000

# Database Type: 'mysql' or 'postgres'
DB_TYPE=mysql

# Database Connection
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=campuskart

# JWT Auth
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

## 9. Database Setup
Ensure that your relational SQL server is active.
1. Create a blank database called `campuskart`:
   ```sql
   CREATE DATABASE campuskart;
   ```
2. Verify that the `.env` credentials match the server.
3. Automatically execute structure schemas from the backend root:
   ```bash
   node initDb.js
   ```

## 10. API Endpoints

### Authentication
- `POST /api/auth/register` – Register account and receive JWT
- `POST /api/auth/login` – Login to existing account

### Products
- `GET /api/products` – Get all available products
- `GET /api/products/:id` – Fetch product by ID
- `POST /api/products` – Add a new student listing
- `PUT /api/products/:id` – Edit listing definition
- `PATCH /api/products/:id/status` – Update state (Available -> Sold)
- `DELETE /api/products/:id` – Remove a product listing

### Bidding & Chat
- `GET /api/messages/chats` – Retrieve active inbox threads
- `GET /api/messages/:chatId` – Load chat message history
- `POST /api/messages` – Send message or initiate new chat thread
- `POST /api/bids` – Submit a direct bid on an active item
- `GET /api/bids/:productId` – Fetch total bids for a product

## 11. Future Improvements
- **Payment Gateway Integration:** Implement secure Stripe/RazorPay escrows to facilitate direct cashless purchases instead of solely cash-on-meet.
- **Real-Time Websockets:** Transition chat from HTTP polling to a true real-time Socket.io bi-directional connection.
- **Advanced Filtering/Search:** Implement elastic search for complex queries across descriptions, price bounds, and condition states.
- **Admin Panel:** Separate dashboard for campus moderators to manage bad actors or reported products.

## 12. Contributing
Contributions are warmly welcomed! 
1. Fork the repository.
2. Create your Feature Branch (`git checkout -b feature/NewMarketplaceTool`).
3. Commit your changes (`git commit -m 'Add NewMarketplaceTool'`).
4. Push to the Branch (`git push origin feature/NewMarketplaceTool`).
5. Open a logical Pull Request pointing to `main`.

## 13. License
This project is licensed under the MIT License - see the LICENSE file for details.
