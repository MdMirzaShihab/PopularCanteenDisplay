import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { validateFoodScreen } from '../../utils/validators';
import { buildEmptySections } from '../gallery/themes/layoutRegistry';
import LayoutPicker from './LayoutPicker';
import SectionConfigTab from './SectionConfigTab';
import ImageUpload from '../common/ImageUpload';
import { Layout, Layers, Settings, FolderOpen, Upload } from 'lucide-react';
import { getMediaByType } from '../../assets/media';

const TABS = [
  { id: 'layout', label: 'Layout & Info', icon: Layout },
  { id: 'sections', label: 'Sections', icon: Layers },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const GAP_OPTIONS = [
  { value: 4, label: 'Small' },
  { value: 8, label: 'Medium' },
  { value: 12, label: 'Large' }
];

const FoodScreenForm = ({ screen, onSubmit, onCancel }) => {
  const { menus } = useData();
  const { error: showError } = useNotification();

  const [activeTab, setActiveTab] = useState('layout');
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [bgMediaSource, setBgMediaSource] = useState('gallery');

  const [formData, setFormData] = useState({
    title: screen?.title || '',
    screenId: screen?.screenId || '',
    layoutTheme: screen?.layoutTheme || 'layout-1',
    backgroundType: screen?.backgroundType || 'color',
    backgroundMedia: screen?.backgroundMedia || null,
    backgroundColor: screen?.backgroundColor || '#1a1a2e',
    sections: screen?.sections || buildEmptySections('layout-1'),
    gap: screen?.gap || 8
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLayoutChange = (newLayoutId) => {
    setFormData(prev => ({
      ...prev,
      layoutTheme: newLayoutId,
      sections: buildEmptySections(newLayoutId)
    }));
    setActiveSectionIdx(0);
  };

  const handleSectionChange = (updatedSection) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) =>
        i === activeSectionIdx ? updatedSection : s
      )
    }));
  };

  const handleBackgroundTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      backgroundType: type,
      backgroundMedia: type === 'color' ? null : prev.backgroundMedia,
      backgroundColor: type === 'color' ? prev.backgroundColor : prev.backgroundColor
    }));
  };

  const handleSubmit = () => {
    const { isValid, errors } = validateFoodScreen(formData);
    if (!isValid) {
      const firstError = Object.values(errors).find(e => typeof e === 'string')
        || 'Please fix validation errors';
      showError(firstError);
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="flex flex-col max-h-[80vh]">
      {/* Tab navigation */}
      <div className="border-b border-bg-300 flex-shrink-0">
        <div className="flex gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActive
                    ? 'border-primary-100 text-primary-100'
                    : 'border-transparent text-text-200 hover:text-text-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content — scrollable */}
      <div className="flex-1 overflow-y-auto p-1">
        {/* Tab 1: Layout & Info */}
        {activeTab === 'layout' && (
          <div className="space-y-6 py-4">
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
                className="w-full px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
                placeholder="e.g., Main Dining Hall Display"
              />
            </div>

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
                className="w-full px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
                placeholder="e.g., HALL-A-01"
              />
              <p className="mt-1 text-xs text-text-200">
                Unique identifier for tracking and management
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-100 mb-3">
                Layout *
              </label>
              <LayoutPicker
                value={formData.layoutTheme}
                onChange={handleLayoutChange}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Sections */}
        {activeTab === 'sections' && (
          <div className="space-y-4 py-4">
            {/* Section sub-tabs */}
            <div className="flex flex-wrap gap-2">
              {formData.sections.map((section, idx) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSectionIdx(idx)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    activeSectionIdx === idx
                      ? 'bg-primary-100 text-white border-primary-100'
                      : 'bg-bg-100 text-text-200 border-bg-300 hover:border-primary-100 hover:text-text-100'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>

            {/* Active section config */}
            {formData.sections[activeSectionIdx] && (
              <SectionConfigTab
                section={formData.sections[activeSectionIdx]}
                onChange={handleSectionChange}
                menus={menus}
              />
            )}
          </div>
        )}

        {/* Tab 3: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6 py-4">
            {/* Background type */}
            <div>
              <label className="block text-sm font-medium text-text-100 mb-3">
                Background Type
              </label>
              <div className="flex gap-2">
                {['image', 'video', 'color'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleBackgroundTypeChange(type)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 capitalize ${
                      formData.backgroundType === type
                        ? 'bg-primary-100 text-white border-primary-100'
                        : 'bg-bg-100 text-text-200 border-bg-300 hover:border-primary-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Image or Video: Gallery + Upload */}
            {(formData.backgroundType === 'image' || formData.backgroundType === 'video') && (
              <div className="space-y-3">
                {/* Source toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBgMediaSource('gallery')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      bgMediaSource === 'gallery'
                        ? 'border-primary-100 bg-primary-100/10 text-primary-100'
                        : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" />
                    Gallery
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgMediaSource('upload')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      bgMediaSource === 'upload'
                        ? 'border-primary-100 bg-primary-100/10 text-primary-100'
                        : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                </div>

                {/* Gallery picker */}
                {bgMediaSource === 'gallery' && (
                  <div>
                    <label className="block text-sm font-medium text-text-200 mb-2">
                      Select from Gallery
                    </label>
                    <div className={`grid ${formData.backgroundType === 'image' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'} gap-2`}>
                      {getMediaByType(formData.backgroundType).map((item) => {
                        const isSelected = formData.backgroundMedia === item.src;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, backgroundMedia: item.src }))}
                            className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                              isSelected
                                ? 'border-primary-100 ring-2 ring-primary-100/30'
                                : 'border-bg-300 hover:border-primary-100/50'
                            }`}
                          >
                            {formData.backgroundType === 'image' ? (
                              <img src={item.src} alt={item.name} className="w-full aspect-video object-cover" />
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
                )}

                {/* Upload */}
                {bgMediaSource === 'upload' && (
                  <ImageUpload
                    value={formData.backgroundMedia}
                    onChange={(base64) => setFormData(prev => ({ ...prev, backgroundMedia: base64 }))}
                    onError={showError}
                    accept={formData.backgroundType === 'image' ? 'image/*' : 'video/*'}
                    label={`Background ${formData.backgroundType === 'image' ? 'Image' : 'Video'}`}
                  />
                )}

                {/* Preview */}
                {formData.backgroundMedia && (
                  <div>
                    <label className="block text-sm font-medium text-text-200 mb-1">Preview</label>
                    <div className="rounded-lg overflow-hidden border border-bg-300 max-h-40">
                      {formData.backgroundType === 'image' ? (
                        <img src={formData.backgroundMedia} alt="Background" className="w-full max-h-40 object-cover" />
                      ) : (
                        <video src={formData.backgroundMedia} muted autoPlay loop className="w-full max-h-40 object-cover" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Color picker */}
            {formData.backgroundType === 'color' && (
              <div>
                <label htmlFor="backgroundColor" className="block text-sm font-medium text-text-100 mb-2">
                  Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="backgroundColor"
                    name="backgroundColor"
                    value={formData.backgroundColor}
                    onChange={handleChange}
                    className="w-12 h-10 rounded border border-bg-300 cursor-pointer"
                  />
                  <span className="text-sm text-text-200 font-mono">
                    {formData.backgroundColor}
                  </span>
                </div>
              </div>
            )}

            {/* Gap size */}
            <div>
              <label htmlFor="gap" className="block text-sm font-medium text-text-100 mb-2">
                Section Gap
              </label>
              <select
                id="gap"
                name="gap"
                value={formData.gap}
                onChange={(e) => setFormData(prev => ({ ...prev, gap: Number(e.target.value) }))}
                className="w-full px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
              >
                {GAP_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.value}px)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex gap-3 pt-4 border-t border-bg-300 flex-shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-text-100 bg-bg-100 border border-bg-300 rounded-lg hover:bg-bg-200 transition-all duration-200 hover:border-primary-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-100 rounded-lg hover:bg-primary-200 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {screen ? 'Update Screen' : 'Create Screen'}
        </button>
      </div>
    </div>
  );
};

export default FoodScreenForm;
