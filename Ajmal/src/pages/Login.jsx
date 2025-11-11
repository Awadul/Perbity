import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { isValidEmail, isRequired } from '../utils/validators';
import { login } from '../services/auth';
import Button from '../components/common/Button';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAppContext();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    if (!isRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isRequired(formData.password)) {
      newErrors.password = 'Password is required';
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
      // Login with backend API
      const userData = await login(formData.email, formData.password);
      
      // Update AppContext with user data
      setUser(userData);
      
      // Navigate to dashboard after successful login
      navigate('/dashboard');
      
      // Reset form
      setFormData({
        email: '',
        password: ''
      });
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        general: error.message || 'Invalid email or password. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Log in to your account</p>

        <form onSubmit={handleSubmit} className="login-form">
          {errors.general && (
            <div className="error-banner">
              {errors.general}
            </div>
          )}

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
              autoComplete="email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

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
                placeholder="Enter your password"
                disabled={isSubmitting}
                autoComplete="current-password"
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
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="login-button"
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>

        {/* Demo Credentials Info */}
        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          <div className="demo-list">
            <div className="demo-item">
              <strong>Admin:</strong>
              <span>admin@perbity.com / admin123456</span>
            </div>
            <div className="demo-item">
              <strong>Demo User:</strong>
              <span>demo@example.com / demo123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
