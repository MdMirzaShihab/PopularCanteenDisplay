import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  initialItems,
  initialMenus,
  initialSchedules,
  initialFoodScreens,
  initialTokenScreens,
  initialActivityLogs,
  initialUsers,
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
  const { user, refreshCurrentUser } = useAuth();

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

  const [foodScreens, setFoodScreens] = useState(() => {
    // Legacy theme ID migration map
    const LEGACY_THEMES = { 'classic-grid': 'card-grid', 'portrait-list': 'clean-list' };
    const migrateThemes = (screens) => {
      const needsMigration = screens.some(s => LEGACY_THEMES[s.theme]);
      if (!needsMigration) return screens;
      const migrated = screens.map(s => ({ ...s, theme: LEGACY_THEMES[s.theme] ?? s.theme }));
      try { localStorage.setItem('canteen_food_screens', JSON.stringify(migrated)); } catch { /* ignore quota */ }
      return migrated;
    };

    const saved = localStorage.getItem('canteen_food_screens');
    if (saved) return migrateThemes(JSON.parse(saved));
    // Migration: check for old unified screens data
    const oldScreens = localStorage.getItem('canteen_screens');
    if (oldScreens) {
      const parsed = JSON.parse(oldScreens);
      const migrated = parsed.map(s => ({
        ...s,
        type: 'food',
        theme: s.displaySettings?.orientation === 'portrait' ? 'clean-list'
          : s.displaySettings?.foregroundMediaDisplay === 'fullScreen' ? 'none'
          : s.displaySettings?.foregroundMediaDisplay === 'on' ? 'media-focus'
          : 'card-grid',
        showPrices: s.displaySettings?.showPrices ?? true,
        transitionDuration: s.displaySettings?.transitionDuration ?? 500,
        slideDelay: s.displaySettings?.slideDelay ?? 5000,
      }));
      localStorage.removeItem('canteen_screens');
      return migrated;
    }
    return initialFoodScreens;
  });

  const [tokenScreens, setTokenScreens] = useState(() => {
    const saved = localStorage.getItem('canteen_token_screens');
    return saved ? JSON.parse(saved) : initialTokenScreens;
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

  // Users
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('canteen_users');
    return saved ? JSON.parse(saved) : initialUsers;
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
      localStorage.setItem('canteen_food_screens', JSON.stringify(foodScreens));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded for food screens. Media files are too large for localStorage.');
      }
    }
  }, [foodScreens]);

  useEffect(() => {
    try {
      localStorage.setItem('canteen_token_screens', JSON.stringify(tokenScreens));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded for token screens.');
      }
    }
  }, [tokenScreens]);

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

  useEffect(() => {
    try {
      localStorage.setItem('canteen_users', JSON.stringify(users));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded for users.');
      }
    }
  }, [users]);

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

  // ============= FOOD SCREENS CRUD =============
  const createFoodScreen = useCallback((screenData) => {
    const newScreen = {
      ...screenData,
      id: generateId(),
      type: 'food',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setFoodScreens(prev => [...prev, newScreen]);
    addActivityLog('CREATE', 'food_screen', newScreen.title, `Created food screen: ${newScreen.title}`,
      null, { title: newScreen.title, theme: newScreen.theme });
    return newScreen;
  }, [addActivityLog]);

  const updateFoodScreen = useCallback((id, updates) => {
    const oldScreen = foodScreens.find(s => s.id === id);
    if (!oldScreen) return null;
    const updatedScreen = { ...oldScreen, ...updates, updatedAt: new Date().toISOString() };
    setFoodScreens(prev => prev.map(s => s.id === id ? updatedScreen : s));
    addActivityLog('UPDATE', 'food_screen', updatedScreen.title, `Updated food screen: ${updatedScreen.title}`,
      { theme: oldScreen.theme }, { theme: updatedScreen.theme });
    return updatedScreen;
  }, [foodScreens, addActivityLog]);

  const deleteFoodScreen = useCallback((id) => {
    const screen = foodScreens.find(s => s.id === id);
    if (!screen) return { success: false, error: 'Screen not found' };
    setFoodScreens(prev => prev.filter(s => s.id !== id));
    addActivityLog('DELETE', 'food_screen', screen.title, `Deleted food screen: ${screen.title}`,
      { title: screen.title }, null);
    return { success: true };
  }, [foodScreens, addActivityLog]);

  // ============= TOKEN SCREENS CRUD =============
  const createTokenScreen = useCallback((screenData) => {
    const newScreen = {
      ...screenData,
      id: generateId(),
      type: 'token',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTokenScreens(prev => [...prev, newScreen]);
    addActivityLog('CREATE', 'token_screen', newScreen.title, `Created token screen: ${newScreen.title}`,
      null, { title: newScreen.title });
    return newScreen;
  }, [addActivityLog]);

  const updateTokenScreen = useCallback((id, updates) => {
    const oldScreen = tokenScreens.find(s => s.id === id);
    if (!oldScreen) return null;
    const updatedScreen = { ...oldScreen, ...updates, updatedAt: new Date().toISOString() };
    setTokenScreens(prev => prev.map(s => s.id === id ? updatedScreen : s));
    addActivityLog('UPDATE', 'token_screen', updatedScreen.title, `Updated token screen: ${updatedScreen.title}`,
      { title: oldScreen.title }, { title: updatedScreen.title });
    return updatedScreen;
  }, [tokenScreens, addActivityLog]);

  const deleteTokenScreen = useCallback((id) => {
    const screen = tokenScreens.find(s => s.id === id);
    if (!screen) return { success: false, error: 'Screen not found' };
    setTokenScreens(prev => prev.filter(s => s.id !== id));
    addActivityLog('DELETE', 'token_screen', screen.title, `Deleted token screen: ${screen.title}`,
      { title: screen.title }, null);
    return { success: true };
  }, [tokenScreens, addActivityLog]);

  // Unified lookup for gallery route (searches both types)
  const getScreenById = useCallback((id) => {
    return foodScreens.find(s => s.id === id) || tokenScreens.find(s => s.id === id);
  }, [foodScreens, tokenScreens]);

  // ============= USERS CRUD =============
  const createUser = useCallback((userData) => {
    const duplicate = users.find(
      u => u.username === userData.username || u.email === userData.email
    );
    if (duplicate) {
      return {
        success: false,
        error: duplicate.username === userData.username
          ? 'Username already exists'
          : 'Email already in use'
      };
    }

    const newUser = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    addActivityLog('CREATE', 'user', newUser.name,
      `Created user: ${newUser.username} (${newUser.role})`,
      null, { username: newUser.username, role: newUser.role }
    );
    return { success: true, user: newUser };
  }, [users, addActivityLog]);

  const updateUser = useCallback((id, updates) => {
    const oldUser = users.find(u => u.id === id);
    if (!oldUser) return { success: false, error: 'User not found' };

    // Check uniqueness against other users
    const conflict = users.find(u => u.id !== id && (
      (updates.username && u.username === updates.username) ||
      (updates.email && u.email === updates.email)
    ));
    if (conflict) {
      return {
        success: false,
        error: conflict.username === updates.username
          ? 'Username already taken'
          : 'Email already in use'
      };
    }

    // Keep existing password if blank on edit
    const password = updates.password && updates.password.trim().length > 0
      ? updates.password
      : oldUser.password;

    const updatedUser = {
      ...oldUser,
      ...updates,
      password,
      updatedAt: new Date().toISOString()
    };
    const passwordChanged = password !== oldUser.password;

    setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
    addActivityLog('UPDATE', 'user', updatedUser.name,
      `Updated user: ${updatedUser.username}`,
      { role: oldUser.role, name: oldUser.name },
      { role: updatedUser.role, name: updatedUser.name }
    );

    // Force logout if current user's password was changed
    if (passwordChanged && user?.id === id) {
      refreshCurrentUser(null);
    }
    // Refresh session if current user's profile (non-password) was updated
    else if (user?.id === id) {
      refreshCurrentUser(updatedUser);
    }

    return { success: true, user: updatedUser };
  }, [users, user, addActivityLog, refreshCurrentUser]);

  const deleteUser = useCallback((id) => {
    const targetUser = users.find(u => u.id === id);
    if (!targetUser) return { success: false, error: 'User not found' };

    // Prevent deleting the last admin
    if (targetUser.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        return { success: false, error: 'Cannot delete the last admin account' };
      }
    }

    setUsers(prev => prev.filter(u => u.id !== id));
    addActivityLog('DELETE', 'user', targetUser.name,
      `Deleted user: ${targetUser.username}`,
      { username: targetUser.username, role: targetUser.role }, null
    );

    // Force logout if current user was deleted
    if (user?.id === id) {
      refreshCurrentUser(null);
    }

    return { success: true };
  }, [users, user, addActivityLog, refreshCurrentUser]);

  const getUserById = useCallback((id) => users.find(u => u.id === id), [users]);

  // ============= SERVING TOKEN =============
  const updateServingToken = useCallback((tokenNumber) => {
    const tokenData = {
      number: tokenNumber,
      updatedAt: new Date().toISOString()
    };

    // Add new token to the front of history, keep only last 10
    setTokenHistory(prev => {
      addActivityLog('UPDATE', 'token', 'Serving Token', `Updated serving token to: ${tokenNumber}`,
        { number: prev[0]?.number || null },
        { number: tokenNumber }
      );
      return [tokenData, ...prev].slice(0, 10);
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
    setFoodScreens(initialFoodScreens);
    setTokenScreens(initialTokenScreens);
    setUsers(initialUsers);
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

    // Food Screens
    foodScreens,
    createFoodScreen,
    updateFoodScreen,
    deleteFoodScreen,
    // Token Screens
    tokenScreens,
    createTokenScreen,
    updateTokenScreen,
    deleteTokenScreen,
    // Unified lookup
    getScreenById,

    // Users
    users,
    createUser,
    updateUser,
    deleteUser,
    getUserById,

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
    foodScreens, createFoodScreen, updateFoodScreen, deleteFoodScreen,
    tokenScreens, createTokenScreen, updateTokenScreen, deleteTokenScreen,
    getScreenById,
    users, createUser, updateUser, deleteUser, getUserById,
    servingToken, tokenHistory, updateServingToken, clearServingToken,
    activityLogs, getActivityLogs,
    clearAllData
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
