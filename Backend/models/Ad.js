import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide ad title'],
    trim: true,
    enum: [
      'Tech Gadgets',
      'Mobile Packages',
      'Online Learning',
      'Shopping Deals',
      'Freelance Work',
      'Health Products',
      'Travel Offers',
      'Food Delivery',
      'Entertainment',
      'Home Services'
    ]
  },
  icon: {
    type: String,
    required: true,
    enum: [
      'fa-mobile-screen',
      'fa-sim-card',
      'fa-graduation-cap',
      'fa-bag-shopping',
      'fa-laptop-code',
      'fa-heart-pulse',
      'fa-plane',
      'fa-utensils',
      'fa-film',
      'fa-house-chimney'
    ]
  },
  color: {
    type: String,
    required: true,
    enum: [
      'from-blue-500 to-blue-400',
      'from-green-500 to-green-400',
      'from-yellow-500 to-yellow-400',
      'from-red-500 to-red-400',
      'from-purple-500 to-purple-400',
      'from-pink-500 to-pink-400',
      'from-indigo-500 to-indigo-400',
      'from-orange-500 to-orange-400',
      'from-teal-500 to-teal-400',
      'from-cyan-500 to-cyan-400'
    ]
  },
  earning: {
    type: Number,
    required: true,
    default: 0.3
  },
  description: {
    type: String,
    default: 'Click and earn'
  },
  url: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  requiredLevel: {
    type: Number,
    default: 1
  },
  dailyLimit: {
    type: Number,
    default: 1 // Each ad can be clicked once per day
  },
  totalClicks: {
    type: Number,
    default: 0
  },
  totalEarningsPaid: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
adSchema.index({ isActive: 1, displayOrder: 1 });
adSchema.index({ isPremium: 1 });

const Ad = mongoose.model('Ad', adSchema);

export default Ad;
