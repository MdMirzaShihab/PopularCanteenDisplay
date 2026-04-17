// Typography + row/card sizing for food-screen menu sections.
// M matches each renderer's current baseline classes and pixel dimensions.

import { DEFAULT_SIZE, SIZE_STEPS } from '../../../utils/constants';

// Section title — shared across visual styles (rendered outside style renderers).
// Responsive 3xl: pair scales up on 2000px+ ultra-wide TVs at every step.
export const TITLE_SIZE_MAP = {
  S:     'text-xl 3xl:text-3xl',
  M:     'text-2xl 3xl:text-4xl',
  L:     'text-3xl 3xl:text-5xl',
  XL:    'text-4xl 3xl:text-6xl',
  '2XL': 'text-5xl 3xl:text-7xl',
};

const ITEM_SIZE_MAPS = {
  'card-grid':      { S: 'text-xs',   M: 'text-sm',   L: 'text-base', XL: 'text-lg',  '2XL': 'text-xl'  },
  'elegant':        { S: 'text-xs',   M: 'text-sm',   L: 'text-base', XL: 'text-lg',  '2XL': 'text-xl'  },
  'catalog':        { S: 'text-base', M: 'text-lg',   L: 'text-xl',   XL: 'text-2xl', '2XL': 'text-3xl' },
  'menu-board':     { S: 'text-base', M: 'text-lg',   L: 'text-xl',   XL: 'text-2xl', '2XL': 'text-3xl' },
  'kinetic-strips': { S: 'text-sm',   M: 'text-base', L: 'text-lg',   XL: 'text-xl',  '2XL': 'text-2xl' },
  'spotlight':      { S: 'text-sm',   M: 'text-base', L: 'text-lg',   XL: 'text-xl',  '2XL': 'text-2xl' },
  'bento':          { S: 'text-sm',   M: 'text-base', L: 'text-lg',   XL: 'text-xl',  '2XL': 'text-2xl' },
};

const PRICE_SIZE_MAPS = {
  'card-grid':      { S: 'text-sm',   M: 'text-base', L: 'text-lg',  XL: 'text-xl',  '2XL': 'text-2xl' },
  'elegant':        { S: 'text-base', M: 'text-lg',   L: 'text-xl',  XL: 'text-2xl', '2XL': 'text-3xl' },
  'catalog':        { S: 'text-lg',   M: 'text-xl',   L: 'text-2xl', XL: 'text-3xl', '2XL': 'text-4xl' },
  'menu-board':     { S: 'text-lg',   M: 'text-xl',   L: 'text-2xl', XL: 'text-3xl', '2XL': 'text-4xl' },
  'kinetic-strips': { S: 'text-lg',   M: 'text-xl',   L: 'text-2xl', XL: 'text-3xl', '2XL': 'text-4xl' },
  'spotlight':      { S: 'text-base', M: 'text-lg',   L: 'text-xl',  XL: 'text-2xl', '2XL': 'text-3xl' },
  'bento':          { S: 'text-base', M: 'text-lg',   L: 'text-xl',  XL: 'text-2xl', '2XL': 'text-3xl' },
};

// Row/card height in pixels. M matches each renderer's prior hardcoded value.
const ITEM_HEIGHT_MAPS = {
  'card-grid':  { S: 96,  M: 120, L: 148, XL: 180, '2XL': 220 },
  'catalog':    { S: 140, M: 180, L: 220, XL: 260, '2XL': 320 },
  'elegant':    { S: 60,  M: 72,  L: 88,  XL: 108, '2XL': 132 },
  'menu-board': { S: 38,  M: 46,  L: 56,  XL: 70,  '2XL': 88  },
};

// Thumbnail image size in pixels, for renderers with a per-item image.
const ITEM_IMAGE_MAPS = {
  'card-grid': { S: 56, M: 70, L: 88, XL: 108, '2XL': 132 },
  'elegant':   { S: 40, M: 48, L: 60, XL: 72,  '2XL': 88  },
};

// Minimum card width for grid-layout renderers.
const CARD_MIN_WIDTH_MAPS = {
  'card-grid': { S: 160, M: 200, L: 240, XL: 300, '2XL': 360 },
  'catalog':   { S: 160, M: 200, L: 240, XL: 300, '2XL': 360 },
};

const FALLBACK_STYLE = 'card-grid';
const DEFAULT_IDX = SIZE_STEPS.indexOf(DEFAULT_SIZE);

const resolveStyled = (map, visualStyle, sizeStep) =>
  map[visualStyle]?.[sizeStep]
  ?? map[visualStyle]?.[DEFAULT_SIZE]
  ?? map[FALLBACK_STYLE][DEFAULT_SIZE];

export const getItemSizeClass = (visualStyle, sizeStep) =>
  resolveStyled(ITEM_SIZE_MAPS, visualStyle, sizeStep);

export const getPriceSizeClass = (visualStyle, sizeStep) =>
  resolveStyled(PRICE_SIZE_MAPS, visualStyle, sizeStep);

export const getTitleSizeClass = (sizeStep) =>
  TITLE_SIZE_MAP[sizeStep] ?? TITLE_SIZE_MAP[DEFAULT_SIZE];

export const getItemHeight = (visualStyle, sizeStep) =>
  resolveStyled(ITEM_HEIGHT_MAPS, visualStyle, sizeStep);

export const getItemImageSize = (visualStyle, sizeStep) =>
  ITEM_IMAGE_MAPS[visualStyle]?.[sizeStep] ?? ITEM_IMAGE_MAPS[visualStyle]?.[DEFAULT_SIZE];

export const getCardMinWidth = (visualStyle, sizeStep) =>
  CARD_MIN_WIDTH_MAPS[visualStyle]?.[sizeStep] ?? CARD_MIN_WIDTH_MAPS[visualStyle]?.[DEFAULT_SIZE];

// Row height must fit whichever of item/price is larger.
export const effectiveRowSize = (itemStep, priceStep) => {
  const i = SIZE_STEPS.indexOf(itemStep);
  const p = SIZE_STEPS.indexOf(priceStep);
  return SIZE_STEPS[Math.max(i < 0 ? DEFAULT_IDX : i, p < 0 ? DEFAULT_IDX : p)];
};
