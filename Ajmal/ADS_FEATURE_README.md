# Ads Viewing Feature - Implementation Guide

## Overview
The ads viewing feature allows users to watch advertisements and earn money based on their subscription package. The system includes 200 common internet ads that users can view daily.

## Features Implemented

### 1. **Backend Setup**
- ✅ **200 Ads Seeded**: Created 10 unique ad types with 20 copies each (total 200 ads)
- ✅ **Ad Types**: Tech Gadgets, Mobile Packages, Online Learning, Shopping Deals, Freelance Work, Health Products, Travel Offers, Food Delivery, Entertainment, Home Services
- ✅ **Earnings System**: Each ad view earns $0.003 (0.3¢) and is automatically added to user balance
- ✅ **API Endpoint**: `POST /api/ads/:id/click` - Records ad views and updates user earnings

### 2. **Database Models**
- **Ad Model**: Stores ad information (title, icon, color, earning, description, url)
- **AdClick Model**: Tracks user ad views with verification and completion status
- **User Model**: Updated with `addEarnings()` method to handle ad earnings

### 3. **Frontend Components**

#### ViewAds Page (`src/pages/ViewAds.jsx`)
- **Total Ads Display**: Shows 200 total ads available in the system
- **Package-Based Limits**: Displays user's daily ad limit based on package
  - Free: 10 ads/day
  - Basic: 20 ads/day
  - Silver: 40 ads/day
  - Gold: 80 ads/day
  - Platinum: 120 ads/day
  - VIP: 200 ads/day
- **10-Second Timer**: Animated countdown with SVG circle visualization
- **Real-Time Stats**: Shows total ads, remaining ads, viewed today, earnings
- **Earnings Tracking**: Displays accumulated earnings in real-time
- **Beautiful Ad Display**: Gradient colored cards with Font Awesome icons

### 4. **API Integration**

#### Get Ads
```javascript
GET /api/ads
Response: {
  success: true,
  count: 200,
  data: [...ads],
  userPlan: {
    name: "Free",
    dailyLimit: 10,
    remainingAds: 10,
    clickedToday: 0,
    clickedAdIds: []
  }
}
```

#### View Ad (Earn Money)
```javascript
POST /api/ads/:id/click
Response: {
  success: true,
  message: "Ad viewed successfully! Earnings added to your balance.",
  data: {
    earning: 0.003,
    newBalance: 1.245,
    totalEarnings: 1.245,
    adsEarnings: 0.015,
    todayEarnings: 0.015,
    adsViewedToday: 5,
    remainingAds: 5
  }
}
```

### 5. **User Experience Flow**

1. **Dashboard**: User clicks "View Ads" button
2. **Intro Screen**: Shows package info, total ads (200), daily limit, and stats
3. **Ad Viewing**: 
   - Beautiful gradient card displays with icon
   - 10-second countdown timer with animation
   - Ad description and "Learn More" link
4. **Earnings**: 
   - Backend automatically adds $0.003 to user balance
   - Updates user.earnings.ads
   - Updates user.balance
   - Updates user.totalEarnings
5. **Next Ad**: After timer, user clicks "Next Ad" to continue
6. **Completion**: Shows total earnings and returns to dashboard

### 6. **Styling Features**
- **4 Stat Boxes**: Total Ads, Can Watch Today, Viewed Today, Today's Earnings
- **Gradient Colors**: 10 unique gradient combinations matching ad types
- **Font Awesome Icons**: Professional icons for each ad category
- **Responsive Design**: Works on mobile and desktop
- **Smooth Animations**: Timer circle, hover effects, transitions

## How to Test

### 1. **Seed the Database** (Already Done)
```bash
cd D:\Project\Backend
node scripts/seedAds.js
```

### 2. **Login as User**
```
Email: demo@example.com
Password: demo123
```

### 3. **View Ads**
- Click "View Ads" from dashboard
- See 200 total ads available
- See your daily limit (10 for Free package)
- Click "Start Watching Ads"
- Watch 10-second timer countdown
- Click "Next Ad" when timer finishes
- Check your balance increase after each ad

### 4. **Test Package Limits**
- As admin (admin@perbity.com / admin123456)
- Assign different package to demo user
- Logout and login as demo user
- Check new daily limit reflects package

## Files Modified/Created

### Backend
- ✅ `scripts/seedAds.js` - Updated to create 200 ads with real URLs
- ✅ `controllers/adController.js` - Updated clickAd() to use addEarnings() method
- ✅ Existing: `models/Ad.js`, `models/AdClick.js`, `models/User.js`

### Frontend
- ✅ `src/pages/ViewAds.jsx` - Complete ads viewing component
- ✅ `src/pages/ViewAds.css` - Comprehensive styling with gradients
- ✅ `src/App.jsx` - Added /view-ads route

## Earnings Breakdown

| Package   | Daily Ads | Daily Earning | Monthly Earning |
|-----------|-----------|---------------|-----------------|
| Free      | 10        | $0.03         | $0.90           |
| Basic     | 20        | $0.06         | $1.80           |
| Silver    | 40        | $0.12         | $3.60           |
| Gold      | 80        | $0.24         | $7.20           |
| Platinum  | 120       | $0.36         | $10.80          |
| VIP       | 200       | $0.60         | $18.00          |

## Backend Processing

When user views an ad:
1. ✅ Validates ad exists and is active
2. ✅ Checks user's daily limit based on package
3. ✅ Verifies user hasn't reached daily limit
4. ✅ Checks if user already viewed this specific ad today
5. ✅ Creates AdClick record with verification
6. ✅ Calls user.addEarnings(0.003, 'ads')
7. ✅ Updates user balance, totalEarnings, adsCompleted, adsCompletedToday
8. ✅ Updates ad.totalClicks and ad.totalEarningsPaid
9. ✅ Returns updated balance and remaining ads

## Additional Features

- ✅ **Daily Reset**: Automatically resets ad view counts at midnight
- ✅ **Experience Points**: Users gain XP for watching ads (10 XP per $0.001 earned)
- ✅ **Level System**: Users level up based on earnings
- ✅ **Feature Unlocks**: Watching ads contributes to unlocking premium features
- ✅ **Statistics Tracking**: Today, week, month earnings tracked separately
- ✅ **Team Earnings**: If user has referrer, their earnings contribute to team stats

## Testing Checklist

- [x] Seed script creates 200 ads
- [x] ViewAds page displays total ads count
- [x] Package-based limits work correctly
- [x] Timer counts down from 10 seconds
- [x] Backend adds earnings to user balance
- [x] Backend updates user.earnings.ads
- [x] AdClick records created with verification
- [x] Daily limit prevents viewing more ads
- [x] Earnings display updates in real-time
- [x] Beautiful gradient ad cards display
- [x] Responsive design works on mobile
- [x] Back to dashboard button works
- [x] Daily limit reached screen displays correctly

## Success! 🎉

The ads viewing feature is now fully integrated with:
- 200 real internet ads available
- Automatic earnings added to user balance
- Package-based daily limits
- Beautiful, responsive UI
- Complete backend tracking
