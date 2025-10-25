import { Edit2, Trash2, Clock } from 'lucide-react';
import { getTimePercentage, formatTimeRange, formatDaysOfWeek, calculateTimeSlotRows, groupSlotsByDay } from '../../utils/timeUtils';
import { useData } from '../../context/DataContext';

const ScheduleCard = ({ schedule, onEdit, onDelete }) => {
  const { getMenuById } = useData();

  // Group slots by day of week
  const slotsByDay = groupSlotsByDay(schedule.timeSlots);
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

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Weekly Timeline Visualization */}
      <div className="p-4 bg-gray-50">
        <p className="text-xs font-medium text-gray-500 mb-3">Weekly Schedule</p>

        {/* Time markers header */}
        <div className="relative h-6 mb-1 ml-20">
          {[0, 6, 12, 18, 24].map(hour => (
            <div
              key={hour}
              className="absolute top-0"
              style={{ left: `${(hour / 24) * 100}%` }}
            >
              <span className="absolute -left-3 text-xs text-gray-600 font-medium">
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
              'bg-accent-100',
              'bg-accent-200',
              'bg-primary-300',
              'bg-accent-100'
            ];

            return (
              <div key={key} className="flex items-stretch">
                {/* Day label */}
                <div className="w-20 flex items-center">
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </div>

                {/* Day timeline */}
                <div className="flex-1 relative bg-gray-200 rounded" style={{ height: `${dayTimelineHeight}px` }}>
                  {/* Time marker lines */}
                  {[0, 6, 12, 18, 24].map(hour => (
                    <div
                      key={hour}
                      className="absolute top-0 bottom-0 border-l border-gray-300"
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
                      <span className="text-xs text-gray-400 italic">No schedule</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Slots List */}
      <div className="p-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Time Slots:</p>
        <div className="space-y-3 mb-4">
          {schedule.timeSlots.map(slot => {
            const menu = getMenuById(slot.menuId);
            return (
              <div key={slot.id} className="p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </span>
                  <span className="text-xs font-medium text-gray-900">{menu?.title || 'Unknown Menu'}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 bg-primary-100 text-white rounded">
                    {formatDaysOfWeek(slot.daysOfWeek)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Default Menu */}
        <div className="text-xs text-gray-500 mb-4">
          <span className="font-medium">Default Menu:</span>{' '}
          {getMenuById(schedule.defaultMenuId)?.title || 'Not set'}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(schedule)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-200 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;
