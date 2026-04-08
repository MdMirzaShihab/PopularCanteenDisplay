# localStorage to Backend API Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all frontend pages and components from localStorage-based `DataContext` to backend API domain hooks, then clean up legacy code.

**Architecture:** Replace every `useData()` call with the corresponding domain hook (`useItems`, `useMenus`, etc.). Rewrite `AuthContext` to authenticate via backend API instead of localStorage. Wire gallery components to `useSocketTokens` for real-time updates and `screens.api.js` for public screen lookup. Delete `DataContext.jsx` and `mockData.js` once all consumers are migrated.

**Tech Stack:** React 19, Vite, Axios, Socket.io-client, Express backend on port 5001, MongoDB Atlas, cookie-based JWT auth.

---

## File Map

### Files to Modify

| File | Change |
|------|--------|
| `src/context/AuthContext.jsx` | Rewrite login/logout/restore to use backend API |
| `src/pages/LoginPage.jsx` | Make login async, update error handling |
| `src/pages/ItemsPage.jsx` | Replace `useData()` with `useItems()` |
| `src/pages/MenusPage.jsx` | Replace `useData()` with `useMenus()` |
| `src/pages/ScreensPage.jsx` | Replace `useData()` with `useFoodScreens()` + `useTokenScreens()` |
| `src/pages/TokenManagementPage.jsx` | Replace `useData()` with `useTokens()` |
| `src/pages/UsersPage.jsx` | Replace `useData()` with `useUsers()` |
| `src/pages/LogsPage.jsx` | Replace `useData()` with `useLogs()` |
| `src/pages/Dashboard.jsx` | Replace `useData()` with multiple hooks |
| `src/pages/GalleryViewPage.jsx` | Replace `useData()` with `screens.api.js` |
| `src/components/menus/MenuItemSelector.jsx` | Replace `useData()` with `useItems()` |
| `src/components/menus/MenuCard.jsx` | Remove `useData()`, receive items via props |
| `src/components/screens/FoodScreenForm.jsx` | Replace `useData()` with `useMenus()` |
| `src/components/gallery/TokenGalleryDisplay.jsx` | Replace `useData()` with `useSocketTokens()` |
| `src/components/gallery/ScreenGridRenderer.jsx` | Remove `useData()`, receive data via props from populated API response |
| `src/main.jsx` | Remove `DataProvider` |

### Files to Delete

| File | Reason |
|------|--------|
| `src/context/DataContext.jsx` | All consumers migrated |
| `src/data/mockData.js` | No longer needed (seed data is in MongoDB) |
| `src/hooks/useTokenArchive.js` | Replaced by `useTokens()` archive functionality |

---

## Task 1: Rewrite AuthContext for Backend API

**Files:**
- Modify: `src/context/AuthContext.jsx`
- Reference: `src/api/auth.api.js`, `src/api/client.js`

This is the foundation — nothing works until login hits the backend.

- [ ] **Step 1: Rewrite AuthContext.jsx**

Replace the entire file contents with:

```jsx
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
```

Key changes:
- `login()` is now **async** and **throws on failure** (no more `{ success, error }` pattern)
- Session restored via `GET /auth/me` on mount (cookie-based)
- 401 interceptor auto-logs out via `registerAuthExpiredHandler`
- Removed `refreshCurrentUser` (not needed — backend manages user state)
- Removed all localStorage reads/writes
- Removed `initialUsers` import from `mockData.js`

- [ ] **Step 2: Update LoginPage.jsx for async login**

Replace the `handleSubmit` and `handleDemoLogin` functions:

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!credentials.username) {
    error('Please enter a username or email');
    return;
  }

  try {
    const data = await login(credentials);
    success(`Welcome back, ${data.user.name}!`);
    navigate('/dashboard');
  } catch (err) {
    error(err.message || 'Login failed. Please try again.');
  }
};

const handleDemoLogin = async (role) => {
  let demoCredentials;
  if (role === 'admin') {
    demoCredentials = { username: 'admin', password: 'admin123' };
  } else if (role === 'operator') {
    demoCredentials = { username: 'operator', password: 'operator123' };
  } else {
    demoCredentials = { username: 'manager', password: 'manager123' };
  }

  setCredentials(demoCredentials);
  try {
    const data = await login(demoCredentials);
    success(`Logged in as ${data.user.name}!`);
    navigate(role === 'operator' ? '/token' : '/dashboard');
  } catch (err) {
    error(err.message || 'Demo login failed.');
  }
};
```

- [ ] **Step 3: Verify login works**

Run: Start frontend with `npm run dev`, navigate to `http://localhost:5173`, click "Admin Account" demo login.
Expected: Redirects to `/dashboard`. Backend console shows login request.

- [ ] **Step 4: Verify session restore works**

Run: Refresh the page after logging in.
Expected: Should stay logged in (cookie-based session restore via `GET /auth/me`).

- [ ] **Step 5: Commit**

```bash
git add src/context/AuthContext.jsx src/pages/LoginPage.jsx
git commit -m "feat: rewrite AuthContext to use backend API instead of localStorage"
```

---

## Task 2: Migrate ItemsPage

**Files:**
- Modify: `src/pages/ItemsPage.jsx`

- [ ] **Step 1: Replace useData with useItems**

In `src/pages/ItemsPage.jsx`, change the import and hook call:

```jsx
// REMOVE this line:
import { useData } from '../context/DataContext';

// ADD this line:
import { useItems } from '../hooks/useItems';
```

Replace line 11:
```jsx
// REMOVE:
const { items, createItem, updateItem, deleteItem } = useData();

// ADD:
const { items, loading, createItem, updateItem, deleteItem } = useItems();
```

- [ ] **Step 2: Make CRUD operations async with proper error handling**

Replace `handleSubmit` (lines 32-46):
```jsx
const handleSubmit = async (formData) => {
  try {
    if (editingItem) {
      await updateItem(editingItem._id, formData);
      success('Item updated successfully!');
    } else {
      await createItem(formData);
      success('Item created successfully!');
    }
    setIsModalOpen(false);
    setEditingItem(null);
  } catch (err) {
    error(err.message || 'Failed to save item. Please try again.');
  }
};
```

Replace `confirmDelete` (lines 48-56):
```jsx
const confirmDelete = async () => {
  try {
    await deleteItem(deletingItem._id);
    success('Item deleted successfully!');
  } catch (err) {
    error(err.message || 'Failed to delete item.');
  }
  setDeletingItem(null);
};
```

Note: `.id` changes to `._id` because MongoDB uses `_id`.

- [ ] **Step 3: Add loading state to the JSX**

After the header div and before `<ItemList>`, add:
```jsx
{loading ? (
  <div className="text-center py-12">
    <p className="text-text-200">Loading items...</p>
  </div>
) : (
  <ItemList
    items={items}
    onEdit={handleEdit}
    onDelete={handleDelete}
  />
)}
```

- [ ] **Step 4: Verify items page works**

Run: Navigate to `/items` in the browser.
Expected: Items load from the backend (16 seeded items). Create, edit, delete all work.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ItemsPage.jsx
git commit -m "feat: migrate ItemsPage from localStorage to useItems API hook"
```

---

## Task 3: Migrate MenusPage + MenuItemSelector + MenuCard

**Files:**
- Modify: `src/pages/MenusPage.jsx`
- Modify: `src/components/menus/MenuItemSelector.jsx`
- Modify: `src/components/menus/MenuCard.jsx`

- [ ] **Step 1: Update MenusPage.jsx**

Replace import and hook:
```jsx
// REMOVE:
import { useData } from '../context/DataContext';

// ADD:
import { useMenus } from '../hooks/useMenus';
```

Replace line 11:
```jsx
// REMOVE:
const { menus, createMenu, updateMenu, deleteMenu } = useData();

// ADD:
const { menus, loading, createMenu, updateMenu, deleteMenu } = useMenus();
```

Replace `handleSubmit` (lines 32-46):
```jsx
const handleSubmit = async (formData) => {
  try {
    if (editingMenu) {
      await updateMenu(editingMenu._id, formData);
      success('Menu updated successfully!');
    } else {
      await createMenu(formData);
      success('Menu created successfully!');
    }
    setIsModalOpen(false);
    setEditingMenu(null);
  } catch (err) {
    error(err.message || 'Failed to save menu. Please try again.');
  }
};
```

Replace `confirmDelete` (lines 48-56):
```jsx
const confirmDelete = async () => {
  try {
    await deleteMenu(deletingMenu._id);
    success('Menu deleted successfully!');
  } catch (err) {
    error(err.message || 'Failed to delete menu.');
  }
  setDeletingMenu(null);
};
```

Add loading state before `<MenuList>`:
```jsx
{loading ? (
  <div className="text-center py-12">
    <p className="text-text-200">Loading menus...</p>
  </div>
) : (
  <MenuList menus={menus} onEdit={handleEdit} onDelete={handleDelete} />
)}
```

- [ ] **Step 2: Update MenuItemSelector.jsx**

This component currently calls `useData()` to get items. Replace with `useItems()`:

```jsx
// REMOVE:
import { useData } from '../../context/DataContext';

// ADD:
import { useItems } from '../../hooks/useItems';
```

Replace the hook call:
```jsx
// REMOVE:
const { items } = useData();

// ADD:
const { items } = useItems();
```

The rest of the component logic (`activeItems` filter, `selectedItems` lookup) works unchanged because both sources return arrays of item objects.

- [ ] **Step 3: Update MenuCard.jsx**

This component calls `useData()` for `getItemsByIds`. Since the API menus come with populated `items` arrays (the backend populates them), we need to adjust.

Read `MenuCard.jsx` fully first to check how it uses `getItemsByIds`. The backend returns menus with `items` already populated as full objects (not just IDs). So `MenuCard` should receive items from the menu object itself.

Replace the useData import and call:
```jsx
// REMOVE:
import { useData } from '../../context/DataContext';

// Inside the component, REMOVE:
const { getItemsByIds } = useData();
const menuItems = getItemsByIds(menu.itemIds);

// REPLACE with:
const menuItems = menu.items || [];
```

The backend populates `menu.items` with full item objects, so no separate lookup is needed.

- [ ] **Step 4: Verify menus page works**

Run: Navigate to `/menus` in the browser.
Expected: 4 seeded menus load. Menu cards show item previews. Create/edit/delete work.

- [ ] **Step 5: Commit**

```bash
git add src/pages/MenusPage.jsx src/components/menus/MenuItemSelector.jsx src/components/menus/MenuCard.jsx
git commit -m "feat: migrate MenusPage, MenuItemSelector, and MenuCard to API hooks"
```

---

## Task 4: Migrate ScreensPage + FoodScreenForm

**Files:**
- Modify: `src/pages/ScreensPage.jsx`
- Modify: `src/components/screens/FoodScreenForm.jsx`

- [ ] **Step 1: Update ScreensPage.jsx**

Replace import and hook:
```jsx
// REMOVE:
import { useData } from '../context/DataContext';

// ADD:
import { useFoodScreens } from '../hooks/useFoodScreens';
import { useTokenScreens } from '../hooks/useTokenScreens';
```

Replace lines 12-16:
```jsx
// REMOVE:
const {
  foodScreens, createFoodScreen, updateFoodScreen, deleteFoodScreen,
  tokenScreens, createTokenScreen, updateTokenScreen, deleteTokenScreen
} = useData();

// ADD:
const { foodScreens, loading: foodLoading, createFoodScreen, updateFoodScreen, deleteFoodScreen, duplicateFoodScreen } = useFoodScreens();
const { tokenScreens, loading: tokenLoading, createTokenScreen, updateTokenScreen, deleteTokenScreen } = useTokenScreens();
```

Replace `handleDuplicate` (lines 40-48):
```jsx
const handleDuplicate = async (screen) => {
  try {
    await duplicateFoodScreen(screen._id);
    success('Screen duplicated successfully!');
  } catch (err) {
    error(err.message || 'Failed to duplicate screen. Please try again.');
  }
};
```

Replace `handleFoodSubmit` (lines 50-64):
```jsx
const handleFoodSubmit = async (formData) => {
  try {
    if (editingScreen) {
      await updateFoodScreen(editingScreen._id, formData);
      success('Food screen updated successfully!');
    } else {
      await createFoodScreen(formData);
      success('Food screen created successfully!');
    }
    setIsModalOpen(false);
    setEditingScreen(null);
  } catch (err) {
    error(err.message || 'Failed to save screen. Please try again.');
  }
};
```

Replace `handleTokenSubmit` (lines 66-80):
```jsx
const handleTokenSubmit = async (formData) => {
  try {
    if (editingScreen) {
      await updateTokenScreen(editingScreen._id, formData);
      success('Token screen updated successfully!');
    } else {
      await createTokenScreen(formData);
      success('Token screen created successfully!');
    }
    setIsModalOpen(false);
    setEditingScreen(null);
  } catch (err) {
    error(err.message || 'Failed to save screen. Please try again.');
  }
};
```

Replace `confirmDelete` (lines 82-91):
```jsx
const confirmDelete = async () => {
  try {
    const deleteFunc = deletingScreen?.type === 'token' ? deleteTokenScreen : deleteFoodScreen;
    await deleteFunc(deletingScreen._id);
    success('Screen deleted successfully!');
  } catch (err) {
    error(err.message || 'Failed to delete screen.');
  }
  setDeletingScreen(null);
};
```

- [ ] **Step 2: Update FoodScreenForm.jsx**

Replace `useData()` with `useMenus()`:
```jsx
// REMOVE:
import { useData } from '../../context/DataContext';

// ADD:
import { useMenus } from '../../hooks/useMenus';

// Inside component, REMOVE:
const { menus } = useData();

// ADD:
const { menus } = useMenus();
```

- [ ] **Step 3: Verify screens page works**

Run: Navigate to `/screens` in the browser.
Expected: 2 food screens and 1 token screen load. All tabs, CRUD, and duplicate work.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ScreensPage.jsx src/components/screens/FoodScreenForm.jsx
git commit -m "feat: migrate ScreensPage and FoodScreenForm to API hooks"
```

---

## Task 5: Migrate TokenManagementPage

**Files:**
- Modify: `src/pages/TokenManagementPage.jsx`

- [ ] **Step 1: Replace useData with useTokens**

```jsx
// REMOVE:
import { useData } from '../context/DataContext';

// ADD:
import { useTokens } from '../hooks/useTokens';
```

Replace line 8:
```jsx
// REMOVE:
const { servingToken, tokenHistory, updateServingToken, clearServingToken, archiveEntries } = useData();

// ADD:
const { currentToken, tokenHistory, loading, updateToken, clearToken, archiveEntries } = useTokens();
```

- [ ] **Step 2: Update handler functions to async**

Replace `handleSubmit` (lines 12-19):
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  if (inputValue.trim() === '') return;
  try {
    await updateToken(inputValue.trim());
    setInputValue('');
  } catch (err) {
    // useTokens hook handles error notification internally
  }
};
```

Replace `handleClear` (lines 21-24):
```jsx
const handleClear = async () => {
  try {
    await clearToken();
    setInputValue('');
  } catch {
    // useTokens hook handles error notification internally
  }
};
```

- [ ] **Step 3: Update JSX references**

Throughout the JSX, rename:
- `servingToken` -> `currentToken` (all occurrences)

Specifically:
- Line 48: `{servingToken ? (` -> `{currentToken ? (`
- Line 51: `{servingToken.number}` -> `{currentToken.number}`
- Line 56: `{formatTimestamp(servingToken.updatedAt)}` -> `{formatTimestamp(currentToken.updatedAt)}`
- Line 98: `{servingToken && (` -> `{currentToken && (`

- [ ] **Step 4: Verify token management works**

Run: Navigate to `/token` in the browser.
Expected: Token state loads from backend. Updating and clearing tokens work. Archive section displays.

- [ ] **Step 5: Commit**

```bash
git add src/pages/TokenManagementPage.jsx
git commit -m "feat: migrate TokenManagementPage to useTokens API hook"
```

---

## Task 6: Migrate UsersPage

**Files:**
- Modify: `src/pages/UsersPage.jsx`

- [ ] **Step 1: Replace useData with useUsers**

```jsx
// REMOVE:
import { useData } from '../context/DataContext';

// ADD:
import { useUsers } from '../hooks/useUsers';
```

Replace line 13:
```jsx
// REMOVE:
const { users, createUser, updateUser, deleteUser } = useData();

// ADD:
const { users, loading, createUser, updateUser, deleteUser } = useUsers();
```

- [ ] **Step 2: Update handleSubmit to async/try-catch**

Replace `handleSubmit` (lines 40-58):
```jsx
const handleSubmit = async (formData) => {
  try {
    if (editingUser) {
      await updateUser(editingUser._id, formData);
      success('User updated successfully!');
    } else {
      await createUser(formData);
      success('User created successfully!');
    }
    setIsModalOpen(false);
    setEditingUser(null);
  } catch (err) {
    error(err.message || 'Failed to save user.');
  }
};
```

- [ ] **Step 3: Update confirmDelete to async/try-catch**

Replace `confirmDelete` (lines 60-68):
```jsx
const confirmDelete = async () => {
  try {
    await deleteUser(deletingUser._id);
    success('User deleted successfully!');
  } catch (err) {
    error(err.message || 'Failed to delete user.');
  }
  setDeletingUser(null);
};
```

- [ ] **Step 4: Add loading state**

Add loading check before `<UserList>`:
```jsx
{loading ? (
  <div className="text-center py-12">
    <p className="text-text-200">Loading users...</p>
  </div>
) : (
  <UserList users={users} onEdit={handleEdit} onDelete={handleDelete} />
)}
```

- [ ] **Step 5: Verify users page works**

Run: Navigate to `/users` as admin.
Expected: 3 seeded users load. CRUD operations work. Non-admins redirected.

- [ ] **Step 6: Commit**

```bash
git add src/pages/UsersPage.jsx
git commit -m "feat: migrate UsersPage to useUsers API hook"
```

---

## Task 7: Migrate LogsPage

**Files:**
- Modify: `src/pages/LogsPage.jsx`

- [ ] **Step 1: Replace useData with useLogs**

```jsx
// REMOVE:
import { useData } from '../context/DataContext';

// ADD:
import { useLogs } from '../hooks/useLogs';
```

Replace lines 10-13:
```jsx
// REMOVE:
const { getActivityLogs } = useData();
const [activeFilters, setActiveFilters] = useState({});
const filteredLogs = useMemo(() => getActivityLogs(activeFilters), [activeFilters, getActivityLogs]);

// ADD:
const [activeFilters, setActiveFilters] = useState({});
const { logs: filteredLogs, loading } = useLogs(activeFilters);
```

Remove `useMemo` from the import line (no longer needed):
```jsx
// REMOVE:
import { useState, useMemo } from 'react';

// ADD:
import { useState } from 'react';
```

- [ ] **Step 2: Verify logs page works**

Run: Navigate to `/logs` as admin.
Expected: Activity logs load from backend. Filters work. Stats cards show correct counts.

- [ ] **Step 3: Commit**

```bash
git add src/pages/LogsPage.jsx
git commit -m "feat: migrate LogsPage to useLogs API hook"
```

---

## Task 8: Migrate Dashboard

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Replace useData with multiple hooks**

```jsx
// REMOVE:
import { useData } from '../context/DataContext';

// ADD:
import { useItems } from '../hooks/useItems';
import { useMenus } from '../hooks/useMenus';
import { useFoodScreens } from '../hooks/useFoodScreens';
import { useTokenScreens } from '../hooks/useTokenScreens';
import { useLogs } from '../hooks/useLogs';
```

Replace line 9:
```jsx
// REMOVE:
const { items, menus, foodScreens, tokenScreens, activityLogs } = useData();

// ADD:
const { items } = useItems();
const { menus } = useMenus();
const { foodScreens } = useFoodScreens();
const { tokenScreens } = useTokenScreens();
const { logs: activityLogs } = useLogs();
```

- [ ] **Step 2: Update activity log field references**

The backend returns `_id` not `id`, and may use `createdAt` instead of `timestamp`. Update the recent activity section:

Replace the recentLogs filter (lines 19-21):
```jsx
const recentLogs = activityLogs
  .filter(log => log.userId === user?._id || log.userId?.toString() === user?._id)
  .slice(0, 5);
```

In the log rendering JSX, update the key and timestamp field:
- `log.id` -> `log._id`
- `log.timestamp` -> `log.createdAt`

```jsx
<div key={log._id} className="p-4 hover:bg-bg-100 transition-colors">
```
and:
```jsx
{format(new Date(log.createdAt), 'MMM dd, HH:mm')}
```

- [ ] **Step 3: Verify dashboard works**

Run: Navigate to `/dashboard`.
Expected: Stats cards show correct counts. Recent activity section shows logs.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: migrate Dashboard to API hooks"
```

---

## Task 9: Migrate GalleryViewPage + Gallery Components

**Files:**
- Modify: `src/pages/GalleryViewPage.jsx`
- Modify: `src/components/gallery/TokenGalleryDisplay.jsx`
- Modify: `src/components/gallery/ScreenGridRenderer.jsx`

- [ ] **Step 1: Rewrite GalleryViewPage.jsx**

The gallery is a public page — it uses `screens.api.js` (no auth needed) to fetch the screen by ID:

```jsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getScreenById } from '../api/screens.api';
import GalleryDisplay from '../components/gallery/GalleryDisplay';
import TokenGalleryDisplay from '../components/gallery/TokenGalleryDisplay';

const GalleryViewPage = () => {
  const { screenId } = useParams();
  const containerRef = useRef(null);
  const [screen, setScreen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getScreenById(screenId)
      .then((data) => setScreen(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [screenId]);

  // Auto-enter fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      if (!containerRef.current) return;
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
          await containerRef.current.webkitRequestFullscreen();
        }
      } catch { /* Silently fail */ }
    };
    const timeoutId = setTimeout(enterFullscreen, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-white text-xl">Loading display...</p>
        </div>
      </div>
    );
  }

  if (error || !screen) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Screen Not Found</h1>
          <p className="text-xl text-gray-400">The requested screen does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      {screen.type === 'token' ? (
        <TokenGalleryDisplay screen={screen} />
      ) : (
        <GalleryDisplay screen={screen} />
      )}
    </div>
  );
};

export default GalleryViewPage;
```

Key change: screen data now comes fully populated from the backend (menus with items included in the response) instead of reading from localStorage.

- [ ] **Step 2: Update TokenGalleryDisplay.jsx**

Replace `useData()` with `useSocketTokens()` for real-time token updates:

```jsx
// REMOVE:
import { useData } from '../../context/DataContext';

// ADD:
import { useSocketTokens } from '../../hooks/useSocketTokens';

// Inside the component, REMOVE:
const { servingToken, tokenHistory } = useData();

// ADD:
const { currentToken: servingToken, tokenHistory } = useSocketTokens();
```

This gives the gallery real-time token updates via Socket.io instead of localStorage polling.

- [ ] **Step 3: Update ScreenGridRenderer.jsx**

The backend returns food screens with sections that have menus fully populated (including items). So `ScreenGridRenderer` no longer needs to look up items/menus from useData.

```jsx
// REMOVE:
import { useData } from '../../context/DataContext';

// Inside the component, REMOVE:
const { items, menus } = useData();
```

The `screen` prop already contains all the data needed (populated by the backend's deep populate in the `/screens/:id` endpoint). The `SectionRenderer` child components will need to read menu/item data from the screen's section structure rather than looking them up.

**Note:** This step requires verifying how `SectionRenderer` accesses items. If it reads from the screen prop hierarchy, no changes needed. If it independently calls `useData()`, it needs the same treatment.

- [ ] **Step 4: Verify gallery works**

Run: Copy a screen ID from the screens page, navigate to `/gallery/<screenId>`.
Expected: Food screen gallery loads with menus and items. Token gallery shows real-time token updates.

- [ ] **Step 5: Commit**

```bash
git add src/pages/GalleryViewPage.jsx src/components/gallery/TokenGalleryDisplay.jsx src/components/gallery/ScreenGridRenderer.jsx
git commit -m "feat: migrate gallery to backend API and Socket.io for real-time tokens"
```

---

## Task 10: Cleanup - Remove DataContext and Legacy Code

**Files:**
- Modify: `src/main.jsx`
- Delete: `src/context/DataContext.jsx`
- Delete: `src/data/mockData.js`
- Delete: `src/hooks/useTokenArchive.js`

- [ ] **Step 1: Verify no remaining useData imports**

Run from the `PopularCanteenDisplay` directory:
```bash
grep -r "useData\|DataContext\|mockData\|useTokenArchive" src/ --include="*.jsx" --include="*.js" | grep -v node_modules
```

Expected: Only hits in `DataContext.jsx`, `mockData.js`, `useTokenArchive.js`, and `main.jsx` — nothing else.

If any other files still reference these, migrate them first before proceeding.

- [ ] **Step 2: Update main.jsx**

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>
);
```

Removed `DataProvider` import and wrapper.

- [ ] **Step 3: Delete legacy files**

```bash
rm src/context/DataContext.jsx
rm src/data/mockData.js
rm src/hooks/useTokenArchive.js
```

- [ ] **Step 4: Verify the app still works end-to-end**

Run: `npm run build`
Expected: Build succeeds with no import errors.

Run: Full manual test — login, navigate all pages, test CRUD on items/menus/screens/users, test token management, test gallery view.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove DataContext, mockData, and useTokenArchive (migration complete)"
```

---

## ID Field Compatibility Note

Throughout the migration, be aware that:
- **localStorage** used auto-generated IDs like `item-001`, accessed via `.id`
- **MongoDB** uses ObjectId strings, accessed via `._id`

All pages must use `._id` when calling update/delete. The backend may also return `_id` for list items. Check each component that references `.id` and update to `._id` if needed. Mongoose also creates a virtual `.id` getter that returns `._id.toString()`, so `.id` may still work in some cases — but prefer `._id` for consistency.
