import { useState } from 'react';
import { Plus, Trash2, AlertTriangle, Info } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { generateId } from '../../data/mockData';
import { checkTimeSlotOverlaps, validateTimeSlot } from '../../utils/validators';
import { getTimePercentage, formatTimeRange, calculateTimeSlotRows, groupSlotsByDay } from '../../utils/timeUtils';

const TimeSlotBuilder = ({ timeSlots, onChange }) => {
  const { menus } = useData();
  const [errors, setErrors] = useState({});

  const addTimeSlot = () => {
    const newSlot = {
      id: generateId(),
      startTime: '09:00',
      endTime: '10:00',
      menuId: menus.length > 0 ? menus[0].id : '',
      menuName: menus.length > 0 ? menus[0].title : '',
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] // Default to weekdays
    };
    onChange([...timeSlots, newSlot]);
  };

  const removeTimeSlot = (slotId) => {
    onChange(timeSlots.filter(slot => slot.id !== slotId));
    // Clear errors for removed slot
    const newErrors = { ...errors };
    delete newErrors[slotId];
    setErrors(newErrors);
  };

  const updateTimeSlot = (slotId, field, value) => {
    const updatedSlots = timeSlots.map(slot => {
      if (slot.id === slotId) {
        const updated = { ...slot, [field]: value };

        // If menu changed, update menu name
        if (field === 'menuId') {
          const menu = menus.find(m => m.id === value);
          updated.menuName = menu?.title || '';
        }

        return updated;
      }
      return slot;
    });

    onChange(updatedSlots);

    // Clear error for this slot and field
    if (errors[slotId]?.[field]) {
      setErrors(prev => ({
        ...prev,
        [slotId]: { ...prev[slotId], [field]: null }
      }));
    }
  };

  // Check for overlaps
  const overlapCheck = checkTimeSlotOverlaps(timeSlots);

  // Group slots by day of week
  const slotsByDay = groupSlotsByDay(timeSlots);
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const rowHeight = 40; // pixels per row for each day timeline

  const colors = [
    'bg-primary-100',
    'bg-primary-200',
    'bg-primary-300',
    'bg-accent-100',
    'bg-accent-200',
    'bg-primary-100'
  ];

  return (
    <div className="space-y-6">
      {/* Weekly Timeline Visualization */}
      {timeSlots.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-100 mb-2">
            Weekly Timeline Preview
          </label>

          {/* Time markers header */}
          <div className="relative h-6 mb-1 ml-20">
            {[0, 6, 12, 18, 24].map(hour => (
              <div
                key={hour}
                className="absolute top-0"
                style={{ left: `${(hour / 24) * 100}%` }}
              >
                <span className="absolute -left-3 text-xs text-text-200 font-medium">
                  {hour}:00
                </span>
              </div>
            ))}
          </div>

          {/* Timeline for each day */}
          <div className="space-y-1">
            {days.map(({ key, label }) => {
              const daySlots = slotsByDay[key] || [];
              const { slotRows, totalRows } = calculateTimeSlotRows(daySlots);
              const dayTimelineHeight = Math.max(rowHeight, totalRows * rowHeight);

              return (
                <div key={key} className="flex items-stretch">
                  {/* Day label */}
                  <div className="w-20 flex items-center">
                    <span className="text-xs font-medium text-text-100">{label}</span>
                  </div>

                  {/* Day timeline */}
                  <div className="flex-1 relative bg-bg-200 rounded" style={{ height: `${dayTimelineHeight}px` }}>
                    {/* Time marker lines */}
                    {[0, 6, 12, 18, 24].map(hour => (
                      <div
                        key={hour}
                        className="absolute top-0 bottom-0 border-l border-bg-300"
                        style={{ left: `${(hour / 24) * 100}%` }}
                      />
                    ))}

                    {/* Time slots for this day */}
                    {daySlots.map((slot, idx) => {
                      const startPercent = getTimePercentage(slot.startTime);
                      const endPercent = getTimePercentage(slot.endTime);
                      const width = endPercent - startPercent;
                      const rowIndex = slotRows[slot.id] || 0;

                      return (
                        <div
                          key={slot.id}
                          className={`absolute ${colors[idx % colors.length]} opacity-80 hover:opacity-100 transition-opacity cursor-pointer rounded`}
                          style={{
                            left: `${startPercent}%`,
                            width: `${width}%`,
                            top: `${rowIndex * rowHeight + 2}px`,
                            height: `${rowHeight - 4}px`
                          }}
                          title={`${formatTimeRange(slot.startTime, slot.endTime)} - ${slot.menuName}`}
                        >
                          <div className="absolute inset-0 flex items-center justify-center px-1">
                            <span className="text-xs font-medium text-white truncate">
                              {slot.menuName}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Empty state for days with no slots */}
                    {daySlots.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-text-200 italic">No schedule</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overlap Info */}
          {overlapCheck.hasOverlap && (
            <div className="mt-3 p-3 bg-primary-100/10 border border-primary-100 rounded-lg flex items-start gap-2">
              <Info className="w-5 h-5 text-primary-100 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-200">Overlapping Time Slots</p>
                <p className="text-xs text-text-100 mt-1">
                  {overlapCheck.overlaps.length} overlap(s) detected. All overlapping menus will be displayed together in separate rows.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Time Slots List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-text-100">
            Time Slots
          </label>
          <button
            type="button"
            onClick={addTimeSlot}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-100 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100"
          >
            <Plus className="w-4 h-4" />
            Add Slot
          </button>
        </div>

        {timeSlots.length === 0 ? (
          <div className="text-center py-8 bg-bg-100 rounded-lg border-2 border-dashed border-bg-300">
            <p className="text-text-200 text-sm">No time slots added yet</p>
            <button
              type="button"
              onClick={addTimeSlot}
              className="mt-2 text-sm text-primary-100 hover:text-primary-200 font-medium"
            >
              Add your first time slot
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {timeSlots.map((slot, idx) => (
              <div key={slot.id} className="p-4 bg-bg-100/50 rounded-lg border border-bg-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-text-100">
                    Slot {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(slot.id)}
                    className="p-1 text-accent-200 hover:bg-accent-200/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Start Time */}
                    <div>
                      <label className="block text-xs font-medium text-text-200 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
                      />
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-xs font-medium text-text-200 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
                      />
                    </div>

                    {/* Menu */}
                    <div>
                      <label className="block text-xs font-medium text-text-200 mb-1">
                        Menu
                      </label>
                      <select
                        value={slot.menuId}
                        onChange={(e) => updateTimeSlot(slot.id, 'menuId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
                      >
                        <option value="">Select menu...</option>
                        {menus.map(menu => (
                          <option key={menu.id} value={menu.id}>
                            {menu.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Days of Week */}
                  <div>
                    <label className="block text-xs font-medium text-text-200 mb-1">
                      Days of Week
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                        const isSelected = slot.daysOfWeek?.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const newDays = isSelected
                                ? (slot.daysOfWeek || []).filter(d => d !== day)
                                : [...(slot.daysOfWeek || []), day];
                              updateTimeSlot(slot.id, 'daysOfWeek', newDays);
                            }}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                              isSelected
                                ? 'bg-primary-100 text-white hover:bg-primary-200'
                                : 'bg-bg-200 text-text-100 hover:bg-bg-300 border border-bg-300'
                            }`}
                          >
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-text-200 mt-1">
                      {slot.daysOfWeek?.length === 0 ? 'No days selected' :
                       slot.daysOfWeek?.length === 7 ? 'All days' :
                       `${slot.daysOfWeek?.length || 0} days selected`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotBuilder;
