import { useRef } from 'react';
import { UtensilsCrossed, Film, Megaphone } from 'lucide-react';
import { VISUAL_STYLES } from '../gallery/themes/visualStyleRegistry';
import MediaMultiPicker from './MediaMultiPicker';
import AnnouncementEditor from './AnnouncementEditor';
import TypographyControl from '../ui/TypographyControl';
import { TRANSITION_EFFECTS, DEFAULT_SLIDE_DURATION, DEFAULT_TRANSITION } from '../../utils/mediaUtils';
import { makeFontSampleMap } from '../../utils/constants';

const CONTENT_TYPES = [
  { type: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { type: 'media', label: 'Media', icon: Film },
  { type: 'announcement', label: 'Announcement', icon: Megaphone }
];

const ITEM_FONT_SAMPLE = makeFontSampleMap('CHICKEN BIRYANI', 'Chicken Biryani');
const PRICE_FONT_SAMPLE = makeFontSampleMap('৳120', '৳120');

const DEFAULT_ANNOUNCEMENT = {
  headline: '',
  subtext: '',
  textAlign: 'center',
  textFont: 'font-heading',
  textColor: '#ffffff',
  backgroundMode: 'transparent',
  backgroundColor: '#1a1a2e',
  backgroundMedia: null,
  backgroundPositionX: 50,
  backgroundPositionY: 50,
  backgroundScale: 1,
  overlayColor: '#000000',
  overlayOpacity: 0.4,
  visualStyle: 'poster',
  icon: null,
};

const TITLE_FONT_SAMPLE = makeFontSampleMap('MENU TITLE', 'Menu Title');

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
    } else if (newType === 'announcement') {
      onChange({ type: 'announcement', announcement: { ...DEFAULT_ANNOUNCEMENT } });
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
              value={content?.menuId?._id || content?.menuId || ''}
              onChange={handleMenuChange}
              className="w-full px-3 py-2 border border-bg-300 rounded-lg bg-white text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="">-- Select a menu --</option>
              {menus.map((menu) => (
                <option key={menu._id} value={menu._id}>
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

          <TypographyControl
            label="Title"
            font={content?.titleFont || 'font-heading'}
            fontSample={TITLE_FONT_SAMPLE}
            onFontChange={(id) => onChange({ ...content, titleFont: id })}
            size={content?.titleSize}
            onSizeChange={(step) => onChange({ ...content, titleSize: step })}
            color={content?.titleColor}
            colorDefault="#ffffff"
            colorThemeDefault
            onColorChange={(hex) => onChange({ ...content, titleColor: hex })}
            renderPreview={({ font, color }) => (
              <span className={`${font} text-base`} style={{ color: color || '#ffffff' }}>
                Menu Title
              </span>
            )}
          />

          <TypographyControl
            label="Item Name"
            font={content?.itemFont || 'font-body'}
            fontSample={ITEM_FONT_SAMPLE}
            onFontChange={(id) => onChange({ ...content, itemFont: id })}
            size={content?.itemSize}
            onSizeChange={(step) => onChange({ ...content, itemSize: step })}
            color={content?.itemColor}
            colorDefault="#ffffff"
            colorThemeDefault
            onColorChange={(hex) => onChange({ ...content, itemColor: hex })}
            renderPreview={({ font, color }) => (
              <span className={`${font} text-base`} style={{ color: color || '#ffffff' }}>
                Chicken Biryani
              </span>
            )}
          />

          <TypographyControl
            label="Price"
            font={content?.priceFont || 'font-heading'}
            fontSample={PRICE_FONT_SAMPLE}
            onFontChange={(id) => onChange({ ...content, priceFont: id })}
            size={content?.priceSize}
            onSizeChange={(step) => onChange({ ...content, priceSize: step })}
            color={content?.priceColor}
            colorDefault="#6ee7b7"
            colorThemeDefault
            onColorChange={(hex) => onChange({ ...content, priceColor: hex })}
            renderPreview={({ font, color }) => (
              <span className={`${font} text-base font-bold`} style={{ color: color || '#6ee7b7' }}>
                ৳120
              </span>
            )}
          />
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

      {/* Announcement content */}
      {currentType === 'announcement' && (
        <AnnouncementEditor content={content} onChange={onChange} />
      )}
    </div>
  );
};

export default SectionContentEditor;
