import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import ImageUpload from '../common/ImageUpload';
import TimeSlotBuilder from '../schedules/TimeSlotBuilder';
import ThemeSelector from './ThemeSelector';
import { validateFoodScreen } from '../../utils/validators';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

const FoodScreenForm = ({ screen, onSubmit, onCancel }) => {
  const { menus } = useData();
  const { error: showError } = useNotification();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    title: '',
    screenId: '',
    defaultMenuId: '',
    timeSlots: [],
    backgroundType: 'image',
    backgroundMedia: null,
    foregroundMedia: null,
    customMessages: [],
    theme: 'card-grid',
    showPrices: true,
    transitionDuration: 500,
    slideDelay: 5000
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
        customMessages: screen.customMessages || [],
        theme: screen.theme || 'card-grid',
        showPrices: screen.showPrices ?? true,
        transitionDuration: screen.transitionDuration ?? 500,
        slideDelay: screen.slideDelay ?? 5000
      });
    } else {
      if (menus.length > 0 && !formData.defaultMenuId) {
        setFormData(prev => ({ ...prev, defaultMenuId: menus[0].id }));
      }
    }
  }, [screen, menus]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleTimeSlotsChange = (timeSlots) => {
    setFormData(prev => ({ ...prev, timeSlots }));
    if (errors.timeSlots) setErrors(prev => ({ ...prev, timeSlots: null }));
  };

  const handleBackgroundChange = (base64) => {
    setFormData(prev => ({ ...prev, backgroundMedia: base64 }));
    if (errors.backgroundMedia) setErrors(prev => ({ ...prev, backgroundMedia: null }));
  };

  const handleForegroundMediaChange = (base64) => {
    setFormData(prev => ({ ...prev, foregroundMedia: base64 }));
  };

  const handleThemeChange = (theme) => {
    setFormData(prev => ({ ...prev, theme }));
    if (errors.theme) setErrors(prev => ({ ...prev, theme: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateFoodScreen(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      if (validation.errors.title || validation.errors.screenId) {
        setActiveTab('basic');
      } else if (validation.errors.defaultMenuId || validation.errors.timeSlots) {
        setActiveTab('schedule');
      } else if (validation.errors.backgroundMedia || validation.errors.theme) {
        setActiveTab('appearance');
      }
      return;
    }

    try {
      await onSubmit(formData);
    } catch {
      showError('Failed to save screen. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'appearance', label: 'Appearance' }
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
              placeholder="e.g., Main Dining Hall Display" />
            {errors.title && <p className="mt-1 text-sm text-accent-200">{errors.title}</p>}
          </div>
          <div>
            <label htmlFor="screenId" className="block text-sm font-medium text-text-100 mb-2">Screen ID *</label>
            <input type="text" id="screenId" name="screenId" value={formData.screenId} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${errors.screenId ? 'border-accent-200' : 'border-bg-300'}`}
              placeholder="e.g., HALL-A-01" />
            <p className="mt-1 text-xs text-text-200">Unique identifier for tracking and management</p>
            {errors.screenId && <p className="mt-1 text-sm text-accent-200">{errors.screenId}</p>}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="defaultMenuId" className="block text-sm font-medium text-text-100 mb-2">Default Menu *</label>
            <select id="defaultMenuId" name="defaultMenuId" value={formData.defaultMenuId} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${errors.defaultMenuId ? 'border-accent-200' : 'border-bg-300'}`}>
              <option value="">Select default menu...</option>
              {menus.map(menu => (<option key={menu.id} value={menu.id}>{menu.title}</option>))}
            </select>
            <p className="mt-1 text-xs text-text-200">Displayed when no time slot is active</p>
            {errors.defaultMenuId && <p className="mt-1 text-sm text-accent-200">{errors.defaultMenuId}</p>}
          </div>
          <div>
            <TimeSlotBuilder timeSlots={formData.timeSlots} onChange={handleTimeSlotsChange} />
            {errors.timeSlots && <p className="mt-1 text-sm text-accent-200">{errors.timeSlots}</p>}
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Background Media */}
          <div className="space-y-3">
            <div className="p-3 bg-primary-100/10 border border-primary-100/30 rounded-lg">
              <p className="text-xs text-text-100">
                <strong>Tip:</strong> Compress media before uploading (images &lt;500KB, videos &lt;2MB).
              </p>
            </div>
            <ImageUpload value={formData.backgroundMedia} onChange={handleBackgroundChange} onError={showError}
              accept="image/*,video/*" label="Background Image/Video *" />
            {errors.backgroundMedia && <p className="mt-1 text-sm text-accent-200">{errors.backgroundMedia}</p>}
          </div>

          {/* Theme Selector */}
          <ThemeSelector value={formData.theme} onChange={handleThemeChange} error={errors.theme} />

          {/* Foreground Media (only for media-focus theme) */}
          {formData.theme === 'media-focus' && (
            <div className="space-y-3 pt-4 border-t border-bg-300">
              <h3 className="text-sm font-semibold text-text-100">Foreground Media (Overlay)</h3>
              <p className="text-xs text-text-200">Upload a promotional image/video to display alongside the menu</p>
              <ImageUpload value={formData.foregroundMedia} onChange={handleForegroundMediaChange} onError={showError}
                accept="image/*,video/*" label="Upload Foreground Media" />
            </div>
          )}

          {/* Custom Messages (only for none/blank theme) */}
          {formData.theme === 'none' && (
            <CustomMessageEditor
              messages={formData.customMessages}
              onChange={(customMessages) => setFormData(prev => ({ ...prev, customMessages }))}
            />
          )}

          {/* Fine-tuning */}
          <div className="pt-4 border-t border-bg-300 space-y-4">
            <h3 className="text-sm font-semibold text-text-100">Fine-tuning</h3>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="showPrices" name="showPrices" checked={formData.showPrices} onChange={handleChange}
                className="w-4 h-4 text-primary-100 border-bg-300 rounded focus:ring-primary-100" />
              <label htmlFor="showPrices" className="text-sm font-medium text-text-100">Show item prices</label>
            </div>

            <div>
              <label htmlFor="transitionDuration" className="block text-sm font-medium text-text-100 mb-2">Page Transition (ms)</label>
              <input type="number" id="transitionDuration" name="transitionDuration" value={formData.transitionDuration} onChange={handleChange}
                min="0" max="2000" step="100"
                className="w-full px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100" />
            </div>

            <div>
              <label htmlFor="slideDelay" className="block text-sm font-medium text-text-100 mb-2">Page Display Duration (ms)</label>
              <input type="number" id="slideDelay" name="slideDelay" value={formData.slideDelay} onChange={handleChange}
                min="1000" max="30000" step="500"
                className="w-full px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100" />
            </div>
          </div>
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

const CustomMessageEditor = ({ messages, onChange }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleAdd = () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;
    onChange([...messages, trimmed]);
    setNewMessage('');
  };

  const handleRemove = (index) => {
    onChange(messages.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...messages];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const handleMoveDown = (index) => {
    if (index === messages.length - 1) return;
    const updated = [...messages];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-3 pt-4 border-t border-bg-300">
      <h3 className="text-sm font-semibold text-text-100">Custom Messages</h3>
      <p className="text-xs text-text-200">
        Add text messages that auto-rotate over the background. Displayed centered with a dark overlay.
      </p>

      {/* Add new message */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
          placeholder="e.g., Today's Special: Biryani 50% off"
          className="flex-1 px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 text-sm"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newMessage.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-100 rounded-lg hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Message list */}
      {messages.length > 0 && (
        <div className="space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-bg-100 border border-bg-300 rounded-lg group"
            >
              <span className="text-xs font-mono text-text-300 w-6 text-center flex-shrink-0">
                {index + 1}
              </span>
              <span className="flex-1 text-sm text-text-100 truncate">{msg}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 text-text-300 hover:text-primary-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === messages.length - 1}
                  className="p-1 text-text-300 hover:text-primary-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1 text-text-300 hover:text-accent-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {messages.length === 0 && (
        <p className="text-xs text-text-300 italic p-3 bg-bg-100 rounded-lg text-center">
          No messages added yet. The screen will show only the background media.
        </p>
      )}
    </div>
  );
};

export default FoodScreenForm;
