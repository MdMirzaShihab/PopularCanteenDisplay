import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { initialUsers } from '../data/mockData';

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

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('canteen_auth_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('canteen_auth_user');
      }
    }
    setLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('canteen_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('canteen_auth_user');
    }
  }, [user]);

  const login = useCallback((credentials) => {
    const { username, email } = credentials;

    const foundUser = initialUsers.find(
      u => u.username === username || u.email === email
    );

    if (!foundUser) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Remove password from user object before storing
    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    return { success: true, user: userWithoutPassword };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('canteen_auth_user');
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isRestaurantUser: user?.role === 'restaurant_user',
    isTokenOperator: user?.role === 'token_operator',
    isAuthenticated: !!user
  }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
