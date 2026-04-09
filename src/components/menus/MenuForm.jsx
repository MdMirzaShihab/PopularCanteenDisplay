import { useState, useEffect } from 'react';
import MenuItemSelector from './MenuItemSelector';
import { validateMenu } from '../../utils/validators';
import { useNotification } from '../../context/NotificationContext';

const MenuForm = ({ menu, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    items: []
  });

  const { error: showError } = useNotification();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (menu) {
      setFormData({
        title: menu.title || '',
        description: menu.description || '',
        items: (menu.items || []).map(item => typeof item === 'string' ? item : item._id)
      });
    }
  }, [menu]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleItemsChange = (items) => {
    setFormData(prev => ({ ...prev, items }));
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate
    const validation = validateMenu(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    // Submit
    try {
      await onSubmit(formData);
    } catch {
      showError('Failed to save menu. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text-100 mb-2">
          Menu Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`input-field ${errors.title ? 'border-accent-200' : ''}`}
          placeholder="e.g., Breakfast Menu"
        />
        {errors.title && <p className="mt-1 text-sm text-accent-200">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-100 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={`input-field ${errors.description ? 'border-accent-200' : ''}`}
          placeholder="Describe the menu..."
        />
        {errors.description && <p className="mt-1 text-sm text-accent-200">{errors.description}</p>}
      </div>

      {/* Item Selector */}
      <div>
        <MenuItemSelector
          selectedItemIds={formData.items}
          onChange={handleItemsChange}
        />
        {errors.items && <p className="mt-1 text-sm text-accent-200">{errors.items}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : menu ? 'Update Menu' : 'Create Menu'}
        </button>
      </div>
    </form>
  );
};

export default MenuForm;
