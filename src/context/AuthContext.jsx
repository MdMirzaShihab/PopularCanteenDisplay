import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import * as authApi from '../api/auth.api';
import { registerAuthExpiredHandler } from '../api/client';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount via httpOnly cookie
  useEffect(() => {
    authApi.getMe()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Register 401 handler so expired sessions auto-logout
  useEffect(() => {
    registerAuthExpiredHandler(() => setUser(null));
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials.username, credentials.password);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if backend fails, clear local state
    }
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isRestaurantUser: user?.role === 'restaurant_user',
    isTokenOperator: user?.role === 'token_operator',
    isAuthenticated: !!user,
  }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
