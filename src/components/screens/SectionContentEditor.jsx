import { useRef } from 'react';
import { UtensilsCrossed, Film } from 'lucide-react';
import { VISUAL_STYLES } from '../gallery/themes/visualStyleRegistry';
import MediaMultiPicker from './MediaMultiPicker';
import { TRANSITION_EFFECTS, DEFAULT_SLIDE_DURATION, DEFAULT_TRANSITION } from '../../utils/mediaUtils';

const CONTENT_TYPES = [
  { type: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { type: 'media', label: 'Media', icon: Film }
];

const TITLE_FONTS = [
  { id: 'font-heading', label: 'Bebas Neue', sample: 'MENU TITLE' },
  { id: 'font-display', label: 'Righteous', sample: 'Menu Title' },
  { id: 'font-script', label: 'Pacifico', sample: 'Menu Title' },
  { id: 'font-marker', label: 'Permanent Marker', sample: 'MENU TITLE' },
  { id: 'font-handwritten', label: 'Kalam', sample: 'Menu Title' },
  { id: 'font-body', label: 'Poppins', sample: 'Menu Title' }
];

const SectionContentEditor = ({ content, onChange, menus, label }) => {
  // Normalize legacy types for the form
  const currentType = (content?.type === 'image' || content?.type === 'video') ? 'media' : (content?.type || 'menu');

  const contentCacheRef = useRef({});

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

  const handleMenuChange = (e) => {
    onChange({ ...content, menuId: e.target.value });
  };

  const handleVisualStyleChange = (styleId) => {
    onChange({ ...content, visualStyle: styleId });
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-text-100">{label}</label>
      )}

      {/* Content type toggle */}
      <div className="flex rounded-lg overflow-hidden border border-bg-300">
        {CONTENT_TYPES.map((contentType) => {
          const TypeIcon = contentType.icon;
          return (
          <button
            key={contentType.type}
            type="button"
            onClick={() => handleTypeChange(contentType.type)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
              currentType === contentType.type
                ? 'bg-primary-100 text-white'
                : 'bg-bg-200 text-text-100 hover:bg-bg-300'
            }`}
          >
            <TypeIcon className="w-4 h-4" />
            {contentType.label}
          </button>
          );
        })}
      </div>

      {/* Menu content */}
      {currentType === 'menu' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-200 mb-1">
              Select Menu
            </label>
            <select
              value={content?.menuId || ''}
              onChange={handleMenuChange}
              className="w-full px-3 py-2 border border-bg-300 rounded-lg bg-white text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="">-- Select a menu --</option>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-200 mb-2">
              Visual Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(VISUAL_STYLES).map((style) => {
                const StyleIcon = style.icon;
                const isSelected = (content?.visualStyle || 'card-grid') === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleVisualStyleChange(style.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? 'border-primary-100 bg-primary-50'
                        : 'border-bg-300 bg-white hover:border-primary-100/50'
                    }`}
                  >
                    <StyleIcon className={`w-5 h-5 ${isSelected ? 'text-primary-100' : 'text-text-200'}`} />
                    <span className={`text-xs font-medium ${isSelected ? 'text-primary-100' : 'text-text-200'}`}>
                      {style.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Font */}
          <div>
            <label className="block text-sm font-medium text-text-200 mb-2">
              Title Font
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TITLE_FONTS.map((font) => {
                const isSelected = (content?.titleFont || 'font-heading') === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => onChange({ ...content, titleFont: font.id })}
                    className={`p-2 rounded-lg border-2 transition-colors text-center ${
                      isSelected
                        ? 'border-primary-100 bg-primary-50'
                        : 'border-bg-300 bg-white hover:border-primary-100/50'
                    }`}
                  >
                    <span className={`${font.id} text-sm ${isSelected ? 'text-primary-100' : 'text-text-100'}`}>
                      {font.sample}
                    </span>
                    <span className="block text-[10px] text-text-200 mt-0.5">{font.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Color */}
          <div>
            <label className="block text-sm font-medium text-text-200 mb-2">
              Title Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={content?.titleColor || '#ffffff'}
                onChange={(e) => onChange({ ...content, titleColor: e.target.value })}
                className="w-10 h-10 rounded border border-bg-300 cursor-pointer"
              />
              <span className="text-sm text-text-200 font-mono">{content?.titleColor || '#ffffff'}</span>
              <div
                className="flex-1 h-10 rounded-lg flex items-center justify-center border border-bg-300"
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <span
                  className={`${content?.titleFont || 'font-heading'} text-sm`}
                  style={{ color: content?.titleColor || '#ffffff' }}
                >
                  Preview Title
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media content */}
      {currentType === 'media' && (
        <div className="space-y-4">
          <MediaMultiPicker
            value={Array.isArray(content?.media) ? content.media : (content?.media ? [content.media] : [])}
            onChange={(items) => onChange({ ...content, type: 'media', media: items })}
          />

          {/* Slide Duration */}
          {Array.isArray(content?.media) && content.media.length > 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-200 mb-1">
                  Slide Duration (seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  step="1"
                  value={content?.slideDuration ?? DEFAULT_SLIDE_DURATION}
                  onChange={(e) => onChange({ ...content, slideDuration: Math.max(1, Math.min(60, parseInt(e.target.value) || DEFAULT_SLIDE_DURATION)) })}
                  className="w-full px-3 py-2 border border-bg-300 rounded-lg bg-white text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
                <p className="text-xs text-text-200 mt-1">How long each image is displayed. Videos play to their natural end.</p>
              </div>

              {/* Transition Effect */}
              <div>
                <label className="block text-sm font-medium text-text-200 mb-2">
                  Transition Effect
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {Object.values(TRANSITION_EFFECTS).map((effect) => {
                    const isSelected = (content?.transition || DEFAULT_TRANSITION) === effect.id;
                    return (
                      <button
                        key={effect.id}
                        type="button"
                        onClick={() => onChange({ ...content, transition: effect.id })}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                          isSelected
                            ? 'border-primary-100 bg-primary-50 text-primary-100'
                            : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
                        }`}
                      >
                        {effect.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionContentEditor;
