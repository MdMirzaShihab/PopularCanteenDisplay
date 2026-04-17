import CardGridRenderer from './CardGridRenderer';
import ElegantRenderer from './ElegantRenderer';
import CatalogRenderer from './CatalogRenderer';
import MenuBoardRenderer from './MenuBoardRenderer';
import KineticStripsRenderer from './KineticStripsRenderer';
import SpotlightRenderer from './SpotlightRenderer';
import BentoRenderer from './BentoRenderer';

const STYLE_RENDERERS = {
  'card-grid': CardGridRenderer,
  'catalog': CatalogRenderer,
  'elegant': ElegantRenderer,
  'menu-board': MenuBoardRenderer,
  'kinetic-strips': KineticStripsRenderer,
  'spotlight': SpotlightRenderer,
  'bento': BentoRenderer,
};

export const getStyleRenderer = (styleId) =>
  STYLE_RENDERERS[styleId] || STYLE_RENDERERS['card-grid'];

export default STYLE_RENDERERS;
