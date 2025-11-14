import express from 'express';
import {
  getHistory,
  getStats,
  getTodayHistory,
  getHistoryByType,
  getAdminHistory
} from '../controllers/historyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.get('/', protect, getHistory);
router.get('/stats', protect, getStats);
router.get('/today', protect, getTodayHistory);
router.get('/type/:type', protect, getHistoryByType);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAdminHistory);

export default router;
