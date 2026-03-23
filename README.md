# 🛒 CampusKart — Student Marketplace

A Gen Z student marketplace mobile app with complete authentication system built using **React Native (Expo)**, **Node.js + Express**, and **MySQL / PostgreSQL**.

![UI Design](https://stitch.google.com/projects/4717860251787936130)

---

## 📦 Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | v18+ | [nodejs.org](https://nodejs.org/) |
| **npm** | v9+ | Comes with Node.js |
| **Expo CLI** | Latest | `npm install -g expo-cli` |
| **MySQL** | 8.0+ | [mysql.com](https://dev.mysql.com/downloads/) |
| **PostgreSQL** *(optional)* | 15+ | [postgresql.org](https://www.postgresql.org/download/) |
| **Android Studio** | Latest | [developer.android.com](https://developer.android.com/studio) |

---

## 🗄️ Database Setup

### Option A: MySQL (Recommended)

1. **Install MySQL** from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. **Open MySQL shell** and run:

```sql
-- Create the database
CREATE DATABASE campuskart;

-- Switch to the database
USE campuskart;

-- Create the users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  college VARCHAR(200),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. **Update** `backend/.env` with your MySQL credentials:
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campuskart
```

---

### Option B: PostgreSQL (Alternative)

1. **Install PostgreSQL** from [postgresql.org](https://www.postgresql.org/download/)
2. **Open psql shell** and run:

```sql
-- Create the database
CREATE DATABASE campuskart;

-- Connect to it
\c campuskart

-- Create the users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  college VARCHAR(200),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. **Update** `backend/.env`:
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=campuskart
```

---

## ⚙️ Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment template (if you haven't already)
cp .env.example .env

# Edit .env with your database credentials
# Then start the server
npm start
```

> The server will run on **http://localhost:5000**

### Backend Packages
| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mysql2` | MySQL driver |
| `pg` | PostgreSQL driver |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT auth tokens |
| `cors` | Cross-origin requests |
| `dotenv` | Environment variables |

---

## 🚀 Frontend Setup

```bash
# From the project root
cd Campuskart

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

---

## 🔗 Connect Frontend ↔ Backend

Update the `BASE_URL` in `src/services/api.js`:

```javascript
// For Android Emulator:
const BASE_URL = 'http://10.0.2.2:5000';

// For physical device (use your computer's IP):
const BASE_URL = 'http://192.168.1.XXX:5000';

// For iOS Simulator:
const BASE_URL = 'http://localhost:5000';
```

> 💡 Find your IP: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

---

## 📱 Run on Android Emulator

1. **Install Android Studio** → [Download](https://developer.android.com/studio)
2. Open **Virtual Device Manager** → Create a new device (e.g., Pixel 7)
3. Start the emulator
4. In your terminal:
```bash
npx expo start
# Press 'a' to open on Android
```

---

## 📲 Run on Real Device

1. Install **Expo Go** from Play Store / App Store
2. Start Expo: `npx expo start`
3. Scan the QR code with Expo Go
4. Make sure your phone and computer are on the **same Wi-Fi network**

---

## 🔌 API Endpoints

### `POST /api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "Rahul Kumar",
  "email": "rahul@college.edu",
  "password": "MySecurePass123",
  "college": "IIT Delhi"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully! 🎉",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Rahul Kumar",
    "email": "rahul@college.edu",
    "college": "IIT Delhi",
    "is_verified": false
  }
}
```

---

### `POST /api/auth/login`

Login with existing credentials.

**Request Body:**
```json
{
  "email": "rahul@college.edu",
  "password": "MySecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful! 🎉",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Rahul Kumar",
    "email": "rahul@college.edu",
    "college": "IIT Delhi",
    "is_verified": false
  }
}
```

---

## 📁 Project Structure

```
Campuskart/
├── App.js                          # App entry point
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js          # Login UI
│   │   └── SignupScreen.js         # Signup UI
│   ├── navigation/
│   │   └── AppNavigator.js         # React Navigation stack
│   └── services/
│       └── api.js                  # Axios API layer
├── backend/
│   ├── server.js                   # Express server
│   ├── config/
│   │   └── db.js                   # MySQL/PostgreSQL config
│   ├── controllers/
│   │   └── authController.js       # Register & Login logic
│   ├── routes/
│   │   └── authRoutes.js           # Auth API routes
│   ├── models/
│   │   └── User.js                 # User database model
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT verification
│   ├── .env                        # Environment variables
│   └── .env.example                # Env template
├── package.json                    # Frontend dependencies
└── README.md                       # This file
```

---

## 🔐 Security Features

- ✅ **Password Hashing** — bcrypt with 12 salt rounds
- ✅ **JWT Tokens** — Signed with secret key, 7-day expiry
- ✅ **Input Validation** — Email format, password length checks
- ✅ **Error Handling** — Secure error messages (no sensitive data leaks)
- ✅ **CORS Protection** — Configurable cross-origin policy
- ✅ **Auth Middleware** — Ready for protecting future routes

---

## 🧠 Notes

- This is an **MVP authentication system** for CampusKart
- **Next steps**: Product listings, chat system, payment integration
- UI follows the **"CampusKart Vibe"** design system (Plus Jakarta Sans + indigo/pink palette)
- Designed by **Stitch MCP** design tool

---

## 🎨 Design System — CampusKart Vibe

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#6366F1` / `#4647d3` | Buttons, links, accents |
| Secondary | `#EC4899` / `#b00d6a` | Brand accent, urgency |
| Background | `#F8FAFC` / `#f5f7f9` | Screen backgrounds |
| Surface | `#ffffff` | Cards, form containers |
| On Surface | `#2c2f31` | Primary text |
| Outline | `#595c5e` | Labels, secondary text |
| Success | `#22C55E` | Verification badges |

---

**Built with ❤️ for students, by students.**
