import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('rain_alert_token');
      const savedUser = localStorage.getItem('rain_alert_user');

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const res = await authApi.getProfile();
          setUser(res.data.data.user);
          localStorage.setItem('rain_alert_user', JSON.stringify(res.data.data.user));
        } catch {
          // Token expired
          localStorage.removeItem('rain_alert_token');
          localStorage.removeItem('rain_alert_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user: userData, token } = res.data.data;
    localStorage.setItem('rain_alert_token', token);
    localStorage.setItem('rain_alert_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    const { user: userData, token } = res.data.data;
    localStorage.setItem('rain_alert_token', token);
    localStorage.setItem('rain_alert_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rain_alert_token');
    localStorage.removeItem('rain_alert_user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('rain_alert_user', JSON.stringify(updatedUser));
  }, []);

  const updatePreferences = useCallback(async (prefs) => {
    const res = await authApi.updatePreferences(prefs);
    const updatedUser = res.data.data.user;
    setUser(updatedUser);
    localStorage.setItem('rain_alert_user', JSON.stringify(updatedUser));
    return updatedUser;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      updatePreferences
    }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
