import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    // Get user with referral info
    const user = await User.findById(req.user.id)
      .populate('referredBy', 'name email');

    // Import Payment model dynamically
    const Payment = (await import('../models/Payment.js')).default;
    
    // Get active payment with plan details
    const activePayment = await Payment.findOne({
      user: req.user.id,
      isActive: true,
      status: 'approved'
    }).populate('paymentPlan');

    console.log(`\n🔍 Getting profile for user: ${user.name} (${req.user.id})`);
    console.log(`   Active Payment Found: ${activePayment ? 'YES' : 'NO'}`);
    if (activePayment) {
      console.log(`   Payment ID: ${activePayment._id}`);
      console.log(`   Payment Status: ${activePayment.status}`);
      console.log(`   Payment isActive: ${activePayment.isActive}`);
      console.log(`   Has PaymentPlan: ${activePayment.paymentPlan ? 'YES' : 'NO'}`);
      if (activePayment.paymentPlan) {
        console.log(`   Plan Name: ${activePayment.paymentPlan.name}`);
        console.log(`   Daily Ads Limit: ${activePayment.paymentPlan.dailyAdsLimit}`);
      }
    }
    console.log(`   User maxDailyAds: ${user.maxDailyAds}`);

    // Check if payment expired
    if (activePayment) {
      activePayment.checkExpiration();
      await activePayment.save();
    }

    // Attach active payment to user response
    const userResponse = user.toObject();
    
    if (activePayment && activePayment.paymentPlan) {
      // Payment with PaymentPlan reference
      userResponse.activePayment = {
        _id: activePayment._id,
        plan: {
          _id: activePayment.paymentPlan._id,
          name: activePayment.paymentPlan.name,
          price: activePayment.paymentPlan.price,
          dailyAdsLimit: activePayment.paymentPlan.dailyAdsLimit,
          dailyProfit: activePayment.paymentPlan.dailyProfit,
          profitPercentage: activePayment.paymentPlan.profitPercentage,
          duration: activePayment.paymentPlan.duration,
          features: activePayment.paymentPlan.features
        },
        amount: activePayment.amount,
        status: activePayment.status,
        isActive: activePayment.isActive,
        createdAt: activePayment.createdAt,
        expiresAt: activePayment.expiresAt
      };
    } else if (activePayment && !activePayment.paymentPlan) {
      // Custom payment without PaymentPlan reference
      // Create a virtual plan object from user's maxDailyAds
      const dailyAdsFromUser = user.maxDailyAds || 10;
      const dailyProfitEstimate = activePayment.amount * 0.03; // 3% daily
      
      userResponse.activePayment = {
        _id: activePayment._id,
        plan: {
          _id: 'custom',
          name: 'Custom Package',
          price: activePayment.amount,
          dailyAdsLimit: dailyAdsFromUser,
          dailyProfit: dailyProfitEstimate,
          profitPercentage: 3,
          duration: 365,
          features: [
            `Investment: $${activePayment.amount}`,
            `Daily Ads: ${dailyAdsFromUser}`,
            `Daily Profit: $${dailyProfitEstimate.toFixed(2)}`
          ]
        },
        amount: activePayment.amount,
        status: activePayment.status,
        isActive: activePayment.isActive,
        createdAt: activePayment.createdAt,
        expiresAt: activePayment.expiresAt
      };
    } else {
      userResponse.activePayment = null;
    }

    // Get today's ads viewed count
    const AdClick = (await import('../models/AdClick.js')).default;
    const adsViewedToday = await AdClick.getTodayClicksCount(req.user.id);
    userResponse.adsViewedToday = adsViewedToday;

    // Calculate total deposits from approved payments (sum of all approved package purchases)
    const totalDepositsResult = await Payment.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          totalDeposits: { $sum: '$amount' }
        }
      }
    ]);
    
    userResponse.totalDeposits = totalDepositsResult.length > 0 ? totalDepositsResult[0].totalDeposits : 0;

    // Calculate total withdraws from checkouts confirmed/completed by admin
    const Checkout = (await import('../models/Checkout.js')).default;
    const totalWithdrawsResult = await Checkout.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalWithdrawn: { $sum: '$amount' }
        }
      }
    ]);
    
    userResponse.totalWithdrawn = totalWithdrawsResult.length > 0 ? totalWithdrawsResult[0].totalWithdrawn : 0;

    // Calculate pending withdraws from checkout requests pending admin confirmation
    const pendingWithdrawsResult = await Checkout.aggregate([
      {
        $match: {
          user: req.user._id,
          status: { $in: ['pending', 'processing'] }
        }
      },
      {
        $group: {
          _id: null,
          pendingWithdraws: { $sum: '$amount' }
        }
      }
    ]);
    
    userResponse.pendingWithdraws = pendingWithdrawsResult.length > 0 ? pendingWithdrawsResult[0].pendingWithdraws : 0;

    res.status(200).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone;
    if (avatar) fieldsToUpdate.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new ErrorResponse('Please provide current and new password', 400));
    }

    if (newPassword.length < 6) {
      return next(new ErrorResponse('New password must be at least 6 characters', 400));
    }

    // Get user with password field
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return next(new ErrorResponse('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const stats = {
      totalEarnings: user.balance,
      adEarnings: user.adEarnings,
      referralEarnings: user.referralEarnings,
      emailEarnings: user.emailEarnings,
      reviewEarnings: user.reviewEarnings,
      investmentEarnings: user.investmentEarnings,
      level: user.level,
      referralCount: user.referralCount
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
