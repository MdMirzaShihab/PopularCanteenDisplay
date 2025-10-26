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
    defaultMenuId: '',
    timeSlots: [],
    backgroundType: 'image',
    backgroundMedia: null,
    displaySettings: {
      layoutStyle: 'grid',
      showPrices: true,
      showIngredients: true,
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
        defaultMenuId: screen.defaultMenuId || '',
        timeSlots: screen.timeSlots || [],
        backgroundType: screen.backgroundType || 'image',
        backgroundMedia: screen.backgroundMedia || null,
        displaySettings: screen.displaySettings || {
          layoutStyle: 'grid',
          showPrices: true,
          showIngredients: true,
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
    setFormData(prev => ({
      ...prev,
      displaySettings: {
        ...prev.displaySettings,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleBackgroundChange = (base64) => {
    setFormData(prev => ({ ...prev, backgroundMedia: base64 }));
    if (errors.backgroundMedia) {
      setErrors(prev => ({ ...prev, backgroundMedia: null }));
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
          <ImageUpload
            value={formData.backgroundMedia}
            onChange={handleBackgroundChange}
            accept="image/*,video/*"
            label="Background Image/Video *"
          />
          {errors.backgroundMedia && <p className="mt-1 text-sm text-accent-200">{errors.backgroundMedia}</p>}
          <p className="text-xs text-text-200">
            Recommended: 1920x1080 (16:9 aspect ratio) for optimal display
          </p>
        </div>
      )}

      {/* Display Settings Tab */}
      {activeTab === 'display' && (
        <div className="space-y-6">
          {/* Layout Style */}
          <div>
            <label htmlFor="layoutStyle" className="block text-sm font-medium text-text-100 mb-2">
              Layout Style
            </label>
            <select
              id="layoutStyle"
              name="layoutStyle"
              value={formData.displaySettings.layoutStyle}
              onChange={handleDisplaySettingChange}
              className="w-full px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
            >
              <option value="grid">Grid Layout</option>
              <option value="list">List Layout</option>
            </select>
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

          {/* Show Ingredients */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showIngredients"
              name="showIngredients"
              checked={formData.displaySettings.showIngredients}
              onChange={handleDisplaySettingChange}
              className="w-4 h-4 text-primary-100 border-bg-300 rounded focus:ring-primary-100"
            />
            <label htmlFor="showIngredients" className="text-sm font-medium text-text-100">
              Show item ingredients
            </label>
          </div>

          {/* Transition Duration */}
          <div>
            <label htmlFor="transitionDuration" className="block text-sm font-medium text-text-100 mb-2">
              Transition Duration (ms)
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
              Duration for fade transitions when menu changes (0-2000ms)
            </p>
          </div>

          {/* Slide Delay */}
          <div>
            <label htmlFor="slideDelay" className="block text-sm font-medium text-text-100 mb-2">
              Slide Delay (ms)
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
              How long each page displays before sliding to next (1000-30000ms)
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
