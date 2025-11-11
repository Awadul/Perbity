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
    const { paymentPlan, amount, paymentMethod, transactionId } = req.body;
    
    // Check if file was uploaded
    if (!req.file) {
      return next(new ErrorResponse('Please upload payment proof image', 400));
    }
    
    // Verify payment plan exists
    const plan = await PaymentPlan.findById(paymentPlan);
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
    
    // Create payment
    const payment = await Payment.create({
      user: req.user._id,
      paymentPlan: paymentPlan,
      amount: amount,
      paymentMethod: paymentMethod || 'binance',
      proofImage: req.file.path,
      transactionId: transactionId
    });
    
    // Populate plan details
    await payment.populate('paymentPlan');
    
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
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }
    
    if (payment.status !== 'pending') {
      return next(new ErrorResponse(`Cannot approve payment with status: ${payment.status}`, 400));
    }
    
    // Deactivate any other active payments for this user
    await Payment.updateMany(
      { user: payment.user, isActive: true },
      { isActive: false }
    );
    
    // Approve payment
    await payment.approve(req.user._id);
    
    // Populate details
    await payment.populate('paymentPlan');
    await payment.populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      message: 'Payment approved successfully',
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
