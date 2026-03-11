import { Plus, Trash2, AlertTriangle, Info } from 'lucide-react';
import { generateId } from '../../data/mockData';
import { checkSectionTimeSlotOverlaps } from '../../utils/validators';
import { getTimePercentage, formatTimeRange, calculateTimeSlotRows, groupSlotsByDay } from '../../utils/timeUtils';
import SectionContentEditor from './SectionContentEditor';

const DAYS = [
  { label: 'Mon', value: 'monday' },
  { label: 'Tue', value: 'tuesday' },
  { label: 'Wed', value: 'wednesday' },
  { label: 'Thu', value: 'thursday' },
  { label: 'Fri', value: 'friday' },
  { label: 'Sat', value: 'saturday' },
  { label: 'Sun', value: 'sunday' }
];

const TIMELINE_DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const ROW_HEIGHT = 40;
const SLOT_COLORS = [
  'bg-primary-100',
  'bg-primary-200',
  'bg-primary-300',
  'bg-accent-100',
  'bg-accent-200',
  'bg-primary-100'
];

const SectionTimeSlotEditor = ({ timeSlots, onChange, menus }) => {
  const overlaps = checkSectionTimeSlotOverlaps(timeSlots || []);

  const getSlotLabel = (slot) => {
    if (!slot.content) return 'No content';
    if (slot.content.type === 'media' || slot.content.type === 'image' || slot.content.type === 'video') return 'Media';
    if (slot.content.type === 'menu' && slot.content.menuId) {
      const menu = menus.find(m => m.id === slot.content.menuId);
      return menu?.title || 'Menu';
    }
    return 'Menu';
  };

  // Adapt slots for timeline utilities (they expect menuName for display)
  const adaptedSlots = (timeSlots || []).map(slot => ({
    ...slot,
    menuName: getSlotLabel(slot)
  }));
  const slotsByDay = groupSlotsByDay(adaptedSlots);

  const handleSlotChange = (slotIdx, field, value) => {
    const updated = timeSlots.map((slot, idx) =>
      idx === slotIdx ? { ...slot, [field]: value } : slot
    );
    onChange(updated);
  };

  const handleContentChange = (slotIdx, newContent) => {
    const updated = timeSlots.map((slot, idx) =>
      idx === slotIdx ? { ...slot, content: newContent } : slot
    );
    onChange(updated);
  };

  const handleDayToggle = (slotIdx, dayValue) => {
    const slot = timeSlots[slotIdx];
    const currentDays = slot.daysOfWeek || [];
    const updatedDays = currentDays.includes(dayValue)
      ? currentDays.filter((d) => d !== dayValue)
      : [...currentDays, dayValue];
    handleSlotChange(slotIdx, 'daysOfWeek', updatedDays);
  };

  const handleAddSlot = () => {
    onChange([
      ...(timeSlots || []),
      {
        id: generateId(),
        startTime: '08:00',
        endTime: '17:00',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        content: { type: 'menu', menuId: '', visualStyle: 'card-grid' }
      }
    ]);
  };

  const handleDeleteSlot = (slotIdx) => {
    onChange(timeSlots.filter((_, idx) => idx !== slotIdx));
  };

  return (
    <div className="space-y-4">
      {/* Overlap warning */}
      {overlaps.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>Some time slots have overlapping time ranges on the same days. Please adjust to avoid conflicts.</span>
        </div>
      )}

      {/* Weekly Timeline Visualization */}
      {(timeSlots || []).length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-100 mb-2">
            Weekly Timeline Preview
          </label>

          {/* Time markers header */}
          <div className="relative h-6 mb-1 ml-20">
            {Array.from({ length: 25 }, (_, i) => i).map(hour => (
              <div
                key={hour}
                className="absolute top-0"
                style={{ left: `${(hour / 24) * 100}%` }}
              >
                <span className="absolute -left-3 text-xs text-text-200 font-medium">
                  {hour % 6 === 0 ? `${hour}:00` : ''}
                </span>
                <span className="absolute top-3 -left-px text-[9px] text-text-300">
                  {hour % 6 !== 0 ? '|' : ''}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline for each day */}
          <div className="space-y-1">
            {TIMELINE_DAYS.map(({ key, label }) => {
              const daySlots = slotsByDay[key] || [];
              const { slotRows, totalRows } = calculateTimeSlotRows(daySlots);
              const dayTimelineHeight = Math.max(ROW_HEIGHT, totalRows * ROW_HEIGHT);

              return (
                <div key={key} className="flex items-stretch">
                  <div className="w-20 flex items-center">
                    <span className="text-xs font-medium text-text-100">{label}</span>
                  </div>
                  <div className="flex-1 relative bg-bg-200 rounded" style={{ height: `${dayTimelineHeight}px` }}>
                    {Array.from({ length: 25 }, (_, i) => i).map(hour => (
                      <div
                        key={hour}
                        className={`absolute top-0 bottom-0 border-l ${hour % 6 === 0 ? 'border-bg-300' : 'border-bg-300/40'}`}
                        style={{ left: `${(hour / 24) * 100}%` }}
                      />
                    ))}
                    {daySlots.map((slot, idx) => {
                      const startPercent = getTimePercentage(slot.startTime);
                      const endPercent = getTimePercentage(slot.endTime);
                      const width = endPercent - startPercent;
                      const rowIndex = slotRows[slot.id] || 0;

                      return (
                        <div
                          key={slot.id}
                          className={`absolute ${SLOT_COLORS[idx % SLOT_COLORS.length]} opacity-80 hover:opacity-100 transition-opacity cursor-pointer rounded`}
                          style={{
                            left: `${startPercent}%`,
                            width: `${width}%`,
                            top: `${rowIndex * ROW_HEIGHT + 2}px`,
                            height: `${ROW_HEIGHT - 4}px`
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
          {overlaps.length > 0 && (
            <div className="mt-3 p-3 bg-primary-100/10 border border-primary-100 rounded-lg flex items-start gap-2">
              <Info className="w-5 h-5 text-primary-100 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-200">Overlapping Time Slots</p>
                <p className="text-xs text-text-100 mt-1">
                  {overlaps.length} overlap(s) detected. Please adjust to avoid conflicts.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Time slot list */}
      {(timeSlots || []).map((slot, slotIdx) => (
        <div
          key={slot.id}
          className="relative border border-bg-300 rounded-lg p-4 space-y-4"
        >
          {/* Delete button */}
          <button
            type="button"
            onClick={() => handleDeleteSlot(slotIdx)}
            className="absolute top-3 right-3 text-accent-200 hover:text-accent-300 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Time range */}
          <div className="flex items-center gap-3 pr-8">
            <div>
              <label className="block text-sm font-medium text-text-200 mb-1">Start</label>
              <input
                type="time"
                value={slot.startTime || '08:00'}
                onChange={(e) => handleSlotChange(slotIdx, 'startTime', e.target.value)}
                className="px-3 py-2 border border-bg-300 rounded-lg bg-white text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-200 mb-1">End</label>
              <input
                type="time"
                value={slot.endTime || '17:00'}
                onChange={(e) => handleSlotChange(slotIdx, 'endTime', e.target.value)}
                className="px-3 py-2 border border-bg-300 rounded-lg bg-white text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          {/* Days of week */}
          <div>
            <label className="block text-sm font-medium text-text-200 mb-2">Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const isSelected = (slot.daysOfWeek || []).includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(slotIdx, day.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary-100 text-white'
                        : 'bg-bg-200 text-text-100 hover:bg-bg-300'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content editor */}
          <SectionContentEditor
            content={slot.content}
            onChange={(newContent) => handleContentChange(slotIdx, newContent)}
            menus={menus}
            label="Content"
          />
        </div>
      ))}

      {/* Add time slot button */}
      <button
        type="button"
        onClick={handleAddSlot}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-bg-300 rounded-lg text-text-200 hover:border-primary-100 hover:text-primary-100 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Time Slot
      </button>
    </div>
  );
};

export default SectionTimeSlotEditor;
