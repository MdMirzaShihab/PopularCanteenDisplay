import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import ImageUpload from '../common/ImageUpload';
import TimeSlotBuilder from '../schedules/TimeSlotBuilder';
import { validateScreen } from '../../utils/validators';

const ScreenForm = ({ screen, onSubmit, onCancel }) => {
  const { menus } = useData();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    title: '',
    screenId: '',
    defaultMenuId: '',
    timeSlots: [],
    backgroundType: 'image',
    backgroundMedia: null,
    foregroundMedia: null,
    displaySettings: {
      orientation: 'landscape',
      foregroundMediaDisplay: 'off',
      tokenWindow: 'on',
      showPrices: true,
      transitionDuration: 500,
      slideDelay: 5000
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (screen) {
      setFormData({
        title: screen.title || '',
        screenId: screen.screenId || '',
        defaultMenuId: screen.defaultMenuId || '',
        timeSlots: screen.timeSlots || [],
        backgroundType: screen.backgroundType || 'image',
        backgroundMedia: screen.backgroundMedia || null,
        foregroundMedia: screen.foregroundMedia || null,
        displaySettings: screen.displaySettings || {
          orientation: 'landscape',
          foregroundMediaDisplay: 'off',
          tokenWindow: 'on',
          showPrices: true,
          transitionDuration: 500,
          slideDelay: 5000
        }
      });
    } else {
      // Set default menu if available
      if (menus.length > 0 && !formData.defaultMenuId) {
        setFormData(prev => ({ ...prev, defaultMenuId: menus[0].id }));
      }
    }
  }, [screen, menus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleTimeSlotsChange = (timeSlots) => {
    setFormData(prev => ({ ...prev, timeSlots }));
    if (errors.timeSlots) {
      setErrors(prev => ({ ...prev, timeSlots: null }));
    }
  };

  const handleDisplaySettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      const updatedSettings = {
        ...prev.displaySettings,
        [name]: newValue
      };

      // Validation: If foreground media is fullScreen, token must be off
      if (name === 'foregroundMediaDisplay' && newValue === 'fullScreen') {
        updatedSettings.tokenWindow = 'off';
      }
      // Validation: If token is on/large, foreground media cannot be fullScreen
      if (name === 'tokenWindow' && (newValue === 'on' || newValue === 'large')) {
        if (prev.displaySettings.foregroundMediaDisplay === 'fullScreen') {
          updatedSettings.foregroundMediaDisplay = 'off';
        }
      }

      return {
        ...prev,
        displaySettings: updatedSettings
      };
    });
  };

  const handleBackgroundChange = (base64) => {
    setFormData(prev => ({ ...prev, backgroundMedia: base64 }));
    if (errors.backgroundMedia) {
      setErrors(prev => ({ ...prev, backgroundMedia: null }));
    }
  };

  const handleForegroundMediaChange = (base64) => {
    setFormData(prev => ({ ...prev, foregroundMedia: base64 }));
    if (errors.foregroundMedia) {
      setErrors(prev => ({ ...prev, foregroundMedia: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate
    const validation = validateScreen(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      // Switch to tab with error
      if (validation.errors.title) {
        setActiveTab('basic');
      } else if (validation.errors.defaultMenuId || validation.errors.timeSlots) {
        setActiveTab('schedule');
      } else if (validation.errors.backgroundMedia) {
        setActiveTab('background');
      }
      return;
    }

    // Submit
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'background', label: 'Background' },
    { id: 'display', label: 'Display Settings' }
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
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-100 mb-2">
              Screen Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${
                errors.title ? 'border-accent-200' : 'border-bg-300'
              }`}
              placeholder="e.g., Main Dining Hall Display"
            />
            {errors.title && <p className="mt-1 text-sm text-accent-200">{errors.title}</p>}
          </div>

          {/* Screen ID */}
          <div>
            <label htmlFor="screenId" className="block text-sm font-medium text-text-100 mb-2">
              Screen ID *
            </label>
            <input
              type="text"
              id="screenId"
              name="screenId"
              value={formData.screenId}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${
                errors.screenId ? 'border-accent-200' : 'border-bg-300'
              }`}
              placeholder="e.g., SCREEN-001, HALL-A-01, DISPLAY-CAFETERIA"
            />
            <p className="mt-1 text-xs text-text-200">
              Unique identifier for this screen (used for tracking and management)
            </p>
            {errors.screenId && <p className="mt-1 text-sm text-accent-200">{errors.screenId}</p>}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {/* Default Menu */}
          <div>
            <label htmlFor="defaultMenuId" className="block text-sm font-medium text-text-100 mb-2">
              Default Menu *
            </label>
            <select
              id="defaultMenuId"
              name="defaultMenuId"
              value={formData.defaultMenuId}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${
                errors.defaultMenuId ? 'border-accent-200' : 'border-bg-300'
              }`}
            >
              <option value="">Select default menu...</option>
              {menus.map(menu => (
                <option key={menu.id} value={menu.id}>
                  {menu.title}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-text-200">
              This menu will be displayed when no time slot is active
            </p>
            {errors.defaultMenuId && <p className="mt-1 text-sm text-accent-200">{errors.defaultMenuId}</p>}
          </div>

          {/* Time Slot Builder */}
          <div>
            <TimeSlotBuilder
              timeSlots={formData.timeSlots}
              onChange={handleTimeSlotsChange}
            />
            {errors.timeSlots && <p className="mt-1 text-sm text-accent-200">{errors.timeSlots}</p>}
          </div>
        </div>
      )}

      {/* Background Tab */}
      {activeTab === 'background' && (
        <div className="space-y-4">
          <div className="p-3 bg-primary-100/10 border border-primary-100/30 rounded-lg">
            <p className="text-xs text-text-100">
              <strong>⚠️ Important:</strong> To avoid storage limits, please compress media files before uploading:
            </p>
            <ul className="text-xs text-text-200 mt-2 ml-4 list-disc space-y-1">
              <li>Images: Compress to under 500KB (use tools like TinyPNG or Squoosh)</li>
              <li>Videos: Keep under 30 seconds and compress to under 2MB</li>
              <li>Recommended resolution: 1920x1080 (16:9 aspect ratio)</li>
            </ul>
          </div>
          <ImageUpload
            value={formData.backgroundMedia}
            onChange={handleBackgroundChange}
            accept="image/*,video/*"
            label="Background Image/Video *"
          />
          {errors.backgroundMedia && <p className="mt-1 text-sm text-accent-200">{errors.backgroundMedia}</p>}
        </div>
      )}

      {/* Display Settings Tab */}
      {activeTab === 'display' && (
        <div className="space-y-6">
          {/* Screen Orientation */}
          <div>
            <label htmlFor="orientation" className="block text-sm font-medium text-text-100 mb-2">
              Screen Orientation
            </label>
            <select
              id="orientation"
              name="orientation"
              value={formData.displaySettings.orientation}
              onChange={handleDisplaySettingChange}
              className="w-full px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
            >
              <option value="landscape">Landscape (Horizontal)</option>
              <option value="portrait">Portrait (Vertical)</option>
            </select>
            <p className="mt-1 text-xs text-text-200">
              Choose the screen orientation for optimal display layout
            </p>
          </div>

          {/* Foreground Media Upload */}
          <div className="space-y-3 pt-4 border-t border-bg-300">
            <h3 className="text-sm font-semibold text-text-100">Foreground Media (Overlay)</h3>
            <p className="text-xs text-text-200">
              Upload media to play on top of the menu display (e.g., promotional videos, announcements)
            </p>
            <div className="p-3 bg-primary-100/10 border border-primary-100/30 rounded-lg">
              <p className="text-xs text-text-200">
                <strong>💡 Tip:</strong> Keep files small to avoid storage limits (compress images to &lt;500KB, videos to &lt;2MB)
              </p>
            </div>
            <ImageUpload
              value={formData.foregroundMedia}
              onChange={handleForegroundMediaChange}
              accept="image/*,video/*"
              label="Upload Foreground Media"
            />
            {errors.foregroundMedia && <p className="mt-1 text-sm text-accent-200">{errors.foregroundMedia}</p>}
          </div>

          {/* Foreground Media Display Mode */}
          <div>
            <label htmlFor="foregroundMediaDisplay" className="block text-sm font-medium text-text-100 mb-2">
              Foreground Media Display
            </label>
            <select
              id="foregroundMediaDisplay"
              name="foregroundMediaDisplay"
              value={formData.displaySettings.foregroundMediaDisplay}
              onChange={handleDisplaySettingChange}
              className="w-full px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
            >
              <option value="off">Off - Hide foreground media</option>
              <option value="on">On - Show in small window (20%)</option>
              <option value="fullScreen">Full Screen - Use full screen</option>
            </select>
            <p className="mt-1 text-xs text-text-200">
              Controls how the foreground media is displayed (only applies if media is uploaded)
            </p>
            {formData.displaySettings.foregroundMediaDisplay === 'fullScreen' && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-xs text-yellow-800">
                  ⚠️ Full Screen mode automatically disables the token window
                </p>
              </div>
            )}
          </div>

          {/* Token Window State */}
          <div>
            <label htmlFor="tokenWindow" className="block text-sm font-medium text-text-100 mb-2">
              Token Window Display
            </label>
            <select
              id="tokenWindow"
              name="tokenWindow"
              value={formData.displaySettings.tokenWindow}
              onChange={handleDisplaySettingChange}
              disabled={formData.displaySettings.foregroundMediaDisplay === 'fullScreen'}
              className="w-full px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="off">Off - Hidden (menu only)</option>
              <option value="on">On - Standard size (10% width)</option>
              <option value="large">Large - Expanded (40% width)</option>
            </select>
            <p className="mt-1 text-xs text-text-200">
              Controls the visibility and size of the token queue panel
            </p>
            {formData.displaySettings.foregroundMediaDisplay === 'fullScreen' && (
              <div className="mt-2 p-2 bg-gray-100 border border-gray-300 rounded-lg">
                <p className="text-xs text-gray-600">
                  Token window is disabled when foreground media is in full screen mode
                </p>
              </div>
            )}
          </div>

          {/* Show Prices */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showPrices"
              name="showPrices"
              checked={formData.displaySettings.showPrices}
              onChange={handleDisplaySettingChange}
              className="w-4 h-4 text-primary-100 border-bg-300 rounded focus:ring-primary-100"
            />
            <label htmlFor="showPrices" className="text-sm font-medium text-text-100">
              Show item prices
            </label>
          </div>

          {/* Transition Duration */}
          <div className="pt-4 border-t border-bg-300">
            <label htmlFor="transitionDuration" className="block text-sm font-medium text-text-100 mb-2">
              Page Transition Duration (ms)
            </label>
            <input
              type="number"
              id="transitionDuration"
              name="transitionDuration"
              value={formData.displaySettings.transitionDuration}
              onChange={handleDisplaySettingChange}
              min="0"
              max="2000"
              step="100"
              className="w-full px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
            />
            <p className="mt-1 text-xs text-text-200">
              Duration for fade transitions between pages (0-2000ms)
            </p>
          </div>

          {/* Slide Delay */}
          <div>
            <label htmlFor="slideDelay" className="block text-sm font-medium text-text-100 mb-2">
              Page Display Duration (ms)
            </label>
            <input
              type="number"
              id="slideDelay"
              name="slideDelay"
              value={formData.displaySettings.slideDelay}
              onChange={handleDisplaySettingChange}
              min="1000"
              max="30000"
              step="500"
              className="w-full px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
            />
            <p className="mt-1 text-xs text-text-200">
              How long each page displays before automatically sliding to next (1000-30000ms)
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-bg-300">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-text-100 bg-bg-100 border border-bg-300 rounded-lg hover:bg-bg-200 transition-all duration-200 hover:border-primary-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-100 rounded-lg hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isSubmitting ? 'Saving...' : screen ? 'Update Screen' : 'Create Screen'}
        </button>
      </div>
    </form>
  );
};

export default ScreenForm;
