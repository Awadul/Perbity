# 🆕 New Features Documentation

## Payment Plans & Admin Dashboard System

This document describes all the new features added to the backend system.

---

## 🎯 Overview

### Three Main Systems Added:

1. **Payment Plans System** - Users can purchase plans to increase daily ad limits
2. **Checkout System** - Users can request withdrawals that admins approve
3. **Admin Dashboard** - Complete admin panel to manage users, payments, and checkouts

---

## 📦 New Models

### 1. PaymentPlan Model

Defines subscription plans with different ad limits and earning rates.

**Fields:**
- `name`: Plan name (Free, Basic, Standard, Premium, VIP)
- `price`: Plan cost in USD
- `duration`: Plan duration in days (typically 30)
- `dailyAdsLimit`: Maximum ads user can click per day
- `features`: Array of plan features
- `adEarningRate`: Earning amount per ad click
- `isPopular`: Flag for popular plans
- `isActive`: Whether plan is available

**5 Default Plans:**
| Plan | Price | Daily Ads | Per Ad | Max Daily | Monthly Potential |
|------|-------|-----------|--------|-----------|-------------------|
| Free | $0 | 10 | $0.30 | $3.00 | $90.00 |
| Basic | $20 | 20 | $0.30 | $6.00 | $180.00 |
| Standard | $50 | 50 | $0.35 | $17.50 | $525.00 ⭐ |
| Premium | $100 | 100 | $0.40 | $40.00 | $1,200.00 |
| VIP | $200 | 200 | $0.50 | $100.00 | $3,000.00 |

### 2. Payment Model

Tracks user subscription payments with proof images.

**Key Features:**
- Upload payment proof (Binance Pay screenshot)
- Admin approval/rejection workflow
- Automatic plan activation
- Expiration date calculation
- Status tracking (pending → approved/rejected)

**Fields:**
- `user`: Reference to User
- `paymentPlan`: Reference to PaymentPlan
- `amount`: Payment amount
- `paymentMethod`: Payment type (binance/paypal/bank/crypto)
- `proofImage`: Path to uploaded screenshot
- `transactionId`: Optional transaction reference
- `status`: pending/approved/rejected/expired
- `isActive`: Whether plan is currently active
- `expiresAt`: Plan expiration date
- `approvedBy`: Admin who approved
- `approvedAt`: Approval timestamp

**Methods:**
- `approve(adminId)` - Approve payment and activate plan
- `reject(adminId, reason)` - Reject payment with reason
- `checkExpiration()` - Check if plan has expired

### 3. Checkout Model

Handles withdrawal requests (renamed from Withdrawal to avoid confusion).

**Key Features:**
- Users request withdrawal of earned balance
- Admin approves/rejects requests
- Payment proof upload by admin
- Status tracking workflow
- Transaction history

**Fields:**
- `user`: Reference to User
- `amount`: Withdrawal amount ($15-$10,000)
- `paymentMethod`: Where to send payment
- `paymentDetails`: Account details (email, wallet, bank info)
- `status`: pending/processing/completed/rejected/cancelled
- `transactionId`: Payment transaction reference
- `proofImage`: Admin uploads payment proof
- `processedBy`: Admin who processed
- `requestNote`: User's note
- `adminNotes`: Admin's internal notes
- `rejectionReason`: Why request was rejected

**Methods:**
- `complete(adminId, transactionId, proofImage)` - Complete withdrawal
- `reject(adminId, reason)` - Reject withdrawal
- `markProcessing(adminId)` - Mark as in progress

**Static Methods:**
- `hasPendingCheckout(userId)` - Check if user has pending request

---

## 🔌 API Endpoints

### Payment Endpoints (`/api/payments`)

#### Public
- **GET /plans** - Get all active payment plans

#### User Protected
- **POST /** - Submit payment with proof image (multipart/form-data)
  - Body: `paymentPlan`, `amount`, `paymentMethod`, `transactionId`
  - File: `proofImage` (JPEG/PNG, max 5MB)
- **GET /my-payments** - Get user's payment history
- **GET /active** - Get currently active payment plan
- **GET /:id/image** - View payment proof image

#### Admin Only
- **GET /admin/all** - Get all payments (with pagination, filtering)
  - Query: `status`, `page`, `limit`
- **PUT /:id/approve** - Approve pending payment
- **PUT /:id/reject** - Reject pending payment
  - Body: `reason`

### Checkout Endpoints (`/api/checkouts`)

#### User Protected
- **POST /** - Create checkout request
  - Body: `amount`, `paymentMethod`, `paymentDetails`, `requestNote`
- **GET /my-checkouts** - Get user's checkout history
  - Query: `status`
- **PUT /:id/cancel** - Cancel pending checkout

#### Admin Only
- **GET /admin/all** - Get all checkouts (with pagination, filtering)
  - Query: `status`, `page`, `limit`
- **GET /admin/stats** - Get checkout statistics
- **PUT /:id/processing** - Mark checkout as processing
- **PUT /:id/complete** - Complete checkout and send payment
  - Body: `transactionId`, `adminNotes`
  - File: `proofImage` (optional payment proof)
- **PUT /:id/reject** - Reject checkout request
  - Body: `reason`

### Admin Endpoints (`/api/admin`)

All require admin role.

#### Dashboard
- **GET /dashboard** - Get complete dashboard statistics
  - Returns: user stats, payment stats, checkout stats, ad stats

#### User Management
- **GET /users** - Get all users with their active plans
  - Query: `page`, `limit`, `search`, `status`
- **GET /users/:id** - Get detailed user information
  - Includes: payments, checkouts, ad clicks
- **PUT /users/:id/status** - Activate/deactivate user
  - Body: `isActive`

#### Payment Management
- **PUT /payments/:id/toggle** - Activate/deactivate payment plan

#### Payment Plan Management
- **GET /payment-plans** - Get all plans with active user counts
- **POST /payment-plans** - Create new payment plan
- **PUT /payment-plans/:id** - Update payment plan
- **DELETE /payment-plans/:id** - Delete payment plan (if no active users)

### Updated Ad Endpoints (`/api/ads`)

Modified to check payment plans:

- **GET /** - Get ads with user's plan info
  - Returns: ads list + `userPlan` object with:
    - `name`: Current plan name
    - `dailyLimit`: Max ads allowed per day
    - `remainingAds`: Ads left today
    - `clickedToday`: Number of ads clicked today
    - `clickedAdIds`: Array of already clicked ad IDs

- **POST /:id/click** - Click ad (now checks plan limit)
  - Validates daily limit based on active plan
  - Returns error if limit reached

---

## 🔐 File Upload System

### Multer Configuration

**Uploaded Files:**
- Payment proof images (Binance Pay screenshots)
- Checkout completion proof (admin uploads)

**Storage:**
- Location: `Backend/uploads/payments/`
- Filename format: `payment-{userId}-{timestamp}-{random}.{ext}`

**Validation:**
- Allowed types: JPEG, JPG, PNG, GIF, WebP
- Maximum size: 5MB
- Auto-cleanup on errors

**Middleware:**
```javascript
import upload from './middleware/upload.js';

// Single file upload
router.post('/payment', upload.single('proofImage'), handler);
```

---

## 📊 Admin Dashboard Statistics

### GET /api/admin/dashboard

Returns comprehensive stats for admin overview:

```json
{
  "users": {
    "total": 150,
    "active": 120,
    "newToday": 5
  },
  "payments": {
    "pending": 8,
    "active": 45,
    "totalRevenue": 3500
  },
  "checkouts": {
    "pending": 12,
    "processing": 3,
    "totalPayouts": 15000
  },
  "ads": {
    "total": 10,
    "totalClicks": 5000,
    "todayClicks": 250
  }
}
```

---

## 🔄 User Payment Flow

### 1. User Purchases Plan

```
User views plans → Selects plan → Makes payment (Binance/PayPal/etc.)
→ Takes screenshot → Uploads proof → Submits payment
→ Payment status: PENDING
```

**API Call:**
```javascript
POST /api/payments
Content-Type: multipart/form-data

{
  paymentPlan: "plan_id_here",
  amount: 50,
  paymentMethod: "binance",
  transactionId: "TXN123456",
  proofImage: [file]
}
```

### 2. Admin Reviews Payment

```
Admin views pending payments → Checks proof image
→ Verifies transaction → Approves payment
→ Plan automatically activated → User gains increased ad limit
```

**API Call:**
```javascript
PUT /api/payments/{payment_id}/approve

// Response includes:
{
  status: "approved",
  isActive: true,
  expiresAt: "2025-12-11T00:00:00.000Z",
  paymentPlan: {
    name: "Standard",
    dailyAdsLimit: 50
  }
}
```

### 3. User Clicks Ads

```
User loads ads page → Backend checks active plan
→ Returns 50 ads (if Standard plan) instead of 10 (Free plan)
→ User clicks ads (up to daily limit)
→ Earns $0.35 per ad (Standard rate)
```

**API Response:**
```javascript
GET /api/ads

{
  data: [...ads],
  userPlan: {
    name: "Standard",
    dailyLimit: 50,
    remainingAds: 35,
    clickedToday: 15
  }
}
```

### 4. Plan Expires

```
30 days pass → System checks expiration
→ Plan marked as expired → User reverts to Free plan (10 ads)
→ User must purchase new plan to regain access
```

---

## 🔄 Checkout Flow

### 1. User Requests Checkout

```
User has $100 balance → Requests checkout
→ Provides payment method details
→ Checkout status: PENDING
```

**API Call:**
```javascript
POST /api/checkouts

{
  amount: 100,
  paymentMethod: "binance",
  paymentDetails: {
    email: "user@email.com",
    binanceId: "12345678"
  },
  requestNote: "Please process quickly"
}
```

### 2. Admin Processes Checkout

```
Admin sees pending checkout → Marks as PROCESSING
→ Sends payment to user → Uploads proof screenshot
→ Marks as COMPLETED with transaction ID
→ User balance deducted automatically
```

**API Calls:**
```javascript
// Mark processing
PUT /api/checkouts/{id}/processing

// Complete
PUT /api/checkouts/{id}/complete
Content-Type: multipart/form-data

{
  transactionId: "TXN789",
  adminNotes: "Sent via Binance Pay",
  proofImage: [file]
}
```

### 3. Checkout Completed

```
User balance updated → Checkout moved to history
→ User can view transaction ID and proof
```

---

## 🛠️ Seeding Data

### Seed All Data

```bash
# Seed everything
npm run seed:all

# Or individually:
npm run seed:admin      # Admin + demo user
npm run seed:ads        # 10 advertisements
npm run seed:plans      # 5 payment plans
```

### Default Data Created:

**Users:**
- Admin: admin@perbity.com / admin123456
- Demo: demo@example.com / demo123

**Ads:**
- 10 advertisements (Tech Gadgets, Mobile Packages, etc.)

**Payment Plans:**
- Free (10 ads/day, $0.30/ad)
- Basic (20 ads/day, $0.30/ad)
- Standard (50 ads/day, $0.35/ad) ⭐ Popular
- Premium (100 ads/day, $0.40/ad)
- VIP (200 ads/day, $0.50/ad)

---

## 🔐 Security Features

### Authentication
- All endpoints require JWT token
- Admin endpoints require admin role
- File uploads validate file type and size
- Rate limiting on payment/checkout creation

### Authorization
- Users can only view their own payments/checkouts
- Only admins can approve/reject
- Payment proof images require ownership or admin role
- File cleanup on errors

### Validation
- Amount limits enforced ($15-$10,000 for checkouts)
- Plan price verification
- Balance checks before checkout
- Duplicate prevention (one pending payment/checkout at a time)

---

## 📱 Frontend Integration

### Payment Plan Purchase Page

```javascript
import api from './utils/api';

// Get plans
const { data } = await api.get('/payments/plans');

// Submit payment
const formData = new FormData();
formData.append('paymentPlan', selectedPlan._id);
formData.append('amount', selectedPlan.price);
formData.append('paymentMethod', 'binance');
formData.append('transactionId', txnId);
formData.append('proofImage', imageFile);

await api.post('/payments', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Checkout Request Page

```javascript
// Create checkout
await api.post('/checkouts', {
  amount: withdrawAmount,
  paymentMethod: 'binance',
  paymentDetails: {
    email: 'user@email.com',
    binanceId: '12345678'
  },
  requestNote: 'Urgent withdrawal'
});

// View history
const { data } = await api.get('/checkouts/my-checkouts');
```

### Admin Dashboard

```javascript
// Get dashboard stats
const { data } = await api.get('/admin/dashboard');

// Get all users with plans
const { data } = await api.get('/admin/users?page=1&limit=20');

// Approve payment
await api.put(`/payments/${paymentId}/approve`);

// Complete checkout
const formData = new FormData();
formData.append('transactionId', 'TXN123');
formData.append('adminNotes', 'Paid successfully');
formData.append('proofImage', proofFile);

await api.put(`/checkouts/${checkoutId}/complete`, formData);
```

---

## 📂 File Structure

```
Backend/
├── models/
│   ├── PaymentPlan.js      ✨ NEW
│   ├── Payment.js          ✨ NEW
│   └── Checkout.js         ✨ NEW
├── controllers/
│   ├── paymentController.js    ✨ NEW
│   ├── checkoutController.js   ✨ NEW
│   ├── adminController.js      ✨ NEW
│   └── adController.js         🔄 UPDATED (plan-based limits)
├── routes/
│   ├── paymentRoutes.js    ✨ NEW
│   ├── checkoutRoutes.js   ✨ NEW
│   └── adminRoutes.js      ✨ NEW
├── middleware/
│   └── upload.js           ✨ NEW (multer config)
├── scripts/
│   └── seedPaymentPlans.js ✨ NEW
├── uploads/
│   └── payments/           ✨ NEW (created automatically)
└── server.js               🔄 UPDATED (new routes)
```

---

## 🧪 Testing APIs

### Test Payment Submission

```bash
curl -X POST http://localhost:5001/api/payments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "paymentPlan=PLAN_ID" \
  -F "amount=50" \
  -F "paymentMethod=binance" \
  -F "proofImage=@/path/to/screenshot.png"
```

### Test Admin Dashboard

```bash
curl http://localhost:5001/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Test Checkout Request

```bash
curl -X POST http://localhost:5001/api/checkouts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "paymentMethod": "binance",
    "paymentDetails": {
      "email": "user@email.com"
    }
  }'
```

---

## 🚀 Deployment Notes

### Environment Variables
No new environment variables needed. Uses existing:
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Authentication
- `CLIENT_URL` - CORS configuration

### Server Setup
1. Create `uploads/payments` directory with write permissions
2. Ensure sufficient disk space for images (recommend 10GB+)
3. Configure reverse proxy to serve uploaded images
4. Set up automated cleanup for old images (optional)

### Database Indexes
All models include proper indexes:
- Payment: user+status, status+createdAt, isActive+expiresAt
- Checkout: user+status, status+requestedAt
- PaymentPlan: price

---

## 📈 Future Enhancements

Possible additions:
- [ ] Automatic payment verification (webhook integration)
- [ ] Recurring subscriptions
- [ ] Plan upgrades/downgrades
- [ ] Refund system
- [ ] Payment gateway integration (Stripe/PayPal API)
- [ ] Email notifications for payments/checkouts
- [ ] Admin analytics dashboard
- [ ] Bulk approval tools
- [ ] Image compression for uploads
- [ ] CDN integration for image delivery

---

**Last Updated:** November 11, 2025  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
