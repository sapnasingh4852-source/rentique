import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'couture_token';
const USER_KEY = 'couture_user';

const readStoredUser = () => {
  try {
    const cached = localStorage.getItem(USER_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const storeUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Restore the session from the token (and cached profile) on boot.
  useEffect(() => {
    let active = true;

    const fetchUser = async () => {
      if (!token) {
        if (active) {
          setUser(null);
          setNotifications([]);
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (active && data.success) {
          setUser(data.user);
          storeUser(data.user);
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        if (!active) return;
        if (err.response?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
          setNotifications([]);
        }
        // A network blip should not sign the user out; keep the cached profile.
      } finally {
        if (active) setLoading(false);
      }
    };

    setLoading(true);
    fetchUser();
    return () => {
      active = false;
    };
  }, [token]);

  const applySession = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    storeUser(data.user);
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      applySession(data);
      return data.user;
    }
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.success) {
      applySession(data);
      return data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  // Explicit 1-click demo persona switch. Never triggered automatically.
  const switchRole = async (targetRole) => {
    try {
      const { data } = await api.post('/auth/switch-test-account', { role: targetRole });
      if (data.success) {
        applySession(data);
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
        storeUser(data.user);
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
