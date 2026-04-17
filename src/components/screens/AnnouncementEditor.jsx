import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlignLeft, AlignCenter, AlignRight, FolderOpen, Upload, Trash2, X } from 'lucide-react';
import {
  ANNOUNCEMENT_PRESETS,
  ANNOUNCEMENT_ICON_OPTIONS,
  ANNOUNCEMENT_ICONS,
} from '../gallery/AnnouncementRenderer.constants';
import { useNotification } from '../../context/NotificationContext';
import { useBackgroundGallery } from '../../hooks/useBackgroundGallery';
import ColorPicker from '../ui/ColorPicker';
import BackgroundCropTool from '../common/BackgroundCropTool';
import ImageUpload from '../common/ImageUpload';
import ConfirmDialog from '../common/ConfirmDialog';
import { FONT_CHOICES, makeFontSampleMap } from '../../utils/constants';

const FONT_SAMPLE = makeFontSampleMap('ANNOUNCEMENT', 'Announcement');

const ALIGN_OPTIONS = [
  { id: 'left', label: 'Left', icon: AlignLeft },
  { id: 'center', label: 'Center', icon: AlignCenter },
  { id: 'right', label: 'Right', icon: AlignRight },
];

const BG_MODE_OPTIONS = [
  { id: 'transparent', label: 'Transparent' },
  { id: 'color', label: 'Solid Color' },
  { id: 'image', label: 'Image' },
  { id: 'image-overlay', label: 'Image + Overlay' },
];

const HEADLINE_SOFT_LIMIT = 120;
const SUBTEXT_SOFT_LIMIT = 200;

const AnnouncementEditor = ({ content, onChange }) => {
  const announcement = useMemo(() => content?.announcement || {}, [content?.announcement]);
  const { error: showError } = useNotification();

  const [bgSource, setBgSource] = useState('gallery');

  const updateField = (field, value) => {
    onChange({
      ...content,
      announcement: { ...announcement, [field]: value },
    });
  };

  const updateFields = (updates) => {
    onChange({
      ...content,
      announcement: { ...announcement, ...updates },
    });
  };

  const handleGalleryItemDeleted = useCallback((id) => {
    if (announcement.backgroundMedia?._id === id) {
      onChange({
        ...content,
        announcement: { ...announcement, backgroundMedia: null },
      });
    }
  }, [announcement, content, onChange]);

  const { galleryMedia, galleryLoading, handleDeleteMedia, addMedia, confirmDialogProps } =
    useBackgroundGallery({ onDeleted: handleGalleryItemDeleted });

  const imageMedia = useMemo(() => galleryMedia.filter(m => m.type === 'image'), [galleryMedia]);

  // Reset source toggle when leaving image modes so next re-entry starts on the Gallery tab.
  useEffect(() => {
    if (announcement.backgroundMode !== 'image' && announcement.backgroundMode !== 'image-overlay') {
      setBgSource('gallery');
    }
  }, [announcement.backgroundMode]);

  const handlePresetChange = (presetId) => {
    const preset = ANNOUNCEMENT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    updateFields({
      visualStyle: presetId,
      textFont: preset.defaults.textFont,
      textColor: preset.defaults.textColor,
      backgroundColor: preset.defaults.backgroundColor,
      textAlign: preset.defaults.textAlign,
    });
  };

  const handleSelectGalleryImage = (mediaItem) => {
    updateFields({
      backgroundMedia: mediaItem,
      backgroundPositionX: 50,
      backgroundPositionY: 50,
      backgroundScale: 1,
    });
  };

  const handleUploadedImage = (mediaItem) => {
    addMedia(mediaItem);
    handleSelectGalleryImage(mediaItem);
  };

  const handleClearBackgroundMedia = () => {
    updateFields({ backgroundMedia: null });
  };

  const headlineLen = (announcement.headline || '').length;
  const subtextLen = (announcement.subtext || '').length;
  const IconPreviewComponent = announcement.icon ? ANNOUNCEMENT_ICONS[announcement.icon] : null;

  return (
    <div className="space-y-6">
      {/* 1. Content Text */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-text-100 uppercase tracking-wide">Content</h4>

        <div>
          <label className="block text-sm font-medium text-text-200 mb-1">
            Headline <span className="text-accent-200">*</span>
          </label>
          <textarea
            value={announcement.headline || ''}
            onChange={(e) => updateField('headline', e.target.value)}
            rows={2}
            placeholder="e.g., Mess closed Friday for Puja"
            className="w-full px-3 py-2 border border-bg-300 rounded-lg bg-white text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
          />
          <p className={`mt-1 text-xs ${headlineLen > HEADLINE_SOFT_LIMIT ? 'text-accent-200' : 'text-text-200'}`}>
            {headlineLen} / {HEADLINE_SOFT_LIMIT} characters
            {headlineLen > HEADLINE_SOFT_LIMIT && ' — longer headlines may overflow on small layouts'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-200 mb-1">Subtext (optional)</label>
          <textarea
            value={announcement.subtext || ''}
            onChange={(e) => updateField('subtext', e.target.value)}
            rows={2}
            placeholder="e.g., Back to normal service Saturday"
            className="w-full px-3 py-2 border border-bg-300 rounded-lg bg-white text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
          />
          <p className={`mt-1 text-xs ${subtextLen > SUBTEXT_SOFT_LIMIT ? 'text-accent-200' : 'text-text-200'}`}>
            {subtextLen} / {SUBTEXT_SOFT_LIMIT} characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-200 mb-2">Text Alignment</label>
          <div className="flex gap-2">
            {ALIGN_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = (announcement.textAlign || 'center') === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateField('textAlign', opt.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'border-primary-100 bg-primary-50 text-primary-100'
                      : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Style Preset */}
      <div>
        <h4 className="text-sm font-semibold text-text-100 uppercase tracking-wide mb-2">Style Preset</h4>
        <p className="text-xs text-text-200 mb-2">
          Picking a preset updates the font, background, and alignment. Your headline, icon, and chosen image are preserved.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ANNOUNCEMENT_PRESETS.map(preset => {
            const isSelected = (announcement.visualStyle || 'poster') === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetChange(preset.id)}
                className={`flex flex-col items-start gap-1 p-3 rounded-lg border-2 text-left transition-colors ${
                  isSelected
                    ? 'border-primary-100 bg-primary-50'
                    : 'border-bg-300 bg-white hover:border-primary-100/50'
                }`}
              >
                <span className={`text-sm font-semibold ${isSelected ? 'text-primary-100' : 'text-text-100'}`}>
                  {preset.label}
                </span>
                <span className="text-[11px] text-text-200 leading-tight">{preset.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Typography */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-text-100 uppercase tracking-wide">Typography</h4>

        <div>
          <label className="block text-sm font-medium text-text-200 mb-2">Text Font</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
            {FONT_CHOICES.map(font => {
              const isSelected = (announcement.textFont || 'font-heading') === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => updateField('textFont', font.id)}
                  className={`p-2 rounded-lg border-2 text-center transition-colors ${
                    isSelected
                      ? 'border-primary-100 bg-primary-50'
                      : 'border-bg-300 bg-white hover:border-primary-100/50'
                  }`}
                >
                  <span className={`${font.id} text-lg leading-tight ${isSelected ? 'text-primary-100' : 'text-text-100'}`}>
                    {FONT_SAMPLE[font.id]}
                  </span>
                  <span className="block text-[10px] text-text-200 mt-0.5">{font.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <ColorPicker
          label="Text Color"
          value={announcement.textColor || '#ffffff'}
          defaultValue="#ffffff"
          onChange={(hex) => updateField('textColor', hex)}
          renderPreview={({ color }) => (
            <div
              className="mt-2 px-4 py-3 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: announcement.backgroundColor || '#1a1a2e' }}
            >
              <span className={`${announcement.textFont || 'font-heading'} text-xl`} style={{ color }}>
                {announcement.headline || 'Preview headline'}
              </span>
            </div>
          )}
        />
      </div>

      {/* 4. Background */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-text-100 uppercase tracking-wide">Background</h4>

        <div>
          <label className="block text-sm font-medium text-text-200 mb-2">Background Mode</label>
          <div className="flex gap-2">
            {BG_MODE_OPTIONS.map(opt => {
              const isSelected = (announcement.backgroundMode || 'transparent') === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateField('backgroundMode', opt.id)}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'border-primary-100 bg-primary-50 text-primary-100'
                      : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {(announcement.backgroundMode || 'transparent') === 'color' && (
          <ColorPicker
            label="Background Color"
            value={announcement.backgroundColor || '#1a1a2e'}
            defaultValue="#1a1a2e"
            onChange={(hex) => updateField('backgroundColor', hex)}
          />
        )}

        {(announcement.backgroundMode === 'image' || announcement.backgroundMode === 'image-overlay') && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBgSource('gallery')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  bgSource === 'gallery' ? 'border-primary-100 bg-primary-100/10 text-primary-100' : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
                }`}
              >
                <FolderOpen className="w-4 h-4" /> Gallery
              </button>
              <button
                type="button"
                onClick={() => setBgSource('upload')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  bgSource === 'upload' ? 'border-primary-100 bg-primary-100/10 text-primary-100' : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
                }`}
              >
                <Upload className="w-4 h-4" /> Upload
              </button>
            </div>

            {bgSource === 'gallery' && (
              <div>
                {galleryLoading ? (
                  <p className="text-sm text-text-200">Loading gallery...</p>
                ) : imageMedia.length === 0 ? (
                  <p className="text-sm text-text-200">
                    No background images yet. Upload one here or from the screen Background tab.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {imageMedia.map(item => {
                      const isSelected = announcement.backgroundMedia?._id === item._id;
                      return (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => handleSelectGalleryImage(item)}
                          className={`group relative rounded-lg overflow-hidden border-2 transition-all ${
                            isSelected ? 'border-primary-100 ring-2 ring-primary-100/30' : 'border-bg-300 hover:border-primary-100/50'
                          }`}
                        >
                          <img src={item.url} alt={item.name} className="w-full aspect-video object-cover" />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-1">
                            <span className="text-[10px] text-white font-medium truncate block">{item.name}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">&#10003;</span>
                            </div>
                          )}
                          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeleteMedia(item); }}
                              className="p-1 bg-accent-200/90 text-white rounded hover:bg-accent-200 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {bgSource === 'upload' && (
              <ImageUpload
                value={announcement.backgroundMedia}
                onChange={handleUploadedImage}
                onError={showError}
                accept="image/*"
                label="Background Image"
                folder="backgrounds"
              />
            )}

            {announcement.backgroundMedia && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-200">
                    Selected: <span className="font-medium text-text-100">{announcement.backgroundMedia.name || 'image'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleClearBackgroundMedia}
                    className="flex items-center gap-1 text-xs text-accent-200 hover:text-accent-300 transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                </div>
                <BackgroundCropTool
                  mediaUrl={announcement.backgroundMedia?.url || announcement.backgroundMedia}
                  mediaType="image"
                  orientation="landscape"
                  positionX={announcement.backgroundPositionX ?? 50}
                  positionY={announcement.backgroundPositionY ?? 50}
                  scale={announcement.backgroundScale ?? 1}
                  onChange={({ positionX, positionY, scale }) =>
                    updateFields({ backgroundPositionX: positionX, backgroundPositionY: positionY, backgroundScale: scale })
                  }
                />
              </>
            )}

            {announcement.backgroundMode === 'image-overlay' && (
              <div className="space-y-3 p-3 border border-bg-300 rounded-lg bg-bg-100">
                <ColorPicker
                  label="Overlay Color"
                  value={announcement.overlayColor || '#000000'}
                  defaultValue="#000000"
                  onChange={(hex) => updateField('overlayColor', hex)}
                />
                <div>
                  <label className="block text-sm font-medium text-text-200 mb-1">
                    Overlay Opacity: {((announcement.overlayOpacity ?? 0.4) * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={announcement.overlayOpacity ?? 0.4}
                    onChange={(e) => updateField('overlayOpacity', parseFloat(e.target.value))}
                    className="w-full accent-primary-100"
                  />
                  <p className="text-xs text-text-200 mt-1">Higher opacity improves text readability over busy images.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Icon */}
      <div>
        <h4 className="text-sm font-semibold text-text-100 uppercase tracking-wide mb-2">
          Icon {IconPreviewComponent && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-text-200">
              <IconPreviewComponent className="w-4 h-4" /> {announcement.icon}
            </span>
          )}
        </h4>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {ANNOUNCEMENT_ICON_OPTIONS.map(opt => {
            const Icon = opt.id ? ANNOUNCEMENT_ICONS[opt.id] : null;
            const isSelected = (announcement.icon || null) === opt.id;
            return (
              <button
                key={opt.id || 'none'}
                type="button"
                onClick={() => updateField('icon', opt.id)}
                title={opt.label}
                className={`aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border-2 transition-colors ${
                  isSelected
                    ? 'border-primary-100 bg-primary-50 text-primary-100'
                    : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
                }`}
              >
                {Icon ? (
                  <Icon className="w-5 h-5" />
                ) : (
                  <span className="text-xs font-medium">None</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
};

export default AnnouncementEditor;
