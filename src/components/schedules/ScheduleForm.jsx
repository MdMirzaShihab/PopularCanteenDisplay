import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import TimeSlotBuilder from './TimeSlotBuilder';
import { validateSchedule } from '../../utils/validators';

const ScheduleForm = ({ schedule, onSubmit, onCancel }) => {
  const { menus } = useData();
  const [formData, setFormData] = useState({
    defaultMenuId: '',
    timeSlots: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (schedule) {
      setFormData({
        defaultMenuId: schedule.defaultMenuId || '',
        timeSlots: schedule.timeSlots || []
      });
    } else {
      // Set default menu if available
      if (menus.length > 0 && !formData.defaultMenuId) {
        setFormData(prev => ({ ...prev, defaultMenuId: menus[0].id }));
      }
    }
  }, [schedule, menus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleTimeSlotsChange = (timeSlots) => {
    setFormData(prev => ({ ...prev, timeSlots }));
    if (errors.timeSlots) {
      setErrors(prev => ({ ...prev, timeSlots: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate
    const validation = validateSchedule(formData);
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
      {/* Default Menu */}
      <div>
        <label htmlFor="defaultMenuId" className="block text-sm font-medium text-text-100 mb-2">
          Default Menu *
        </label>
        <select
          id="defaultMenuId"
          name="defaultMenuId"
          value={formData.defaultMenuId}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100 ${
            errors.defaultMenuId ? 'border-accent-200' : 'border-bg-300'
          }`}
        >
          <option value="">Select default menu...</option>
          {menus.map(menu => (
            <option key={menu.id} value={menu.id}>
              {menu.title}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-text-200">
          This menu will be displayed when no time slot is active
        </p>
        {errors.defaultMenuId && <p className="mt-1 text-sm text-accent-200">{errors.defaultMenuId}</p>}
      </div>

      {/* Time Slot Builder */}
      <div>
        <TimeSlotBuilder
          timeSlots={formData.timeSlots}
          onChange={handleTimeSlotsChange}
        />
        {errors.timeSlots && <p className="mt-1 text-sm text-accent-200">{errors.timeSlots}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-bg-300">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-text-100 bg-bg-100 border border-bg-300 rounded-lg hover:bg-bg-200 transition-all duration-200 hover:border-primary-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-100 rounded-lg hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isSubmitting ? 'Saving...' : schedule ? 'Update Schedule' : 'Create Schedule'}
        </button>
      </div>
    </form>
  );
};

export default ScheduleForm;
