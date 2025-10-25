import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import MenuList from '../components/menus/MenuList';
import MenuForm from '../components/menus/MenuForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const MenusPage = () => {
  const { menus, createMenu, updateMenu, deleteMenu } = useData();
  const { success, error } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [deletingMenu, setDeletingMenu] = useState(null);

  const handleCreate = () => {
    setEditingMenu(null);
    setIsModalOpen(true);
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleDelete = (menu) => {
    setDeletingMenu(menu);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingMenu) {
        updateMenu(editingMenu.id, formData);
        success('Menu updated successfully!');
      } else {
        createMenu(formData);
        success('Menu created successfully!');
      }
      setIsModalOpen(false);
      setEditingMenu(null);
    } catch (err) {
      error('Failed to save menu. Please try again.');
    }
  };

  const confirmDelete = () => {
    const result = deleteMenu(deletingMenu.id);
    if (result.success) {
      success('Menu deleted successfully!');
    } else {
      error(result.error);
    }
    setDeletingMenu(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-100">Menus Management</h1>
          <p className="text-text-200 mt-1">Organize items into menus for different meal times</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Menu
        </button>
      </div>

      {/* Menus List */}
      <MenuList
        menus={menus}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMenu(null);
        }}
        title={editingMenu ? 'Edit Menu' : 'Create New Menu'}
        size="lg"
      >
        <MenuForm
          menu={editingMenu}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingMenu(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingMenu}
        onClose={() => setDeletingMenu(null)}
        onConfirm={confirmDelete}
        title="Delete Menu"
        message={`Are you sure you want to delete "${deletingMenu?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default MenusPage;
