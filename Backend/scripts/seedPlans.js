import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PaymentPlan from '../models/PaymentPlan.js';

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

// Investment packages: 3% daily profit, $0.30 per ad
// Formula: dailyAdsLimit = (price * 0.03) / 0.30 = price * 0.1
const plansData = [
  {
    name: '$100 Package',
    price: 100,
    duration: 365, // 1 year
    dailyAdsLimit: 10, // $3 profit / $0.30 per ad = 10 ads
    dailyProfit: 3,
    profitPercentage: 3,
    features: [
      '10 ads per day',
      '$3 daily profit',
      '3% daily return',
      'Basic support',
      'Email notifications'
    ],
    adEarningRate: 0.30,
    isPopular: false,
    isActive: true,
    description: 'Entry level investment'
  },
  {
    name: '$200 Package',
    price: 200,
    duration: 365,
    dailyAdsLimit: 20, // $6 profit / $0.30 per ad = 20 ads
    dailyProfit: 6,
    profitPercentage: 3,
    features: [
      '20 ads per day',
      '$6 daily profit',
      '3% daily return',
      'Priority support',
      'Email notifications',
      'Advanced statistics'
    ],
    adEarningRate: 0.30,
    isPopular: false,
    isActive: true,
    description: 'Double your earnings'
  },
  {
    name: '$300 Package',
    price: 300,
    duration: 365,
    dailyAdsLimit: 30, // $9 profit / $0.30 per ad = 30 ads
    dailyProfit: 9,
    profitPercentage: 3,
    features: [
      '30 ads per day',
      '$9 daily profit',
      '3% daily return',
      'Priority support',
      'Advanced analytics',
      'Referral bonuses'
    ],
    adEarningRate: 0.30,
    isPopular: false,
    isActive: true,
    description: 'Great value package'
  },
  {
    name: '$400 Package',
    price: 400,
    duration: 365,
    dailyAdsLimit: 40, // $12 profit / $0.30 per ad = 40 ads
    dailyProfit: 12,
    profitPercentage: 3,
    features: [
      '40 ads per day',
      '$12 daily profit',
      '3% daily return',
      'VIP support',
      'Advanced analytics',
      'Higher referral bonuses'
    ],
    adEarningRate: 0.30,
    isPopular: true,
    isActive: true,
    description: 'Popular choice'
  },
  {
    name: '$500 Package',
    price: 500,
    duration: 365,
    dailyAdsLimit: 50, // $15 profit / $0.30 per ad = 50 ads
    dailyProfit: 15,
    profitPercentage: 3,
    features: [
      '50 ads per day',
      '$15 daily profit',
      '3% daily return',
      'VIP support',
      'Full analytics suite',
      'Maximum referral bonuses',
      'Instant withdrawals'
    ],
    adEarningRate: 0.30,
    isPopular: false,
    isActive: true,
    description: 'Mid-tier investment'
  },
  {
    name: '$600 Package',
    price: 600,
    duration: 365,
    dailyAdsLimit: 60, // $18 profit / $0.30 per ad = 60 ads
    dailyProfit: 18,
    profitPercentage: 3,
    features: [
      '60 ads per day',
      '$18 daily profit',
      '3% daily return',
      'Dedicated support',
      'Full analytics suite',
      'Maximum earnings potential',
      'Instant withdrawals'
    ],
    adEarningRate: 0.30,
    isPopular: false,
    isActive: true,
    description: 'High returns package'
  },
  {
    name: '$700 Package',
    price: 700,
    duration: 365,
    dailyAdsLimit: 70, // $21 profit / $0.30 per ad = 70 ads
    dailyProfit: 21,
    profitPercentage: 3,
    features: [
      '70 ads per day',
      '$21 daily profit',
      '3% daily return',
      'Dedicated support',
      'All exclusive ads',
      'Premium features',
      'Instant withdrawals'
    ],
    adEarningRate: 0.30,
    isPopular: false,
    isActive: true,
    description: 'Premium investment'
  },
  {
    name: '$800 Package',
    price: 800,
    duration: 365,
    dailyAdsLimit: 80, // $24 profit / $0.30 per ad = 80 ads
    dailyProfit: 24,
    profitPercentage: 3,
    features: [
      '80 ads per day',
      '$24 daily profit',
      '3% daily return',
      'Dedicated account manager',
      'All premium features',
      'Early access to new features',
      'Instant withdrawals'
    ],
    adEarningRate: 0.30,
    isPopular: false,
    isActive: true,
    description: 'Elite investment tier'
  },
  {
    name: '$900 Package',
    price: 900,
    duration: 365,
    dailyAdsLimit: 90, // $27 profit / $0.30 per ad = 90 ads
    dailyProfit: 27,
    profitPercentage: 3,
    features: [
      '90 ads per day',
      '$27 daily profit',
      '3% daily return',
      'Dedicated account manager',
      'VIP treatment',
      'All premium features',
      'Priority withdrawals'
    ],
    adEarningRate: 0.30,
    isPopular: false,
    isActive: true,
    description: 'Near maximum returns'
  },
  {
    name: '$1000 Package',
    price: 1000,
    duration: 365,
    dailyAdsLimit: 100, // $30 profit / $0.30 per ad = 100 ads
    dailyProfit: 30,
    profitPercentage: 3,
    features: [
      '100 ads per day',
      '$30 daily profit',
      '3% daily return',
      'Dedicated account manager',
      'VIP treatment',
      'Maximum earnings potential',
      'All premium features',
      'Priority withdrawals',
      'Exclusive benefits'
    ],
    adEarningRate: 0.30,
    isPopular: false,
    isActive: true,
    description: 'Maximum investment package'
  }
];

const seedPlans = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing plans
    await PaymentPlan.deleteMany({});
    console.log('Cleared existing payment plans');
    
    // Insert new plans
    const plans = await PaymentPlan.insertMany(plansData);
    console.log(`\n✅ ${plans.length} payment plans inserted successfully!\n`);
    
    // Display inserted plans
    console.log('📋 Payment Plans:');
    console.log('━'.repeat(80));
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name.padEnd(15)} - $${plan.price.toString().padEnd(6)} - ${plan.dailyAdsLimit} ads/day`);
      console.log(`   Duration: ${plan.duration} days`);
      console.log(`   Features: ${plan.features.length} included`);
      console.log(`   Popular: ${plan.isPopular ? 'Yes' : 'No'}`);
      console.log('━'.repeat(80));
    });
    
    console.log('\n✅ Payment plans seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding payment plans:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedPlans();
