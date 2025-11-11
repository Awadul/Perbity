# Ad Viewing System - How It Works

## Overview
The Perbity ad viewing system allows users to click on ads and earn $0.003 per ad. The system includes daily limits, automatic resets, and prevents duplicate clicks.

## Key Features

### 1. Daily Limit System
- **Each user has a daily limit** based on their payment plan:
  - Free Plan: 10 ads/day
  - Basic Plan: 20 ads/day
  - Standard Plan: 40 ads/day
  - Premium Plan: 80 ads/day
  - VIP Plan: 200 ads/day

### 2. Ad Display Logic
- Users see **only the ads they haven't clicked today**
- The number of ads shown = **min(remaining limit, unclicked ads)**
- Example: If user has 10 remaining and there are 200 total ads, they see 10 ads
- Once an ad is clicked, it **disappears from the grid immediately**

### 3. Daily Reset at Midnight (00:00)
The system automatically resets at midnight:

#### User Model Reset (`resetDailyStats` method):
```javascript
// Resets at 00:00 daily
- earningsToday = 0
- adsCompletedToday = 0
- lastEarningResetDate = today
```

#### AdClick Model:
- Uses `clickDate` to track when ads were clicked
- Filters clicks by: `clickDate >= today at 00:00`
- After midnight, all previous day's clicks are ignored in daily count

### 4. Frontend Logic (ViewAds.jsx)

#### On Page Load:
1. Fetch all ads from `/api/ads`
2. Backend returns:
   - `data`: All ads in system (200 ads)
   - `userPlan.clickedAdIds`: Array of ad IDs clicked today
   - `userPlan.remainingAds`: How many ads user can still click
3. Filter out clicked ads: `unclickedAds = ads.filter(ad => !clickedAdIds.includes(ad._id))`
4. Show only remaining count: `adsToShow = unclickedAds.slice(0, remainingAds)`

#### When User Clicks Ad:
1. Call `POST /api/ads/:id/click`
2. Backend validates:
   - User hasn't reached daily limit
   - User hasn't clicked this ad today
3. If valid:
   - Creates AdClick record with today's date
   - Adds $0.003 to user balance
   - Returns updated earnings and remaining count
4. Frontend:
   - Removes clicked ad from `availableAds` array
   - Updates stats display
   - Opens ad URL in new tab
   - Shows success message

### 5. Backend Validation (adController.js)

#### GET /api/ads:
```javascript
// Get today's start time
const today = new Date();
today.setHours(0, 0, 0, 0);

// Count clicks today
const todayClicksCount = await AdClick.getTodayClicksCount(userId);

// Get clicked ad IDs today
const clickedAds = await AdClick.find({
  user: userId,
  clickDate: { $gte: today }
}).distinct('ad');

// Calculate remaining
remainingAds = dailyLimit - todayClicksCount;
```

#### POST /api/ads/:id/click:
```javascript
// Check daily limit
if (todayClicksCount >= dailyAdsLimit) {
  return error('Daily limit reached');
}

// Check duplicate click today
const existingClick = await AdClick.findOne({
  user: userId,
  ad: adId,
  clickDate: { $gte: today }
});

if (existingClick) {
  return error('Already viewed this ad today');
}

// Create click record
await AdClick.create({
  user, ad, earning: 0.003,
  clickDate: Date.now()
});

// Reset user daily stats if needed
user.resetDailyStats();

// Add earnings
user.addEarnings(0.003, 'ads');
```

## User Experience Flow

### Scenario 1: First Visit Today (Free Plan - 10 ads)
1. User clicks "View Ads"
2. Sees: "Showing 10 ads available to you"
3. Grid shows 10 random ads (out of 200 total)
4. User clicks first ad → Opens website + Earns $0.003
5. Grid now shows 9 ads (clicked one is removed)
6. Stats update: "9/10" remaining
7. User clicks all 9 remaining ads
8. After clicking 10th ad: "Daily Limit Reached!"
9. Message: "Your ad viewing limit resets at midnight (00:00)"

### Scenario 2: After Midnight Reset
1. Clock strikes 00:00
2. Database queries automatically use new date
3. User visits "View Ads"
4. Sees: "Showing 10 ads available to you"
5. Grid shows 10 different ads (can be same ads from yesterday)
6. Stats show: "0/10 viewed today"
7. Yesterday's earnings still in total balance
8. Can earn another $0.030 today

### Scenario 3: User Has Remaining Limit But All Ads Clicked
1. User has clicked all 200 ads in the system
2. Still has 5 remaining clicks in daily limit
3. Sees: "No More Ads Available"
4. Message: "You have 5 ads remaining but all ads have been viewed"
5. Must wait for midnight reset

### Scenario 4: User Upgrades Plan Mid-Day
1. User on Free Plan (10 ads), clicked 5 ads
2. Admin assigns Premium Plan (80 ads)
3. User refreshes page
4. Now sees: "75/80" remaining
5. Can click 75 more ads today
6. Tomorrow gets full 80 ads

## Database Schema

### AdClick Collection:
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref User),
  ad: ObjectId (ref Ad),
  earning: 0.003,
  clickDate: ISODate("2025-11-11T14:30:00Z"),
  isVerified: true,
  isCompleted: true,
  clickDuration: 10
}
```

### Query for Today's Clicks:
```javascript
// Today at 00:00
const today = new Date();
today.setHours(0, 0, 0, 0);

// Find clicks after midnight
AdClick.find({
  user: userId,
  clickDate: { $gte: today }
})
```

## Testing the System

### Test Daily Reset:
1. Click 10 ads (reach limit)
2. Change system time to next day 00:01
3. Refresh page
4. Should see 10 new ads available

### Test Duplicate Prevention:
1. Click an ad (earns $0.003)
2. Note the ad ID
3. Try clicking same ad again
4. Backend should return error: "You have already viewed this ad today"

### Test Limit Enforcement:
1. Free plan user clicks 10 ads
2. Try clicking 11th ad
3. Backend should return error: "Daily limit reached"

### Test Ad Filtering:
1. Note initial ad count (e.g., 10 ads shown)
2. Click one ad
3. Verify:
   - Ad disappears from grid
   - Remaining count decreases by 1
   - Can't see clicked ad anymore
   - Stats show "9/10"

## Security Features

1. **Backend Validation**: All limits checked on server side
2. **Duplicate Prevention**: Can't click same ad twice in one day
3. **JWT Authentication**: Must be logged in to view/click ads
4. **IP & User Agent Tracking**: Recorded in AdClick for fraud detection
5. **Daily Reset Automatic**: No manual intervention needed

## Future Enhancements

1. **Ad Rotation**: Show different ads each day
2. **Priority Ads**: Some ads appear more frequently
3. **Time-based Ads**: Different ads at different times of day
4. **Geographic Targeting**: Show ads based on user location
5. **Category Preferences**: Users choose ad categories they prefer
