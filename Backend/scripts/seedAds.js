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

// Ads data from frontend
const adsData = [
  {
    title: 'Tech Gadgets',
    icon: 'fa-mobile-screen',
    color: 'from-blue-500 to-blue-400',
    earning: 0.3,
    displayOrder: 1,
    description: 'Watch tech gadget advertisements and earn',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Mobile Packages',
    icon: 'fa-sim-card',
    color: 'from-green-500 to-green-400',
    earning: 0.3,
    displayOrder: 2,
    description: 'Explore mobile package deals',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Online Learning',
    icon: 'fa-graduation-cap',
    color: 'from-yellow-500 to-yellow-400',
    earning: 0.3,
    displayOrder: 3,
    description: 'Discover online learning opportunities',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Shopping Deals',
    icon: 'fa-bag-shopping',
    color: 'from-red-500 to-red-400',
    earning: 0.3,
    displayOrder: 4,
    description: 'Find amazing shopping deals',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Freelance Work',
    icon: 'fa-laptop-code',
    color: 'from-purple-500 to-purple-400',
    earning: 0.3,
    displayOrder: 5,
    description: 'Explore freelance work opportunities',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Health Products',
    icon: 'fa-heart-pulse',
    color: 'from-pink-500 to-pink-400',
    earning: 0.3,
    displayOrder: 6,
    description: 'Discover health and wellness products',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Travel Offers',
    icon: 'fa-plane',
    color: 'from-indigo-500 to-indigo-400',
    earning: 0.3,
    displayOrder: 7,
    description: 'Explore exciting travel offers',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Food Delivery',
    icon: 'fa-utensils',
    color: 'from-orange-500 to-orange-400',
    earning: 0.3,
    displayOrder: 8,
    description: 'Check out food delivery services',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Entertainment',
    icon: 'fa-film',
    color: 'from-teal-500 to-teal-400',
    earning: 0.3,
    displayOrder: 9,
    description: 'Discover entertainment options',
    isActive: true,
    isPremium: false
  },
  {
    title: 'Home Services',
    icon: 'fa-house-chimney',
    color: 'from-cyan-500 to-cyan-400',
    earning: 0.3,
    displayOrder: 10,
    description: 'Find home service providers',
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
    
    // Insert new ads
    const ads = await Ad.insertMany(adsData);
    console.log(`${ads.length} ads inserted successfully`);
    
    // Display inserted ads
    ads.forEach((ad, index) => {
      console.log(`${index + 1}. ${ad.title} - $${ad.earning} - ${ad.color}`);
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
