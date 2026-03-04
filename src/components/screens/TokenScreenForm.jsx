import { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { validateTokenScreen } from '../../utils/validators';
import ImageUpload from '../common/ImageUpload';
import { Image, Video, Palette } from 'lucide-react';

const COLOR_PRESETS = ['#1f2937', '#0f172a', '#1a2e1a', '#2d1b1b', '#000000', '#1e3a5f'];

const TokenScreenForm = ({ screen, onSubmit, onCancel }) => {
  const { error: showError } = useNotification();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    title: '',
    screenId: '',
    backgroundType: 'color',
    backgroundMedia: null,
    backgroundColor: '#1f2937',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (screen) {
      setFormData({
        title: screen.title || '',
        screenId: screen.screenId || '',
        backgroundType: screen.backgroundType || 'color',
        backgroundMedia: screen.backgroundMedia || null,
        backgroundColor: screen.backgroundColor || '#1f2937',
      });
    } else {
      setFormData({
        title: '', screenId: '',
        backgroundType: 'color', backgroundMedia: null, backgroundColor: '#1f2937'
      });
      setErrors({});
    }
  }, [screen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
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
      return updated;
    });
    if (errors.backgroundType) setErrors(prev => ({ ...prev, backgroundType: null }));
    if (errors.backgroundMedia) setErrors(prev => ({ ...prev, backgroundMedia: null }));
    if (errors.backgroundColor) setErrors(prev => ({ ...prev, backgroundColor: null }));
  };

  const handleBackgroundMediaChange = (base64) => {
    setFormData(prev => ({ ...prev, backgroundMedia: base64 }));
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
      await onSubmit(formData);
    } catch {
      showError('Failed to save token screen. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
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
              placeholder="e.g., TOKEN-01" />
            <p className="mt-1 text-xs text-text-200">Unique identifier for tracking and management</p>
            {errors.screenId && <p className="mt-1 text-sm text-accent-200">{errors.screenId}</p>}
          </div>

          <div className="p-4 bg-bg-100 rounded-lg border border-bg-300">
            <p className="text-sm text-text-100">
              Token screens display a fullscreen view of the current serving token. No additional configuration is needed — the token number is updated from the Token Display Management page.
            </p>
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

          {/* Image Upload */}
          {formData.backgroundType === 'image' && (
            <div className="space-y-3">
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
              />
              {errors.backgroundMedia && <p className="mt-1 text-sm text-accent-200">{errors.backgroundMedia}</p>}
            </div>
          )}

          {/* Video Upload */}
          {formData.backgroundType === 'video' && (
            <div className="space-y-3">
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
              />
              {errors.backgroundMedia && <p className="mt-1 text-sm text-accent-200">{errors.backgroundMedia}</p>}
            </div>
          )}

          {/* Solid Color Picker */}
          {formData.backgroundType === 'color' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-text-100">Background Color</label>

              {/* Preset Swatches */}
              <div className="flex items-center gap-3">
                {COLOR_PRESETS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                      formData.backgroundColor === color
                        ? 'border-primary-100 ring-2 ring-primary-100/30'
                        : 'border-bg-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-bg-300 cursor-pointer"
                />
                <span className="text-sm text-text-200">Custom color: {formData.backgroundColor}</span>
              </div>

              {/* Preview */}
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
    </form>
  );
};

export default TokenScreenForm;
