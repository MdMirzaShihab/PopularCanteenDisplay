import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import { useNotification } from '../context/NotificationContext';
import ItemList from '../components/items/ItemList';
import ItemForm from '../components/items/ItemForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';

const ItemsPage = () => {
  // Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState('all');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { items, loading, pagination, createItem, updateItem, deleteItem } = useItems({
    search: debouncedSearch,
    category,
    isActive,
  });

  const { success, error } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item) => {
    setDeletingItem(item);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingItem) {
        await updateItem(editingItem._id, formData);
        success('Item updated successfully!');
      } else {
        await createItem(formData);
        success('Item created successfully!');
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      error(err.message || 'Failed to save item. Please try again.');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteItem(deletingItem._id);
      success('Item deleted successfully!');
    } catch (err) {
      error(err.message || 'Failed to delete item.');
    }
    setDeletingItem(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-100">Items Management</h1>
          <p className="text-text-200 mt-1">Manage your food and beverage items</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Item
        </button>
      </div>

      {/* Items List */}
      <>
        <ItemList
          items={items}
          loading={loading}
          totalCount={pagination.total}
          search={search}
          category={category}
          isActive={isActive}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onIsActiveChange={setIsActive}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={pagination.goToPage}
        />
      </>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Item' : 'Create New Item'}
        size="lg"
      >
        <ItemForm
          item={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={confirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default ItemsPage;
