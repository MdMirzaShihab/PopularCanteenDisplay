import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useMenus } from '../../hooks/useMenus';
import { useNotification } from '../../context/NotificationContext';
import { useBackgroundGallery } from '../../hooks/useBackgroundGallery';
import { validateFoodScreen } from '../../utils/validators';
import { slugify } from '../../utils/constants';
import { buildEmptySections, LAYOUT_THEMES } from '../gallery/themes/layoutRegistry';
import LayoutPicker from './LayoutPicker';
import SectionConfigTab from './SectionConfigTab';
import ImageUpload from '../common/ImageUpload';
import BackgroundCropTool from '../common/BackgroundCropTool';
import ColorPicker from '../ui/ColorPicker';
import { FolderOpen, Upload, Trash2 } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';

const GAP_OPTIONS = [
  { value: 4, label: 'Small' },
  { value: 8, label: 'Medium' },
  { value: 12, label: 'Large' }
];

const FoodScreenForm = forwardRef(({ screen, activeTab, onTabChange, onSubmit, onFormDataChange }, ref) => {
  const { menus } = useMenus();
  const { error: showError } = useNotification();

  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [bgMediaSource, setBgMediaSource] = useState('gallery');
  const [formErrors, setFormErrors] = useState({});
  const [screenIdManuallyEdited, setScreenIdManuallyEdited] = useState(Boolean(screen?.screenId));

  const [formData, setFormData] = useState({
    title: screen?.title || '',
    screenId: screen?.screenId || '',
    layoutTheme: screen?.layoutTheme || 'layout-1',
    backgroundType: screen?.backgroundType || 'color',
    backgroundMedia: screen?.backgroundMedia || null,
    backgroundColor: screen?.backgroundColor || '#1a1a2e',
    backgroundPositionX: screen?.backgroundPositionX ?? 50,
    backgroundPositionY: screen?.backgroundPositionY ?? 50,
    backgroundScale: screen?.backgroundScale ?? 1,
    sections: screen?.sections || buildEmptySections('layout-1'),
    gap: screen?.gap || 8
  });

  const initialFormData = useRef(JSON.stringify(formData));

  const handleGalleryItemDeleted = useCallback((id) => {
    setFormData(prev => (prev.backgroundMedia?._id === id ? { ...prev, backgroundMedia: null } : prev));
  }, []);

  const { galleryMedia, galleryLoading, handleDeleteMedia, addMedia, confirmDialogProps } =
    useBackgroundGallery({ onDeleted: handleGalleryItemDeleted });

  const filteredGalleryMedia = useMemo(
    () => galleryMedia.filter(m => m.type === formData.backgroundType),
    [galleryMedia, formData.backgroundType]
  );

  // Report formData changes to parent (for preview)
  useEffect(() => {
    onFormDataChange?.(formData);
  }, [formData, onFormDataChange]);

  // Unsaved changes warning
  useEffect(() => {
    const isDirty = JSON.stringify(formData) !== initialFormData.current;
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData]);

  // Expose submit to parent via ref
  const handleSubmit = useCallback(() => {
    const { isValid, errors, tabErrors, firstErrorSectionIdx } = validateFoodScreen(formData);
    if (!isValid) {
      if (tabErrors.layout) {
        onTabChange('layout');
        showError(tabErrors.layout);
      } else if (tabErrors.sections) {
        onTabChange('sections');
        setActiveSectionIdx(firstErrorSectionIdx);
        showError(tabErrors.sections);
      } else if (tabErrors.settings) {
        onTabChange('background');
        showError(tabErrors.settings);
      } else {
        showError('Please fix validation errors');
      }
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    onSubmit(formData);
    return true;
  }, [formData, onSubmit, onTabChange, showError]);

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    isDirty: () => JSON.stringify(formData) !== initialFormData.current,
    getFormErrors: () => formErrors,
  }), [handleSubmit, formData, formErrors]);

  const clearFieldError = (field) => {
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
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
    clearFieldError(name);
    if (name === 'title' && !screenIdManuallyEdited) clearFieldError('screenId');
  };

  const handleLayoutChange = (newLayoutId) => {
    const oldOrientation = LAYOUT_THEMES[formData.layoutTheme]?.orientation;
    const newOrientation = LAYOUT_THEMES[newLayoutId]?.orientation;
    const orientationChanged = oldOrientation !== newOrientation;

    setFormData(prev => ({
      ...prev,
      layoutTheme: newLayoutId,
      sections: buildEmptySections(newLayoutId),
      ...(orientationChanged ? { backgroundPositionX: 50, backgroundPositionY: 50, backgroundScale: 1 } : {}),
    }));
    setActiveSectionIdx(0);
    setFormErrors(prev => ({ ...prev, layoutTheme: undefined, sections: undefined, sectionCount: undefined }));
  };

  const handleSectionChange = (updatedSection) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) =>
        i === activeSectionIdx ? updatedSection : s
      )
    }));
    if (formErrors.sections && Array.isArray(formErrors.sections)) {
      setFormErrors(prev => {
        if (!Array.isArray(prev.sections)) return prev;
        const updated = [...prev.sections];
        updated[activeSectionIdx] = undefined;
        return { ...prev, sections: updated.some(e => e) ? updated : undefined };
      });
    }
  };

  const handleBackgroundTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      backgroundType: type,
      backgroundMedia: type === 'color' ? null : prev.backgroundMedia,
      backgroundColor: type === 'color' ? prev.backgroundColor : prev.backgroundColor,
      backgroundPositionX: 50,
      backgroundPositionY: 50,
      backgroundScale: 1,
    }));
    setFormErrors(prev => ({ ...prev, backgroundMedia: undefined, backgroundColor: undefined }));
  };

  return (
    <div className="space-y-6 py-4">
      {/* Tab: Layout & Info */}
      {activeTab === 'layout' && (
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-100 mb-2">Screen Title *</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${formErrors.title ? 'border-accent-200' : 'border-bg-300'}`}
              placeholder="e.g., Main Dining Hall Display" />
            {formErrors.title && <p className="mt-1 text-sm text-accent-200">{formErrors.title}</p>}
          </div>

          <div>
            <label htmlFor="screenId" className="block text-sm font-medium text-text-100 mb-2">Screen ID *</label>
            <input type="text" id="screenId" name="screenId" value={formData.screenId} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${formErrors.screenId ? 'border-accent-200' : 'border-bg-300'}`}
              placeholder="e.g., main-dining-hall" />
            <p className="mt-1 text-xs text-text-200">
              Used in the gallery URL. Auto-generated from the title — edit if you need a custom value.
            </p>
            {formErrors.screenId && <p className="mt-1 text-sm text-accent-200">{formErrors.screenId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-100 mb-3">Layout *</label>
            <LayoutPicker value={formData.layoutTheme} onChange={handleLayoutChange} />
          </div>
        </div>
      )}

      {/* Tab: Sections */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.sections.map((section, idx) => (
              <button key={section._id || section.id} type="button" onClick={() => setActiveSectionIdx(idx)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
                  activeSectionIdx === idx
                    ? 'bg-primary-100 text-white border-primary-100'
                    : 'bg-bg-100 text-text-200 border-bg-300 hover:border-primary-100 hover:text-text-100'
                }`}>
                {section.label}
              </button>
            ))}
          </div>
          {formData.sections[activeSectionIdx] && (
            <SectionConfigTab section={formData.sections[activeSectionIdx]} onChange={handleSectionChange}
              menus={menus.filter(m => m.isActive !== false)} />
          )}
        </div>
      )}

      {/* Tab: Background */}
      {activeTab === 'background' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-100 mb-3">Background Type</label>
            <div className="flex gap-2">
              {['image', 'video', 'color'].map(type => (
                <button key={type} type="button" onClick={() => handleBackgroundTypeChange(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 capitalize ${
                    formData.backgroundType === type
                      ? 'bg-primary-100 text-white border-primary-100'
                      : 'bg-bg-100 text-text-200 border-bg-300 hover:border-primary-100'
                  }`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {(formData.backgroundType === 'image' || formData.backgroundType === 'video') && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button type="button" onClick={() => setBgMediaSource('gallery')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    bgMediaSource === 'gallery' ? 'border-primary-100 bg-primary-100/10 text-primary-100' : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
                  }`}>
                  <FolderOpen className="w-4 h-4" /> Gallery
                </button>
                <button type="button" onClick={() => setBgMediaSource('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    bgMediaSource === 'upload' ? 'border-primary-100 bg-primary-100/10 text-primary-100' : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
                  }`}>
                  <Upload className="w-4 h-4" /> Upload
                </button>
              </div>

              {bgMediaSource === 'gallery' && (
                <div>
                  <label className="block text-sm font-medium text-text-200 mb-2">Select from Gallery</label>
                  {galleryLoading ? (
                    <p className="text-sm text-text-200">Loading gallery...</p>
                  ) : (
                    <div className={`grid ${formData.backgroundType === 'image' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'} gap-2`}>
                      {filteredGalleryMedia.map((item) => {
                        const isSelected = formData.backgroundMedia?._id === item._id;
                        return (
                          <button key={item._id} type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev, backgroundMedia: item,
                              backgroundPositionX: 50, backgroundPositionY: 50, backgroundScale: 1,
                            }))}
                            className={`group relative rounded-lg overflow-hidden border-2 transition-all ${
                              isSelected ? 'border-primary-100 ring-2 ring-primary-100/30' : 'border-bg-300 hover:border-primary-100/50'
                            }`}>
                            {formData.backgroundType === 'image' ? (
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

              {bgMediaSource === 'upload' && (
                <ImageUpload value={formData.backgroundMedia}
                  onChange={(mediaObj) => {
                    addMedia(mediaObj);
                    setFormData(prev => ({
                      ...prev, backgroundMedia: mediaObj,
                      backgroundPositionX: 50, backgroundPositionY: 50, backgroundScale: 1,
                    }));
                  }}
                  onError={showError}
                  accept={formData.backgroundType === 'image' ? 'image/*' : 'video/*'}
                  label={`Background ${formData.backgroundType === 'image' ? 'Image' : 'Video'}`}
                  folder="backgrounds"
                  maxSizeMB={5} />
              )}

              {formData.backgroundMedia && (
                <BackgroundCropTool mediaUrl={formData.backgroundMedia?.url || formData.backgroundMedia} mediaType={formData.backgroundType}
                  orientation={LAYOUT_THEMES[formData.layoutTheme]?.orientation || 'landscape'}
                  positionX={formData.backgroundPositionX} positionY={formData.backgroundPositionY} scale={formData.backgroundScale}
                  onChange={({ positionX, positionY, scale }) =>
                    setFormData(prev => ({ ...prev, backgroundPositionX: positionX, backgroundPositionY: positionY, backgroundScale: scale }))} />
              )}
            </div>
          )}

          {formData.backgroundType === 'color' && (
            <div>
              <ColorPicker
                label="Background Color"
                value={formData.backgroundColor || '#000000'}
                defaultValue="#000000"
                onChange={(hex) => setFormData(prev => ({ ...prev, backgroundColor: hex }))}
              />
            </div>
          )}
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div>
            <label htmlFor="gap" className="block text-sm font-medium text-text-100 mb-2">Section Gap</label>
            <select id="gap" name="gap" value={formData.gap}
              onChange={(e) => setFormData(prev => ({ ...prev, gap: Number(e.target.value) }))}
              className="w-full px-4 py-2 border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100">
              {GAP_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label} ({opt.value}px)</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
});

FoodScreenForm.displayName = 'FoodScreenForm';

export default FoodScreenForm;
