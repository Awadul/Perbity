import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // Balance & Earnings
  balance: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalDeposits: {
    type: Number,
    default: 0
  },
  
  // Earnings by Category
  earnings: {
    ads: {
      type: Number,
      default: 0
    },
    referrals: {
      type: Number,
      default: 0
    },
    emails: {
      type: Number,
      default: 0
    },
    reviews: {
      type: Number,
      default: 0
    },
    investments: {
      type: Number,
      default: 0
    }
  },
  
  // Earnings Tracking (Time-based)
  earningsToday: {
    type: Number,
    default: 0
  },
  earningsThisWeek: {
    type: Number,
    default: 0
  },
  earningsThisMonth: {
    type: Number,
    default: 0
  },
  lastEarningResetDate: {
    type: Date,
    default: Date.now
  },
  
  // Ads Progress
  adsCompleted: {
    type: Number,
    default: 0
  },
  adsCompletedToday: {
    type: Number,
    default: 0
  },
  maxDailyAds: {
    type: Number,
    default: 10
  },
  lastAdClickDate: {
    type: Date,
    default: null
  },
  lastAdPackageUpdate: {
    type: Date,
    default: null
  },
  
  // Level System
  level: {
    type: Number,
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  },
  nextLevelAt: {
    type: Number,
    default: 100
  },
  
  // Referral System
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralCount: {
    type: Number,
    default: 0
  },
  activeReferrals: {
    type: Number,
    default: 0
  },
  referralEarningsTotal: {
    type: Number,
    default: 0
  },
  
  // Team Structure
  team: {
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      isActive: {
        type: Boolean,
        default: true
      },
      totalEarnings: {
        type: Number,
        default: 0
      }
    }],
    totalMembers: {
      type: Number,
      default: 0
    },
    activeMembers: {
      type: Number,
      default: 0
    },
    teamEarnings: {
      type: Number,
      default: 0
    }
  },
  
  // Investment Tracking
  totalInvested: {
    type: Number,
    default: 0
  },
  activeInvestments: {
    type: Number,
    default: 0
  },
  investmentProfit: {
    type: Number,
    default: 0
  },
  
  // Withdrawal Tracking
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  pendingWithdrawals: {
    type: Number,
    default: 0
  },
  withdrawalCount: {
    type: Number,
    default: 0
  },
  
  // Feature Unlocks
  unlockedFeatures: {
    emails: {
      type: Boolean,
      default: false
    },
    reviews: {
      type: Boolean,
      default: false
    },
    premiumAds: {
      type: Boolean,
      default: false
    },
    instantWithdrawal: {
      type: Boolean,
      default: false
    }
  },
  
  // Progress to unlock features
  unlockProgress: {
    emailsRequirement: {
      type: Number,
      default: 10 // Earn $10 to unlock
    },
    reviewsRequirement: {
      type: Number,
      default: 10 // 10 referrals to unlock
    }
  },
  
  // User Status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: null
  },
  
  // Account Info
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  
  // Activity Tracking
  lastLogin: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  
  // Security
  refreshToken: {
    type: String,
    select: false
  },
  passwordChangedAt: {
    type: Date,
    default: null
  },
  
  // Notifications & Preferences
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    referralUpdates: {
      type: Boolean,
      default: true
    },
    withdrawalUpdates: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total balance including all earnings
userSchema.virtual('currentBalance').get(function() {
  return this.balance + this.earnings.ads + this.earnings.referrals + 
         this.earnings.emails + this.earnings.reviews + this.earnings.investments;
});

// Virtual for referral link
userSchema.virtual('referralLink').get(function() {
  return `${process.env.CLIENT_URL}/signup?ref=${this.referralCode}`;
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Set password changed timestamp
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

// Generate referral code before saving
userSchema.pre('save', async function(next) {
  if (!this.referralCode && this.isNew) {
    // Generate unique referral code using user ID
    this.referralCode = this._id.toString().substring(0, 8).toUpperCase();
  }
  next();
});

// Update team stats before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('team.members')) {
    this.team.totalMembers = this.team.members.length;
    this.team.activeMembers = this.team.members.filter(m => m.isActive).length;
  }
  next();
});

// Reset daily stats at midnight
userSchema.methods.resetDailyStats = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastReset = new Date(this.lastEarningResetDate);
  lastReset.setHours(0, 0, 0, 0);
  
  if (today > lastReset) {
    this.earningsToday = 0;
    this.adsCompletedToday = 0;
    this.lastEarningResetDate = Date.now();
  }
};

// Check if emails feature is unlocked
userSchema.methods.checkEmailsUnlock = function() {
  if (!this.unlockedFeatures.emails && this.totalEarnings >= this.unlockProgress.emailsRequirement) {
    this.unlockedFeatures.emails = true;
    return true;
  }
  return this.unlockedFeatures.emails;
};

// Check if reviews feature is unlocked
userSchema.methods.checkReviewsUnlock = function() {
  if (!this.unlockedFeatures.reviews && this.referralCount >= this.unlockProgress.reviewsRequirement) {
    this.unlockedFeatures.reviews = true;
    return true;
  }
  return this.unlockedFeatures.reviews;
};

// Add earnings and update totals
userSchema.methods.addEarnings = function(amount, category = 'ads') {
  this.earnings[category] += amount;
  this.balance += amount;
  this.totalEarnings += amount;
  this.earningsToday += amount;
  this.earningsThisWeek += amount;
  this.earningsThisMonth += amount;
  
  // Add experience points
  this.experience += Math.floor(amount * 10);
  
  // Check level up
  if (this.experience >= this.nextLevelAt) {
    this.level += 1;
    this.nextLevelAt = Math.floor(this.nextLevelAt * 1.5);
  }
  
  // Check feature unlocks
  this.checkEmailsUnlock();
  this.checkReviewsUnlock();
};

// Add team member
userSchema.methods.addTeamMember = async function(memberId) {
  const existingMember = this.team.members.find(
    m => m.user.toString() === memberId.toString()
  );
  
  if (!existingMember) {
    this.team.members.push({
      user: memberId,
      joinedAt: Date.now(),
      isActive: true,
      totalEarnings: 0
    });
    this.referralCount += 1;
    this.activeReferrals += 1;
  }
};

// Update team earnings
userSchema.methods.updateTeamEarnings = function(amount, memberId) {
  const member = this.team.members.find(
    m => m.user.toString() === memberId.toString()
  );
  
  if (member) {
    member.totalEarnings += amount;
    this.team.teamEarnings += amount;
  }
};

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Generate refresh token
userSchema.methods.getRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );
};

// Check if user changed password after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Create indexes for better query performance
// Note: email and referralCode already have unique indexes from schema definition
userSchema.index({ referredBy: 1 });
userSchema.index({ 'team.members.user': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ totalEarnings: -1 });
userSchema.index({ role: 1, isActive: 1 });

const User = mongoose.model('User', userSchema);

export default User;
