import mongoose from 'mongoose';
import PaymentPlan from '../models/PaymentPlan.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Payment plans data - matching the frontend BuyPlan.jsx
// Formula: For every $100 invested, user gets 3 ads ($1 per ad)
const paymentPlansData = [
  {
    name: '$50 Investment',
    price: 50,
    duration: 30,
    dailyAdsLimit: 1, // Special case: $50 gets 1 ad
    dailyProfit: 1.5,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      '1 ad viewing credit included',
      'Withdraw anytime 24/7',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$50 investment with 1 ad credit bonus'
  },
  {
    name: '$100 Investment',
    price: 100,
    duration: 30,
    dailyAdsLimit: 3, // $100 / 100 * 3 = 3 ads
    dailyProfit: 3,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      '3 ads at $1 each',
      'Withdraw anytime 24/7',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$100 investment - 3 ads at $1 each'
  },
  {
    name: '$200 Investment',
    price: 200,
    duration: 30,
    dailyAdsLimit: 6, // $200 / 100 * 3 = 6 ads
    dailyProfit: 6,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      '6 ads at $1 each',
      'Withdraw anytime 24/7',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$200 investment - 6 ads at $1 each'
  },
  {
    name: '$300 Investment',
    price: 300,
    duration: 30,
    dailyAdsLimit: 9, // $300 / 100 * 3 = 9 ads
    dailyProfit: 9,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      '9 ads at $1 each',
      'Withdraw anytime 24/7',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$300 investment - 9 ads at $1 each'
  },
  {
    name: '$400 Investment',
    price: 400,
    duration: 30,
    dailyAdsLimit: 12, // $400 / 100 * 3 = 12 ads
    dailyProfit: 12,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      '12 ads at $1 each',
      'Withdraw anytime 24/7',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$400 investment - 12 ads at $1 each'
  },
  {
    name: '$500 Investment',
    price: 500,
    duration: 30,
    dailyAdsLimit: 15, // $500 / 100 * 3 = 15 ads
    dailyProfit: 15,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      '15 ads at $1 each',
      'Withdraw anytime 24/7',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: true,
    isActive: true,
    description: '$500 investment - 15 ads at $1 each'
  },
  {
    name: '$600 Investment',
    price: 600,
    duration: 30,
    dailyAdsLimit: 18, // $600 / 100 * 3 = 18 ads
    dailyProfit: 18,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      '18 ads at $1 each',
      'Withdraw anytime 24/7',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$600 investment - 18 ads at $1 each'
  },
  {
    name: '$700 Investment',
    price: 700,
    duration: 30,
    dailyAdsLimit: 21, // $700 / 100 * 3 = 21 ads
    dailyProfit: 21,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      '21 ads at $1 each',
      'Withdraw anytime 24/7',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$700 investment - 21 ads at $1 each'
  },
  {
    name: '$800 Investment',
    price: 800,
    duration: 30,
    dailyAdsLimit: 24, // $800 / 100 * 3 = 24 ads
    dailyProfit: 24,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      '24 ads at $1 each',
      'Withdraw anytime 24/7',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$800 investment - 24 ads at $1 each'
  },
  {
    name: '$900 Investment',
    price: 900,
    duration: 30,
    dailyAdsLimit: 27, // $900 / 100 * 3 = 27 ads
    dailyProfit: 27,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      '27 ads at $1 each',
      'Withdraw anytime 24/7',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$900 investment - 27 ads at $1 each'
  },
  {
    name: '$1000 Investment',
    price: 1000,
    duration: 30,
    dailyAdsLimit: 30, // $1000 / 100 * 3 = 30 ads
    dailyProfit: 30,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      '30 ads at $1 each',
      'Withdraw anytime 24/7',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$1000 investment - 30 ads at $1 each'
  }
];

const seedPaymentPlans = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing payment plans
    await PaymentPlan.deleteMany({});
    console.log('Cleared existing payment plans');
    
    // Insert new payment plans
    const plans = await PaymentPlan.insertMany(paymentPlansData);
    console.log(`${plans.length} payment plans inserted successfully\n`);
    
    // Display inserted plans
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name} - $${plan.price}/month`);
      console.log(`   Daily Ads: ${plan.dailyAdsLimit} ads`);
      console.log(`   Earning: $${plan.adEarningRate} per ad`);
      console.log(`   Max Daily: $${(plan.dailyAdsLimit * plan.adEarningRate).toFixed(2)}`);
      console.log(`   Features: ${plan.features.length} features`);
      if (plan.isPopular) console.log(`   ⭐ POPULAR`);
      console.log('');
    });
    
    console.log('✅ Payment plans seeding completed successfully!');
    
    // Calculate potential earnings
    console.log('\n📊 Earning Potential (30 days):');
    plans.forEach(plan => {
      const dailyEarning = plan.dailyAdsLimit * plan.adEarningRate;
      const monthlyEarning = dailyEarning * 30;
      const profit = monthlyEarning - plan.price;
      const roi = plan.price > 0 ? ((profit / plan.price) * 100).toFixed(0) : 0;
      
      console.log(`${plan.name}: $${monthlyEarning.toFixed(2)}/month | Profit: $${profit.toFixed(2)} | ROI: ${roi}%`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding payment plans:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedPaymentPlans();
