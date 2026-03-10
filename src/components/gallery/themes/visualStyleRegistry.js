import { LayoutGrid, Sparkles, List, Image, BookOpen, Minus } from 'lucide-react';

export const VISUAL_STYLES = {
  'card-grid': {
    id: 'card-grid',
    label: 'Card Grid',
    description: 'Cards with circular images, clean layout',
    icon: LayoutGrid
  },
  'elegant': {
    id: 'elegant',
    label: 'Elegant',
    description: 'Gold accents, script fonts, premium feel',
    icon: Sparkles
  },
  'compact': {
    id: 'compact',
    label: 'Compact List',
    description: 'Dense 2-column list, max items visible',
    icon: List
  },
  'catalog': {
    id: 'catalog',
    label: 'Catalog',
    description: 'Full-bleed images with overlay text',
    icon: Image
  },
  'menu-board': {
    id: 'menu-board',
    label: 'Menu Board',
    description: 'Chalkboard aesthetic, dotted price lines',
    icon: BookOpen
  },
  'minimal-rows': {
    id: 'minimal-rows',
    label: 'Minimal Rows',
    description: 'Clean horizontal rows, accent bar',
    icon: Minus
  }
};

export const VALID_VISUAL_STYLE_IDS = Object.keys(VISUAL_STYLES);

export const getVisualStyle = (id) => VISUAL_STYLES[id] || VISUAL_STYLES['card-grid'];
