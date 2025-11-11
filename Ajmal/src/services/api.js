import { API_BASE_URL } from '../config/api';

/**
 * API service for making HTTP requests
 */
class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  getAuthToken() {
    return localStorage.getItem('token');
  }

  setAuthToken(token) {
    localStorage.setItem('token', token);
  }

  removeAuthToken() {
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    const token = this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available and not skipped
    if (token && !options.skipAuth) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          this.removeAuthToken();
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          window.location.href = '/login';
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Upload file with multipart/form-data
  async upload(endpoint, formData, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    const token = this.getAuthToken();
    
    const config = {
      method: 'POST',
      headers: {
        ...options.headers,
      },
      body: formData,
      ...options,
    };

    // Add auth token if available
    if (token && !options.skipAuth) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          this.removeAuthToken();
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          window.location.href = '/login';
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Upload request failed:', error);
      throw error;
    }
  }
}

export default new ApiService(API_BASE_URL);
