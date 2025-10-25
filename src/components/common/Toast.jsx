import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const Toast = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-primary-100 text-white border-primary-200';
      case 'error':
        return 'bg-accent-200 text-white border-accent-200';
      case 'warning':
        return 'bg-accent-100 text-white border-accent-100';
      case 'info':
      default:
        return 'bg-bg-200 text-text-100 border-bg-300';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
          getIcon={getIcon}
          getStyles={getStyles}
        />
      ))}
    </div>
  );
};

const ToastItem = ({ notification, onClose, getIcon, getStyles }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg transform transition-all duration-300 animate-slide-in ${getStyles(
        notification.type
      )}`}
    >
      <div className="flex-shrink-0">{getIcon(notification.type)}</div>
      <p className="flex-1 text-sm font-medium">{notification.message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
