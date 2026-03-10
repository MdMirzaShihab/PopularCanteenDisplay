import CardGridRenderer from './CardGridRenderer';
import ElegantRenderer from './ElegantRenderer';
import CompactRenderer from './CompactRenderer';
import CatalogRenderer from './CatalogRenderer';
import MenuBoardRenderer from './MenuBoardRenderer';
import MinimalRowsRenderer from './MinimalRowsRenderer';

const STYLE_RENDERERS = {
  'card-grid': CardGridRenderer,
  'elegant': ElegantRenderer,
  'compact': CompactRenderer,
  'catalog': CatalogRenderer,
  'menu-board': MenuBoardRenderer,
  'minimal-rows': MinimalRowsRenderer
};

export const getStyleRenderer = (styleId) =>
  STYLE_RENDERERS[styleId] || STYLE_RENDERERS['card-grid'];

export default STYLE_RENDERERS;
