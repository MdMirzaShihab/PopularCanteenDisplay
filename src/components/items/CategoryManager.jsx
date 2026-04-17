import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import ConfirmDialog from '../common/ConfirmDialog';

const CategoryManager = ({ categories, loading, createCategory, updateCategory, deleteCategory }) => {
  const { success, error } = useNotification();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [renameConfirm, setRenameConfirm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await createCategory({ name: trimmed });
      setNewName('');
      success('Category added');
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditingName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const commitEdit = (cat) => {
    const trimmed = editingName.trim();
    if (!trimmed || trimmed === cat.name) {
      cancelEdit();
      return;
    }
    if (cat.itemCount > 0) {
      setRenameConfirm({ id: cat._id, oldName: cat.name, newName: trimmed, itemCount: cat.itemCount });
      return;
    }
    performRename(cat._id, trimmed, false);
  };

  const performRename = async (id, name, force) => {
    setBusy(true);
    try {
      await updateCategory(id, { name, force });
      success('Category renamed');
      cancelEdit();
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const requestDelete = (cat) => {
    setDeleteConfirm({ id: cat._id, name: cat.name, itemCount: cat.itemCount });
  };

  const performDelete = async () => {
    if (!deleteConfirm) return;
    const { id, itemCount } = deleteConfirm;
    setBusy(true);
    try {
      await deleteCategory(id, { force: itemCount > 0 });
      success('Category deleted');
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="input-field flex-1"
          maxLength={50}
        />
        <button
          type="submit"
          disabled={busy || !newName.trim()}
          className="btn-primary flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-center py-6 text-text-200">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-center py-6 text-text-200">No categories yet</p>
      ) : (
        <ul className="border border-bg-300 rounded-lg divide-y divide-bg-300 max-h-96 overflow-y-auto">
          {categories.map((cat) => (
            <li key={cat._id} className="flex items-center gap-2 px-4 py-2">
              {editingId === cat._id ? (
                <>
                  <input
                    autoFocus
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(cat);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="input-field flex-1"
                    maxLength={50}
                  />
                  <button
                    onClick={() => commitEdit(cat)}
                    disabled={busy}
                    className="p-2 text-primary-100 hover:bg-primary-100/10 rounded-lg disabled:opacity-50"
                    aria-label="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={busy}
                    className="p-2 text-text-300 hover:bg-bg-200 rounded-lg disabled:opacity-50"
                    aria-label="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-text-100">{cat.name}</span>
                  <span className="text-xs text-text-300">
                    {cat.itemCount} {cat.itemCount === 1 ? 'item' : 'items'}
                  </span>
                  <button
                    onClick={() => startEdit(cat)}
                    disabled={busy}
                    className="p-2 text-text-200 hover:bg-bg-100 rounded-lg disabled:opacity-50"
                    aria-label={`Edit ${cat.name}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => requestDelete(cat)}
                    disabled={busy}
                    className="p-2 text-accent-200 hover:bg-accent-200/10 rounded-lg disabled:opacity-50"
                    aria-label={`Delete ${cat.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        isOpen={!!renameConfirm}
        onClose={() => setRenameConfirm(null)}
        onConfirm={() => performRename(renameConfirm.id, renameConfirm.newName, true)}
        title="Rename category?"
        message={
          renameConfirm
            ? `"${renameConfirm.oldName}" is used by ${renameConfirm.itemCount} item(s). Renaming will update all of them to "${renameConfirm.newName}". Continue?`
            : ''
        }
        confirmText="Rename"
        type="warning"
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={performDelete}
        title="Delete category?"
        message={
          deleteConfirm?.itemCount > 0
            ? `"${deleteConfirm.name}" is used by ${deleteConfirm.itemCount} item(s). Deleting will clear the category on those items. Continue?`
            : `Delete "${deleteConfirm?.name}"?`
        }
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default CategoryManager;
