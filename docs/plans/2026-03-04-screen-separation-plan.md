# Screen Separation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split the unified "Screen" concept into two separate types — Food Screens (schedule-based menu display) and Token Screens (fullscreen token-only display) — with dedicated data models, forms, cards, and gallery renderers.

**Architecture:** Two separate state arrays in DataContext (`foodScreens` + `tokenScreens`), each with tailored CRUD. The ScreensPage gets tabs to switch between the two types. GalleryViewPage branches on `screen.type` to render the appropriate display. Themes replace the old `displaySettings` object for food screens, bundling orientation + foreground media behavior into named presets.

**Tech Stack:** React 19, Vite, Tailwind CSS, localStorage, lucide-react icons

---

## Important Context

- **No test framework** is configured in this project. Skip all TDD steps. Verify with `npm run build` instead.
- **Existing components to reuse:** `ImageUpload` (props: `value, onChange, onError, accept, label`), `TimeSlotBuilder` (props: `timeSlots, onChange`), `Modal`, `ConfirmDialog`
- **Validation pattern:** `validateX(data) → { isValid: boolean, errors: { [field]: string } }`
- **DataContext pattern:** `useCallback`-wrapped mutations, `useMemo`-memoized context value, `useEffect` for localStorage persistence, `addActivityLog()` for every mutation
- **Theme presets map:**
  - `classic-grid` → landscape, no foreground media
  - `portrait-list` → portrait, no foreground media
  - `media-focus` → landscape, foreground media at 20vh
  - `none` → landscape, background media shown fullscreen (no menu)

---

### Task 1: Update Mock Data — Split initialScreens

**Files:**
- Modify: `src/data/mockData.js:311-378`

**Step 1: Replace `initialScreens` with `initialFoodScreens` and `initialTokenScreens`**

Replace the existing `initialScreens` array with:

```js
export const initialFoodScreens = [
  {
    id: 'food-screen-001',
    title: 'Main Dining Hall Display',
    screenId: 'HALL-A-01',
    type: 'food',
    defaultMenuId: 'menu-001',
    timeSlots: [
      {
        id: 'screen-slot-001',
        startTime: '07:00',
        endTime: '11:00',
        menuId: 'menu-001',
        menuName: 'Breakfast Menu',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      {
        id: 'screen-slot-002',
        startTime: '12:00',
        endTime: '16:00',
        menuId: 'menu-002',
        menuName: 'Lunch Menu',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      {
        id: 'screen-slot-003',
        startTime: '18:00',
        endTime: '22:00',
        menuId: 'menu-003',
        menuName: 'Dinner Menu',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    ],
    backgroundType: 'image',
    backgroundMedia: '<keep existing SVG data URI from screen-001>',
    theme: 'classic-grid',
    showPrices: true,
    transitionDuration: 500,
    slideDelay: 5000,
    createdAt: '2024-01-23T08:00:00Z',
    updatedAt: '2024-01-23T08:00:00Z'
  },
  {
    id: 'food-screen-002',
    title: 'Cafeteria Display',
    screenId: 'CAFE-01',
    type: 'food',
    defaultMenuId: 'menu-002',
    timeSlots: [
      {
        id: 'screen-slot-004',
        startTime: '11:00',
        endTime: '14:00',
        menuId: 'menu-002',
        menuName: 'Lunch Menu',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }
    ],
    backgroundType: 'image',
    backgroundMedia: '<keep existing SVG data URI from screen-002>',
    theme: 'classic-grid',
    showPrices: true,
    transitionDuration: 300,
    slideDelay: 5000,
    createdAt: '2024-01-23T08:30:00Z',
    updatedAt: '2024-01-23T08:30:00Z'
  }
];

export const initialTokenScreens = [
  {
    id: 'token-screen-001',
    title: 'Main Counter Token Display',
    screenId: 'TOKEN-01',
    type: 'token',
    createdAt: '2024-01-23T09:00:00Z',
    updatedAt: '2024-01-23T09:00:00Z'
  }
];
```

Also update the export at the bottom if `initialScreens` is exported individually.

**Step 2: Verify build**

Run: `npm run build`
Expected: Build failure (DataContext still imports `initialScreens`) — that's expected, we fix it in Task 2.

---

### Task 2: Update DataContext — Split Screen State + CRUD

**Files:**
- Modify: `src/context/DataContext.jsx`

This is the largest single task. Replace the entire screens section of DataContext.

**Step 1: Update imports**

Change:
```js
import { initialItems, initialMenus, initialSchedules, initialScreens, initialActivityLogs, initialUsers, generateId } from '../data/mockData';
```
To:
```js
import { initialItems, initialMenus, initialSchedules, initialFoodScreens, initialTokenScreens, initialActivityLogs, initialUsers, generateId } from '../data/mockData';
```

**Step 2: Replace `screens` state with `foodScreens` + `tokenScreens`**

Remove:
```js
const [screens, setScreens] = useState(() => {
  const saved = localStorage.getItem('canteen_screens');
  return saved ? JSON.parse(saved) : initialScreens;
});
```

Add (with migration from old `canteen_screens` key):
```js
const [foodScreens, setFoodScreens] = useState(() => {
  const saved = localStorage.getItem('canteen_food_screens');
  if (saved) return JSON.parse(saved);
  // Migration: check for old unified screens data
  const oldScreens = localStorage.getItem('canteen_screens');
  if (oldScreens) {
    const parsed = JSON.parse(oldScreens);
    // Convert old screens to food screens
    const migrated = parsed.map(s => ({
      ...s,
      type: 'food',
      theme: s.displaySettings?.orientation === 'portrait' ? 'portrait-list'
        : s.displaySettings?.foregroundMediaDisplay === 'fullScreen' ? 'none'
        : s.displaySettings?.foregroundMediaDisplay === 'on' ? 'media-focus'
        : 'classic-grid',
      showPrices: s.displaySettings?.showPrices ?? true,
      transitionDuration: s.displaySettings?.transitionDuration ?? 500,
      slideDelay: s.displaySettings?.slideDelay ?? 5000,
    }));
    // Clean up old key
    localStorage.removeItem('canteen_screens');
    return migrated;
  }
  return initialFoodScreens;
});

const [tokenScreens, setTokenScreens] = useState(() => {
  const saved = localStorage.getItem('canteen_token_screens');
  return saved ? JSON.parse(saved) : initialTokenScreens;
});
```

**Step 3: Replace screens localStorage persistence**

Remove the old `canteen_screens` useEffect. Add two new ones:
```js
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
```

**Step 4: Replace screens CRUD with food + token CRUD**

Remove the old `createScreen`, `updateScreen`, `deleteScreen`, `getScreenById` functions. Add:

```js
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
```

**Step 5: Update `clearAllData`**

Replace `setScreens(initialScreens)` with:
```js
setFoodScreens(initialFoodScreens);
setTokenScreens(initialTokenScreens);
```

**Step 6: Update context value**

Replace the screens section in the `value` useMemo:
```js
// Replace:
// screens, createScreen, updateScreen, deleteScreen, getScreenById,

// With:
foodScreens, createFoodScreen, updateFoodScreen, deleteFoodScreen,
tokenScreens, createTokenScreen, updateTokenScreen, deleteTokenScreen,
getScreenById,
```

Update the useMemo dependency array accordingly.

**Step 7: Verify build**

Run: `npm run build`
Expected: Failures in components still importing old `screens`, `createScreen`, etc. — fixed in later tasks.

---

### Task 3: Update Validators

**Files:**
- Modify: `src/utils/validators.js:92-121`

**Step 1: Replace `validateScreen` with two validators**

Replace the existing `validateScreen` function with:

```js
export const validateFoodScreen = (screenData) => {
  const errors = {};

  if (!screenData.title || screenData.title.trim().length === 0) {
    errors.title = 'Screen title is required';
  }

  if (!screenData.screenId || screenData.screenId.trim().length === 0) {
    errors.screenId = 'Screen ID is required';
  }

  if (!screenData.defaultMenuId) {
    errors.defaultMenuId = 'Default menu is required';
  }

  if (!screenData.timeSlots || screenData.timeSlots.length === 0) {
    errors.timeSlots = 'At least one time slot is required';
  }

  if (!screenData.backgroundMedia) {
    errors.backgroundMedia = 'Background image/video is required';
  }

  if (!screenData.theme) {
    errors.theme = 'Please select a theme';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateTokenScreen = (screenData) => {
  const errors = {};

  if (!screenData.title || screenData.title.trim().length === 0) {
    errors.title = 'Screen title is required';
  }

  if (!screenData.screenId || screenData.screenId.trim().length === 0) {
    errors.screenId = 'Screen ID is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

**Step 2: Verify build**

Run: `npm run build`

---

### Task 4: Create ThemeSelector Component

**Files:**
- Create: `src/components/screens/ThemeSelector.jsx`

**Step 1: Create the visual theme picker**

```jsx
import { Monitor, Smartphone, Film, Image } from 'lucide-react';

const THEMES = [
  {
    id: 'classic-grid',
    label: 'Classic Grid',
    description: 'Landscape layout with menu cards in a grid',
    icon: Monitor,
  },
  {
    id: 'portrait-list',
    label: 'Portrait List',
    description: 'Vertical layout for tall/rotated screens',
    icon: Smartphone,
  },
  {
    id: 'media-focus',
    label: 'Media Focus',
    description: 'Grid layout with a promotional media window',
    icon: Film,
  },
  {
    id: 'none',
    label: 'No Theme',
    description: 'Background media fills the entire screen',
    icon: Image,
  },
];

const ThemeSelector = ({ value, onChange, error }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-text-100 mb-3">
        Display Theme *
      </label>
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((theme) => {
          const Icon = theme.icon;
          const isSelected = value === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary-100 bg-primary-100/10 shadow-md'
                  : 'border-bg-300 bg-white hover:border-primary-100/50 hover:bg-bg-100'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-100 text-white' : 'bg-bg-200 text-text-200'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-sm font-semibold ${isSelected ? 'text-primary-100' : 'text-text-100'}`}>
                  {theme.label}
                </span>
              </div>
              <p className="text-xs text-text-200 leading-relaxed">
                {theme.description}
              </p>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm text-accent-200">{error}</p>}
    </div>
  );
};

export default ThemeSelector;
```

**Step 2: Verify build**

Run: `npm run build`

---

### Task 5: Create FoodScreenForm

**Files:**
- Create: `src/components/screens/FoodScreenForm.jsx`

**Step 1: Create the 3-tab food screen form**

This replaces the old `ScreenForm.jsx` for food screens. It has 3 tabs: Basic Info, Schedule, Appearance.

```jsx
import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import ImageUpload from '../common/ImageUpload';
import TimeSlotBuilder from '../schedules/TimeSlotBuilder';
import ThemeSelector from './ThemeSelector';
import { validateFoodScreen } from '../../utils/validators';

const FoodScreenForm = ({ screen, onSubmit, onCancel }) => {
  const { menus } = useData();
  const { error: showError } = useNotification();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    title: '',
    screenId: '',
    defaultMenuId: '',
    timeSlots: [],
    backgroundType: 'image',
    backgroundMedia: null,
    foregroundMedia: null,
    theme: 'classic-grid',
    showPrices: true,
    transitionDuration: 500,
    slideDelay: 5000
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (screen) {
      setFormData({
        title: screen.title || '',
        screenId: screen.screenId || '',
        defaultMenuId: screen.defaultMenuId || '',
        timeSlots: screen.timeSlots || [],
        backgroundType: screen.backgroundType || 'image',
        backgroundMedia: screen.backgroundMedia || null,
        foregroundMedia: screen.foregroundMedia || null,
        theme: screen.theme || 'classic-grid',
        showPrices: screen.showPrices ?? true,
        transitionDuration: screen.transitionDuration ?? 500,
        slideDelay: screen.slideDelay ?? 5000
      });
    } else {
      if (menus.length > 0 && !formData.defaultMenuId) {
        setFormData(prev => ({ ...prev, defaultMenuId: menus[0].id }));
      }
    }
  }, [screen, menus]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleTimeSlotsChange = (timeSlots) => {
    setFormData(prev => ({ ...prev, timeSlots }));
    if (errors.timeSlots) setErrors(prev => ({ ...prev, timeSlots: null }));
  };

  const handleBackgroundChange = (base64) => {
    setFormData(prev => ({ ...prev, backgroundMedia: base64 }));
    if (errors.backgroundMedia) setErrors(prev => ({ ...prev, backgroundMedia: null }));
  };

  const handleForegroundMediaChange = (base64) => {
    setFormData(prev => ({ ...prev, foregroundMedia: base64 }));
  };

  const handleThemeChange = (theme) => {
    setFormData(prev => ({ ...prev, theme }));
    if (errors.theme) setErrors(prev => ({ ...prev, theme: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateFoodScreen(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      if (validation.errors.title || validation.errors.screenId) {
        setActiveTab('basic');
      } else if (validation.errors.defaultMenuId || validation.errors.timeSlots) {
        setActiveTab('schedule');
      } else if (validation.errors.backgroundMedia || validation.errors.theme) {
        setActiveTab('appearance');
      }
      return;
    }

    try {
      await onSubmit(formData);
    } catch {
      showError('Failed to save screen. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'appearance', label: 'Appearance' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-bg-300">
        <div className="flex gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-primary-100 text-primary-100'
                  : 'border-transparent text-text-200 hover:text-text-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-100 mb-2">Screen Title *</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${errors.title ? 'border-accent-200' : 'border-bg-300'}`}
              placeholder="e.g., Main Dining Hall Display" />
            {errors.title && <p className="mt-1 text-sm text-accent-200">{errors.title}</p>}
          </div>
          <div>
            <label htmlFor="screenId" className="block text-sm font-medium text-text-100 mb-2">Screen ID *</label>
            <input type="text" id="screenId" name="screenId" value={formData.screenId} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${errors.screenId ? 'border-accent-200' : 'border-bg-300'}`}
              placeholder="e.g., HALL-A-01" />
            <p className="mt-1 text-xs text-text-200">Unique identifier for tracking and management</p>
            {errors.screenId && <p className="mt-1 text-sm text-accent-200">{errors.screenId}</p>}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="defaultMenuId" className="block text-sm font-medium text-text-100 mb-2">Default Menu *</label>
            <select id="defaultMenuId" name="defaultMenuId" value={formData.defaultMenuId} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${errors.defaultMenuId ? 'border-accent-200' : 'border-bg-300'}`}>
              <option value="">Select default menu...</option>
              {menus.map(menu => (<option key={menu.id} value={menu.id}>{menu.title}</option>))}
            </select>
            <p className="mt-1 text-xs text-text-200">Displayed when no time slot is active</p>
            {errors.defaultMenuId && <p className="mt-1 text-sm text-accent-200">{errors.defaultMenuId}</p>}
          </div>
          <div>
            <TimeSlotBuilder timeSlots={formData.timeSlots} onChange={handleTimeSlotsChange} />
            {errors.timeSlots && <p className="mt-1 text-sm text-accent-200">{errors.timeSlots}</p>}
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Background Media */}
          <div className="space-y-3">
            <div className="p-3 bg-primary-100/10 border border-primary-100/30 rounded-lg">
              <p className="text-xs text-text-100">
                <strong>Tip:</strong> Compress media before uploading (images &lt;500KB, videos &lt;2MB).
              </p>
            </div>
            <ImageUpload value={formData.backgroundMedia} onChange={handleBackgroundChange} onError={showError}
              accept="image/*,video/*" label="Background Image/Video *" />
            {errors.backgroundMedia && <p className="mt-1 text-sm text-accent-200">{errors.backgroundMedia}</p>}
          </div>

          {/* Theme Selector */}
          <ThemeSelector value={formData.theme} onChange={handleThemeChange} error={errors.theme} />

          {/* Foreground Media (only for media-focus theme) */}
          {formData.theme === 'media-focus' && (
            <div className="space-y-3 pt-4 border-t border-bg-300">
              <h3 className="text-sm font-semibold text-text-100">Foreground Media (Overlay)</h3>
              <p className="text-xs text-text-200">Upload a promotional image/video to display alongside the menu</p>
              <ImageUpload value={formData.foregroundMedia} onChange={handleForegroundMediaChange} onError={showError}
                accept="image/*,video/*" label="Upload Foreground Media" />
            </div>
          )}

          {/* Fine-tuning */}
          <div className="pt-4 border-t border-bg-300 space-y-4">
            <h3 className="text-sm font-semibold text-text-100">Fine-tuning</h3>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="showPrices" name="showPrices" checked={formData.showPrices} onChange={handleChange}
                className="w-4 h-4 text-primary-100 border-bg-300 rounded focus:ring-primary-100" />
              <label htmlFor="showPrices" className="text-sm font-medium text-text-100">Show item prices</label>
            </div>

            <div>
              <label htmlFor="transitionDuration" className="block text-sm font-medium text-text-100 mb-2">Page Transition (ms)</label>
              <input type="number" id="transitionDuration" name="transitionDuration" value={formData.transitionDuration} onChange={handleChange}
                min="0" max="2000" step="100"
                className="w-full px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100" />
            </div>

            <div>
              <label htmlFor="slideDelay" className="block text-sm font-medium text-text-100 mb-2">Page Display Duration (ms)</label>
              <input type="number" id="slideDelay" name="slideDelay" value={formData.slideDelay} onChange={handleChange}
                min="1000" max="30000" step="500"
                className="w-full px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100" />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-bg-300">
        <button type="button" onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-text-100 bg-bg-100 border border-bg-300 rounded-lg hover:bg-bg-200 transition-all duration-200 hover:border-primary-100">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-100 rounded-lg hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg">
          {isSubmitting ? 'Saving...' : screen ? 'Update Screen' : 'Create Screen'}
        </button>
      </div>
    </form>
  );
};

export default FoodScreenForm;
```

**Step 2: Verify build**

Run: `npm run build`

---

### Task 6: Create TokenScreenForm

**Files:**
- Create: `src/components/screens/TokenScreenForm.jsx`

**Step 1: Create the minimal token screen form**

```jsx
import { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { validateTokenScreen } from '../../utils/validators';

const TokenScreenForm = ({ screen, onSubmit, onCancel }) => {
  const { error: showError } = useNotification();
  const [formData, setFormData] = useState({
    title: '',
    screenId: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (screen) {
      setFormData({
        title: screen.title || '',
        screenId: screen.screenId || '',
      });
    } else {
      setFormData({ title: '', screenId: '' });
      setErrors({});
    }
  }, [screen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateTokenScreen(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch {
      showError('Failed to save token screen. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text-100 mb-2">Screen Title *</label>
        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${errors.title ? 'border-accent-200' : 'border-bg-300'}`}
          placeholder="e.g., Main Counter Token Display" />
        {errors.title && <p className="mt-1 text-sm text-accent-200">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="screenId" className="block text-sm font-medium text-text-100 mb-2">Screen ID *</label>
        <input type="text" id="screenId" name="screenId" value={formData.screenId} onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${errors.screenId ? 'border-accent-200' : 'border-bg-300'}`}
          placeholder="e.g., TOKEN-01" />
        <p className="mt-1 text-xs text-text-200">Unique identifier for tracking and management</p>
        {errors.screenId && <p className="mt-1 text-sm text-accent-200">{errors.screenId}</p>}
      </div>

      <div className="p-4 bg-bg-100 rounded-lg border border-bg-300">
        <p className="text-sm text-text-100">
          Token screens display a fullscreen view of the current serving token. No additional configuration is needed — the token number is updated from the Token Display Management page.
        </p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-bg-300">
        <button type="button" onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-text-100 bg-bg-100 border border-bg-300 rounded-lg hover:bg-bg-200 transition-all duration-200 hover:border-primary-100">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-100 rounded-lg hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg">
          {isSubmitting ? 'Saving...' : screen ? 'Update Screen' : 'Create Screen'}
        </button>
      </div>
    </form>
  );
};

export default TokenScreenForm;
```

**Step 2: Verify build**

Run: `npm run build`

---

### Task 7: Create TokenScreenCard

**Files:**
- Create: `src/components/screens/TokenScreenCard.jsx`

**Step 1: Create the simple token screen card**

```jsx
import { Edit2, Trash2, ExternalLink, Hash, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

const TokenScreenCard = ({ screen, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { success } = useNotification();

  const handlePreview = () => {
    navigate(`/gallery/${screen.id}`);
  };

  const handleCopyUrl = async () => {
    const url = `${window.location.origin}/gallery/${screen.id}`;
    try {
      await navigator.clipboard.writeText(url);
      success('Display URL copied to clipboard!');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      success('Display URL copied to clipboard!');
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-bg-300 hover:border-accent-100">
      {/* Token Icon Header */}
      <div className="relative h-36 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
          <Hash className="w-16 h-16 text-yellow-400 relative" />
        </div>
        <div className="absolute top-2 left-2">
          <div className="bg-yellow-500 text-gray-900 px-3 py-1.5 rounded-lg shadow-lg">
            <span className="text-xs font-bold">Token</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-text-100 mb-2 group-hover:text-primary-100 transition-colors line-clamp-1">
          {screen.title}
        </h3>
        <p className="text-sm text-text-200 mb-4">
          ID: <span className="font-mono">{screen.screenId}</span>
        </p>

        {/* Actions */}
        <div className="grid grid-cols-4 gap-2">
          <button onClick={handlePreview}
            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-200 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100">
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button onClick={handleCopyUrl}
            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-primary-100 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100"
            title="Copy Display URL">
            <Link2 className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(screen)}
            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-primary-100 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100"
            title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <button onClick={() => onDelete(screen)}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-accent-200 bg-accent-200/10 rounded-lg hover:bg-accent-200/20 transition-all duration-200 border border-transparent hover:border-accent-200">
          <Trash2 className="w-4 h-4" />
          Delete Screen
        </button>
      </div>
    </div>
  );
};

export default TokenScreenCard;
```

**Step 2: Verify build**

Run: `npm run build`

---

### Task 8: Create TokenGalleryDisplay

**Files:**
- Create: `src/components/gallery/TokenGalleryDisplay.jsx`

**Step 1: Create fullscreen token-only gallery display**

Extract and expand the existing `TokenPanelLandscape` large-mode aesthetic into a standalone fullscreen component.

```jsx
import { useEffect, useRef, useState } from 'react';
import { useData } from '../../context/DataContext';
import { speakTokenNumber } from '../../utils/speechUtils';
import { getCurrentTime, formatTimeDisplay } from '../../utils/timeUtils';
import { Hash, Clock, Users } from 'lucide-react';

const TokenGalleryDisplay = ({ screen }) => {
  const { servingToken, tokenHistory } = useData();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const prevTokenRef = useRef(null);

  // Update clock every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Voice announcement when token changes
  useEffect(() => {
    const announceToken = async () => {
      if (servingToken && servingToken.number !== prevTokenRef.current) {
        if (prevTokenRef.current !== null) {
          try {
            await speakTokenNumber(servingToken.number);
          } catch {
            // Silently handle errors
          }
        }
        prevTokenRef.current = servingToken.number;
      } else if (!servingToken) {
        prevTokenRef.current = null;
      }
    };
    announceToken();
  }, [servingToken]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/85 via-emerald-500/85 to-teal-500/85 backdrop-blur-md shadow-xl">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-white" />
              <h1 className="text-4xl xl:text-5xl font-bold text-white drop-shadow-xl font-heading tracking-wider">
                {screen.title}
              </h1>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <Clock className="w-5 h-5 text-white" />
              <span className="text-lg font-bold text-white font-heading tracking-wider">
                {formatTimeDisplay(currentTime)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Token Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {servingToken ? (
          <>
            {/* NOW SERVING Badge */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white bg-opacity-10 rounded-full backdrop-blur-sm border border-white/20">
                <Hash className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl xl:text-3xl font-bold text-white uppercase tracking-widest">
                  Now Serving
                </span>
              </div>
            </div>

            {/* Large Token Number */}
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-yellow-400 opacity-20 blur-[100px] rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white rounded-[2rem] px-16 py-12 shadow-2xl">
                <div className="text-[12rem] xl:text-[16rem] font-black leading-none drop-shadow-2xl text-center">
                  {servingToken.number}
                </div>
              </div>
            </div>

            {/* Please collect message */}
            <p className="text-2xl text-gray-300 mb-8">Please collect your order</p>

            {/* Recently Called Tokens */}
            {tokenHistory.length > 1 && (
              <div className="w-full max-w-2xl">
                <div className="bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-400 uppercase tracking-wide mb-4 text-center">
                    Recently Called
                  </h3>
                  <div className="flex justify-center gap-6">
                    {tokenHistory.slice(1, 3).map((token) => (
                      <div key={token.updatedAt}
                        className="bg-gray-700 bg-opacity-50 backdrop-blur-sm px-10 py-5 rounded-xl border border-gray-600">
                        <div className="flex items-center gap-3">
                          <Hash className="w-6 h-6 text-gray-400" />
                          <span className="text-4xl font-bold text-gray-300">{token.number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-400">
            <Hash className="w-32 h-32 mx-auto mb-8 opacity-30" />
            <p className="text-4xl font-semibold">No Active Token</p>
            <p className="text-xl mt-4 opacity-70">Waiting for next customer</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-gray-700 bg-black bg-opacity-30">
        <div className="text-center space-y-2">
          <p className="text-gray-400 text-lg font-medium">Please wait for your number</p>
          <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>Live Updates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenGalleryDisplay;
```

**Step 2: Verify build**

Run: `npm run build`

---

### Task 9: Update ScreenCard for Food Screens

**Files:**
- Modify: `src/components/screens/ScreenCard.jsx`

**Step 1: Simplify ScreenCard to food-screen only**

Remove the token-related display settings. Update the card to show theme badge instead. Remove the unused `getScheduleById` import since food screens have inline timeSlots.

Key changes:
- Remove `schedule` lookup and display
- Show theme badge instead of layout style
- Remove `showIngredients` indicator (not in food screen model)
- Add time slot count display
- Remove `onDuplicate` prop (simplify)

The full replacement of ScreenCard.jsx:

```jsx
import { Edit2, Trash2, ExternalLink, Monitor, Copy, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isVideoUrl } from '../../utils/fileUtils';
import { useNotification } from '../../context/NotificationContext';

const THEME_LABELS = {
  'classic-grid': 'Classic Grid',
  'portrait-list': 'Portrait List',
  'media-focus': 'Media Focus',
  'none': 'No Theme',
};

const ScreenCard = ({ screen, onEdit, onDelete, onDuplicate }) => {
  const navigate = useNavigate();
  const { success } = useNotification();

  const handlePreview = () => {
    navigate(`/gallery/${screen.id}`);
  };

  const handleCopyUrl = async () => {
    const url = `${window.location.origin}/gallery/${screen.id}`;
    try {
      await navigator.clipboard.writeText(url);
      success('Display URL copied to clipboard!');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      success('Display URL copied to clipboard!');
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-bg-300 hover:border-accent-100">
      {/* Background Preview */}
      <div className="relative h-48 bg-gradient-to-br from-primary-300 to-primary-200 overflow-hidden">
        {screen.backgroundMedia && (
          isVideoUrl(screen.backgroundMedia) ? (
            <video src={screen.backgroundMedia}
              className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
              autoPlay muted loop playsInline />
          ) : (
            <img src={screen.backgroundMedia} alt={screen.title}
              className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
          )
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Monitor className="w-12 h-12 text-white opacity-50 group-hover:opacity-70 transition-opacity" />
        </div>
        {/* Theme Badge */}
        <div className="absolute top-2 left-2">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
            <span className="text-xs font-bold">{THEME_LABELS[screen.theme] || 'Classic Grid'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-text-100 mb-3 group-hover:text-primary-100 transition-colors line-clamp-1">{screen.title}</h3>

        {/* Info */}
        <div className="mb-4 p-3 bg-bg-100/50 rounded-lg border border-bg-300">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${screen.showPrices ? 'bg-primary-100' : 'bg-bg-300'}`} />
              <span className="text-text-100">Prices</span>
            </div>
            <div className="text-text-100">
              {screen.timeSlots?.length || 0} time slot{(screen.timeSlots?.length || 0) !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          <button onClick={handlePreview}
            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-200 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100">
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button onClick={handleCopyUrl}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-100 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100"
            title="Copy Display URL">
            <Link2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDuplicate(screen)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-accent-100 bg-accent-100/10 rounded-lg hover:bg-accent-100/20 transition-all duration-200 border border-transparent hover:border-accent-100"
            title="Duplicate Screen">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(screen)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-100 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <button onClick={() => onDelete(screen)}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-accent-200 bg-accent-200/10 rounded-lg hover:bg-accent-200/20 transition-all duration-200 border border-transparent hover:border-accent-200">
          <Trash2 className="w-4 h-4" />
          Delete Screen
        </button>
      </div>
    </div>
  );
};

export default ScreenCard;
```

**Step 2: Verify build**

Run: `npm run build`

---

### Task 10: Update ScreensPage with Tabs

**Files:**
- Modify: `src/pages/ScreensPage.jsx`
- Modify: `src/components/screens/ScreenList.jsx`

**Step 1: Rewrite ScreensPage with tab switching**

Replace the entire ScreensPage to manage both food and token screens with tabs:

```jsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import ScreenList from '../components/screens/ScreenList';
import TokenScreenCard from '../components/screens/TokenScreenCard';
import FoodScreenForm from '../components/screens/FoodScreenForm';
import TokenScreenForm from '../components/screens/TokenScreenForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const ScreensPage = () => {
  const {
    foodScreens, createFoodScreen, updateFoodScreen, deleteFoodScreen,
    tokenScreens, createTokenScreen, updateTokenScreen, deleteTokenScreen
  } = useData();
  const { success, error } = useNotification();

  const [activeTab, setActiveTab] = useState('food');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState(null);
  const [deletingScreen, setDeletingScreen] = useState(null);

  const isFoodTab = activeTab === 'food';

  const handleCreate = () => {
    setEditingScreen(null);
    setIsModalOpen(true);
  };

  const handleEdit = (screen) => {
    setEditingScreen(screen);
    setIsModalOpen(true);
  };

  const handleDelete = (screen) => {
    setDeletingScreen(screen);
  };

  const handleDuplicate = (screen) => {
    try {
      const duplicated = { ...screen, title: `${screen.title} (Copy)`, id: undefined };
      createFoodScreen(duplicated);
      success('Screen duplicated successfully!');
    } catch {
      error('Failed to duplicate screen. Please try again.');
    }
  };

  const handleFoodSubmit = async (formData) => {
    try {
      if (editingScreen) {
        updateFoodScreen(editingScreen.id, formData);
        success('Food screen updated successfully!');
      } else {
        createFoodScreen(formData);
        success('Food screen created successfully!');
      }
      setIsModalOpen(false);
      setEditingScreen(null);
    } catch {
      error('Failed to save screen. Please try again.');
    }
  };

  const handleTokenSubmit = async (formData) => {
    try {
      if (editingScreen) {
        updateTokenScreen(editingScreen.id, formData);
        success('Token screen updated successfully!');
      } else {
        createTokenScreen(formData);
        success('Token screen created successfully!');
      }
      setIsModalOpen(false);
      setEditingScreen(null);
    } catch {
      error('Failed to save screen. Please try again.');
    }
  };

  const confirmDelete = () => {
    const deleteFunc = deletingScreen?.type === 'token' ? deleteTokenScreen : deleteFoodScreen;
    const result = deleteFunc(deletingScreen.id);
    if (result.success) {
      success('Screen deleted successfully!');
    } else {
      error(result.error);
    }
    setDeletingScreen(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-100">Screens Management</h1>
          <p className="text-text-200 mt-1">Configure food display and token screens</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {isFoodTab ? 'Create Food Screen' : 'Create Token Screen'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-bg-300">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('food')}
            className={`px-1 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
              isFoodTab
                ? 'border-primary-100 text-primary-100'
                : 'border-transparent text-text-200 hover:text-text-100'
            }`}
          >
            Food Screens ({foodScreens.length})
          </button>
          <button
            onClick={() => setActiveTab('token')}
            className={`px-1 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
              !isFoodTab
                ? 'border-primary-100 text-primary-100'
                : 'border-transparent text-text-200 hover:text-text-100'
            }`}
          >
            Token Screens ({tokenScreens.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {isFoodTab ? (
        <ScreenList screens={foodScreens} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} />
      ) : (
        tokenScreens.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-200">No token screens yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokenScreens.map(screen => (
              <TokenScreenCard key={screen.id} screen={screen} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingScreen(null); }}
        title={editingScreen
          ? `Edit ${isFoodTab ? 'Food' : 'Token'} Screen`
          : `Create New ${isFoodTab ? 'Food' : 'Token'} Screen`}
        size="lg"
      >
        {isFoodTab ? (
          <FoodScreenForm screen={editingScreen} onSubmit={handleFoodSubmit}
            onCancel={() => { setIsModalOpen(false); setEditingScreen(null); }} />
        ) : (
          <TokenScreenForm screen={editingScreen} onSubmit={handleTokenSubmit}
            onCancel={() => { setIsModalOpen(false); setEditingScreen(null); }} />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingScreen}
        onClose={() => setDeletingScreen(null)}
        onConfirm={confirmDelete}
        title="Delete Screen"
        message={`Are you sure you want to delete "${deletingScreen?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default ScreensPage;
```

**Step 2: Verify build**

Run: `npm run build`

---

### Task 11: Update TimeBasedRenderer — Remove Token Panel Code

**Files:**
- Modify: `src/components/gallery/TimeBasedRenderer.jsx`

**Step 1: Simplify to theme-based rendering**

Major changes:
- Remove all token panel components (`TokenPanelPortrait`, `TokenPanelLandscape`)
- Remove token-related imports (`speakTokenNumber`), state (`servingToken`, `tokenHistory`), and refs (`prevTokenRef`)
- Remove `tokenWindowState`, `showTokenPanel`, `tokenSize` calculations
- Add theme-based layout logic: derive `isPortrait`, `showForegroundMedia`, `isForegroundFullScreen` from `screen.theme`
- Use `screen.showPrices`, `screen.transitionDuration`, `screen.slideDelay` directly instead of `displaySettings`

The theme mapping logic at the top of the component:

```js
// Derive layout from theme
const theme = screen.theme || 'classic-grid';
const isPortrait = theme === 'portrait-list';
const showForegroundMedia = theme === 'media-focus' && screen.foregroundMedia;
const isForegroundFullScreen = theme === 'none';
const foregroundMediaSize = 20; // percentage for media-focus theme
```

Remove the old `displaySettings`-based calculations:
```js
// DELETE these lines:
// const tokenWindowState = displaySettings.tokenWindow || 'off';
// const foregroundMediaDisplay = displaySettings.foregroundMediaDisplay || 'off';
// const orientation = displaySettings.orientation || 'landscape';
// const isPortrait = orientation === 'portrait';
// const showTokenPanel = tokenWindowState !== 'off';
// const showForegroundMedia = foregroundMediaDisplay !== 'off' && screen.foregroundMedia;
// const isForegroundFullScreen = foregroundMediaDisplay === 'fullScreen';
// const tokenSize = tokenWindowState === 'large' ? 40 : (isPortrait ? 12 : 10);
```

Update `displaySettings.showPrices` → `screen.showPrices`
Update `displaySettings.transitionDuration` → `screen.transitionDuration`
Update `displaySettings.slideDelay` → `screen.slideDelay`

In the LANDSCAPE layout, remove the entire token panel section:
```jsx
// DELETE the token panel div:
// {showTokenPanel && ( <div ...> <TokenPanelLandscape ... /> </div> )}
```

In the PORTRAIT layout, remove the token panel section similarly.

Remove the `TokenPanelPortrait` and `TokenPanelLandscape` component definitions entirely from the bottom of the file.

Update the `MenuGrid` and `PageIndicators` components — these stay the same.

Update the component signature to no longer accept `displaySettings`:
```jsx
const TimeBasedRenderer = ({ screen }) => {
```

**Step 2: Verify build**

Run: `npm run build`

---

### Task 12: Update GalleryViewPage — Branch on Screen Type

**Files:**
- Modify: `src/pages/GalleryViewPage.jsx`

**Step 1: Add type-based rendering**

Import `TokenGalleryDisplay` and branch:

```jsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import GalleryDisplay from '../components/gallery/GalleryDisplay';
import TokenGalleryDisplay from '../components/gallery/TokenGalleryDisplay';

const GalleryViewPage = () => {
  const { screenId } = useParams();
  const { getScreenById, foodScreens, tokenScreens } = useData();
  const containerRef = useRef(null);
  const [isDataReady, setIsDataReady] = useState(false);

  const screen = getScreenById(screenId);

  // Mark data as ready once both screen arrays have loaded
  useEffect(() => {
    if (foodScreens !== undefined && tokenScreens !== undefined) {
      setIsDataReady(true);
    }
  }, [foodScreens, tokenScreens]);

  // Auto-enter fullscreen on mount (same as before)
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

  if (!isDataReady) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-white text-xl">Loading display...</p>
        </div>
      </div>
    );
  }

  if (!screen) {
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

**Step 2: Verify build**

Run: `npm run build`

---

### Task 13: Update GalleryDisplay — Remove displaySettings prop

**Files:**
- Modify: `src/components/gallery/GalleryDisplay.jsx`

**Step 1: Remove `displaySettings` prop from TimeBasedRenderer call**

Change:
```jsx
<TimeBasedRenderer screen={screen} displaySettings={screen.displaySettings} />
```
To:
```jsx
<TimeBasedRenderer screen={screen} />
```

**Step 2: Verify build**

Run: `npm run build`

---

### Task 14: Update Dashboard — Fix Screen Count Reference

**Files:**
- Modify: `src/pages/Dashboard.jsx` (if it references `screens`)

**Step 1: Search for `screens` usage in Dashboard**

Check if Dashboard.jsx uses `screens` from DataContext. If so, update to use `foodScreens` and `tokenScreens`. The stat card should show total count: `foodScreens.length + tokenScreens.length`.

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, all references updated.

---

### Task 15: Final Verification and Cleanup

**Step 1: Full build verification**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 2: Run lint**

Run: `npm run lint`
Check for any new warnings (pre-existing ones are OK).

**Step 3: Manual smoke test checklist**

Start dev server with `npm run dev` and verify:
- [ ] Login as admin
- [ ] Navigate to Screens page
- [ ] See "Food Screens" and "Token Screens" tabs
- [ ] Food Screens tab shows existing screens (migrated)
- [ ] Create a new food screen (all 3 tabs work, theme selector works)
- [ ] Create a new token screen (simple form)
- [ ] Token Screens tab shows the new token screen
- [ ] Click "Preview" on a food screen → gallery shows menu correctly
- [ ] Click "Preview" on a token screen → fullscreen token display
- [ ] Go to Token Display page → update token → verify it appears on token screen gallery
- [ ] Copy URL works for both screen types
- [ ] Delete works for both screen types

**Step 4: Remove old ScreenForm.jsx if no longer imported**

Check if `src/components/screens/ScreenForm.jsx` is still imported anywhere. If not, it can be deleted as it's been replaced by `FoodScreenForm.jsx`.

---

Plan complete and saved to `docs/plans/2026-03-04-screen-separation-plan.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
