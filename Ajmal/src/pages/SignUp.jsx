import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { isValidEmail, isValidPassword, isRequired } from '../utils/validators';
import { register } from '../services/auth';
import Button from '../components/common/Button';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { setUser } = useAppContext();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: referralCode || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isRequired(formData.name)) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!isRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isRequired(formData.phone)) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!isRequired(formData.password)) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isRequired(formData.confirmPassword)) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Register user with backend API
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        referralCode: formData.referralCode
      };
      
      const registeredUser = await register(userData);
      
      // Update AppContext with user data
      setUser(registeredUser);
      
      // Navigate to dashboard after successful signup
      navigate('/dashboard');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Sign up error:', error);
      
      // Extract error message from response
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && !error.message.includes('HTTP error')) {
        errorMessage = error.message;
      }
      
      // Provide user-friendly error messages
      if (errorMessage.includes('already exists') || errorMessage.includes('already registered')) {
        errorMessage = 'An account with this email already exists. Please login or use a different email.';
      } else if (errorMessage.includes('Invalid referral code')) {
        errorMessage = 'The referral code you entered is invalid. Please check and try again.';
      } else if (errorMessage.includes('validation failed') || errorMessage.includes('required')) {
        errorMessage = 'Please fill in all required fields correctly.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-title">Create Account</h1>
        <p className="signup-subtitle">Sign up to get started</p>

        {errors.general && (
          <div className="error-banner">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'input-error' : ''}
              placeholder="+1 (555) 123-4567"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
          </div>

          {referralCode && (
            <div className="referral-info">
              <div className="referral-icon">🎁</div>
              <div className="referral-text">
                <strong>You're invited!</strong>
                <span>Join using referral code: <strong>{referralCode}</strong></span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                placeholder="Create a password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
            <span className="password-hint">
              At least 6 characters required
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'input-error' : ''}
                placeholder="Confirm your password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="signup-button"
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <Link to="/login">Log In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
