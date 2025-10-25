import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import { getTimePercentage, formatTimeRange, formatDaysOfWeek, calculateTimeSlotRows, groupSlotsByDay } from '../utils/timeUtils';
import ScheduleForm from '../components/schedules/ScheduleForm';
import Modal from '../components/common/Modal';

const SchedulesPage = () => {
  const { getSingleSchedule, updateSchedule, getMenuById } = useData();
  const { success, error } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const schedule = getSingleSchedule();

  // Group slots by day of week
  const slotsByDay = schedule ? groupSlotsByDay(schedule.timeSlots) : {};
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

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      updateSchedule(schedule.id, formData);
      success('Schedule updated successfully!');
      setIsModalOpen(false);
    } catch (err) {
      error('Failed to update schedule. Please try again.');
    }
  };

  if (!schedule) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No schedule found. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-100">Schedule Configuration</h1>
          <p className="text-text-200 mt-1">Configure time-based menu schedules for all displays</p>
        </div>
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-white font-medium rounded-lg hover:bg-primary-200 transition-all duration-200 border border-transparent hover:border-primary-200 shadow-md hover:shadow-lg"
        >
          <Edit2 className="w-5 h-5" />
          Edit Schedule
        </button>
      </div>

      {/* Weekly Timeline Visualization */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-bg-300">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-text-100 mb-4">Weekly Schedule</h2>

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

              const colors = [
                'bg-primary-100',
                'bg-primary-200',
                'bg-primary-300',
                'bg-accent-100',
                'bg-accent-200',
                'bg-primary-100'
              ];

              return (
                <div key={key} className="flex items-stretch">
                  {/* Day label */}
                  <div className="w-20 flex items-center">
                    <span className="text-sm font-medium text-text-100">{label}</span>
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
                      const menu = getMenuById(slot.menuId);
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
                          title={`${formatTimeRange(slot.startTime, slot.endTime)} - ${menu?.title || 'Unknown'}`}
                        >
                          <div className="absolute inset-0 flex items-center justify-center px-1">
                            <span className="text-xs font-medium text-white truncate">
                              {menu?.title || 'Menu'}
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
        </div>
      </div>

      {/* Time Slots List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-bg-300">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-text-100 mb-4">Time Slots</h2>
          <div className="space-y-3 mb-6">
            {schedule.timeSlots.map(slot => {
              const menu = getMenuById(slot.menuId);
              return (
                <div key={slot.id} className="p-3 bg-bg-100/50 rounded-lg border border-bg-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-200">
                      {formatTimeRange(slot.startTime, slot.endTime)}
                    </span>
                    <span className="text-sm font-medium text-text-100">{menu?.title || 'Unknown Menu'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-3 py-1 bg-gradient-to-br from-primary-100 to-primary-200 text-white rounded-lg font-medium shadow-sm">
                      {formatDaysOfWeek(slot.daysOfWeek)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Default Menu */}
      <div className="bg-primary-100/10 border border-primary-100 rounded-xl p-6">
        <span className="text-sm font-medium text-primary-100">Default Menu:</span>{' '}
        <span className="text-sm text-text-100 font-semibold">{getMenuById(schedule.defaultMenuId)?.title || 'Not set'}</span>
        <p className="text-xs text-text-200 mt-1">This menu will be displayed when no time slot is active</p>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Schedule"
        size="xl"
      >
        <ScheduleForm
          schedule={schedule}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default SchedulesPage;
