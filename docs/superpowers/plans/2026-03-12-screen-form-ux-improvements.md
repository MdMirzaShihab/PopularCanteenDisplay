# Screen Form UX Improvements — Error Handling & State Preservation

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix FoodScreenForm to show actionable validation errors (inline + toast with auto-tab navigation), preserve content state when switching between menu/media types, and fix a runtime bug in MediaMultiPicker.

**Architecture:** Three independent changes — (1) improve error surfacing in `FoodScreenForm.jsx` to match `TokenScreenForm`'s pattern (inline errors + auto-tab navigation), (2) modify `SectionContentEditor.jsx` to cache prior content selections so switching menu<->media preserves state, (3) fix `showError` bug in `MediaMultiPicker.jsx`.

**Tech Stack:** React 19, Tailwind CSS, existing validation utils

---

## Chunk 1: Bug Fix + Error Surfacing

### Task 1: Fix `showError` bug in MediaMultiPicker

The `MediaMultiPicker` component destructures `showError` from `useNotification()`, but the context only exports `error`. This causes a runtime crash when users hit the media item limit.

**Files:**
- Modify: `src/components/screens/MediaMultiPicker.jsx:10`

- [ ] **Step 1: Fix the destructured name**

In `MediaMultiPicker.jsx` line 10, change:
```javascript
const { showError } = useNotification();
```
to:
```javascript
const { error: showError } = useNotification();
```

This aliases `error` to `showError` (matching how `FoodScreenForm` and `TokenScreenForm` already do it), so all existing `showError()` calls in the component work without further changes.

- [ ] **Step 2: Verify the fix**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/screens/MediaMultiPicker.jsx
git commit -m "fix: alias error to showError in MediaMultiPicker to match NotificationContext API"
```

---

### Task 2: Add inline error display and auto-tab navigation to FoodScreenForm

Currently `FoodScreenForm` only shows a single toast for the first string-typed error. Section errors (nested arrays) are never surfaced. The user gets a generic "Please fix validation errors" with no guidance on which tab or field to fix.

**Files:**
- Modify: `src/components/screens/FoodScreenForm.jsx`
- Modify: `src/utils/validators.js` (lines 94–178, `validateFoodScreen`)

#### Step-by-step:

- [ ] **Step 1: Update `validateFoodScreen` to return a flat `tabErrors` map**

In `src/utils/validators.js`, after the existing `validateFoodScreen` function's return statement (line 174), add a `tabErrors` field to the return object. This maps each error key to its tab so the form knows which tab to navigate to.

Replace the return block (lines 170–178) with:

**Important:** `errors.sections` can be set to a string (section count mismatch at line 110) OR an array (per-section validation errors). The `tabErrors` block must handle both cases.

```javascript
  if (sectionErrors.some(e => e)) {
    errors.sections = sectionErrors;
  }

  // Build a flat map of tab -> first error message for auto-navigation
  const tabErrors = {};
  let firstErrorSectionIdx = 0;

  if (errors.title || errors.screenId || errors.layoutTheme) {
    tabErrors.layout = errors.title || errors.screenId || errors.layoutTheme;
  }
  if (errors.sections) {
    if (Array.isArray(errors.sections)) {
      // Per-section content/timeslot errors
      const idx = errors.sections.findIndex(e => e);
      if (idx !== -1) {
        const sectionErrs = errors.sections[idx];
        const firstSectionError = Object.values(sectionErrs)[0];
        tabErrors.sections = `Section ${idx + 1}: ${firstSectionError}`;
        firstErrorSectionIdx = idx;
      }
    } else if (typeof errors.sections === 'string') {
      // Section count mismatch (layout vs sections array length)
      tabErrors.sections = errors.sections;
    }
  }
  if (errors.backgroundMedia || errors.backgroundColor) {
    tabErrors.settings = errors.backgroundMedia || errors.backgroundColor;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    tabErrors,
    firstErrorSectionIdx
  };
```

- [ ] **Step 2: Run lint to verify validator changes**

Run: `npm run lint`
Expected: No new lint errors.

- [ ] **Step 3: Update FoodScreenForm to use `tabErrors` for auto-navigation + better toast messages**

In `src/components/screens/FoodScreenForm.jsx`, replace the `handleSubmit` function (lines 75–84) with:

```javascript
  const handleSubmit = () => {
    const { isValid, errors, tabErrors, firstErrorSectionIdx } = validateFoodScreen(formData);
    if (!isValid) {
      // Auto-navigate to the first tab with errors
      if (tabErrors.layout) {
        setActiveTab('layout');
        showError(tabErrors.layout);
      } else if (tabErrors.sections) {
        setActiveTab('sections');
        setActiveSectionIdx(firstErrorSectionIdx);
        showError(tabErrors.sections);
      } else if (tabErrors.settings) {
        setActiveTab('settings');
        showError(tabErrors.settings);
      } else {
        showError('Please fix validation errors');
      }
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    onSubmit(formData);
  };
```

- [ ] **Step 4: Add `formErrors` state and inline error rendering**

Add a new state variable after the existing state declarations (after line 30):

```javascript
  const [formErrors, setFormErrors] = useState({});
```

Add a helper to clear individual field errors when the user types (add after `handleChange` on line 46):

```javascript
  const clearFieldError = (field) => {
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
```

Update `handleChange` to clear errors on input:

```javascript
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };
```

- [ ] **Step 5: Add inline error messages to the Layout & Info tab fields**

For the **title** input (around line 128), add a conditional error border and error message:

Change the input's className to include error styling:
```javascript
className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${formErrors.title ? 'border-accent-200' : 'border-bg-300'}`}
```

Add error message after the input (before the closing `</div>`):
```jsx
{formErrors.title && <p className="mt-1 text-sm text-accent-200">{formErrors.title}</p>}
```

Do the same for the **screenId** input — add error border class and error message paragraph after the helper text `<p>` tag.

- [ ] **Step 6: Add error indicator dots on tab buttons**

Update the tab button rendering (lines 91–109) to show a red dot when a tab has errors:

```javascript
{TABS.map(tab => {
  const Icon = tab.icon;
  const isActive = activeTab === tab.id;
  const hasError = (tab.id === 'layout' && (formErrors.title || formErrors.screenId || formErrors.layoutTheme))
    || (tab.id === 'sections' && formErrors.sections)
    || (tab.id === 'settings' && (formErrors.backgroundMedia || formErrors.backgroundColor));
  return (
    <button
      key={tab.id}
      type="button"
      onClick={() => setActiveTab(tab.id)}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 ${
        isActive
          ? 'border-primary-100 text-primary-100'
          : hasError
            ? 'border-accent-200 text-accent-200'
            : 'border-transparent text-text-200 hover:text-text-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      {tab.label}
      {hasError && !isActive && (
        <span className="w-2 h-2 rounded-full bg-accent-200" />
      )}
    </button>
  );
})}
```

- [ ] **Step 7: Run lint and build**

Run: `npm run lint && npm run build`
Expected: Both pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/screens/FoodScreenForm.jsx src/utils/validators.js
git commit -m "feat: add inline errors, auto-tab navigation, and descriptive toasts to FoodScreenForm"
```

---

## Chunk 2: State Preservation

### Task 3: Preserve content state when switching between menu and media in SectionContentEditor

Currently, `handleTypeChange` in `SectionContentEditor` replaces the entire content object with fresh defaults when switching types. If a user selects a menu, then switches to media to check something, then switches back — the menu selection is gone.

**Files:**
- Modify: `src/components/screens/SectionContentEditor.jsx`

#### Approach:
Cache the prior content in a `useRef` keyed by content type. When switching types, store current content under its type key, then restore any previously cached content for the target type (or use defaults if none cached).

- [ ] **Step 1: Add useRef import and cache ref**

At the top of `SectionContentEditor.jsx`, add `useRef` to the import:

```javascript
import { useRef } from 'react';
```

Inside the component, before `handleTypeChange`, add a cache ref:

```javascript
  const contentCacheRef = useRef({});
```

- [ ] **Step 2: Update `handleTypeChange` to cache and restore**

Replace the existing `handleTypeChange` function (lines 24–32) with:

```javascript
  const handleTypeChange = (newType) => {
    if (newType === currentType) return;

    // Cache current content under its type
    contentCacheRef.current[currentType] = content;

    // Restore cached content for the new type, or use defaults
    if (contentCacheRef.current[newType]) {
      onChange(contentCacheRef.current[newType]);
    } else if (newType === 'menu') {
      onChange({ type: 'menu', menuId: '', visualStyle: 'card-grid', titleFont: 'font-heading', titleColor: '#ffffff' });
    } else if (newType === 'media') {
      onChange({ type: 'media', media: [], slideDuration: DEFAULT_SLIDE_DURATION, transition: DEFAULT_TRANSITION });
    }
  };
```

- [ ] **Step 3: Run lint and build**

Run: `npm run lint && npm run build`
Expected: Both pass.

- [ ] **Step 4: Manual test scenario**

1. Open screen create modal
2. Go to Sections tab
3. In Section 1 default content, select a menu from the dropdown
4. Switch content type to "Media"
5. Switch content type back to "Menu"
6. Verify: the previously selected menu should still be selected

Same test for media:
1. Switch to "Media", select some media items
2. Switch to "Menu"
3. Switch back to "Media"
4. Verify: media items should still be selected

- [ ] **Step 5: Commit**

```bash
git add src/components/screens/SectionContentEditor.jsx
git commit -m "feat: preserve content selections when switching between menu and media types"
```

---

### Task 4: Preserve time slot content state when switching types

The same state-loss issue exists in time slot content editors (each time slot has its own `SectionContentEditor`). The fix from Task 3 handles this automatically because the cache ref is per-component-instance. Each `SectionContentEditor` mounted for a time slot gets its own `contentCacheRef`.

No additional code changes needed. This task is a verification step.

- [ ] **Step 1: Manual test**

1. Create a food screen, go to Sections tab
2. Add a time slot
3. In the time slot's content editor, select a menu
4. Switch to "Media", select some items
5. Switch back to "Menu"
6. Verify: menu selection preserved
7. Verify: switch to "Media" again, media items preserved

- [ ] **Step 2: Final build verification**

Run: `npm run build`
Expected: Clean build, no warnings.

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/screens/MediaMultiPicker.jsx` | Fix `showError` destructuring to alias `error` from context |
| `src/utils/validators.js` | Add `tabErrors` map to `validateFoodScreen` return value |
| `src/components/screens/FoodScreenForm.jsx` | Add `formErrors` state, inline field errors, error indicator dots on tabs, auto-tab navigation on validation failure |
| `src/components/screens/SectionContentEditor.jsx` | Add `useRef` cache to preserve menu/media state across type switches |
