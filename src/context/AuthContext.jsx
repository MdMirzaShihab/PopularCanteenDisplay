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
    const { username, password } = credentials;

    // Read live user list from localStorage; fall back to seed data on first run
    const stored = localStorage.getItem('canteen_users');
    const users = stored ? JSON.parse(stored) : initialUsers;

    const foundUser = users.find(
      u => u.username === username || u.email === username
    );

    if (!foundUser || foundUser.password !== password) {
      return { success: false, error: 'Invalid username or password' };
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

  // Called by DataContext when the current user is deleted or password changed
  const refreshCurrentUser = useCallback((updatedUser) => {
    if (!updatedUser) {
      // User was deleted — force logout
      setUser(null);
      localStorage.removeItem('canteen_auth_user');
    } else {
      // Profile updated — refresh session without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    refreshCurrentUser,
    isAdmin: user?.role === 'admin',
    isRestaurantUser: user?.role === 'restaurant_user',
    isTokenOperator: user?.role === 'token_operator',
    isAuthenticated: !!user
  }), [user, loading, login, logout, refreshCurrentUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
