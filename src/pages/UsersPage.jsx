import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const UsersPage = () => {
  const { users, createUser, updateUser, deleteUser } = useData();
  const { isAdmin } = useAuth();
  const { success, error } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Redirect if not admin — placed after all hooks
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user) => {
    setDeletingUser(user);
  };

  const handleSubmit = async (formData) => {
    if (editingUser) {
      const result = updateUser(editingUser.id, formData);
      if (result?.success === false) {
        error(result.error);
        return;
      }
      success('User updated successfully!');
    } else {
      const result = createUser(formData);
      if (result?.success === false) {
        error(result.error);
        return;
      }
      success('User created successfully!');
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const confirmDelete = () => {
    const result = deleteUser(deletingUser.id);
    if (result.success) {
      success('User deleted successfully!');
    } else {
      error(result.error);
    }
    setDeletingUser(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-100">User Management</h1>
          <p className="text-text-200 mt-1">Manage system users and their roles</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New User
        </button>
      </div>

      {/* User List */}
      <UserList
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Edit User' : 'Create New User'}
        size="lg"
      >
        <UserForm
          user={editingUser}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingUser(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deletingUser?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default UsersPage;
