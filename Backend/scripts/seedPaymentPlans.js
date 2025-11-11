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

// Payment plans data
const paymentPlansData = [
  {
    name: 'Free',
    price: 0,
    duration: 365, // 1 year
    dailyAdsLimit: 10,
    features: [
      '10 ads per day',
      '$0.3 per ad',
      'Basic referral system',
      'Standard withdrawal',
      'Email support'
    ],
    adEarningRate: 0.3,
    isPopular: false,
    isActive: true,
    description: 'Free plan with basic features'
  },
  {
    name: 'Basic',
    price: 20,
    duration: 30,
    dailyAdsLimit: 20,
    features: [
      '20 ads per day',
      '$0.3 per ad',
      'Enhanced referral bonuses',
      'Priority support',
      'Faster withdrawals (24h)'
    ],
    adEarningRate: 0.3,
    isPopular: false,
    isActive: true,
    description: 'Double your daily ad limit'
  },
  {
    name: 'Standard',
    price: 50,
    duration: 30,
    dailyAdsLimit: 50,
    features: [
      '50 ads per day',
      '$0.35 per ad',
      'Premium referral bonuses',
      'Priority support',
      'Fast withdrawals (12h)',
      'Exclusive ads access'
    ],
    adEarningRate: 0.35,
    isPopular: true,
    isActive: true,
    description: 'Most popular plan for serious earners'
  },
  {
    name: 'Premium',
    price: 100,
    duration: 30,
    dailyAdsLimit: 100,
    features: [
      '100 ads per day',
      '$0.4 per ad',
      'Maximum referral bonuses',
      'VIP support',
      'Instant withdrawals',
      'Exclusive premium ads',
      'Early access to new features'
    ],
    adEarningRate: 0.4,
    isPopular: false,
    isActive: true,
    description: 'Maximum earning potential'
  },
  {
    name: 'VIP',
    price: 200,
    duration: 30,
    dailyAdsLimit: 200,
    features: [
      '200 ads per day',
      '$0.5 per ad',
      'Ultimate referral bonuses',
      'Dedicated account manager',
      'Instant withdrawals',
      'All premium ads',
      'First access to beta features',
      'Custom dashboard',
      'API access'
    ],
    adEarningRate: 0.5,
    isPopular: false,
    isActive: true,
    description: 'Ultimate VIP experience'
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
