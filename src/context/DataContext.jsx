import { createContext, useContext, useState, useEffect } from 'react';
import {
  initialItems,
  initialMenus,
  initialSchedules,
  initialScreens,
  initialActivityLogs,
  generateId
} from '../data/mockData';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();

  // Initialize state from localStorage or use initial data
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('canteen_items');
    return saved ? JSON.parse(saved) : initialItems;
  });

  const [menus, setMenus] = useState(() => {
    const saved = localStorage.getItem('canteen_menus');
    return saved ? JSON.parse(saved) : initialMenus;
  });

  const [schedules, setSchedules] = useState(() => {
    const saved = localStorage.getItem('canteen_schedules');
    return saved ? JSON.parse(saved) : initialSchedules;
  });

  const [screens, setScreens] = useState(() => {
    const saved = localStorage.getItem('canteen_screens');
    return saved ? JSON.parse(saved) : initialScreens;
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('canteen_logs');
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });

  // Token history: stores last 3 tokens (most recent first)
  const [tokenHistory, setTokenHistory] = useState(() => {
    const saved = localStorage.getItem('canteen_token_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('canteen_items', JSON.stringify(items));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded for items. Consider reducing image sizes or using fewer items.');
      } else {
        console.error('Error saving items to localStorage:', error);
      }
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('canteen_menus', JSON.stringify(menus));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded for menus.');
      } else {
        console.error('Error saving menus to localStorage:', error);
      }
    }
  }, [menus]);

  useEffect(() => {
    try {
      localStorage.setItem('canteen_schedules', JSON.stringify(schedules));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded for schedules.');
      } else {
        console.error('Error saving schedules to localStorage:', error);
      }
    }
  }, [schedules]);

  useEffect(() => {
    try {
      localStorage.setItem('canteen_screens', JSON.stringify(screens));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded for screens. Media files are too large for localStorage.');
        alert('Storage limit exceeded! Screen media files are too large. Please use smaller images/videos (recommended: compress images to under 500KB and limit videos to 30 seconds).');
      } else {
        console.error('Error saving screens to localStorage:', error);
      }
    }
  }, [screens]);

  useEffect(() => {
    try {
      localStorage.setItem('canteen_logs', JSON.stringify(activityLogs));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded for logs. Clearing old logs...');
        // Keep only last 50 logs
        const trimmedLogs = activityLogs.slice(0, 50);
        setActivityLogs(trimmedLogs);
      } else {
        console.error('Error saving logs to localStorage:', error);
      }
    }
  }, [activityLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('canteen_token_history', JSON.stringify(tokenHistory));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded for token history.');
      } else {
        console.error('Error saving token history to localStorage:', error);
      }
    }
  }, [tokenHistory]);

  // Listen for storage changes from other tabs/windows (for real-time token updates across screens)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Only react to changes in the token history
      if (e.key === 'canteen_token_history') {
        if (e.newValue) {
          const newHistory = JSON.parse(e.newValue);
          setTokenHistory(newHistory);
        } else {
          // History was cleared
          setTokenHistory([]);
        }
      }
    };

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Polling fallback for same-tab updates (checks every 3 seconds)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      const stored = localStorage.getItem('canteen_token_history');
      const storedHistory = stored ? JSON.parse(stored) : [];

      // Only update if the value has actually changed
      if (JSON.stringify(tokenHistory) !== JSON.stringify(storedHistory)) {
        setTokenHistory(storedHistory);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(pollInterval);
  }, [tokenHistory]);

  // Activity logging helper
  const addActivityLog = (action, resourceType, resourceName, details, beforeData = null, afterData = null) => {
    if (!user) return;

    const log = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      action, // CREATE, UPDATE, DELETE
      resourceType, // item, menu, schedule, screen
      resourceName,
      details,
      beforeData,
      afterData
    };

    setActivityLogs(prev => [log, ...prev]);
  };

  // ============= ITEMS CRUD =============
  const createItem = (itemData) => {
    const newItem = {
      ...itemData,
      id: generateId(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setItems(prev => [...prev, newItem]);
    addActivityLog('CREATE', 'item', newItem.name, `Added new item: ${newItem.name}`, null, { name: newItem.name, price: newItem.price });
    return newItem;
  };

  const updateItem = (id, updates) => {
    const oldItem = items.find(i => i.id === id);
    if (!oldItem) return null;

    const updatedItem = {
      ...oldItem,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setItems(prev => prev.map(i => i.id === id ? updatedItem : i));
    addActivityLog('UPDATE', 'item', updatedItem.name, `Updated item: ${updatedItem.name}`,
      { price: oldItem.price, description: oldItem.description },
      { price: updatedItem.price, description: updatedItem.description }
    );
    return updatedItem;
  };

  const deleteItem = (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return false;

    // Check if item is used in any menu
    const usedInMenus = menus.filter(m => m.itemIds.includes(id));
    if (usedInMenus.length > 0) {
      return {
        success: false,
        error: `Cannot delete. Item is used in ${usedInMenus.length} menu(s): ${usedInMenus.map(m => m.title).join(', ')}`
      };
    }

    setItems(prev => prev.filter(i => i.id !== id));
    addActivityLog('DELETE', 'item', item.name, `Deleted item: ${item.name}`, { name: item.name, price: item.price }, null);
    return { success: true };
  };

  const getItemById = (id) => items.find(i => i.id === id);

  const getItemsByIds = (ids) => items.filter(i => ids.includes(i.id));

  // ============= MENUS CRUD =============
  const createMenu = (menuData) => {
    const newMenu = {
      ...menuData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMenus(prev => [...prev, newMenu]);
    addActivityLog('CREATE', 'menu', newMenu.title, `Created menu: ${newMenu.title} with ${newMenu.itemIds.length} items`,
      null, { title: newMenu.title, itemsCount: newMenu.itemIds.length });
    return newMenu;
  };

  const updateMenu = (id, updates) => {
    const oldMenu = menus.find(m => m.id === id);
    if (!oldMenu) return null;

    const updatedMenu = {
      ...oldMenu,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setMenus(prev => prev.map(m => m.id === id ? updatedMenu : m));
    addActivityLog('UPDATE', 'menu', updatedMenu.title, `Updated menu: ${updatedMenu.title}`,
      { itemsCount: oldMenu.itemIds.length },
      { itemsCount: updatedMenu.itemIds.length }
    );
    return updatedMenu;
  };

  const deleteMenu = (id) => {
    const menu = menus.find(m => m.id === id);
    if (!menu) return false;

    // Check if menu is used in any schedule
    const usedInSchedules = schedules.filter(s =>
      s.defaultMenuId === id || s.timeSlots.some(slot => slot.menuId === id)
    );

    if (usedInSchedules.length > 0) {
      return {
        success: false,
        error: `Cannot delete. Menu is used in ${usedInSchedules.length} schedule(s): ${usedInSchedules.map(s => s.name).join(', ')}`
      };
    }

    setMenus(prev => prev.filter(m => m.id !== id));
    addActivityLog('DELETE', 'menu', menu.title, `Deleted menu: ${menu.title}`,
      { title: menu.title, itemsCount: menu.itemIds.length }, null);
    return { success: true };
  };

  const getMenuById = (id) => menus.find(m => m.id === id);

  // ============= SCHEDULES CRUD =============
  // Note: Only ONE schedule is allowed in the system. Creation is disabled.
  const createSchedule = (scheduleData) => {
    console.warn('Schedule creation is disabled. Only one schedule is allowed in the system.');
    return {
      success: false,
      error: 'Cannot create new schedule. Only one schedule is allowed in the system.'
    };
  };

  const updateSchedule = (id, updates) => {
    const oldSchedule = schedules.find(s => s.id === id);
    if (!oldSchedule) return null;

    const updatedSchedule = {
      ...oldSchedule,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setSchedules(prev => prev.map(s => s.id === id ? updatedSchedule : s));
    addActivityLog('UPDATE', 'schedule', updatedSchedule.name, `Updated schedule: ${updatedSchedule.name}`,
      { slotsCount: oldSchedule.timeSlots.length },
      { slotsCount: updatedSchedule.timeSlots.length }
    );
    return updatedSchedule;
  };

  const deleteSchedule = (id) => {
    console.warn('Schedule deletion is disabled. The system requires exactly one schedule.');
    return {
      success: false,
      error: 'Cannot delete schedule. The system requires exactly one schedule to operate.'
    };
  };

  const getScheduleById = (id) => schedules.find(s => s.id === id);

  // Get the single schedule (there should only be one)
  const getSingleSchedule = () => schedules[0] || null;

  // ============= SCREENS CRUD =============
  const createScreen = (screenData) => {
    const newScreen = {
      ...screenData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setScreens(prev => [...prev, newScreen]);
    addActivityLog('CREATE', 'screen', newScreen.title, `Created screen: ${newScreen.title}`,
      null, { title: newScreen.title, scheduleId: newScreen.scheduleId });
    return newScreen;
  };

  const updateScreen = (id, updates) => {
    const oldScreen = screens.find(s => s.id === id);
    if (!oldScreen) return null;

    const updatedScreen = {
      ...oldScreen,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setScreens(prev => prev.map(s => s.id === id ? updatedScreen : s));
    addActivityLog('UPDATE', 'screen', updatedScreen.title, `Updated screen: ${updatedScreen.title}`,
      { scheduleId: oldScreen.scheduleId },
      { scheduleId: updatedScreen.scheduleId }
    );
    return updatedScreen;
  };

  const deleteScreen = (id) => {
    const screen = screens.find(s => s.id === id);
    if (!screen) return false;

    setScreens(prev => prev.filter(s => s.id !== id));
    addActivityLog('DELETE', 'screen', screen.title, `Deleted screen: ${screen.title}`,
      { title: screen.title }, null);
    return { success: true };
  };

  const getScreenById = (id) => screens.find(s => s.id === id);

  // ============= SERVING TOKEN =============
  const updateServingToken = (tokenNumber) => {
    const tokenData = {
      number: tokenNumber,
      updatedAt: new Date().toISOString()
    };

    // Add new token to the front of history, keep only last 3
    setTokenHistory(prev => [tokenData, ...prev].slice(0, 3));

    addActivityLog('UPDATE', 'token', 'Serving Token', `Updated serving token to: ${tokenNumber}`,
      { number: tokenHistory[0]?.number || null },
      { number: tokenNumber }
    );
    return tokenData;
  };

  const clearServingToken = () => {
    setTokenHistory([]);
    addActivityLog('UPDATE', 'token', 'Serving Token', 'Cleared all tokens',
      { number: tokenHistory[0]?.number || null },
      null
    );
  };

  // Get current serving token (first in history)
  const servingToken = tokenHistory.length > 0 ? tokenHistory[0] : null;

  // ============= ACTIVITY LOGS =============
  const getActivityLogs = (filters = {}) => {
    let filtered = [...activityLogs];

    if (filters.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }

    if (filters.resourceType) {
      filtered = filtered.filter(log => log.resourceType === filters.resourceType);
    }

    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters.startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    return filtered;
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This will reset to initial demo data.')) {
      setItems(initialItems);
      setMenus(initialMenus);
      setSchedules(initialSchedules);
      setScreens(initialScreens);
      setActivityLogs(initialActivityLogs);
      addActivityLog('RESET', 'system', 'All Data', 'Reset all data to initial demo state');
    }
  };

  const value = {
    // Items
    items,
    createItem,
    updateItem,
    deleteItem,
    getItemById,
    getItemsByIds,

    // Menus
    menus,
    createMenu,
    updateMenu,
    deleteMenu,
    getMenuById,

    // Schedules
    schedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getScheduleById,
    getSingleSchedule,

    // Screens
    screens,
    createScreen,
    updateScreen,
    deleteScreen,
    getScreenById,

    // Serving Token
    servingToken,
    tokenHistory,
    updateServingToken,
    clearServingToken,

    // Activity Logs
    activityLogs,
    getActivityLogs,

    // Utility
    clearAllData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
