import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
      }
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('canteen_menus', JSON.stringify(menus));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded for menus.');
      }
    }
  }, [menus]);

  useEffect(() => {
    try {
      localStorage.setItem('canteen_schedules', JSON.stringify(schedules));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded for schedules.');
      }
    }
  }, [schedules]);

  useEffect(() => {
    try {
      localStorage.setItem('canteen_screens', JSON.stringify(screens));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded for screens. Media files are too large for localStorage.');
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
      }
    }
  }, [activityLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('canteen_token_history', JSON.stringify(tokenHistory));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded for token history.');
      }
    }
  }, [tokenHistory]);

  // Listen for storage changes from other tabs/windows (for real-time token updates across screens)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Only react to changes in the token history
      if (e.key === 'canteen_token_history') {
        if (e.newValue) {
          try {
            const newHistory = JSON.parse(e.newValue);
            setTokenHistory(newHistory);
          } catch {
            // Ignore malformed storage values
          }
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
  const tokenHistoryRef = useRef(tokenHistory);
  tokenHistoryRef.current = tokenHistory;

  useEffect(() => {
    const pollInterval = setInterval(() => {
      const stored = localStorage.getItem('canteen_token_history');
      const storedHistory = stored ? JSON.parse(stored) : [];
      const current = tokenHistoryRef.current;

      // Cheap comparison before full stringify
      if (storedHistory.length !== current.length ||
          storedHistory[0]?.number !== current[0]?.number ||
          storedHistory[0]?.updatedAt !== current[0]?.updatedAt) {
        setTokenHistory(storedHistory);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []); // No dependency on tokenHistory — uses ref instead

  // Activity logging helper
  const addActivityLog = useCallback((action, resourceType, resourceName, details, beforeData = null, afterData = null) => {
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
  }, [user]);

  // ============= ITEMS CRUD =============
  const createItem = useCallback((itemData) => {
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
  }, [addActivityLog]);

  const updateItem = useCallback((id, updates) => {
    let updatedItem = null;
    setItems(prev => {
      const oldItem = prev.find(i => i.id === id);
      if (!oldItem) return prev;
      updatedItem = { ...oldItem, ...updates, updatedAt: new Date().toISOString() };
      addActivityLog('UPDATE', 'item', updatedItem.name, `Updated item: ${updatedItem.name}`,
        { price: oldItem.price, description: oldItem.description },
        { price: updatedItem.price, description: updatedItem.description }
      );
      return prev.map(i => i.id === id ? updatedItem : i);
    });
    return updatedItem;
  }, [addActivityLog]);

  const deleteItem = useCallback((id) => {
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
  }, [items, menus, addActivityLog]);

  const getItemById = useCallback((id) => items.find(i => i.id === id), [items]);

  const getItemsByIds = useCallback((ids) => items.filter(i => ids.includes(i.id)), [items]);

  // ============= MENUS CRUD =============
  const createMenu = useCallback((menuData) => {
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
  }, [addActivityLog]);

  const updateMenu = useCallback((id, updates) => {
    let updatedMenu = null;
    setMenus(prev => {
      const oldMenu = prev.find(m => m.id === id);
      if (!oldMenu) return prev;
      updatedMenu = { ...oldMenu, ...updates, updatedAt: new Date().toISOString() };
      addActivityLog('UPDATE', 'menu', updatedMenu.title, `Updated menu: ${updatedMenu.title}`,
        { itemsCount: oldMenu.itemIds.length },
        { itemsCount: updatedMenu.itemIds.length }
      );
      return prev.map(m => m.id === id ? updatedMenu : m);
    });
    return updatedMenu;
  }, [addActivityLog]);

  const deleteMenu = useCallback((id) => {
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
  }, [menus, schedules, addActivityLog]);

  const getMenuById = useCallback((id) => menus.find(m => m.id === id), [menus]);

  // ============= SCHEDULES CRUD =============
  // Note: Only ONE schedule is allowed in the system. Creation is disabled.
  const createSchedule = useCallback(() => {
    return {
      success: false,
      error: 'Cannot create new schedule. Only one schedule is allowed in the system.'
    };
  }, []);

  const updateSchedule = useCallback((id, updates) => {
    let updatedSchedule = null;
    setSchedules(prev => {
      const oldSchedule = prev.find(s => s.id === id);
      if (!oldSchedule) return prev;
      updatedSchedule = { ...oldSchedule, ...updates, updatedAt: new Date().toISOString() };
      addActivityLog('UPDATE', 'schedule', updatedSchedule.name, `Updated schedule: ${updatedSchedule.name}`,
        { slotsCount: oldSchedule.timeSlots.length },
        { slotsCount: updatedSchedule.timeSlots.length }
      );
      return prev.map(s => s.id === id ? updatedSchedule : s);
    });
    return updatedSchedule;
  }, [addActivityLog]);

  const deleteSchedule = useCallback(() => {
    return {
      success: false,
      error: 'Cannot delete schedule. The system requires exactly one schedule to operate.'
    };
  }, []);

  const getScheduleById = useCallback((id) => schedules.find(s => s.id === id), [schedules]);

  // Get the single schedule (there should only be one)
  const getSingleSchedule = useCallback(() => schedules[0] || null, [schedules]);

  // ============= SCREENS CRUD =============
  const createScreen = useCallback((screenData) => {
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
  }, [addActivityLog]);

  const updateScreen = useCallback((id, updates) => {
    let updatedScreen = null;
    setScreens(prev => {
      const oldScreen = prev.find(s => s.id === id);
      if (!oldScreen) return prev;
      updatedScreen = { ...oldScreen, ...updates, updatedAt: new Date().toISOString() };
      addActivityLog('UPDATE', 'screen', updatedScreen.title, `Updated screen: ${updatedScreen.title}`,
        { scheduleId: oldScreen.scheduleId },
        { scheduleId: updatedScreen.scheduleId }
      );
      return prev.map(s => s.id === id ? updatedScreen : s);
    });
    return updatedScreen;
  }, [addActivityLog]);

  const deleteScreen = useCallback((id) => {
    const screen = screens.find(s => s.id === id);
    if (!screen) return false;

    setScreens(prev => prev.filter(s => s.id !== id));
    addActivityLog('DELETE', 'screen', screen.title, `Deleted screen: ${screen.title}`,
      { title: screen.title }, null);
    return { success: true };
  }, [screens, addActivityLog]);

  const getScreenById = useCallback((id) => screens.find(s => s.id === id), [screens]);

  // ============= SERVING TOKEN =============
  const updateServingToken = useCallback((tokenNumber) => {
    const tokenData = {
      number: tokenNumber,
      updatedAt: new Date().toISOString()
    };

    // Add new token to the front of history, keep only last 3
    setTokenHistory(prev => {
      addActivityLog('UPDATE', 'token', 'Serving Token', `Updated serving token to: ${tokenNumber}`,
        { number: prev[0]?.number || null },
        { number: tokenNumber }
      );
      return [tokenData, ...prev].slice(0, 3);
    });

    return tokenData;
  }, [addActivityLog]);

  const clearServingToken = useCallback(() => {
    setTokenHistory(prev => {
      addActivityLog('UPDATE', 'token', 'Serving Token', 'Cleared all tokens',
        { number: prev[0]?.number || null },
        null
      );
      return [];
    });
  }, [addActivityLog]);

  // Get current serving token (first in history)
  const servingToken = tokenHistory.length > 0 ? tokenHistory[0] : null;

  // ============= ACTIVITY LOGS =============
  const getActivityLogs = useCallback((filters = {}) => {
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
  }, [activityLogs]);

  const clearAllData = useCallback(() => {
    setItems(initialItems);
    setMenus(initialMenus);
    setSchedules(initialSchedules);
    setScreens(initialScreens);
    setActivityLogs(initialActivityLogs);
    addActivityLog('RESET', 'system', 'All Data', 'Reset all data to initial demo state');
  }, [addActivityLog]);

  const value = useMemo(() => ({
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
  }), [
    items, createItem, updateItem, deleteItem, getItemById, getItemsByIds,
    menus, createMenu, updateMenu, deleteMenu, getMenuById,
    schedules, createSchedule, updateSchedule, deleteSchedule, getScheduleById, getSingleSchedule,
    screens, createScreen, updateScreen, deleteScreen, getScreenById,
    servingToken, tokenHistory, updateServingToken, clearServingToken,
    activityLogs, getActivityLogs,
    clearAllData
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
