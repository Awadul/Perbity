import express from 'express';
import {
  getInvestments,
  getInvestment,
  createInvestment,
  getInvestmentStats,
  processDailyEarnings,
  cancelInvestment,
  getAllInvestments
} from '../controllers/investmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { investmentValidation, validate } from '../middleware/validator.js';

const router = express.Router();

// User routes
router.get('/', protect, getInvestments);
router.get('/stats', protect, getInvestmentStats);
router.get('/:id', protect, getInvestment);
router.post('/', protect, investmentValidation, validate, createInvestment);
router.put('/:id/cancel', protect, cancelInvestment);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllInvestments);
router.post('/process-earnings', protect, authorize('admin'), processDailyEarnings);

export default router;
