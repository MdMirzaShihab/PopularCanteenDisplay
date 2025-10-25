import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info') => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const notification = {
      id,
      message,
      type // success, error, warning, info
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 3000);

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const success = useCallback((message) => {
    return addNotification(message, 'success');
  }, [addNotification]);

  const error = useCallback((message) => {
    return addNotification(message, 'error');
  }, [addNotification]);

  const warning = useCallback((message) => {
    return addNotification(message, 'warning');
  }, [addNotification]);

  const info = useCallback((message) => {
    return addNotification(message, 'info');
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
