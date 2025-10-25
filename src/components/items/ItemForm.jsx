import { useState, useEffect } from 'react';
import ImageUpload from '../common/ImageUpload';
import { validateItem } from '../../utils/validators';

const ItemForm = ({ item, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    ingredients: '',
    image: null,
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        ingredients: item.ingredients || '',
        image: item.image || null,
        isActive: item.isActive !== undefined ? item.isActive : true
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (base64) => {
    setFormData(prev => ({ ...prev, image: base64 }));
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate
    const validation = validateItem(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    // Submit
    try {
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price)
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="input-label">
          Item Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`input-field ${
            errors.name ? 'border-accent-200' : ''
          }`}
          placeholder="e.g., Classic Burger"
        />
        {errors.name && <p className="mt-1 text-sm text-accent-200">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="input-label">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={`input-field ${
            errors.description ? 'border-accent-200' : ''
          }`}
          placeholder="Describe the item..."
        />
        {errors.description && <p className="mt-1 text-sm text-accent-200">{errors.description}</p>}
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="input-label">
          Price ($) *
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          step="0.01"
          min="0"
          className={`input-field ${
            errors.price ? 'border-accent-200' : ''
          }`}
          placeholder="9.99"
        />
        {errors.price && <p className="mt-1 text-sm text-accent-200">{errors.price}</p>}
      </div>

      {/* Ingredients */}
      <div>
        <label htmlFor="ingredients" className="input-label">
          Ingredients (comma-separated) *
        </label>
        <input
          type="text"
          id="ingredients"
          name="ingredients"
          value={formData.ingredients}
          onChange={handleChange}
          className={`input-field ${
            errors.ingredients ? 'border-accent-200' : ''
          }`}
          placeholder="beef, lettuce, tomato, cheese"
        />
        {errors.ingredients && <p className="mt-1 text-sm text-accent-200">{errors.ingredients}</p>}
      </div>

      {/* Image Upload */}
      <div>
        <ImageUpload
          value={formData.image}
          onChange={handleImageChange}
          accept="image/*,video/*"
          label="Item Image/Video *"
        />
        {errors.image && <p className="mt-1 text-sm text-accent-200">{errors.image}</p>}
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="w-4 h-4 text-primary-100 border-bg-300 rounded focus:ring-primary-100"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-text-100">
          Item is active
        </label>
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
          {isSubmitting ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
        </button>
      </div>
    </form>
  );
};

export default ItemForm;
