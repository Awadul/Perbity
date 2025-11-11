import mongoose from 'mongoose';

const adClickSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: true
  },
  earning: {
    type: Number,
    required: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  clickDate: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  clickDuration: {
    type: Number, // Time spent on ad page in seconds
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for checking if click is from today
adClickSchema.virtual('isToday').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.clickDate >= today;
});

// Static method to check if user clicked ad today
adClickSchema.statics.hasClickedToday = async function(userId, adId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const click = await this.findOne({
    user: userId,
    ad: adId,
    clickDate: { $gte: today }
  });
  
  return !!click;
};

// Static method to get today's clicks count for user
adClickSchema.statics.getTodayClicksCount = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return await this.countDocuments({
    user: userId,
    clickDate: { $gte: today }
  });
};

// Index for faster queries
adClickSchema.index({ user: 1, ad: 1, clickDate: -1 });
adClickSchema.index({ user: 1, clickDate: -1 });
adClickSchema.index({ clickDate: -1 });
adClickSchema.index({ isVerified: 1 });

const AdClick = mongoose.model('AdClick', adClickSchema);

export default AdClick;
