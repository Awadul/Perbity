import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  refreshToken,
  updatePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerValidation,
  loginValidation,
  validate
} from '../middleware/validator.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
router.put('/updatepassword', protect, updatePassword);

export default router;
