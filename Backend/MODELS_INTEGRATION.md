# Database Models Integration Guide

This document describes all the database models integrated from the frontend application.

## Models Overview

### 1. User Model (`models/User.js`)

Complete user profile with earnings tracking, team management, and feature unlocking.

**Key Features:**
- **Authentication**: Email/password with JWT and refresh tokens
- **Earnings Tracking**: Separate categories (ads, referrals, emails, reviews, investments)
- **Team System**: Referral tree with member tracking
- **Feature Unlocks**: Progressive feature access based on achievements
- **Level System**: Experience points and level progression
- **Daily Stats**: Auto-resetting daily earnings and click counts

**Important Fields:**
```javascript
earnings: {
  ads: Number,           // From watching advertisements
  referrals: Number,     // From team member signups ($1.5 each)
  emails: Number,        // From email tasks (unlock at $10 total)
  reviews: Number,       // From review tasks (unlock at 10 referrals)
  investments: Number    // From investment packages
}

team: {
  members: [{
    user: ObjectId,
    joinedAt: Date,
    isActive: Boolean,
    totalEarnings: Number
  }],
  totalMembers: Number,
  activeMembers: Number,
  teamEarnings: Number
}

unlockedFeatures: {
  emails: Boolean,           // Unlocks at $10 total earnings
  reviews: Boolean,          // Unlocks at 10 referrals
  premiumAds: Boolean,       // Future feature
  instantWithdrawal: Boolean // Future feature
}
```

**Helper Methods:**
- `addEarnings(category, amount)` - Add earnings to specific category
- `addTeamMember(userId)` - Add new referral to team
- `updateTeamEarnings(amount)` - Update team total earnings
- `resetDailyStats()` - Reset daily counters
- `checkEmailsUnlock()` - Check if emails feature unlocked
- `checkReviewsUnlock()` - Check if reviews feature unlocked

---

### 2. Ad Model (`models/Ad.js`)

Advertisement listings that users can view to earn money.

**Frontend Integration:**
Matches the 10 ads displayed in `src/pages/EarnAds.jsx`

**Ad Types (from frontend):**
1. Tech Gadgets (fa-mobile-screen, blue)
2. Mobile Packages (fa-sim-card, green)
3. Online Learning (fa-graduation-cap, yellow)
4. Shopping Deals (fa-bag-shopping, red)
5. Freelance Work (fa-laptop-code, purple)
6. Health Products (fa-heart-pulse, pink)
7. Travel Offers (fa-plane, indigo)
8. Food Delivery (fa-utensils, orange)
9. Entertainment (fa-film, teal)
10. Home Services (fa-house-chimney, cyan)

**Important Fields:**
```javascript
title: String (enum of 10 ad types)
icon: String (FontAwesome icon class)
color: String (Tailwind gradient classes)
earning: Number (default: 0.3)
dailyLimit: Number (default: 1 - one click per day per ad)
isPremium: Boolean (for future premium ads feature)
totalClicks: Number (tracking total engagement)
```

---

### 3. AdClick Model (`models/AdClick.js`)

Tracks user ad clicks and earnings.

**Frontend Integration:**
- Replaces localStorage tracking in `EarnAds.jsx`
- Validates 10 ads per day limit
- Tracks completion status

**Important Features:**
```javascript
// Static methods for quick checks
hasClickedToday(userId, adId)      // Check if user clicked specific ad today
getTodayClicksCount(userId)         // Get total clicks today (max 10)

// Fields
user: ObjectId
ad: ObjectId
earning: Number (0.3 per click)
clickDate: Date (for daily limit enforcement)
isCompleted: Boolean (popup closed successfully)
clickDuration: Number (time spent viewing)
```

**Business Logic:**
- Maximum 10 ad clicks per day per user
- Each ad can be clicked once per day
- Earnings credited immediately on completion
- Tracks IP and user agent for fraud prevention

---

### 4. Investment Model (`models/Investment.js`)

Investment packages as shown in frontend Dashboard and Investment page.

**Frontend Integration:**
Matches the 3 packages in `src/pages/Investment.jsx` and Dashboard stats

**Investment Packages:**
```javascript
Basic Package:
- Amount: $20
- Daily Earning: $2.5
- Duration: 30 days
- Total Return: $75 (275% ROI)

Standard Package (Popular):
- Amount: $40
- Daily Earning: $5
- Duration: 30 days
- Total Return: $150 (275% ROI)

Premium Package:
- Amount: $80
- Daily Earning: $10
- Duration: 30 days
- Total Return: $300 (275% ROI)
```

**Important Fields & Methods:**
```javascript
packageName: String (Basic/Standard/Premium)
dailyEarning: Number (auto-calculated)
totalEarned: Number (accumulated)
daysCompleted: Number
daysRemaining: Number
status: String (active/completed/cancelled/paused)
nextEarningDate: Date (for automated processing)

// Virtual fields
progressPercentage: (daysCompleted / totalDuration) * 100
expectedReturn: dailyEarning * totalDuration
roiPercentage: (expectedReturn / amount) * 100

// Methods
processDailyEarning() - Process next day's earning
getPackages() - Static method to get all package info
```

---

### 5. Withdrawal Model (`models/Withdrawal.js`)

User withdrawal requests with payment processing.

**Frontend Integration:**
- Minimum: $15 (as shown in Dashboard)
- Maximum: $1000
- Processing Time: 12 hours (normal) or instant (with 5% fee)

**Important Fields:**
```javascript
amount: Number (15-1000)
fee: Number (2% normal, 5% instant)
netAmount: Number (amount - fee)
paymentMethod: String (paypal/bank/crypto/wise/skrill)
paymentDetails: Object {
  email, accountNumber, accountName,
  bankName, walletAddress, phoneNumber
}
status: String (pending/processing/completed/rejected/cancelled)
priority: String (normal/instant)
processingTime: String ("12 hours" or "Few seconds")
```

**Business Logic:**
- Auto-calculates fee based on priority
- Normal withdrawals: 2% fee, 12-hour processing
- Instant withdrawals: 5% fee, immediate processing
- One active withdrawal per user at a time
- Requires minimum $15 balance

---

### 6. Referral Model (`models/Referral.js`)

Tracks referral relationships and earnings.

**Frontend Integration:**
- $1.5 earning per referral (as shown in Dashboard)
- Team member tracking
- Reviews feature unlocks at 10 referrals

**Important Fields:**
```javascript
referrer: ObjectId (who referred)
referred: ObjectId (who was referred)
earning: Number (default: 1.5)
bonusEarning: Number (future feature for active referrals)
totalEarning: Number (earning + bonusEarning)
level: Number (1 = direct, 2 = sub-referral, etc.)
status: String (pending/confirmed/paid/cancelled)

referredUserActivity: {
  lastLogin: Date,
  totalEarnings: Number,
  isActive: Boolean
}
```

**Business Logic:**
- Earnings credited on referral registration
- Status changes: pending → confirmed → paid
- Tracks referral activity for bonus calculations
- Can track multi-level referrals

---

## Data Flow Examples

### Ad Clicking Flow
1. User clicks ad in `EarnAds.jsx`
2. Frontend calls `POST /api/ads/:id/click`
3. Backend checks daily limit (10 ads)
4. Creates AdClick record with earning $0.3
5. Updates User.earnings.ads
6. Updates User.todayEarnings.ads
7. Updates User.dailyAdClicks
8. Returns updated balance

### Referral Flow
1. User A shares referral link with code
2. User B registers with code
3. Backend creates Referral record
4. Credits $1.5 to User A
5. Adds User B to User A's team.members
6. Checks if User A unlocked reviews (10 referrals)
7. Updates User A's unlockedFeatures if threshold met

### Investment Flow
1. User selects package in Investment page
2. Frontend calls `POST /api/investments`
3. Backend creates Investment record
4. Calculates dailyEarning based on amount
5. Sets nextEarningDate to tomorrow
6. Daily cron job processes earnings
7. Updates Investment.totalEarned
8. Credits User.earnings.investments

### Withdrawal Flow
1. User requests withdrawal from Dashboard
2. Backend checks minimum $15 balance
3. Checks for existing pending withdrawals
4. Creates Withdrawal record with fee calculation
5. Status: pending → processing → completed
6. Updates User.totalWithdrawn
7. Sends payment via selected method
8. Updates withdrawal status

---

## Database Seeding

### Seed Initial Data
```bash
# Seed admin and demo users
npm run seed:admin

# Seed 10 advertisements
npm run seed:ads

# Seed both
npm run seed:all
```

### Default Credentials
After seeding:
- **Admin**: admin@perbity.com / admin123456
- **Demo User**: demo@example.com / demo123

---

## Integration Checklist

### Frontend Integration Tasks
- [ ] Replace localStorage with API calls in all pages
- [ ] Add axios/fetch for HTTP requests
- [ ] Implement authentication token storage
- [ ] Update Login.jsx to call `/api/auth/login`
- [ ] Update Signup.jsx to call `/api/auth/register`
- [ ] Update Dashboard.jsx to fetch stats from `/api/users/stats`
- [ ] Update EarnAds.jsx to call `/api/ads` and `/api/ads/:id/click`
- [ ] Update Investment.jsx to call `/api/investments`
- [ ] Add withdrawal functionality calling `/api/withdrawals`
- [ ] Add referral link display from user profile

### Backend Testing Tasks
- [ ] Start backend server (`npm run dev`)
- [ ] Test MongoDB connection
- [ ] Run seed scripts
- [ ] Test authentication endpoints
- [ ] Test ad clicking with daily limit
- [ ] Test investment creation
- [ ] Test withdrawal requests
- [ ] Test referral tracking
- [ ] Test feature unlock logic

---

## Environment Variables Required

```env
# MongoDB
MONGODB_URI=mongodb+srv://admin:admin@cluster0.43ch1.mongodb.net/perbity?retryWrites=true&w=majority&appName=Cluster0

# JWT
JWT_SECRET=perbity-secret-key-2025-change-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=perbity-refresh-secret-key-2025
JWT_REFRESH_EXPIRE=30d

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:5173

# Cookie settings
JWT_COOKIE_EXPIRE=7
```

---

## API Endpoints Summary

### Authentication
- POST `/api/auth/register` - Register new user (with referral code)
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- POST `/api/auth/logout` - Logout user
- POST `/api/auth/refresh-token` - Refresh JWT token
- PUT `/api/auth/password` - Update password

### Users
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update profile
- GET `/api/users/stats` - Get user statistics (earnings, team, etc.)

### Ads
- GET `/api/ads` - Get all active ads (10 daily ads)
- POST `/api/ads/:id/click` - Click ad (earn $0.3)
- GET `/api/ads/earnings` - Get ad earnings history
- GET `/api/ads/today` - Get today's clicked ads

### Investments
- GET `/api/investments` - Get user investments
- POST `/api/investments` - Create investment ($20/$40/$80)
- GET `/api/investments/stats` - Get investment statistics

### Withdrawals
- GET `/api/withdrawals` - Get withdrawal history
- POST `/api/withdrawals` - Request withdrawal (min $15, max $1000)

### Referrals
- GET `/api/referrals` - Get referral list
- GET `/api/referrals/stats` - Get referral statistics

---

## Feature Unlock Logic

### Emails Feature
- **Requirement**: Total earnings >= $10
- **Check**: Runs on every earning addition
- **Auto-unlock**: Yes, when threshold met
- **Frontend**: Show "Emails" section in Dashboard

### Reviews Feature
- **Requirement**: Total referrals >= 10
- **Check**: Runs on every team member addition
- **Auto-unlock**: Yes, when threshold met
- **Frontend**: Show "Reviews" section in Dashboard

### Future Features
- Premium Ads: High-earning ads for active users
- Instant Withdrawal: No processing time for VIP users

---

## Performance Optimizations

### Database Indexes
All models include proper indexes:
- User: email, referralCode, referredBy, team.members
- Ad: isActive, displayOrder, isPremium
- AdClick: user+ad+date, user+date
- Investment: user+status, status+nextEarningDate
- Withdrawal: user+status, status+requestedAt
- Referral: referrer+referred (unique), referrer+status

### Query Optimization
- Populate only required fields
- Use lean queries for read-only data
- Implement pagination for lists
- Cache frequently accessed data

---

## Next Steps

1. **Start Backend**: `cd Backend && npm run dev`
2. **Seed Data**: `npm run seed:all`
3. **Test APIs**: Use Postman/Thunder Client
4. **Integrate Frontend**: Replace localStorage with API calls
5. **Test Features**: Ad clicking, investments, withdrawals
6. **Deploy**: Deploy backend to hosting service
7. **Configure CORS**: Update CLIENT_URL for production

---

Last Updated: November 11, 2025
