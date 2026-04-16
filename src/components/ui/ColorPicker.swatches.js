// Palette for ColorPicker. 10-column grid (1 warm grayscale row + 8 color rows) + 10 standard colors.
// Curated for a canteen/food/restaurant context — warm neutrals and appetite-forward hues.
// Color rows run dark (top) to light (bottom); columns are food-friendly hue families:
// tomato, paprika, saffron, mustard, basil, fresh-green, emerald, teal, rose, blush.

export const GRAYSCALE_ROW = [
  '#000000', '#1c1917', '#44403c', '#57534e', '#78716c',
  '#a8a29e', '#d6d3d1', '#e7e5e4', '#f5f5f4', '#ffffff'
];

export const COLOR_GRID_ROWS = [
  ['#7f1d1d', '#7c2d12', '#78350f', '#713f12', '#365314', '#14532d', '#064e3b', '#134e4a', '#831843', '#881337'],
  ['#991b1b', '#9a3412', '#92400e', '#854d0e', '#3f6212', '#166534', '#065f46', '#115e59', '#9d174d', '#9f1239'],
  ['#b91c1c', '#c2410c', '#b45309', '#a16207', '#4d7c0f', '#15803d', '#047857', '#0f766e', '#be185d', '#be123c'],
  ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a', '#059669', '#0d9488', '#db2777', '#e11d48'],
  ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#ec4899', '#f43f5e'],
  ['#f87171', '#fb923c', '#fbbf24', '#facc15', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#f472b6', '#fb7185'],
  ['#fca5a5', '#fdba74', '#fcd34d', '#fde047', '#bef264', '#86efac', '#6ee7b7', '#5eead4', '#f9a8d4', '#fda4af'],
  ['#fecaca', '#fed7aa', '#fde68a', '#fef08a', '#d9f99d', '#bbf7d0', '#a7f3d0', '#99f6e4', '#fbcfe8', '#fecdd3']
];

// Quick-access row. Includes the app's primary (sage #8F9779) and accent (blush #FFB6B9) for theme consistency.
export const STANDARD_COLORS = [
  '#000000', '#ffffff', '#dc2626', '#ea580c', '#f59e0b',
  '#16a34a', '#8f9779', '#0d9488', '#db2777', '#ffb6b9'
];
