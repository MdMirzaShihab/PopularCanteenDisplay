import { createContext, useContext, useState, useEffect } from 'react';
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

  const login = (credentials) => {
    // For demo purposes, any credentials work
    // Try to match with mock users, otherwise create a generic admin user
    const { username, password, email } = credentials;

    let foundUser = initialUsers.find(
      u => u.username === username || u.email === email
    );

    // If no user found, create a demo admin user
    if (!foundUser) {
      foundUser = {
        id: `user-${Date.now()}`,
        name: username || email || 'Demo User',
        email: email || `${username}@canteen.com`,
        username: username || email,
        role: 'admin',
        createdAt: new Date().toISOString()
      };
    }

    // Remove password from user object before storing
    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    return { success: true, user: userWithoutPassword };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('canteen_auth_user');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isRestaurantUser = () => {
    return user?.role === 'restaurant_user';
  };

  const isTokenOperator = () => {
    return user?.role === 'token_operator';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isRestaurantUser,
    isTokenOperator,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
