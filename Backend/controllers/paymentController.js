import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import PaymentPlan from '../models/PaymentPlan.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import path from 'path';
import fs from 'fs';

// @desc    Get all payment plans
// @route   GET /api/payments/plans
// @access  Public
export const getPaymentPlans = async (req, res, next) => {
  try {
    const plans = await PaymentPlan.getActivePlans();
    
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit payment with proof image
// @route   POST /api/payments
// @access  Private
export const submitPayment = async (req, res, next) => {
  try {
    const { paymentPlan, planId, amount, paymentMethod, transactionId, accountName, note } = req.body;
    
    // Check if file was uploaded
    if (!req.file) {
      return next(new ErrorResponse('Please upload payment proof image', 400));
    }
    
    // Handle both old format (paymentPlan) and new format (planId)
    let plan = null;
    let planIdToUse = paymentPlan || planId;
    
    // If planId is provided and not 'custom', try to find the plan by ID
    if (planIdToUse && planIdToUse !== 'custom') {
      plan = await PaymentPlan.findById(planIdToUse);
      if (!plan) {
        // Delete uploaded file
        fs.unlinkSync(req.file.path);
        return next(new ErrorResponse('Payment plan not found', 404));
      }
      
      // Verify amount matches plan price
      if (parseFloat(amount) !== plan.price) {
        // Delete uploaded file
        fs.unlinkSync(req.file.path);
        return next(new ErrorResponse(`Amount must be $${plan.price} for ${plan.name} plan`, 400));
      }
    } else {
      // For 'custom' or no planId, try to find a matching plan by amount
      if (!amount || parseFloat(amount) <= 0) {
        fs.unlinkSync(req.file.path);
        return next(new ErrorResponse('Valid amount is required', 400));
      }
      
      // Look for a PaymentPlan matching the exact amount
      plan = await PaymentPlan.findOne({ price: parseFloat(amount), isActive: true });
      
      if (plan) {
        console.log(`✅ Found matching PaymentPlan for $${amount}: ${plan.name} (${plan.dailyAdsLimit} ads/day)`);
      } else {
        console.log(`⚠️ No PaymentPlan found for $${amount}, will use custom plan logic`);
      }
    }
    
    // Check if user already has an active payment
    const activePayment = await Payment.findOne({
      user: req.user._id,
      isActive: true,
      status: 'approved'
    });
    
    if (activePayment) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return next(new ErrorResponse('You already have an active payment plan', 400));
    }
    
    // Check if user has a pending payment
    const pendingPayment = await Payment.findOne({
      user: req.user._id,
      status: 'pending'
    });
    
    if (pendingPayment) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return next(new ErrorResponse('You already have a pending payment waiting for approval', 400));
    }
    
    // Create payment data
    const paymentData = {
      user: req.user._id,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'binance',
      proofImage: req.file.path,
      transactionId: transactionId || null,
      accountName: accountName || null,
      adminNotes: note || null
    };
    
    // Only add paymentPlan if we have a valid plan
    if (plan) {
      paymentData.paymentPlan = plan._id;
    }
    
    // Create payment
    const payment = await Payment.create(paymentData);
    
    // Populate plan details if exists
    if (payment.paymentPlan) {
      await payment.populate('paymentPlan');
    }
    
    res.status(201).json({
      success: true,
      message: 'Payment submitted successfully. Waiting for admin approval.',
      data: payment
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get user payments
// @route   GET /api/payments/my-payments
// @access  Private
export const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('paymentPlan')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active payment plan
// @route   GET /api/payments/active
// @access  Private
export const getActivePayment = async (req, res, next) => {
  try {
    const activePayment = await Payment.findOne({
      user: req.user._id,
      isActive: true,
      status: 'approved'
    }).populate('paymentPlan');
    
    // Check if payment expired
    if (activePayment) {
      activePayment.checkExpiration();
      await activePayment.save();
    }
    
    res.status(200).json({
      success: true,
      data: activePayment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments/admin/all
// @access  Private/Admin
export const getAllPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const payments = await Payment.find(query)
      .populate('user', 'name email phone')
      .populate('paymentPlan')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Payment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: payments.length,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: page,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve payment (Admin)
// @route   PUT /api/payments/:id/approve
// @access  Private/Admin
export const approvePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('paymentPlan');
    
    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }
    
    if (payment.status !== 'pending') {
      return next(new ErrorResponse(`Cannot approve payment with status: ${payment.status}`, 400));
    }
    
    console.log(`💰 Processing payment approval for payment ID: ${payment._id}`);
    console.log(`👤 User ID: ${payment.user}`);
    console.log(`📦 Payment Plan ID: ${payment.paymentPlan || 'None (Custom Plan)'}`);
    console.log(`💵 Amount: $${payment.amount}`);
    
    // Get user
    const user = await User.findById(payment.user);
    
    if (!user) {
      console.error(`❌ User not found for payment ${payment._id}`);
      return next(new ErrorResponse('User not found', 404));
    }
    
    // Deactivate any other active payments for this user (same as assignPackage)
    await Payment.updateMany(
      { user: payment.user, isActive: true },
      { isActive: false, status: 'expired' }
    );
    
    // Approve and activate the payment (same as assignPackage does with Payment.create)
    payment.status = 'approved';
    payment.isActive = true;
    payment.approvedBy = req.user._id;
    payment.approvedAt = new Date();
    payment.activatedAt = new Date();
    
    // Set expiration date if plan exists
    if (payment.paymentPlan) {
      const plan = payment.paymentPlan;
      payment.expiresAt = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
      
      console.log(`📦 PaymentPlan found: ${plan.name}`);
      
      // Update user's package benefits - activate plan only
      user.maxDailyAds = plan.dailyAdsLimit || 10;
      user.lastAdPackageUpdate = new Date();
      
      // Update totalDeposits (track investment amount)
      if (typeof user.totalDeposits === 'undefined') {
        user.totalDeposits = 0;
      }
      user.totalDeposits += payment.amount;
      
      // DO NOT add balance - user earns balance by watching ads only
      
      await payment.save();
      await user.save();
      
      console.log(`✅ Package activated successfully!`);
      console.log(`   User: ${user.name} (${user.email})`);
      console.log(`   Plan: ${plan.name}`);
      console.log(`   Daily Ads Limit: ${user.maxDailyAds}`);
      console.log(`   Balance: $${user.balance.toFixed(2)} (unchanged - earnings from ads only)`);
      console.log(`   Total Deposits: $${user.totalDeposits.toFixed(2)}`);
    } else {
      // Custom plan without PaymentPlan reference
      // Set expiration to 1 year for custom plans
      payment.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      
      console.log(`📦 Custom Plan (No PaymentPlan document)`);
      
      // For custom plans, calculate ads based on formula: 3 ads per $100
      // Formula: (amount / 100) * 3
      const defaultAdsLimit = Math.floor((payment.amount / 100) * 3);
      
      console.log(`   Amount: $${payment.amount}`);
      console.log(`   Calculated Ads: ${defaultAdsLimit} (formula: ${payment.amount}/100 * 3)`);
      
      // Update user's package benefits - activate plan only
      user.maxDailyAds = defaultAdsLimit;
      user.lastAdPackageUpdate = new Date();
      
      // Update totalDeposits (track investment amount)
      if (typeof user.totalDeposits === 'undefined') {
        user.totalDeposits = 0;
      }
      user.totalDeposits += payment.amount;
      
      // DO NOT add balance - user earns balance by watching ads only
      
      await payment.save();
      await user.save();
      
      console.log(`✅ Custom package activated successfully!`);
      console.log(`   User: ${user.name} (${user.email})`);
      console.log(`   Amount: $${payment.amount}`);
      console.log(`   Daily Ads Limit: ${user.maxDailyAds}`);
      console.log(`   Balance: $${user.balance.toFixed(2)} (unchanged - earnings from ads only)`);
      console.log(`   Total Deposits: $${user.totalDeposits.toFixed(2)}`);
    }
    
    // Referral Reward System: Give referrer $10 for every $100 package purchase
    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        // Calculate referral reward: $10 for every $100
        const referralReward = Math.floor(payment.amount / 100) * 10;
        
        if (referralReward > 0) {
          referrer.balance += referralReward;
          referrer.earnings.referrals += referralReward;
          referrer.totalEarnings += referralReward;
          referrer.referralEarningsTotal += referralReward;
          
          await referrer.save();
          
          console.log(`\n🎁 Referral Reward Given!`);
          console.log(`   Referred User: ${user.name} (${user.email})`);
          console.log(`   Package Amount: $${payment.amount}`);
          console.log(`   Referrer: ${referrer.name} (${referrer.email})`);
          console.log(`   Reward Amount: $${referralReward}`);
          console.log(`   Referrer New Balance: $${referrer.balance.toFixed(2)}`);
        }
      }
    }
    
    // Populate details
    await payment.populate('user', 'name email');
    
    // Verify the payment was saved correctly
    console.log(`\n📋 Final Payment State:`);
    console.log(`   Payment ID: ${payment._id}`);
    console.log(`   Status: ${payment.status}`);
    console.log(`   isActive: ${payment.isActive}`);
    console.log(`   Expires At: ${payment.expiresAt}`);
    
    // Verify the user was updated
    const verifyUser = await User.findById(payment.user);
    console.log(`\n👤 Final User State:`);
    console.log(`   User: ${verifyUser.name}`);
    console.log(`   maxDailyAds: ${verifyUser.maxDailyAds}`);
    console.log(`   Balance: $${verifyUser.balance.toFixed(2)}`);
    console.log(`   Total Deposits: $${verifyUser.totalDeposits?.toFixed(2) || '0.00'}`);
    
    res.status(200).json({
      success: true,
      message: 'Payment approved and package assigned successfully. User can now view ads.',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject payment (Admin)
// @route   PUT /api/payments/:id/reject
// @access  Private/Admin
export const rejectPayment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return next(new ErrorResponse('Please provide rejection reason', 400));
    }
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }
    
    if (payment.status !== 'pending') {
      return next(new ErrorResponse(`Cannot reject payment with status: ${payment.status}`, 400));
    }
    
    await payment.reject(req.user._id, reason);
    
    await payment.populate('paymentPlan');
    await payment.populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      message: 'Payment rejected',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment proof image
// @route   GET /api/payments/:id/image
// @access  Private/Admin
export const getPaymentImage = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }
    
    // Check if user owns this payment or is admin
    if (payment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to view this payment proof', 403));
    }
    
    if (!payment.proofImage) {
      return next(new ErrorResponse('No proof image available', 404));
    }
    
    // Check if file exists
    if (!fs.existsSync(payment.proofImage)) {
      return next(new ErrorResponse('Proof image file not found', 404));
    }
    
    // Send file
    res.sendFile(path.resolve(payment.proofImage));
  } catch (error) {
    next(error);
  }
};
