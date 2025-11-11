/**
 * API Configuration
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
export const API_TIMEOUT = 30000;

export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}/api${endpoint}`;
};
