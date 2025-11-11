import Ad from '../models/Ad.js';
import AdClick from '../models/AdClick.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import PaymentPlan from '../models/PaymentPlan.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all ads
// @route   GET /api/ads
// @access  Private
export const getAds = async (req, res, next) => {
  try {
    // Get user's active payment plan
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
    
    // Determine daily ads limit based on payment plan
    let dailyAdsLimit = 10; // Default free plan limit
    let planName = 'Free';
    
    if (activePayment && activePayment.isActive) {
      dailyAdsLimit = activePayment.paymentPlan.dailyAdsLimit;
      planName = activePayment.paymentPlan.name;
    }
    
    // Get today's clicks count
    const todayClicksCount = await AdClick.getTodayClicksCount(req.user._id);
    
    // Get all active ads
    const ads = await Ad.find({ isActive: true }).sort('displayOrder');
    
    // Get clicked ad IDs for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedAds = await AdClick.find({
      user: req.user._id,
      clickDate: { $gte: today }
    }).distinct('ad');

    res.status(200).json({
      success: true,
      count: ads.length,
      data: ads,
      userPlan: {
        name: planName,
        dailyLimit: dailyAdsLimit,
        remainingAds: Math.max(0, dailyAdsLimit - todayClicksCount),
        clickedToday: todayClicksCount,
        clickedAdIds: clickedAds
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's ad clicks for today
// @route   GET /api/ads/clicks/today
// @access  Private
export const getTodayClicks = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const clicks = await AdClick.find({
      user: req.user.id,
      clickDate: { $gte: today }
    }).populate('ad', 'title earning');

    res.status(200).json({
      success: true,
      count: clicks.length,
      data: clicks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Click an ad / View ad and earn
// @route   POST /api/ads/:id/click
// @access  Private
export const clickAd = async (req, res, next) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return next(new ErrorResponse('Ad not found', 404));
    }

    if (!ad.isActive) {
      return next(new ErrorResponse('This ad is not active', 400));
    }

    // Get user's active payment plan to check daily limit
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
    
    // Determine daily ads limit
    let dailyAdsLimit = 10; // Default free plan
    if (activePayment && activePayment.isActive) {
      dailyAdsLimit = activePayment.paymentPlan.dailyAdsLimit;
    }
    
    // Check if user has reached daily limit
    const todayClicksCount = await AdClick.getTodayClicksCount(req.user._id);
    if (todayClicksCount >= dailyAdsLimit) {
      return next(new ErrorResponse(`Daily limit reached. You can click ${dailyAdsLimit} ads per day with your current plan.`, 400));
    }

    // Check if user already clicked this ad today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingClick = await AdClick.findOne({
      user: req.user._id,
      ad: ad._id,
      clickDate: { $gte: today }
    });

    if (existingClick) {
      return next(new ErrorResponse('You have already viewed this ad today', 400));
    }

    // Create ad click record with completion
    const adClick = await AdClick.create({
      user: req.user._id,
      ad: ad._id,
      earning: ad.earning,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      isCompleted: true,
      isVerified: true,
      verifiedAt: Date.now(),
      clickDuration: 10 // 10 second viewing
    });

    // Update user's earnings using the addEarnings method
    const user = await User.findById(req.user._id);
    
    // Reset daily stats if needed
    user.resetDailyStats();
    
    // Add earnings to user account
    user.addEarnings(ad.earning, 'ads');
    user.adsCompleted += 1;
    user.adsCompletedToday += 1;
    user.lastAdClickDate = Date.now();
    
    await user.save();
    
    // Update ad statistics
    ad.totalClicks += 1;
    ad.totalEarningsPaid += ad.earning;
    await ad.save();

    res.status(201).json({
      success: true,
      message: 'Ad viewed successfully! Earnings added to your balance.',
      data: {
        earning: ad.earning,
        newBalance: user.balance,
        totalEarnings: user.totalEarnings,
        adsEarnings: user.earnings.ads,
        todayEarnings: user.earningsToday,
        adsViewedToday: user.adsCompletedToday,
        remainingAds: Math.max(0, dailyAdsLimit - (todayClicksCount + 1))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's ad earnings
// @route   GET /api/ads/earnings
// @access  Private
export const getAdEarnings = async (req, res, next) => {
  try {
    const clicks = await AdClick.find({ user: req.user.id });

    const totalEarnings = clicks.reduce((sum, click) => sum + click.earning, 0);

    // Get today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayClicks = clicks.filter(click => click.clickDate >= today);
    const todayEarnings = todayClicks.reduce((sum, click) => sum + click.earning, 0);

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        todayEarnings,
        totalClicks: clicks.length,
        todayClicks: todayClicks.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create ad (Admin)
// @route   POST /api/ads
// @access  Private/Admin
export const createAd = async (req, res, next) => {
  try {
    const ad = await Ad.create(req.body);

    res.status(201).json({
      success: true,
      data: ad
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ad (Admin)
// @route   PUT /api/ads/:id
// @access  Private/Admin
export const updateAd = async (req, res, next) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!ad) {
      return next(new ErrorResponse('Ad not found', 404));
    }

    res.status(200).json({
      success: true,
      data: ad
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ad (Admin)
// @route   DELETE /api/ads/:id
// @access  Private/Admin
export const deleteAd = async (req, res, next) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);

    if (!ad) {
      return next(new ErrorResponse('Ad not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
