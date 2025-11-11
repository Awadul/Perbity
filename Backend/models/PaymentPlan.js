import mongoose from 'mongoose';

const paymentPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide plan name'],
    enum: ['Free', 'Basic', 'Standard', 'Premium', 'VIP'],
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide plan price'],
    default: 0
  },
  duration: {
    type: Number, // Duration in days
    required: true,
    default: 30
  },
  dailyAdsLimit: {
    type: Number,
    required: [true, 'Please provide daily ads limit'],
    default: 10
  },
  features: [{
    type: String
  }],
  adEarningRate: {
    type: Number,
    default: 0.3 // Earning per ad click
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Virtual for monthly price
paymentPlanSchema.virtual('monthlyPrice').get(function() {
  return this.duration === 30 ? this.price : (this.price * 30 / this.duration).toFixed(2);
});

// Static method to get all active plans
paymentPlanSchema.statics.getActivePlans = async function() {
  return await this.find({ isActive: true }).sort({ price: 1 });
};

const PaymentPlan = mongoose.model('PaymentPlan', paymentPlanSchema);

export default PaymentPlan;
