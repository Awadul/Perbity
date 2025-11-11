# Perbity Investment Packages

## Overview
Perbity uses an investment-based model where users invest money and earn 3% daily profit through viewing ads.

## Package Formula
```
Investment Amount × 3% = Daily Profit
Daily Profit ÷ $0.003 per ad = Daily Ads Available

Example: $100 Package
$100 × 0.03 = $3 daily profit
$3 ÷ $0.003 = 1000 ads per day
```

## Available Packages

| Investment | Daily Profit | % Return | Ads/Day | Duration |
|-----------|--------------|----------|---------|----------|
| $100      | $3.00        | 3%       | 1,000   | 365 days |
| $200      | $6.00        | 3%       | 2,000   | 365 days |
| $300      | $9.00        | 3%       | 3,000   | 365 days |
| $400      | $12.00       | 3%       | 4,000   | 365 days |
| $500      | $15.00       | 3%       | 5,000   | 365 days |
| $600      | $18.00       | 3%       | 6,000   | 365 days |
| $700      | $21.00       | 3%       | 7,000   | 365 days |
| $800      | $24.00       | 3%       | 8,000   | 365 days |
| $900      | $27.00       | 3%       | 9,000   | 365 days |
| $1000     | $30.00       | 3%       | 10,000  | 365 days |

## Package Details

### $100 Package (Entry Level)
- **Investment:** $100
- **Daily Profit:** $3.00
- **Ads Per Day:** 1,000
- **Duration:** 365 days (1 year)
- **Features:**
  - 1000 ads per day
  - $3 daily profit
  - 3% daily return
  - Basic support
  - Email notifications

### $200 Package
- **Investment:** $200
- **Daily Profit:** $6.00
- **Ads Per Day:** 2,000
- **Duration:** 365 days
- **Features:**
  - 2000 ads per day
  - $6 daily profit
  - 3% daily return
  - Priority support
  - Email notifications
  - Advanced statistics

### $300 Package
- **Investment:** $300
- **Daily Profit:** $9.00
- **Ads Per Day:** 3,000
- **Duration:** 365 days
- **Features:**
  - 3000 ads per day
  - $9 daily profit
  - 3% daily return
  - Priority support
  - Advanced analytics
  - Referral bonuses

### $400 Package (Popular)
- **Investment:** $400
- **Daily Profit:** $12.00
- **Ads Per Day:** 4,000
- **Duration:** 365 days
- **Features:**
  - 4000 ads per day
  - $12 daily profit
  - 3% daily return
  - VIP support
  - Advanced analytics
  - Higher referral bonuses
- **Most Popular Choice**

### $500 Package
- **Investment:** $500
- **Daily Profit:** $15.00
- **Ads Per Day:** 5,000
- **Duration:** 365 days
- **Features:**
  - 5000 ads per day
  - $15 daily profit
  - 3% daily return
  - VIP support
  - Full analytics suite
  - Maximum referral bonuses
  - Instant withdrawals

### $600 Package
- **Investment:** $600
- **Daily Profit:** $18.00
- **Ads Per Day:** 6,000
- **Duration:** 365 days
- **Features:**
  - 6000 ads per day
  - $18 daily profit
  - 3% daily return
  - Dedicated support
  - Full analytics suite
  - Maximum earnings potential
  - Instant withdrawals

### $700 Package
- **Investment:** $700
- **Daily Profit:** $21.00
- **Ads Per Day:** 7,000
- **Duration:** 365 days
- **Features:**
  - 7000 ads per day
  - $21 daily profit
  - 3% daily return
  - Dedicated support
  - All exclusive ads
  - Premium features
  - Instant withdrawals

### $800 Package
- **Investment:** $800
- **Daily Profit:** $24.00
- **Ads Per Day:** 8,000
- **Duration:** 365 days
- **Features:**
  - 8000 ads per day
  - $24 daily profit
  - 3% daily return
  - Dedicated account manager
  - All premium features
  - Early access to new features
  - Instant withdrawals

### $900 Package
- **Investment:** $900
- **Daily Profit:** $27.00
- **Ads Per Day:** 9,000
- **Duration:** 365 days
- **Features:**
  - 9000 ads per day
  - $27 daily profit
  - 3% daily return
  - Dedicated account manager
  - VIP treatment
  - All premium features
  - Priority withdrawals

### $1000 Package (Maximum)
- **Investment:** $1000
- **Daily Profit:** $30.00
- **Ads Per Day:** 10,000
- **Duration:** 365 days
- **Features:**
  - 10000 ads per day
  - $30 daily profit
  - 3% daily return
  - Dedicated account manager
  - VIP treatment
  - Maximum earnings potential
  - All premium features
  - Priority withdrawals
  - Exclusive benefits

## How It Works

### For Users:
1. **Purchase Package:** User invests $100-$1000
2. **Daily Profit:** Automatically calculated as 3% of investment
3. **View Ads:** User must click ads to earn the daily profit
4. **Earn Money:** $0.003 earned per ad clicked
5. **Daily Reset:** Ads reset at 00:00 (midnight) each day

### Example: $400 Package User
- Invests $400
- Gets 4,000 ads per day
- Can earn $12 daily ($400 × 3%)
- Needs to click 4,000 ads to get full profit
- Package active for 365 days

### Ad Viewing Process:
1. User logs in to dashboard
2. Clicks "View Ads" button
3. Sees grid of available ads (up to their daily limit)
4. Clicks any ad card
5. Ad opens in new tab
6. User earns $0.003 immediately
7. Ad disappears from their grid
8. Process repeats until daily limit reached

### Daily Reset:
- At 00:00 (midnight), system resets:
  - Ads clicked counter = 0
  - All ads become available again
  - User can click their full daily limit again

## Admin Features

### Package Assignment:
1. Admin selects user
2. Chooses package from dropdown
3. System shows preview:
   - Investment amount
   - Daily profit (3%)
   - Ads per day
   - Duration (365 days)
4. Admin confirms assignment
5. User immediately gets access to their ad limit

### Package Display Format:
```
$400 Package - $400 Investment | $12 Daily Profit | 4000 Ads/Day
```

## Database Schema

### PaymentPlan Model:
```javascript
{
  name: "$400 Package",
  price: 400,
  duration: 365,
  dailyAdsLimit: 4000,
  dailyProfit: 12,
  profitPercentage: 3,
  adEarningRate: 0.003,
  features: [...],
  isPopular: true,
  isActive: true
}
```

### Payment Model (User's Active Package):
```javascript
{
  user: ObjectId,
  paymentPlan: ObjectId,
  amount: 400,
  status: "approved",
  isActive: true,
  expiresAt: Date (365 days from now)
}
```

## ROI Calculation

### Daily ROI:
```
Daily Profit / Investment × 100 = 3%
```

### Monthly ROI (30 days):
```
(Daily Profit × 30) / Investment × 100 = 90%
```

### Yearly ROI (365 days):
```
(Daily Profit × 365) / Investment × 100 = 1095%
```

### Example: $400 Package
- **Daily:** $12 (3% return)
- **Monthly:** $360 (90% return)
- **Yearly:** $4,380 (1095% return)

## Important Notes

1. **All packages last 365 days** - Maximum earning period
2. **User must click ads** - Profit only earned by viewing ads
3. **3% is consistent** - All packages have same percentage
4. **Ads reset daily** - At midnight (00:00)
5. **One package at a time** - User can only have one active package
6. **No partial ads** - User must click full ads to earn

## Frontend Display

### Dashboard Package Card:
```
💎 Investment Package
[$400 Package]

Investment: $400
Daily Profit (3%): $12.00

Daily Ads: 4000
Viewed: 0
Remaining: 4000

👆 Tap for full details
```

### Package Modal Details:
```
Investment Package: $400 Package
Investment Amount: $400
Daily Profit (3%): $12.00
Ads Available Daily: 4000 ads
Viewed Today: 0 ads
Remaining Today: 4000 ads
Earnings Per Ad: $0.003
Today's Ad Earnings: $0.000
```

## Implementation Status

✅ **Backend:**
- 10 packages seeded in database
- PaymentPlan model updated with profit fields
- Duration set to 365 days for all packages
- Ads calculation: price × 10 = daily ads

✅ **Frontend:**
- Admin dropdown shows: "$X Investment | $Y Profit | Z Ads/Day"
- Package preview modal in admin panel
- Dashboard shows investment summary
- Golden/yellow theme for investment cards

✅ **Ad System:**
- $0.003 per ad
- Daily reset at midnight
- Filtered by clicked ads
- Shows only remaining ads
