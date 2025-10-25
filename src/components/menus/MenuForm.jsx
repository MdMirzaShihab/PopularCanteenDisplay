import { useState, useEffect } from 'react';
import MenuItemSelector from './MenuItemSelector';
import { validateMenu } from '../../utils/validators';

const MenuForm = ({ menu, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    itemIds: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (menu) {
      setFormData({
        title: menu.title || '',
        description: menu.description || '',
        itemIds: menu.itemIds || []
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

  const handleItemsChange = (itemIds) => {
    setFormData(prev => ({ ...prev, itemIds }));
    if (errors.itemIds) {
      setErrors(prev => ({ ...prev, itemIds: null }));
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
    } catch (error) {
      console.error('Error submitting form:', error);
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
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.title ? 'border-accent-200' : 'border-gray-300'
          }`}
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
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.description ? 'border-accent-200' : 'border-gray-300'
          }`}
          placeholder="Describe the menu..."
        />
        {errors.description && <p className="mt-1 text-sm text-accent-200">{errors.description}</p>}
      </div>

      {/* Item Selector */}
      <div>
        <MenuItemSelector
          selectedItemIds={formData.itemIds}
          onChange={handleItemsChange}
        />
        {errors.itemIds && <p className="mt-1 text-sm text-accent-200">{errors.itemIds}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-text-100 bg-white border border-gray-300 rounded-lg hover:bg-bg-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : menu ? 'Update Menu' : 'Create Menu'}
        </button>
      </div>
    </form>
  );
};

export default MenuForm;
