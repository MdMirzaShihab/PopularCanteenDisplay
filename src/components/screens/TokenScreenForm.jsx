import { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { validateTokenScreen } from '../../utils/validators';
import ImageUpload from '../common/ImageUpload';
import { Image, Video, Palette, FolderOpen, Upload, Trash2 } from 'lucide-react';
import { getMedia, deleteMedia } from '../../api/media.api';
import BackgroundCropTool from '../common/BackgroundCropTool';
import ConfirmDialog from '../common/ConfirmDialog';
import ColorPicker from '../ui/ColorPicker';
import { FONT_CHOICES, makeFontSampleMap, slugify } from '../../utils/constants';

const TITLE_FONT_SAMPLE = makeFontSampleMap('TOKEN DISPLAY', 'Token Display');

const DEFAULTS = {
  titleFont: 'font-heading',
  titleColor: '#ffffff',
  brandingColor: '#ffffff',
  dateTimeFont: 'font-body',
  dateTimeColor: '#ffffff',
  servingFont: 'font-heading',
  servingColor: '#facc15',
  collectFont: 'font-body',
  collectColor: '#ffffff',
};

const FontPicker = ({ label, value, sampleMap, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-text-100 mb-2">{label}</label>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
      {FONT_CHOICES.map((font) => {
        const isSelected = value === font.id;
        return (
          <button
            key={font.id}
            type="button"
            onClick={() => onChange(font.id)}
            className={`p-2 rounded-lg border-2 transition-colors text-center ${
              isSelected
                ? 'border-primary-100 bg-primary-50'
                : 'border-bg-300 bg-white hover:border-primary-100/50'
            }`}
          >
            <span className={`${font.id} text-lg leading-tight ${isSelected ? 'text-primary-100' : 'text-text-100'}`}>
              {sampleMap[font.id]}
            </span>
            <span className="block text-[10px] text-text-200 mt-0.5">{font.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const MediaGalleryPicker = ({ items, loading, type, value, onSelect, onDelete }) => {
  if (loading) return <div className="p-4 text-center text-sm text-text-200">Loading gallery...</div>;
  const filteredItems = items.filter(m => m.type === type);
  if (filteredItems.length === 0) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-text-200 mb-2">Select from Gallery</label>
      <div className={`grid ${type === 'image' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'} gap-2`}>
        {filteredItems.map((item) => {
          const isSelected = value?._id === item._id;
          return (
            <button key={item._id} type="button" onClick={() => onSelect(item)}
              className={`group relative rounded-lg overflow-hidden border-2 transition-all ${
                isSelected ? 'border-primary-100 ring-2 ring-primary-100/30' : 'border-bg-300 hover:border-primary-100/50'
              }`}>
              {item.type === 'image' ? (
                <img src={item.url} alt={item.name} className="w-full aspect-video object-cover" />
              ) : (
                <video src={item.url} muted className="w-full aspect-video object-cover"
                  onMouseEnter={(e) => e.target.play()} onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }} />
              )}
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
                  onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                  className="p-1 bg-accent-200/90 text-white rounded hover:bg-accent-200 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TokenScreenForm = ({ screen, onSubmit, onCancel }) => {
  const { error: showError } = useNotification();
  const [activeTab, setActiveTab] = useState('basic');
  const [mediaSource, setMediaSource] = useState('gallery');
  const [formData, setFormData] = useState({
    title: '',
    screenId: '',
    titleFont: DEFAULTS.titleFont,
    titleColor: DEFAULTS.titleColor,
    brandingColor: DEFAULTS.brandingColor,
    dateTimeFont: DEFAULTS.dateTimeFont,
    dateTimeColor: DEFAULTS.dateTimeColor,
    servingFont: DEFAULTS.servingFont,
    servingColor: DEFAULTS.servingColor,
    collectFont: DEFAULTS.collectFont,
    collectColor: DEFAULTS.collectColor,
    backgroundType: 'color',
    backgroundMedia: null,
    backgroundColor: '#1f2937',
    backgroundPositionX: 50,
    backgroundPositionY: 50,
    backgroundScale: 1,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenIdManuallyEdited, setScreenIdManuallyEdited] = useState(Boolean(screen?.screenId));
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState('');

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const result = await getMedia({ limit: 100, folder: 'backgrounds' });
        setGalleryMedia(result.data);
      } catch (err) {
        console.error('Failed to load media gallery:', err);
      } finally {
        setGalleryLoading(false);
      }
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    if (screen) {
      setFormData({
        title: screen.title || '',
        screenId: screen.screenId || '',
        titleFont: screen.titleFont || DEFAULTS.titleFont,
        titleColor: screen.titleColor || DEFAULTS.titleColor,
        brandingColor: screen.brandingColor || DEFAULTS.brandingColor,
        dateTimeFont: screen.dateTimeFont || DEFAULTS.dateTimeFont,
        dateTimeColor: screen.dateTimeColor || DEFAULTS.dateTimeColor,
        servingFont: screen.servingFont || DEFAULTS.servingFont,
        servingColor: screen.servingColor || DEFAULTS.servingColor,
        collectFont: screen.collectFont || DEFAULTS.collectFont,
        collectColor: screen.collectColor || DEFAULTS.collectColor,
        backgroundType: screen.backgroundType || 'color',
        backgroundMedia: screen.backgroundMedia || null,
        backgroundColor: screen.backgroundColor || '#1f2937',
        backgroundPositionX: screen.backgroundPositionX ?? 50,
        backgroundPositionY: screen.backgroundPositionY ?? 50,
        backgroundScale: screen.backgroundScale ?? 1,
      });
      setScreenIdManuallyEdited(Boolean(screen.screenId));
    } else {
      setFormData({
        title: '', screenId: '',
        titleFont: DEFAULTS.titleFont, titleColor: DEFAULTS.titleColor,
        brandingColor: DEFAULTS.brandingColor,
        dateTimeFont: DEFAULTS.dateTimeFont, dateTimeColor: DEFAULTS.dateTimeColor,
        servingFont: DEFAULTS.servingFont, servingColor: DEFAULTS.servingColor,
        collectFont: DEFAULTS.collectFont, collectColor: DEFAULTS.collectColor,
        backgroundType: 'color', backgroundMedia: null, backgroundColor: '#1f2937',
        backgroundPositionX: 50, backgroundPositionY: 50, backgroundScale: 1,
      });
      setErrors({});
      setScreenIdManuallyEdited(false);
    }
  }, [screen]);

  const handleDeleteMedia = async (mediaItem) => {
    try {
      await deleteMedia(mediaItem._id);
      setGalleryMedia(prev => prev.filter(m => m._id !== mediaItem._id));
      if (formData.backgroundMedia?._id === mediaItem._id) {
        setFormData(prev => ({ ...prev, backgroundMedia: null }));
      }
    } catch (err) {
      if (err.message && err.message.includes('used by')) {
        setDeleteTarget(mediaItem);
        setDeleteWarning(err.message + ' Deleting it will remove it from those screens.');
        setDeleteConfirmOpen(true);
      } else {
        showError('Failed to delete media');
      }
    }
  };

  const handleForceDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMedia(deleteTarget._id, true);
      setGalleryMedia(prev => prev.filter(m => m._id !== deleteTarget._id));
      if (formData.backgroundMedia?._id === deleteTarget._id) {
        setFormData(prev => ({ ...prev, backgroundMedia: null }));
      }
    } catch (err) {
      showError('Failed to delete media');
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'title' && !screenIdManuallyEdited) {
        next.screenId = slugify(value);
      }
      return next;
    });
    if (name === 'screenId') setScreenIdManuallyEdited(true);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (name === 'title' && !screenIdManuallyEdited && errors.screenId) {
      setErrors(prev => ({ ...prev, screenId: null }));
    }
  };

  const handleBackgroundTypeChange = (type) => {
    setFormData(prev => {
      const updated = { ...prev, backgroundType: type };
      if (type === 'color') {
        updated.backgroundMedia = null;
        if (!updated.backgroundColor) {
          updated.backgroundColor = '#1f2937';
        }
      } else {
        updated.backgroundMedia = null;
      }
      updated.backgroundPositionX = 50;
      updated.backgroundPositionY = 50;
      updated.backgroundScale = 1;
      return updated;
    });
    setMediaSource('gallery');
    if (errors.backgroundType) setErrors(prev => ({ ...prev, backgroundType: null }));
    if (errors.backgroundMedia) setErrors(prev => ({ ...prev, backgroundMedia: null }));
    if (errors.backgroundColor) setErrors(prev => ({ ...prev, backgroundColor: null }));
  };

  const handleBackgroundMediaChange = (media) => {
    setFormData(prev => ({
      ...prev,
      backgroundMedia: media,
      backgroundPositionX: 50,
      backgroundPositionY: 50,
      backgroundScale: 1,
    }));
    if (errors.backgroundMedia) setErrors(prev => ({ ...prev, backgroundMedia: null }));
  };

  const handleColorChange = (color) => {
    setFormData(prev => ({ ...prev, backgroundColor: color }));
    if (errors.backgroundColor) setErrors(prev => ({ ...prev, backgroundColor: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateTokenScreen(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      if (validation.errors.title || validation.errors.screenId) {
        setActiveTab('basic');
      } else if (validation.errors.backgroundType || validation.errors.backgroundMedia || validation.errors.backgroundColor) {
        setActiveTab('appearance');
      }
      return;
    }

    try {
      const payload = {
        ...formData,
        backgroundMedia: formData.backgroundMedia?._id || formData.backgroundMedia || null,
      };
      await onSubmit(payload);
    } catch {
      showError('Failed to save token screen. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'typography', label: 'Typography' },
    { id: 'appearance', label: 'Appearance' }
  ];

  const backgroundTypeOptions = [
    { id: 'image', label: 'Image', icon: Image },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'color', label: 'Solid Color', icon: Palette },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-bg-300">
        <div className="flex gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-primary-100 text-primary-100'
                  : 'border-transparent text-text-200 hover:text-text-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-100 mb-2">Screen Title *</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${errors.title ? 'border-accent-200' : 'border-bg-300'}`}
              placeholder="e.g., Main Counter Token Display" />
            {errors.title && <p className="mt-1 text-sm text-accent-200">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="screenId" className="block text-sm font-medium text-text-100 mb-2">Screen ID *</label>
            <input type="text" id="screenId" name="screenId" value={formData.screenId} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${errors.screenId ? 'border-accent-200' : 'border-bg-300'}`}
              placeholder="e.g., main-counter-token" />
            <p className="mt-1 text-xs text-text-200">
              Used in the gallery URL. Auto-generated from the title — edit if you need a custom value.
            </p>
            {errors.screenId && <p className="mt-1 text-sm text-accent-200">{errors.screenId}</p>}
          </div>

          <div className="p-4 bg-bg-100 rounded-lg border border-bg-300">
            <p className="text-sm text-text-100">
              Token screens display a fullscreen view of the current serving token. The token number is updated from the Token Display Management page.
            </p>
          </div>
        </div>
      )}

      {/* Typography Tab */}
      {activeTab === 'typography' && (
        <div className="space-y-8">
          {/* Branding */}
          <div className="pb-6 border-b border-bg-300">
            <h4 className="text-sm font-semibold text-text-100 uppercase tracking-wide mb-3">Branding Line</h4>
            <p className="text-xs text-text-200 mb-3">
              "Popular Medical College and Hospital — We Care for Life". Font is fixed; only the color is configurable.
            </p>
            <ColorPicker
              label="Branding Color"
              value={formData.brandingColor}
              defaultValue={DEFAULTS.brandingColor}
              onChange={(hex) => setFormData(prev => ({ ...prev, brandingColor: hex }))}
              renderPreview={({ color }) => (
                <div
                  className="h-12 rounded-lg flex flex-col items-center justify-center border border-bg-300"
                  style={{ backgroundColor: '#1a1a2e' }}
                >
                  <span className="text-xs font-bold font-body" style={{ color }}>
                    Popular Medical College and Hospital
                  </span>
                  <span className="text-[10px] font-body italic" style={{ color, opacity: 0.6 }}>
                    We Care for Life
                  </span>
                </div>
              )}
            />
          </div>

          {/* Screen Title */}
          <div className="pb-6 border-b border-bg-300">
            <h4 className="text-sm font-semibold text-text-100 uppercase tracking-wide mb-3">Screen Title</h4>
            <div className="space-y-4">
              <FontPicker
                label="Title Font"
                value={formData.titleFont}
                sampleMap={TITLE_FONT_SAMPLE}
                onChange={(id) => setFormData(prev => ({ ...prev, titleFont: id }))}
              />
              <ColorPicker
                label="Title Color"
                value={formData.titleColor}
                defaultValue={DEFAULTS.titleColor}
                onChange={(hex) => setFormData(prev => ({ ...prev, titleColor: hex }))}
                renderPreview={({ color }) => (
                  <div className="h-12 rounded-lg flex items-center justify-center border border-bg-300" style={{ backgroundColor: '#1a1a2e' }}>
                    <span className={`${formData.titleFont} text-base`} style={{ color }}>
                      {formData.title || 'Preview Title'}
                    </span>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="pb-6 border-b border-bg-300">
            <h4 className="text-sm font-semibold text-text-100 uppercase tracking-wide mb-3">Date &amp; Time Card</h4>
            <div className="space-y-4">
              <FontPicker
                label="Date/Time Font"
                value={formData.dateTimeFont}
                sampleMap={makeFontSampleMap('12:45 PM', 'Wed, Apr 17')}
                onChange={(id) => setFormData(prev => ({ ...prev, dateTimeFont: id }))}
              />
              <ColorPicker
                label="Date/Time Color"
                value={formData.dateTimeColor}
                defaultValue={DEFAULTS.dateTimeColor}
                onChange={(hex) => setFormData(prev => ({ ...prev, dateTimeColor: hex }))}
                renderPreview={({ color }) => (
                  <div className="h-12 rounded-lg flex items-center justify-center gap-4 border border-bg-300" style={{ backgroundColor: '#1a1a2e' }}>
                    <span className={`${formData.dateTimeFont} text-sm`} style={{ color }}>Wed, Apr 17</span>
                    <span className={`${formData.dateTimeFont} text-base font-bold`} style={{ color }}>12:45 PM</span>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Now Serving + Token */}
          <div className="pb-6 border-b border-bg-300">
            <h4 className="text-sm font-semibold text-text-100 uppercase tracking-wide mb-3">Now Serving &amp; Token</h4>
            <p className="text-xs text-text-200 mb-3">
              Applied to both the "Now Serving" label and the big token number.
            </p>
            <div className="space-y-4">
              <FontPicker
                label="Serving Font"
                value={formData.servingFont}
                sampleMap={makeFontSampleMap('NOW SERVING', 'Now Serving')}
                onChange={(id) => setFormData(prev => ({ ...prev, servingFont: id }))}
              />
              <ColorPicker
                label="Serving Color"
                value={formData.servingColor}
                defaultValue={DEFAULTS.servingColor}
                onChange={(hex) => setFormData(prev => ({ ...prev, servingColor: hex }))}
                renderPreview={({ color }) => (
                  <div className="h-14 rounded-lg flex items-center justify-center gap-3 border border-bg-300" style={{ backgroundColor: '#1a1a2e' }}>
                    <span className={`${formData.servingFont} text-xs uppercase tracking-widest`} style={{ color }}>Now Serving</span>
                    <span className={`${formData.servingFont} text-2xl font-bold`} style={{ color }}>A42</span>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Collect Message */}
          <div>
            <h4 className="text-sm font-semibold text-text-100 uppercase tracking-wide mb-3">Collect Message</h4>
            <p className="text-xs text-text-200 mb-3">
              "Please collect your order" shown under the token number.
            </p>
            <div className="space-y-4">
              <FontPicker
                label="Collect Font"
                value={formData.collectFont}
                sampleMap={makeFontSampleMap('PLEASE COLLECT', 'Please collect')}
                onChange={(id) => setFormData(prev => ({ ...prev, collectFont: id }))}
              />
              <ColorPicker
                label="Collect Color"
                value={formData.collectColor}
                defaultValue={DEFAULTS.collectColor}
                onChange={(hex) => setFormData(prev => ({ ...prev, collectColor: hex }))}
                renderPreview={({ color }) => (
                  <div className="h-12 rounded-lg flex items-center justify-center border border-bg-300" style={{ backgroundColor: '#1a1a2e' }}>
                    <span className={`${formData.collectFont} text-base uppercase tracking-widest`} style={{ color }}>
                      Please collect your order
                    </span>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Background Type Selector */}
          <div>
            <label className="block text-sm font-medium text-text-100 mb-3">Background Type</label>
            <div className="flex gap-3">
              {backgroundTypeOptions.map(option => {
                const IconComponent = option.icon;
                const isActive = formData.backgroundType === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleBackgroundTypeChange(option.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'border-primary-100 bg-primary-100/10 text-primary-100'
                        : 'border-bg-300 bg-bg-100 text-text-200 hover:border-primary-100/50 hover:text-text-100'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
            {errors.backgroundType && <p className="mt-1 text-sm text-accent-200">{errors.backgroundType}</p>}
          </div>

          {/* Image Selection */}
          {formData.backgroundType === 'image' && (
            <div className="space-y-3">
              {/* Gallery / Upload toggle */}
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

              {mediaSource === 'gallery' && (
                <MediaGalleryPicker
                  items={galleryMedia}
                  loading={galleryLoading}
                  type="image"
                  value={formData.backgroundMedia}
                  onSelect={handleBackgroundMediaChange}
                  onDelete={handleDeleteMedia}
                />
              )}

              {mediaSource === 'upload' && (
                <>
                  <div className="p-3 bg-primary-100/10 border border-primary-100/30 rounded-lg">
                    <p className="text-xs text-text-100">
                      <strong>Tip:</strong> Compress images before uploading (recommended &lt;500KB).
                    </p>
                  </div>
                  <ImageUpload
                    value={formData.backgroundMedia}
                    onChange={handleBackgroundMediaChange}
                    onError={showError}
                    accept="image/*"
                    label="Upload Background Image"
                    folder="backgrounds"
                  />
                </>
              )}

              {formData.backgroundMedia && (
                <BackgroundCropTool
                  mediaUrl={formData.backgroundMedia?.url || formData.backgroundMedia}
                  mediaType="image"
                  orientation="landscape"
                  positionX={formData.backgroundPositionX}
                  positionY={formData.backgroundPositionY}
                  scale={formData.backgroundScale}
                  onChange={({ positionX, positionY, scale }) =>
                    setFormData(prev => ({
                      ...prev,
                      backgroundPositionX: positionX,
                      backgroundPositionY: positionY,
                      backgroundScale: scale,
                    }))
                  }
                />
              )}

              {errors.backgroundMedia && <p className="mt-1 text-sm text-accent-200">{errors.backgroundMedia}</p>}
            </div>
          )}

          {/* Video Selection */}
          {formData.backgroundType === 'video' && (
            <div className="space-y-3">
              {/* Gallery / Upload toggle */}
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

              {mediaSource === 'gallery' && (
                <MediaGalleryPicker
                  items={galleryMedia}
                  loading={galleryLoading}
                  type="video"
                  value={formData.backgroundMedia}
                  onSelect={handleBackgroundMediaChange}
                  onDelete={handleDeleteMedia}
                />
              )}

              {mediaSource === 'upload' && (
                <>
                  <div className="p-3 bg-primary-100/10 border border-primary-100/30 rounded-lg">
                    <p className="text-xs text-text-100">
                      <strong>Tip:</strong> Compress videos before uploading (recommended &lt;2MB).
                    </p>
                  </div>
                  <ImageUpload
                    value={formData.backgroundMedia}
                    onChange={handleBackgroundMediaChange}
                    onError={showError}
                    accept="video/*"
                    label="Upload Background Video"
                    folder="backgrounds"
                  />
                </>
              )}

              {formData.backgroundMedia && (
                <BackgroundCropTool
                  mediaUrl={formData.backgroundMedia?.url || formData.backgroundMedia}
                  mediaType="video"
                  orientation="landscape"
                  positionX={formData.backgroundPositionX}
                  positionY={formData.backgroundPositionY}
                  scale={formData.backgroundScale}
                  onChange={({ positionX, positionY, scale }) =>
                    setFormData(prev => ({
                      ...prev,
                      backgroundPositionX: positionX,
                      backgroundPositionY: positionY,
                      backgroundScale: scale,
                    }))
                  }
                />
              )}

              {errors.backgroundMedia && <p className="mt-1 text-sm text-accent-200">{errors.backgroundMedia}</p>}
            </div>
          )}

          {/* Solid Color Picker */}
          {formData.backgroundType === 'color' && (
            <div className="space-y-4">
              <ColorPicker
                label="Background Color"
                value={formData.backgroundColor}
                defaultValue="#000000"
                onChange={(hex) => handleColorChange(hex)}
              />

              <div
                className="w-full h-24 rounded-lg border border-bg-300 flex items-center justify-center"
                style={{ backgroundColor: formData.backgroundColor }}
              >
                <span className="text-white text-sm font-medium opacity-70">Background Preview</span>
              </div>

              {errors.backgroundColor && <p className="mt-1 text-sm text-accent-200">{errors.backgroundColor}</p>}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-bg-300">
        <button type="button" onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-text-100 bg-bg-100 border border-bg-300 rounded-lg hover:bg-bg-200 transition-all duration-200 hover:border-primary-100">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-100 rounded-lg hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg">
          {isSubmitting ? 'Saving...' : screen ? 'Update Screen' : 'Create Screen'}
        </button>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setDeleteTarget(null); }}
        onConfirm={handleForceDelete}
        title="Delete Media"
        message={deleteWarning}
        confirmText="Delete"
        type="danger"
      />
    </form>
  );
};

export default TokenScreenForm;
