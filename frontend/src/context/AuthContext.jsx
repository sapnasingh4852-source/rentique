import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('couture_token') || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Load current user profile on boot
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        // Auto-login as default Customer for frictionless hackathon preview
        await switchRole('CUSTOMER');
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (data.success) {
          setUser(data.user);
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.warn('Session expired or offline, switching to demo user:', err.message);
        await switchRole('CUSTOMER');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('couture_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.success) {
      localStorage.setItem('couture_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('couture_token');
    setToken(null);
    setUser(null);
  };

  // 1-Click Role Switcher for seamless demo testing
  const switchRole = async (targetRole) => {
    try {
      const { data } = await api.post('/auth/switch-test-account', { role: targetRole });
      if (data.success) {
        localStorage.setItem('couture_token', data.token);
        setToken(data.token);
        setUser(data.user);
        // Refresh notifications
        try {
          const meRes = await api.get('/auth/me');
          if (meRes.data.success) {
            setNotifications(meRes.data.notifications || []);
          }
        } catch (_) {}
        return data.user;
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  const refreshMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        notifications,
        login,
        register,
        logout,
        switchRole,
        refreshMe
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
