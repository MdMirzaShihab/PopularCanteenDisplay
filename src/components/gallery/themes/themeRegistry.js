import {
  AlignLeft, Star, LayoutGrid, BookOpen, Layers,
  Grid3x3, Columns2, SquareStack, SplitSquareHorizontal, List,
  Film, Image
} from 'lucide-react';

// Theme registry — single source of truth for all theme metadata.
// Layout config + ItemRenderers live in TimeBasedRenderer.jsx (THEME_CONFIG).

export const THEME_REGISTRY = [
  // --- PORTRAIT ---
  {
    id: 'clean-list',
    label: 'Clean List',
    description: 'Vertical list with thumbnail, name, and price',
    group: 'portrait',
    icon: AlignLeft,
  },
  {
    id: 'elegant',
    label: 'Elegant',
    description: 'Warm tones with circular images and script fonts',
    group: 'portrait',
    icon: Star,
  },
  {
    id: 'compact',
    label: 'Compact',
    description: 'Dense two-column text grid, maximum items visible',
    group: 'portrait',
    icon: LayoutGrid,
  },
  {
    id: 'catalog',
    label: 'Catalog',
    description: 'Full-bleed images with name and price overlay',
    group: 'portrait',
    icon: BookOpen,
  },
  {
    id: 'showcase',
    label: 'Showcase',
    description: 'Large hero cards with bold images and descriptions',
    group: 'portrait',
    icon: Layers,
  },

  // --- LANDSCAPE ---
  {
    id: 'color-blocks',
    label: 'Color Blocks',
    description: 'Bold colored blocks with large images and prices',
    group: 'landscape',
    icon: Grid3x3,
  },
  {
    id: 'menu-board',
    label: 'Menu Board',
    description: 'Classic chalkboard style with dotted price lines',
    group: 'landscape',
    icon: Columns2,
  },
  {
    id: 'card-grid',
    label: 'Card Grid',
    description: 'Polished card grid with circular images',
    group: 'landscape',
    icon: SquareStack,
  },
  {
    id: 'split',
    label: 'Split',
    description: 'Image on left, name and details on right',
    group: 'landscape',
    icon: SplitSquareHorizontal,
  },
  {
    id: 'minimal-rows',
    label: 'Minimal Rows',
    description: 'Clean horizontal rows with thumbnail and price',
    group: 'landscape',
    icon: List,
  },

  // --- SPECIAL ---
  {
    id: 'media-focus',
    label: 'Media Focus',
    description: 'Card grid with a promotional media strip at top',
    group: 'special',
    icon: Film,
  },
  {
    id: 'none',
    label: 'Announcement',
    description: 'Fullscreen background with rotating custom messages',
    group: 'special',
    icon: Image,
  },
];

export const THEME_MAP = Object.fromEntries(
  THEME_REGISTRY.map(t => [t.id, t])
);

export const VALID_THEME_IDS = THEME_REGISTRY.map(t => t.id);

export const DEFAULT_THEME_ID = 'card-grid';

export const getThemeById = (id) => THEME_MAP[id] ?? THEME_MAP[DEFAULT_THEME_ID];

// Legacy theme ID migration map
export const LEGACY_THEME_MAP = {
  'classic-grid': 'card-grid',
  'portrait-list': 'clean-list',
};
