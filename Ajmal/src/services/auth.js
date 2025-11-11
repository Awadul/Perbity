import apiService from './api';

/**
 * Authentication Service
 * Handles user authentication with backend API
 */

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} User data
 */
export const login = async (email, password) => {
  try {
    const response = await apiService.post('/auth/login', {
      email,
      password
    }, { skipAuth: true });

    if (response.success && response.token && response.user) {
      // Store token
      apiService.setAuthToken(response.token);
      
      // Store user data (ensure it's valid)
      if (response.user && typeof response.user === 'object') {
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('isAuthenticated', 'true');
      }
      
      return response.user;
    }
    
    throw new Error(response.message || 'Login failed');
  } catch (error) {
    console.error('Login error:', error);
    // Clean up any partial data
    clearAuthData();
    throw error;
  }
};

/**
 * Register new user
 * @param {object} userData - User registration data
 * @returns {Promise<object>} User data
 */
export const register = async (userData) => {
  try {
    const response = await apiService.post('/auth/register', userData, { skipAuth: true });

    if (response.success && response.token && response.user) {
      // Store token
      apiService.setAuthToken(response.token);
      
      // Store user data (ensure it's valid)
      if (response.user && typeof response.user === 'object') {
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('isAuthenticated', 'true');
      }
      
      return response.user;
    }
    
    throw new Error(response.message || 'Registration failed');
  } catch (error) {
    console.error('Registration error:', error);
    // Clean up any partial data
    clearAuthData();
    throw error;
  }
};

/**
 * Get current authenticated user from server
 * @returns {Promise<object|null>} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiService.get('/auth/me');
    
    if (response.success && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Get current user from localStorage
 * @returns {object|null}
 */
export const getCurrentUserLocal = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    // Clear invalid data
    localStorage.removeItem('user');
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true' && !!apiService.getAuthToken();
};

/**
 * Clear all auth data from localStorage
 */
export const clearAuthData = () => {
  apiService.removeAuthToken();
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user');
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    // Call logout endpoint
    await apiService.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage
    clearAuthData();
  }
};

/**
 * Update password
 * @param {string} currentPassword 
 * @param {string} newPassword 
 * @returns {Promise<boolean>}
 */
export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const response = await apiService.put('/auth/password', {
      currentPassword,
      newPassword
    });
    
    return response.success;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
};
