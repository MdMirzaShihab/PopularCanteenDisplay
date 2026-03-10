import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SectionContentEditor from './SectionContentEditor';
import SectionTimeSlotEditor from './SectionTimeSlotEditor';

const SectionConfigTab = ({ section, onChange, menus }) => {
  const [defaultOpen, setDefaultOpen] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(true);

  const handleDefaultContentChange = (newContent) => {
    onChange({ ...section, defaultContent: newContent });
  };

  const handleTimeSlotsChange = (newTimeSlots) => {
    onChange({ ...section, timeSlots: newTimeSlots });
  };

  return (
    <div className="space-y-4">
      {/* Default Content panel */}
      <div className="border border-bg-300 rounded-lg bg-white">
        <button
          type="button"
          onClick={() => setDefaultOpen(!defaultOpen)}
          className="w-full flex justify-between items-center p-4"
        >
          <span className="text-sm font-semibold text-text-100">Default Content</span>
          {defaultOpen ? (
            <ChevronUp className="w-5 h-5 text-text-200" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-200" />
          )}
        </button>
        {defaultOpen && (
          <div className="px-4 pb-4 space-y-3">
            <p className="text-xs text-text-300">
              Shown when no scheduled time slot matches
            </p>
            <SectionContentEditor
              content={section.defaultContent}
              onChange={handleDefaultContentChange}
              menus={menus}
            />
          </div>
        )}
      </div>

      {/* Time Slots panel */}
      <div className="border border-bg-300 rounded-lg bg-white">
        <button
          type="button"
          onClick={() => setScheduleOpen(!scheduleOpen)}
          className="w-full flex justify-between items-center p-4"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-100">Schedule</span>
            <span className="px-2 py-0.5 text-xs font-medium bg-primary-50 text-primary-100 rounded-full">
              {(section.timeSlots || []).length}
            </span>
          </div>
          {scheduleOpen ? (
            <ChevronUp className="w-5 h-5 text-text-200" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-200" />
          )}
        </button>
        {scheduleOpen && (
          <div className="px-4 pb-4 space-y-3">
            <p className="text-xs text-text-300">
              Add time-based content that overrides the default
            </p>
            <SectionTimeSlotEditor
              timeSlots={section.timeSlots || []}
              onChange={handleTimeSlotsChange}
              menus={menus}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionConfigTab;
