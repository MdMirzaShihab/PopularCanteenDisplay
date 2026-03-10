import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import ScreenList from '../components/screens/ScreenList';
import TokenScreenCard from '../components/screens/TokenScreenCard';
import FoodScreenForm from '../components/screens/FoodScreenForm';
import TokenScreenForm from '../components/screens/TokenScreenForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const ScreensPage = () => {
  const {
    foodScreens, createFoodScreen, updateFoodScreen, deleteFoodScreen,
    tokenScreens, createTokenScreen, updateTokenScreen, deleteTokenScreen
  } = useData();
  const { success, error } = useNotification();

  const [activeTab, setActiveTab] = useState('food');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState(null);
  const [deletingScreen, setDeletingScreen] = useState(null);

  const isFoodTab = activeTab === 'food';

  const handleCreate = () => {
    setEditingScreen(null);
    setIsModalOpen(true);
  };

  const handleEdit = (screen) => {
    setEditingScreen(screen);
    setIsModalOpen(true);
  };

  const handleDelete = (screen) => {
    setDeletingScreen(screen);
  };

  const handleDuplicate = (screen) => {
    try {
      const duplicated = { ...screen, title: `${screen.title} (Copy)`, id: undefined, screenId: `${screen.screenId || ''}-copy` };
      createFoodScreen(duplicated);
      success('Screen duplicated successfully!');
    } catch {
      error('Failed to duplicate screen. Please try again.');
    }
  };

  const handleFoodSubmit = async (formData) => {
    try {
      if (editingScreen) {
        updateFoodScreen(editingScreen.id, formData);
        success('Food screen updated successfully!');
      } else {
        createFoodScreen(formData);
        success('Food screen created successfully!');
      }
      setIsModalOpen(false);
      setEditingScreen(null);
    } catch {
      error('Failed to save screen. Please try again.');
    }
  };

  const handleTokenSubmit = async (formData) => {
    try {
      if (editingScreen) {
        updateTokenScreen(editingScreen.id, formData);
        success('Token screen updated successfully!');
      } else {
        createTokenScreen(formData);
        success('Token screen created successfully!');
      }
      setIsModalOpen(false);
      setEditingScreen(null);
    } catch {
      error('Failed to save screen. Please try again.');
    }
  };

  const confirmDelete = () => {
    const deleteFunc = deletingScreen?.type === 'token' ? deleteTokenScreen : deleteFoodScreen;
    const result = deleteFunc(deletingScreen.id);
    if (result.success) {
      success('Screen deleted successfully!');
    } else {
      error(result.error);
    }
    setDeletingScreen(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-100">Screens Management</h1>
          <p className="text-text-200 mt-1">Configure food display and token screens</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {isFoodTab ? 'Create Food Screen' : 'Create Token Screen'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-bg-300">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('food')}
            className={`px-1 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
              isFoodTab
                ? 'border-primary-100 text-primary-100'
                : 'border-transparent text-text-200 hover:text-text-100'
            }`}
          >
            Food Screens ({foodScreens.length})
          </button>
          <button
            onClick={() => setActiveTab('token')}
            className={`px-1 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
              !isFoodTab
                ? 'border-primary-100 text-primary-100'
                : 'border-transparent text-text-200 hover:text-text-100'
            }`}
          >
            Token Screens ({tokenScreens.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {isFoodTab ? (
        <ScreenList screens={foodScreens} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} />
      ) : (
        tokenScreens.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-200">No token screens yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokenScreens.map(screen => (
              <TokenScreenCard key={screen.id} screen={screen} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingScreen(null); }}
        title={editingScreen
          ? `Edit ${isFoodTab ? 'Food' : 'Token'} Screen`
          : `Create New ${isFoodTab ? 'Food' : 'Token'} Screen`}
        size="lg"
      >
        {isFoodTab ? (
          <FoodScreenForm screen={editingScreen} onSubmit={handleFoodSubmit}
            onCancel={() => { setIsModalOpen(false); setEditingScreen(null); }} />
        ) : (
          <TokenScreenForm screen={editingScreen} onSubmit={handleTokenSubmit}
            onCancel={() => { setIsModalOpen(false); setEditingScreen(null); }} />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingScreen}
        onClose={() => setDeletingScreen(null)}
        onConfirm={confirmDelete}
        title="Delete Screen"
        message={`Are you sure you want to delete "${deletingScreen?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default ScreensPage;
