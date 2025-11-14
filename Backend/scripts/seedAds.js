import mongoose from 'mongoose';
import Ad from '../models/Ad.js';
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

// Common ads available on the internet
const commonAdsTemplate = [
  {
    title: 'Tech Gadgets',
    icon: 'fa-mobile-screen',
    color: 'from-blue-500 to-blue-400',
    earning: 1.00,
    description: 'Latest smartphones, tablets and gadgets. Shop now!',
    url: 'https://www.amazon.com/electronics',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Mobile Packages',
    icon: 'fa-sim-card',
    color: 'from-green-500 to-green-400',
    earning: 1.00,
    description: 'Best mobile plans and packages. Get connected today!',
    url: 'https://www.t-mobile.com',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Online Learning',
    icon: 'fa-graduation-cap',
    color: 'from-yellow-500 to-yellow-400',
    earning: 1.00,
    description: 'Learn new skills with thousands of courses online',
    url: 'https://www.coursera.org',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Shopping Deals',
    icon: 'fa-bag-shopping',
    color: 'from-red-500 to-red-400',
    earning: 1.00,
    description: 'Amazing deals on clothing, electronics and more!',
    url: 'https://www.ebay.com',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Freelance Work',
    icon: 'fa-laptop-code',
    color: 'from-purple-500 to-purple-400',
    earning: 1.00,
    description: 'Find freelance jobs and start earning today',
    url: 'https://www.upwork.com',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Health Products',
    icon: 'fa-heart-pulse',
    color: 'from-pink-500 to-pink-400',
    earning: 1.00,
    description: 'Quality health and wellness products for you',
    url: 'https://www.iherb.com',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Travel Offers',
    icon: 'fa-plane',
    color: 'from-indigo-500 to-indigo-400',
    earning: 1.00,
    description: 'Book flights, hotels and travel packages',
    url: 'https://www.booking.com',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Food Delivery',
    icon: 'fa-utensils',
    color: 'from-orange-500 to-orange-400',
    earning: 1.00,
    description: 'Order food from your favorite restaurants',
    url: 'https://www.ubereats.com',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Entertainment',
    icon: 'fa-film',
    color: 'from-teal-500 to-teal-400',
    earning: 1.00,
    description: 'Stream movies, TV shows and music',
    url: 'https://www.netflix.com',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Home Services',
    icon: 'fa-house-chimney',
    color: 'from-cyan-500 to-cyan-400',
    earning: 1.00,
    description: 'Professional services for your home needs',
    url: 'https://www.taskrabbit.com',
    isActive: true,
    isPremium: false
  }
];

const seedAds = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing ads
    await Ad.deleteMany({});
    console.log('Cleared existing ads');
    
    // Create multiple copies of each ad (20 copies = 200 total ads)
    const allAds = [];
    const copies = 20; // Number of times to repeat each ad
    
    for (let i = 0; i < copies; i++) {
      commonAdsTemplate.forEach((ad, index) => {
        allAds.push({
          ...ad,
          displayOrder: (i * 10) + index + 1
        });
      });
    }
    
    // Insert all ads
    const ads = await Ad.insertMany(allAds);
    console.log(`\n✅ ${ads.length} ads inserted successfully!`);
    
    // Display summary
    console.log('\n📊 Ads Summary:');
    console.log(`   - Unique ad types: ${commonAdsTemplate.length}`);
    console.log(`   - Copies per type: ${copies}`);
    console.log(`   - Total ads: ${ads.length}`);
    console.log(`   - Earning per ad: $${commonAdsTemplate[0].earning}`);
    console.log('\n📋 Ad Types:');
    commonAdsTemplate.forEach((ad, index) => {
      console.log(`   ${index + 1}. ${ad.title} (${copies} copies)`);
    });
    
    console.log('\n✅ Ads seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding ads:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedAds();
