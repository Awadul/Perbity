import User from '../models/User.js';
import Payment from '../models/Payment.js';
import PaymentPlan from '../models/PaymentPlan.js';
import Checkout from '../models/Checkout.js';
import Ad from '../models/Ad.js';
import AdClick from '../models/AdClick.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const newUsersToday = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    
    // Payment stats
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const activePayments = await Payment.countDocuments({ isActive: true, status: 'approved' });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Checkout stats
    const pendingCheckouts = await Checkout.countDocuments({ status: 'pending' });
    const processingCheckouts = await Checkout.countDocuments({ status: 'processing' });
    const totalPayouts = await Checkout.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Ad stats
    const totalAds = await Ad.countDocuments();
    const totalClicks = await AdClick.countDocuments();
    const todayClicks = await AdClick.countDocuments({
      clickDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newUsersToday
        },
        payments: {
          pending: pendingPayments,
          active: activePayments,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        checkouts: {
          pending: pendingCheckouts,
          processing: processingCheckouts,
          totalPayouts: totalPayouts[0]?.total || 0
        },
        ads: {
          total: totalAds,
          totalClicks,
          todayClicks
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with their payment plans
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    
    const query = { role: 'user' };
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status) {
      query.isActive = status === 'active';
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get active payment for each user
    const usersWithPlans = await Promise.all(
      users.map(async (user) => {
        const activePayment = await Payment.findOne({
          user: user._id,
          isActive: true,
          status: 'approved'
        }).populate('paymentPlan');
        
        // Format the response to match frontend expectations
        const userObj = user.toObject();
        if (activePayment) {
          userObj.activePayment = {
            ...activePayment.toObject(),
            plan: activePayment.paymentPlan // Add plan alias for frontend compatibility
          };
        } else {
          userObj.activePayment = null;
        }
        
        return userObj;
      })
    );
    
    const count = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: usersWithPlans.length,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: usersWithPlans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user details with payment history
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    // Get payment history
    const payments = await Payment.find({ user: user._id })
      .populate('paymentPlan')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    // Get checkout history
    const checkouts = await Checkout.find({ user: user._id })
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });
    
    // Get ad clicks
    const adClicks = await AdClick.find({ user: user._id })
      .populate('ad')
      .sort({ clickDate: -1 })
      .limit(50);
    
    res.status(200).json({
      success: true,
      data: {
        user,
        payments,
        checkouts,
        adClicks: adClicks.length,
        recentClicks: adClicks.slice(0, 10)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate/Deactivate payment plan for user
// @route   PUT /api/admin/payments/:id/toggle
// @access  Private/Admin
export const togglePaymentStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }
    
    if (payment.status !== 'approved') {
      return next(new ErrorResponse('Can only toggle approved payments', 400));
    }
    
    payment.isActive = !payment.isActive;
    
    if (!payment.isActive) {
      payment.status = 'expired';
    } else {
      payment.status = 'approved';
    }
    
    await payment.save();
    await payment.populate('paymentPlan');
    await payment.populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      message: `Payment ${payment.isActive ? 'activated' : 'deactivated'} successfully`,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    if (user.role === 'admin') {
      return next(new ErrorResponse('Cannot modify admin user', 403));
    }
    
    user.isActive = isActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    if (user.role === 'admin') {
      return next(new ErrorResponse('Cannot modify admin user', 403));
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign package to user
// @route   POST /api/admin/assign-package
// @access  Private/Admin
export const assignPackage = async (req, res, next) => {
  try {
    const { userId, planId } = req.body;
    
    if (!userId || !planId) {
      return next(new ErrorResponse('User ID and Plan ID are required', 400));
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    if (user.role === 'admin') {
      return next(new ErrorResponse('Cannot assign package to admin', 403));
    }
    
    // Find plan
    const plan = await PaymentPlan.findById(planId);
    if (!plan) {
      return next(new ErrorResponse('Payment plan not found', 404));
    }
    
    // Deactivate existing active payments for this user
    await Payment.updateMany(
      { user: userId, isActive: true },
      { isActive: false, status: 'expired' }
    );
    
    // Create new payment with approved status and active
    const payment = await Payment.create({
      user: userId,
      paymentPlan: planId,
      amount: plan.price,
      paymentMethod: 'other', // Admin assignment
      proofImage: null, // Not needed for admin assignment
      transactionId: `ADMIN-${Date.now()}`, // Admin-generated transaction ID
      status: 'approved',
      isActive: true,
      approvedBy: req.user.id,
      approvedAt: new Date(),
      activatedAt: new Date(),
      expiresAt: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000)
    });
    
    await payment.populate('paymentPlan');
    await payment.populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      message: `${plan.name} package assigned to ${user.name} successfully`,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payment plans (Admin)
// @route   GET /api/admin/payment-plans
// @access  Private/Admin
export const getPaymentPlans = async (req, res, next) => {
  try {
    const plans = await PaymentPlan.find().sort({ price: 1 });
    
    // Get active users count for each plan
    const plansWithStats = await Promise.all(
      plans.map(async (plan) => {
        const activeCount = await Payment.countDocuments({
          paymentPlan: plan._id,
          isActive: true,
          status: 'approved'
        });
        
        return {
          ...plan.toObject(),
          activeUsers: activeCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: plansWithStats.length,
      data: plansWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create payment plan
// @route   POST /api/admin/payment-plans
// @access  Private/Admin
export const createPaymentPlan = async (req, res, next) => {
  try {
    const plan = await PaymentPlan.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Payment plan created successfully',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment plan
// @route   PUT /api/admin/payment-plans/:id
// @access  Private/Admin
export const updatePaymentPlan = async (req, res, next) => {
  try {
    const plan = await PaymentPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!plan) {
      return next(new ErrorResponse('Payment plan not found', 404));
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment plan updated successfully',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete payment plan
// @route   DELETE /api/admin/payment-plans/:id
// @access  Private/Admin
export const deletePaymentPlan = async (req, res, next) => {
  try {
    const plan = await PaymentPlan.findById(req.params.id);
    
    if (!plan) {
      return next(new ErrorResponse('Payment plan not found', 404));
    }
    
    // Check if plan has active users
    const activePayments = await Payment.countDocuments({
      paymentPlan: plan._id,
      isActive: true
    });
    
    if (activePayments > 0) {
      return next(new ErrorResponse('Cannot delete plan with active users', 400));
    }
    
    await plan.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Payment plan deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
