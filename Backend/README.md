# Perbity Backend API

Backend API for Perbity earning platform built with Node.js, Express, MongoDB, and JWT authentication.

## 🚀 Features

- User authentication with JWT
- Role-based access control (User/Admin)
- Ad click tracking and earnings
- Investment system with daily earnings
- Withdrawal management
- Referral system
- Secure password hashing with bcrypt
- Rate limiting
- Input validation
- Error handling

## 📁 Project Structure

```
Backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── adController.js      # Ad operations
│   ├── investmentController.js
│   ├── withdrawalController.js
│   └── referralController.js
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── errorHandler.js      # Error handling
│   ├── rateLimiter.js       # Rate limiting
│   └── validator.js         # Input validation
├── models/
│   ├── User.js              # User schema
│   ├── Ad.js                # Ad schema
│   ├── AdClick.js           # Ad click tracking
│   ├── Investment.js        # Investment schema
│   ├── Withdrawal.js        # Withdrawal schema
│   └── Referral.js          # Referral schema
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── adRoutes.js
│   ├── investmentRoutes.js
│   ├── withdrawalRoutes.js
│   └── referralRoutes.js
├── utils/
│   ├── errorResponse.js     # Custom error class
│   └── tokenResponse.js     # Token response helper
├── .env                     # Environment variables
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
└── server.js                # Entry point
```

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the values in `.env` file

3. Start MongoDB:
```bash
# Make sure MongoDB is running locally or use MongoDB Atlas
```

4. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh token
- `PUT /api/auth/updatepassword` - Update password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get single user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Ads
- `GET /api/ads` - Get all active ads
- `GET /api/ads/clicks/today` - Get today's clicks
- `POST /api/ads/:id/click` - Click an ad
- `GET /api/ads/earnings` - Get ad earnings
- `POST /api/ads` - Create ad (Admin)
- `PUT /api/ads/:id` - Update ad (Admin)
- `DELETE /api/ads/:id` - Delete ad (Admin)

### Investments
- `GET /api/investments` - Get user investments
- `GET /api/investments/stats` - Get investment stats
- `GET /api/investments/:id` - Get single investment
- `POST /api/investments` - Create investment
- `PUT /api/investments/:id/cancel` - Cancel investment
- `GET /api/investments/admin/all` - Get all investments (Admin)
- `POST /api/investments/process-earnings` - Process daily earnings (Admin)

### Withdrawals
- `GET /api/withdrawals` - Get user withdrawals
- `GET /api/withdrawals/:id` - Get single withdrawal
- `POST /api/withdrawals` - Create withdrawal request
- `GET /api/withdrawals/admin/all` - Get all withdrawals (Admin)
- `PUT /api/withdrawals/:id/status` - Update withdrawal status (Admin)
- `DELETE /api/withdrawals/:id` - Delete withdrawal (Admin)

### Referrals
- `GET /api/referrals` - Get user referrals
- `GET /api/referrals/stats` - Get referral stats
- `GET /api/referrals/admin/all` - Get all referrals (Admin)
- `PUT /api/referrals/:id/confirm` - Confirm and pay referral (Admin)

## 🔐 Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/perbity
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRE=30d
COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:5173
```

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **express-validator** - Input validation
- **cookie-parser** - Cookie parsing
- **morgan** - HTTP request logger
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **compression** - Response compression

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting on sensitive routes
- Input validation and sanitization
- HTTP security headers with Helmet
- CORS protection
- Cookie security

## 📝 License

ISC
