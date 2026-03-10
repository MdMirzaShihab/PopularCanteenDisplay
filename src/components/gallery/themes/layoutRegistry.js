import { LayoutGrid, Columns, Rows, PanelLeft, Columns3, Grid2x2, LayoutDashboard, PanelLeftDashed, RectangleVertical, SplitSquareVertical, Rows3, PanelTop, StretchVertical, Grid3x3, Wallpaper, TableProperties } from 'lucide-react';

export const LAYOUT_THEMES = {
  // ============= LANDSCAPE LAYOUTS =============
  'layout-1': {
    id: 'layout-1',
    label: 'Full Screen',
    description: 'Single block fills entire screen',
    icon: LayoutGrid,
    orientation: 'landscape',
    sections: 1,
    grid: { cols: '1fr', rows: '1fr' },
    areas: [
      { id: 'section-1', label: 'Main', gridArea: '1 / 1 / 2 / 2' }
    ]
  },
  'layout-2': {
    id: 'layout-2',
    label: 'Side by Side',
    description: '60% left + 40% right',
    icon: Columns,
    orientation: 'landscape',
    sections: 2,
    grid: { cols: '3fr 2fr', rows: '1fr' },
    areas: [
      { id: 'section-1', label: 'Left (60%)', gridArea: '1 / 1 / 2 / 2' },
      { id: 'section-2', label: 'Right (40%)', gridArea: '1 / 2 / 2 / 3' }
    ]
  },
  'layout-3': {
    id: 'layout-3',
    label: 'Top & Bottom',
    description: 'Stacked top and bottom',
    icon: Rows,
    orientation: 'landscape',
    sections: 2,
    grid: { cols: '1fr', rows: '1fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Top', gridArea: '1 / 1 / 2 / 2' },
      { id: 'section-2', label: 'Bottom', gridArea: '2 / 1 / 3 / 2' }
    ]
  },
  'layout-4': {
    id: 'layout-4',
    label: 'Main + Side Stack',
    description: '1 large left + 2 stacked right',
    icon: PanelLeft,
    orientation: 'landscape',
    sections: 3,
    grid: { cols: '3fr 2fr', rows: '1fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Left (large)', gridArea: '1 / 1 / 3 / 2' },
      { id: 'section-2', label: 'Top Right', gridArea: '1 / 2 / 2 / 3' },
      { id: 'section-3', label: 'Bottom Right', gridArea: '2 / 2 / 3 / 3' }
    ]
  },
  'layout-5': {
    id: 'layout-5',
    label: 'Three Columns',
    description: '3 equal columns',
    icon: Columns3,
    orientation: 'landscape',
    sections: 3,
    grid: { cols: '1fr 1fr 1fr', rows: '1fr' },
    areas: [
      { id: 'section-1', label: 'Left', gridArea: '1 / 1 / 2 / 2' },
      { id: 'section-2', label: 'Center', gridArea: '1 / 2 / 2 / 3' },
      { id: 'section-3', label: 'Right', gridArea: '1 / 3 / 2 / 4' }
    ]
  },
  'layout-6': {
    id: 'layout-6',
    label: 'Quad Grid',
    description: '2x2 equal grid',
    icon: Grid2x2,
    orientation: 'landscape',
    sections: 4,
    grid: { cols: '1fr 1fr', rows: '1fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Top Left', gridArea: '1 / 1 / 2 / 2' },
      { id: 'section-2', label: 'Top Right', gridArea: '1 / 2 / 2 / 3' },
      { id: 'section-3', label: 'Bottom Left', gridArea: '2 / 1 / 3 / 2' },
      { id: 'section-4', label: 'Bottom Right', gridArea: '2 / 2 / 3 / 3' }
    ]
  },
  'layout-7': {
    id: 'layout-7',
    label: 'Dashboard',
    description: 'Large left + 2 center + 2 right',
    icon: LayoutDashboard,
    orientation: 'landscape',
    sections: 5,
    grid: { cols: '2fr 1fr 1fr', rows: '1fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Left (large)', gridArea: '1 / 1 / 3 / 2' },
      { id: 'section-2', label: 'Center Top', gridArea: '1 / 2 / 2 / 3' },
      { id: 'section-3', label: 'Center Bottom', gridArea: '2 / 2 / 3 / 3' },
      { id: 'section-4', label: 'Right Top', gridArea: '1 / 3 / 2 / 4' },
      { id: 'section-5', label: 'Right Bottom', gridArea: '2 / 3 / 3 / 4' }
    ]
  },
  'layout-8': {
    id: 'layout-8',
    label: 'Wide + Stack',
    description: 'Large left + 2 middle + 3 right (slim)',
    icon: PanelLeftDashed,
    orientation: 'landscape',
    sections: 6,
    grid: { cols: '2fr 1fr 1fr', rows: '1fr 1fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Left (large)', gridArea: '1 / 1 / 4 / 2' },
      { id: 'section-2', label: 'Middle Top', gridArea: '1 / 2 / 2 / 3' },
      { id: 'section-3', label: 'Middle Bottom', gridArea: '2 / 2 / 4 / 3' },
      { id: 'section-4', label: 'Right Top', gridArea: '1 / 3 / 2 / 4' },
      { id: 'section-5', label: 'Right Middle', gridArea: '2 / 3 / 3 / 4' },
      { id: 'section-6', label: 'Right Bottom', gridArea: '3 / 3 / 4 / 4' }
    ]
  },

  // ============= PORTRAIT LAYOUTS =============
  'layout-p1': {
    id: 'layout-p1',
    label: 'Full Portrait',
    description: 'Single block, vertical display',
    icon: RectangleVertical,
    orientation: 'portrait',
    sections: 1,
    grid: { cols: '1fr', rows: '1fr' },
    areas: [
      { id: 'section-1', label: 'Main', gridArea: '1 / 1 / 2 / 2' }
    ]
  },
  'layout-p2': {
    id: 'layout-p2',
    label: 'Top Heavy',
    description: '60% top hero + 40% bottom',
    icon: SplitSquareVertical,
    orientation: 'portrait',
    sections: 2,
    grid: { cols: '1fr', rows: '3fr 2fr' },
    areas: [
      { id: 'section-1', label: 'Top (60%)', gridArea: '1 / 1 / 2 / 2' },
      { id: 'section-2', label: 'Bottom (40%)', gridArea: '2 / 1 / 3 / 2' }
    ]
  },
  'layout-p3': {
    id: 'layout-p3',
    label: 'Three Rows',
    description: '3 equal stacked rows',
    icon: Rows3,
    orientation: 'portrait',
    sections: 3,
    grid: { cols: '1fr', rows: '1fr 1fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Top', gridArea: '1 / 1 / 2 / 2' },
      { id: 'section-2', label: 'Middle', gridArea: '2 / 1 / 3 / 2' },
      { id: 'section-3', label: 'Bottom', gridArea: '3 / 1 / 4 / 2' }
    ]
  },
  'layout-p4': {
    id: 'layout-p4',
    label: 'Hero + Duo',
    description: 'Large top + 2 side-by-side bottom',
    icon: PanelTop,
    orientation: 'portrait',
    sections: 3,
    grid: { cols: '1fr 1fr', rows: '3fr 2fr' },
    areas: [
      { id: 'section-1', label: 'Top (hero)', gridArea: '1 / 1 / 2 / 3' },
      { id: 'section-2', label: 'Bottom Left', gridArea: '2 / 1 / 3 / 2' },
      { id: 'section-3', label: 'Bottom Right', gridArea: '2 / 2 / 3 / 3' }
    ]
  },
  'layout-p5': {
    id: 'layout-p5',
    label: 'Sandwich',
    description: 'Banner + main content + banner',
    icon: StretchVertical,
    orientation: 'portrait',
    sections: 3,
    grid: { cols: '1fr', rows: '1fr 4fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Top Banner', gridArea: '1 / 1 / 2 / 2' },
      { id: 'section-2', label: 'Main Content', gridArea: '2 / 1 / 3 / 2' },
      { id: 'section-3', label: 'Bottom Banner', gridArea: '3 / 1 / 4 / 2' }
    ]
  },
  'layout-p6': {
    id: 'layout-p6',
    label: 'Hero + Trio',
    description: 'Large top + 3 stacked rows below',
    icon: Wallpaper,
    orientation: 'portrait',
    sections: 4,
    grid: { cols: '1fr', rows: '2fr 1fr 1fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Top (hero)', gridArea: '1 / 1 / 2 / 2' },
      { id: 'section-2', label: 'Row 1', gridArea: '2 / 1 / 3 / 2' },
      { id: 'section-3', label: 'Row 2', gridArea: '3 / 1 / 4 / 2' },
      { id: 'section-4', label: 'Row 3', gridArea: '4 / 1 / 5 / 2' }
    ]
  },
  'layout-p7': {
    id: 'layout-p7',
    label: 'Showcase',
    description: 'Hero top + 2x2 grid bottom',
    icon: TableProperties,
    orientation: 'portrait',
    sections: 5,
    grid: { cols: '1fr 1fr', rows: '2fr 1fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Top (hero)', gridArea: '1 / 1 / 2 / 3' },
      { id: 'section-2', label: 'Mid Left', gridArea: '2 / 1 / 3 / 2' },
      { id: 'section-3', label: 'Mid Right', gridArea: '2 / 2 / 3 / 3' },
      { id: 'section-4', label: 'Bottom Left', gridArea: '3 / 1 / 4 / 2' },
      { id: 'section-5', label: 'Bottom Right', gridArea: '3 / 2 / 4 / 3' }
    ]
  },
  'layout-p8': {
    id: 'layout-p8',
    label: 'Vertical Grid',
    description: '2 columns x 3 rows grid',
    icon: Grid3x3,
    orientation: 'portrait',
    sections: 6,
    grid: { cols: '1fr 1fr', rows: '1fr 1fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Top Left', gridArea: '1 / 1 / 2 / 2' },
      { id: 'section-2', label: 'Top Right', gridArea: '1 / 2 / 2 / 3' },
      { id: 'section-3', label: 'Mid Left', gridArea: '2 / 1 / 3 / 2' },
      { id: 'section-4', label: 'Mid Right', gridArea: '2 / 2 / 3 / 3' },
      { id: 'section-5', label: 'Bottom Left', gridArea: '3 / 1 / 4 / 2' },
      { id: 'section-6', label: 'Bottom Right', gridArea: '3 / 2 / 4 / 3' }
    ]
  }
};

export const VALID_LAYOUT_IDS = Object.keys(LAYOUT_THEMES);

export const getLayoutTheme = (id) => LAYOUT_THEMES[id] || LAYOUT_THEMES['layout-1'];

export const buildEmptySections = (layoutId) => {
  const layout = getLayoutTheme(layoutId);
  return layout.areas.map(area => ({
    id: area.id,
    label: area.label,
    defaultContent: { type: 'menu', menuId: '', visualStyle: 'card-grid' },
    timeSlots: []
  }));
};
