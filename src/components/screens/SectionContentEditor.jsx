import { useState } from 'react';
import { UtensilsCrossed, Image as ImageIcon, Video, Upload, FolderOpen } from 'lucide-react';
import { VISUAL_STYLES } from '../gallery/themes/visualStyleRegistry';
import ImageUpload from '../common/ImageUpload';
import { useNotification } from '../../context/NotificationContext';
import { getMediaByType } from '../../assets/media';

const CONTENT_TYPES = [
  { type: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'video', label: 'Video', icon: Video }
];

const TITLE_FONTS = [
  { id: 'font-heading', label: 'Bebas Neue', sample: 'MENU TITLE' },
  { id: 'font-display', label: 'Righteous', sample: 'Menu Title' },
  { id: 'font-script', label: 'Pacifico', sample: 'Menu Title' },
  { id: 'font-marker', label: 'Permanent Marker', sample: 'MENU TITLE' },
  { id: 'font-handwritten', label: 'Kalam', sample: 'Menu Title' },
  { id: 'font-body', label: 'Poppins', sample: 'Menu Title' }
];

const MediaGalleryPicker = ({ type, value, onSelect }) => {
  const items = getMediaByType(type);

  if (items.length === 0) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-text-200 mb-2">
        Select from Gallery
      </label>
      <div className={`grid ${type === 'image' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'} gap-2`}>
        {items.map((item) => {
          const isSelected = value === item.src;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.src)}
              className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                isSelected
                  ? 'border-primary-100 ring-2 ring-primary-100/30'
                  : 'border-bg-300 hover:border-primary-100/50'
              }`}
            >
              {type === 'image' ? (
                <img
                  src={item.src}
                  alt={item.name}
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <video
                  src={item.src}
                  muted
                  className="w-full aspect-video object-cover"
                  onMouseEnter={(e) => e.target.play()}
                  onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                />
              )}
              <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-1">
                <span className="text-[10px] text-white font-medium truncate block">{item.name}</span>
              </div>
              {isSelected && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">&#10003;</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SectionContentEditor = ({ content, onChange, menus, label }) => {
  const { showError } = useNotification();
  const currentType = content?.type || 'menu';
  const [mediaSource, setMediaSource] = useState('gallery'); // 'gallery' or 'upload'

  const handleTypeChange = (newType) => {
    if (newType === currentType) return;

    if (newType === 'menu') {
      onChange({ type: 'menu', menuId: '', visualStyle: 'card-grid', titleFont: 'font-heading', titleColor: '#ffffff', media: undefined });
    } else if (newType === 'image') {
      onChange({ type: 'image', media: undefined, menuId: undefined, visualStyle: undefined });
    } else if (newType === 'video') {
      onChange({ type: 'video', media: undefined, menuId: undefined, visualStyle: undefined });
    }
    setMediaSource('gallery');
  };

  const handleMenuChange = (e) => {
    onChange({ ...content, menuId: e.target.value });
  };

  const handleVisualStyleChange = (styleId) => {
    onChange({ ...content, visualStyle: styleId });
  };

  const handleMediaChange = (mediaValue) => {
    onChange({ ...content, media: mediaValue });
  };

  const handleMediaError = (errorMsg) => {
    showError(errorMsg);
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

      {/* Image/Video content */}
      {(currentType === 'image' || currentType === 'video') && (
        <div className="space-y-3">
          {/* Source toggle: Gallery vs Upload */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMediaSource('gallery')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                mediaSource === 'gallery'
                  ? 'border-primary-100 bg-primary-100/10 text-primary-100'
                  : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Gallery
            </button>
            <button
              type="button"
              onClick={() => setMediaSource('upload')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                mediaSource === 'upload'
                  ? 'border-primary-100 bg-primary-100/10 text-primary-100'
                  : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>

          {/* Gallery picker */}
          {mediaSource === 'gallery' && (
            <MediaGalleryPicker
              type={currentType}
              value={content?.media}
              onSelect={handleMediaChange}
            />
          )}

          {/* Upload */}
          {mediaSource === 'upload' && (
            <ImageUpload
              value={content?.media || null}
              onChange={handleMediaChange}
              onError={handleMediaError}
              accept={currentType === 'image' ? 'image/*' : 'video/*'}
              label={currentType === 'image' ? 'Upload Image' : 'Upload Video'}
            />
          )}

          {/* Preview of selected media */}
          {content?.media && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-text-200 mb-1">Preview</label>
              <div className="rounded-lg overflow-hidden border border-bg-300 max-h-40">
                {currentType === 'image' ? (
                  <img src={content.media} alt="Selected" className="w-full max-h-40 object-cover" />
                ) : (
                  <video src={content.media} muted autoPlay loop className="w-full max-h-40 object-cover" />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionContentEditor;
