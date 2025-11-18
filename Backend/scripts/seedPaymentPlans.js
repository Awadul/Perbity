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
const paymentPlansData = [
  {
    name: '$50 Investment',
    price: 50,
    duration: 30,
    dailyAdsLimit: 1,
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
    dailyAdsLimit: 10,
    dailyProfit: 3,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      'Withdraw anytime 24/7',
      'Bonus rewards on deposits',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$100 investment package'
  },
  {
    name: '$200 Investment',
    price: 200,
    duration: 30,
    dailyAdsLimit: 20,
    dailyProfit: 6,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      'Withdraw anytime 24/7',
      'Bonus rewards on deposits',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$200 investment package'
  },
  {
    name: '$300 Investment',
    price: 300,
    duration: 30,
    dailyAdsLimit: 30,
    dailyProfit: 9,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      'Withdraw anytime 24/7',
      'Bonus rewards on deposits',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$300 investment package'
  },
  {
    name: '$400 Investment',
    price: 400,
    duration: 30,
    dailyAdsLimit: 40,
    dailyProfit: 12,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      'Withdraw anytime 24/7',
      'Bonus rewards on deposits',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$400 investment package'
  },
  {
    name: '$500 Investment',
    price: 500,
    duration: 30,
    dailyAdsLimit: 50,
    dailyProfit: 15,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      'Withdraw anytime 24/7',
      'Bonus rewards on deposits',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: true,
    isActive: true,
    description: '$500 investment package - Most Popular'
  },
  {
    name: '$600 Investment',
    price: 600,
    duration: 30,
    dailyAdsLimit: 60,
    dailyProfit: 18,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      'Withdraw anytime 24/7',
      'Bonus rewards on deposits',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$600 investment package'
  },
  {
    name: '$700 Investment',
    price: 700,
    duration: 30,
    dailyAdsLimit: 70,
    dailyProfit: 21,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      'Withdraw anytime 24/7',
      'Bonus rewards on deposits',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$700 investment package'
  },
  {
    name: '$800 Investment',
    price: 800,
    duration: 30,
    dailyAdsLimit: 80,
    dailyProfit: 24,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      'Withdraw anytime 24/7',
      'Bonus rewards on deposits',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$800 investment package'
  },
  {
    name: '$900 Investment',
    price: 900,
    duration: 30,
    dailyAdsLimit: 90,
    dailyProfit: 27,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      'Withdraw anytime 24/7',
      'Bonus rewards on deposits',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$900 investment package'
  },
  {
    name: '$1000 Investment',
    price: 1000,
    duration: 30,
    dailyAdsLimit: 100,
    dailyProfit: 30,
    profitPercentage: 3,
    features: [
      '3% daily guaranteed return',
      'Instant activation after payment',
      'Withdraw anytime 24/7',
      'Bonus rewards on deposits',
      'Real-time profit tracking'
    ],
    adEarningRate: 1.0,
    isPopular: false,
    isActive: true,
    description: '$1000 investment package'
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
