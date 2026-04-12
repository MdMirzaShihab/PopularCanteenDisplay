import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import * as foodScreensApi from '../api/foodScreens.api';
import FoodScreenForm from '../components/screens/FoodScreenForm';
import FoodScreenPreview from '../components/screens/FoodScreenPreview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { ArrowLeft, Layout, Layers, Image, Settings, Save } from 'lucide-react';

const TABS = [
  { id: 'layout', label: 'Layout', icon: Layout },
  { id: 'sections', label: 'Sections', icon: Layers },
  { id: 'background', label: 'Background', icon: Image },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const FoodScreenEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const formRef = useRef();

  const isEditMode = !!id;

  const [screen, setScreen] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('layout');
  const [formData, setFormData] = useState(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Fetch screen data for edit mode
  useEffect(() => {
    if (!id) return;
    const fetchScreen = async () => {
      try {
        const data = await foodScreensApi.getFoodScreenById(id);
        setScreen(data);
      } catch (err) {
        showError(err.message || 'Failed to load screen');
        navigate('/screens', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchScreen();
  }, [id, navigate, showError]);

  const handleFormDataChange = useCallback((data) => {
    setFormData(data);
  }, []);

  const handleSave = async () => {
    const submitted = formRef.current?.submit();
    // submit returns false if validation fails
    if (submitted === false) return;
  };

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (isEditMode) {
        await foodScreensApi.updateFoodScreen(id, data);
        success('Food screen updated successfully!');
      } else {
        await foodScreensApi.createFoodScreen(data);
        success('Food screen created successfully!');
      }
      navigate('/screens');
    } catch (err) {
      showError(err.message || 'Failed to save screen. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (formRef.current?.isDirty()) {
      setShowLeaveDialog(true);
    } else {
      navigate('/screens');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-bg-300 flex-shrink-0">
        <button onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-text-200 hover:text-text-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="w-px h-6 bg-bg-300" />
        <span className="text-sm font-semibold text-text-100">
          {isEditMode ? 'Edit Food Screen' : 'Create Food Screen'}
        </span>

        <div className="flex-1" />

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const formErrors = formRef.current?.getFormErrors() || {};
            const hasError = (tab.id === 'layout' && (formErrors.title || formErrors.screenId || formErrors.layoutTheme || formErrors.sectionCount))
              || (tab.id === 'sections' && formErrors.sections)
              || (tab.id === 'background' && (formErrors.backgroundMedia || formErrors.backgroundColor));
            return (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-100/10 text-primary-100'
                    : hasError
                      ? 'text-accent-200'
                      : 'text-text-200 hover:text-text-100 hover:bg-bg-100'
                }`}>
                <Icon className="w-4 h-4" />
                {tab.label}
                {hasError && !isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent-200" />}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary-100 rounded-lg hover:bg-primary-200 disabled:opacity-50 transition-all duration-200 shadow-sm">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Split layout: Editor + Preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel */}
        <div className="flex-1 overflow-y-auto px-6">
          <FoodScreenForm
            ref={formRef}
            screen={screen}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSubmit={handleSubmit}
            onFormDataChange={handleFormDataChange}
          />
        </div>

        {/* Preview panel */}
        <div className="w-[42%] border-l border-bg-300 bg-bg-100 p-5 overflow-y-auto flex-shrink-0">
          <FoodScreenPreview formData={formData} />
        </div>
      </div>

      {/* Leave confirmation */}
      <ConfirmDialog
        isOpen={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        onConfirm={() => navigate('/screens')}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
        confirmText="Leave"
        type="danger"
      />
    </div>
  );
};

export default FoodScreenEditorPage;
