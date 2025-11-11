import Investment from '../models/Investment.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get user's investments
// @route   GET /api/investments
// @access  Private
export const getInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: investments.length,
      data: investments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single investment
// @route   GET /api/investments/:id
// @access  Private
export const getInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!investment) {
      return next(new ErrorResponse('Investment not found', 404));
    }

    res.status(200).json({
      success: true,
      data: investment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new investment
// @route   POST /api/investments
// @access  Private
export const createInvestment = async (req, res, next) => {
  try {
    const { amount } = req.body;

    // Check if user has sufficient balance
    const user = await User.findById(req.user.id);
    
    if (user.balance < amount) {
      return next(new ErrorResponse('Insufficient balance', 400));
    }

    // Deduct amount from user's balance
    user.balance -= amount;
    await user.save();

    // Create investment
    const investment = await Investment.create({
      user: req.user.id,
      amount
    });

    res.status(201).json({
      success: true,
      data: investment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get investment stats
// @route   GET /api/investments/stats
// @access  Private
export const getInvestmentStats = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user.id });

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalEarned = investments.reduce((sum, inv) => sum + inv.totalEarned, 0);
    const activeInvestments = investments.filter(inv => inv.status === 'active').length;

    // Calculate daily earnings from active investments
    const dailyEarnings = investments
      .filter(inv => inv.status === 'active')
      .reduce((sum, inv) => sum + inv.dailyEarning, 0);

    res.status(200).json({
      success: true,
      data: {
        totalInvested,
        totalEarned,
        activeInvestments,
        dailyEarnings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process daily investment earnings (Cron job)
// @route   POST /api/investments/process-earnings
// @access  Private/Admin
export const processDailyEarnings = async (req, res, next) => {
  try {
    const activeInvestments = await Investment.find({ status: 'active' });

    let totalProcessed = 0;
    let totalEarnings = 0;

    for (const investment of activeInvestments) {
      // Check if already processed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (investment.lastEarningDate && investment.lastEarningDate >= today) {
        continue; // Already processed today
      }

      // Add daily earning to user's balance
      const user = await User.findById(investment.user);
      user.balance += investment.dailyEarning;
      user.investmentEarnings += investment.dailyEarning;
      await user.save();

      // Update investment
      investment.totalEarned += investment.dailyEarning;
      investment.lastEarningDate = new Date();
      investment.daysRemaining -= 1;

      // Check if investment completed (30 days)
      if (investment.daysRemaining <= 0) {
        investment.status = 'completed';
      }

      await investment.save();

      totalProcessed++;
      totalEarnings += investment.dailyEarning;
    }

    res.status(200).json({
      success: true,
      message: 'Daily earnings processed successfully',
      data: {
        investmentsProcessed: totalProcessed,
        totalEarningsDistributed: totalEarnings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel investment
// @route   PUT /api/investments/:id/cancel
// @access  Private
export const cancelInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!investment) {
      return next(new ErrorResponse('Investment not found', 404));
    }

    if (investment.status !== 'active') {
      return next(new ErrorResponse('Investment is not active', 400));
    }

    investment.status = 'cancelled';
    await investment.save();

    res.status(200).json({
      success: true,
      data: investment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all investments (Admin)
// @route   GET /api/investments/admin/all
// @access  Private/Admin
export const getAllInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find()
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: investments.length,
      data: investments
    });
  } catch (error) {
    next(error);
  }
};
