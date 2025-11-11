import express from 'express';
import {
  getWithdrawals,
  getWithdrawal,
  createWithdrawal,
  getAllWithdrawals,
  updateWithdrawalStatus,
  deleteWithdrawal
} from '../controllers/withdrawalController.js';
import { protect, authorize } from '../middleware/auth.js';
import { withdrawalValidation, validate } from '../middleware/validator.js';

const router = express.Router();

// User routes
router.get('/', protect, getWithdrawals);
router.get('/:id', protect, getWithdrawal);
router.post('/', protect, withdrawalValidation, validate, createWithdrawal);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllWithdrawals);
router.put('/:id/status', protect, authorize('admin'), updateWithdrawalStatus);
router.delete('/:id', protect, authorize('admin'), deleteWithdrawal);

export default router;
