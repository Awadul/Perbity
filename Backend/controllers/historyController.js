import History from '../models/History.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get user's transaction history
// @route   GET /api/history
// @access  Private
export const getHistory = async (req, res, next) => {
  try {
    const { type, startDate, endDate, limit = 50, page = 1 } = req.query;
    
    const options = {
      type,
      startDate,
      endDate,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };
    
    const history = await History.getUserHistory(req.user._id, options);
    const total = await History.countDocuments({ 
      user: req.user._id,
      ...(type && { type })
    });
    
    res.status(200).json({
      success: true,
      count: history.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's earnings statistics
// @route   GET /api/history/stats
// @access  Private
export const getStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const stats = await History.getUserStats(req.user._id, {
      startDate,
      endDate
    });
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's earnings history
// @route   GET /api/history/today
// @access  Private
export const getTodayHistory = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const history = await History.find({
      user: req.user._id,
      createdAt: { $gte: today }
    }).sort({ createdAt: -1 });
    
    const totalEarnings = history.reduce((sum, record) => {
      if (['ad_earning', 'referral_bonus', 'daily_profit', 'bonus'].includes(record.type)) {
        return sum + record.amount;
      }
      return sum;
    }, 0);
    
    res.status(200).json({
      success: true,
      count: history.length,
      totalEarnings,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get history by type
// @route   GET /api/history/type/:type
// @access  Private
export const getHistoryByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { limit = 50, page = 1 } = req.query;
    
    const history = await History.find({
      user: req.user._id,
      type
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await History.countDocuments({
      user: req.user._id,
      type
    });
    
    res.status(200).json({
      success: true,
      count: history.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin history (all users)
// @route   GET /api/history/admin/all
// @access  Private/Admin
export const getAdminHistory = async (req, res, next) => {
  try {
    const { type, userId, limit = 100, page = 1 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (userId) query.user = userId;
    
    const history = await History.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await History.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: history.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: history
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getHistory,
  getStats,
  getTodayHistory,
  getHistoryByType,
  getAdminHistory
};
