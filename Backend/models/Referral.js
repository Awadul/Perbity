import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  earning: {
    type: Number,
    default: 1.5
  },
  bonusEarning: {
    type: Number,
    default: 0
  },
  totalEarning: {
    type: Number,
    default: 1.5
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'paid', 'cancelled'],
    default: 'pending'
  },
  level: {
    type: Number,
    default: 1 // Level 1 = direct referral, Level 2 = referral's referral, etc.
  },
  isActive: {
    type: Boolean,
    default: true
  },
  referredUserActivity: {
    lastLogin: {
      type: Date,
      default: null
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Virtual for referral age
referralSchema.virtual('ageInDays').get(function() {
  const age = Date.now() - this.createdAt;
  return Math.floor(age / (1000 * 60 * 60 * 24));
});

// Calculate total earning before saving
referralSchema.pre('save', function(next) {
  this.totalEarning = this.earning + this.bonusEarning;
  next();
});

// Method to confirm referral
referralSchema.methods.confirm = function() {
  if (this.status === 'pending') {
    this.status = 'confirmed';
    this.confirmedAt = Date.now();
    return true;
  }
  return false;
};

// Method to mark as paid
referralSchema.methods.markAsPaid = function() {
  if (this.status === 'confirmed') {
    this.status = 'paid';
    this.paidAt = Date.now();
    return true;
  }
  return false;
};

// Static method to get referral stats
referralSchema.statics.getReferralStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { referrer: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalEarnings: { $sum: '$totalEarning' }
      }
    }
  ]);
  
  return stats;
};

// Static method to get active referrals count
referralSchema.statics.getActiveReferralsCount = async function(userId) {
  return await this.countDocuments({
    referrer: userId,
    isActive: true,
    'referredUserActivity.isActive': true
  });
};

// Index for faster queries
referralSchema.index({ referrer: 1, referred: 1 }, { unique: true });
referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referrer: 1, isActive: 1 });
referralSchema.index({ referred: 1 });
referralSchema.index({ createdAt: -1 });

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;
