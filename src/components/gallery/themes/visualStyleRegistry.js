import { LayoutGrid, Sparkles, Image, BookOpen, Zap, Star, LayoutPanelTop } from 'lucide-react';

export const VISUAL_STYLES = {
  'card-grid': {
    id: 'card-grid',
    label: 'Prism',
    description: 'Holographic border, neon price glow, cyan image ring',
    icon: LayoutGrid
  },
  'catalog': {
    id: 'catalog',
    label: 'Cinema',
    description: 'Full-bleed image, viewfinder brackets, floating price pill',
    icon: Image
  },
  'elegant': {
    id: 'elegant',
    label: 'Gilded',
    description: 'Art-deco gold, triangle ornaments, plaque price',
    icon: Sparkles
  },
  'menu-board': {
    id: 'menu-board',
    label: 'Neon Chalk',
    description: 'Rotating neon hues, glowing indicator dots and price pills',
    icon: BookOpen
  },
  'kinetic-strips': {
    id: 'kinetic-strips',
    label: 'Kinetic',
    description: 'Angular parallelogram panels, rotating neon accents',
    icon: Zap
  },
  'spotlight': {
    id: 'spotlight',
    label: 'Spotlight',
    description: 'Featured hero item cycles every few seconds + small grid',
    icon: Star
  },
  'bento': {
    id: 'bento',
    label: 'Bento',
    description: 'Mixed-size mosaic — one signature cell + five smaller',
    icon: LayoutPanelTop
  },
};

export const VALID_VISUAL_STYLE_IDS = Object.keys(VISUAL_STYLES);

export const getVisualStyle = (id) => VISUAL_STYLES[id] || VISUAL_STYLES['card-grid'];
