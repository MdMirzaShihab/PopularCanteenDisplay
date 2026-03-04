import { useState, useEffect } from 'react';
import { validateUser } from '../../utils/validators';
import { useNotification } from '../../context/NotificationContext';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'restaurant_user', label: 'Restaurant Manager' },
  { value: 'token_operator', label: 'Token Operator' },
];

const UserForm = ({ user, onSubmit, onCancel }) => {
  const isEditing = !!user;
  const { error: showError } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'restaurant_user',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        password: '',
        role: user.role || 'restaurant_user',
      });
    } else {
      setFormData({ name: '', email: '', username: '', password: '', role: 'restaurant_user' });
      setErrors({});
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateUser(formData, isEditing);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    // On edit, omit password if left blank
    const payload = { ...formData };
    if (isEditing && !payload.password) {
      delete payload.password;
    }

    try {
      await onSubmit(payload);
    } catch {
      showError('Failed to save user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <label htmlFor="name" className="input-label">Full Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`input-field ${errors.name ? 'border-accent-200' : ''}`}
          placeholder="e.g., Jane Smith"
        />
        {errors.name && <p className="mt-1 text-sm text-accent-200">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="input-label">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`input-field ${errors.email ? 'border-accent-200' : ''}`}
          placeholder="jane@canteen.com"
        />
        {errors.email && <p className="mt-1 text-sm text-accent-200">{errors.email}</p>}
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username" className="input-label">Username *</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={`input-field ${errors.username ? 'border-accent-200' : ''}`}
          placeholder="janesmith"
        />
        {errors.username && <p className="mt-1 text-sm text-accent-200">{errors.username}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="input-label">
          Password {isEditing ? '(leave blank to keep current)' : '*'}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`input-field ${errors.password ? 'border-accent-200' : ''}`}
          placeholder={isEditing ? 'Leave blank to keep current password' : 'Min 6 characters'}
        />
        {errors.password && <p className="mt-1 text-sm text-accent-200">{errors.password}</p>}
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="input-label">Role *</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className={`input-field ${errors.role ? 'border-accent-200' : ''}`}
        >
          {ROLE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.role && <p className="mt-1 text-sm text-accent-200">{errors.role}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
