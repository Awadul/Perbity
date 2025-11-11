import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUserLocal, clearAuthData, getCurrentUser as fetchCurrentUser } from '../services/auth';
import apiService from '../services/api';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState('light');

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = apiService.getAuthToken();
        const localUser = getCurrentUserLocal();
        
        if (token && localUser) {
          setUser(localUser);
          setIsAuthenticated(true);
          
          // Optionally refresh user data from server
          try {
            const freshUser = await fetchCurrentUser();
            if (freshUser) {
              setUser(freshUser);
            }
          } catch (error) {
            console.error('Failed to refresh user data:', error);
            // Keep using local user data if refresh fails
          }
        } else {
          // Clear any stale auth state
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(!!userData);
  };

  const logout = async () => {
    try {
      const { logout: authLogout } = await import('../services/auth');
      await authLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    user,
    setUser: updateUser,
    loading,
    isAuthenticated,
    logout,
    theme,
    toggleTheme,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
