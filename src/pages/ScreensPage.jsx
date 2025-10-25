import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import ScreenList from '../components/screens/ScreenList';
import ScreenForm from '../components/screens/ScreenForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const ScreensPage = () => {
  const { screens, createScreen, updateScreen, deleteScreen } = useData();
  const { success, error } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState(null);
  const [deletingScreen, setDeletingScreen] = useState(null);

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
      const duplicatedScreen = {
        ...screen,
        title: `${screen.title} (Copy)`,
        id: undefined // Let createScreen generate a new ID
      };
      createScreen(duplicatedScreen);
      success('Screen duplicated successfully!');
    } catch (err) {
      error('Failed to duplicate screen. Please try again.');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingScreen) {
        updateScreen(editingScreen.id, formData);
        success('Screen updated successfully!');
      } else {
        createScreen(formData);
        success('Screen created successfully!');
      }
      setIsModalOpen(false);
      setEditingScreen(null);
    } catch (err) {
      error('Failed to save screen. Please try again.');
    }
  };

  const confirmDelete = () => {
    const result = deleteScreen(deletingScreen.id);
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
          <p className="text-text-200 mt-1">Configure display screens with schedules and backgrounds</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Screen
        </button>
      </div>

      {/* Screens List */}
      <ScreenList
        screens={screens}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingScreen(null);
        }}
        title={editingScreen ? 'Edit Screen' : 'Create New Screen'}
        size="lg"
      >
        <ScreenForm
          screen={editingScreen}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingScreen(null);
          }}
        />
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
