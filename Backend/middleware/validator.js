import { body, validationResult } from 'express-validator';

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Register validation rules
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone().withMessage('Please provide a valid phone number'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Login validation rules
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Update profile validation rules
export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone().withMessage('Please provide a valid phone number')
];

// Withdrawal validation rules
export const withdrawalValidation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isNumeric().withMessage('Amount must be a number')
    .custom((value) => {
      if (value < 15) throw new Error('Minimum withdrawal amount is $15');
      if (value > 1000) throw new Error('Maximum withdrawal amount is $1000');
      return true;
    }),
  
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['paypal', 'bank', 'crypto', 'other']).withMessage('Invalid payment method'),
  
  body('paymentDetails')
    .trim()
    .notEmpty().withMessage('Payment details are required')
];

// Investment validation rules
export const investmentValidation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isIn([20, 40, 80]).withMessage('Invalid investment amount')
];
