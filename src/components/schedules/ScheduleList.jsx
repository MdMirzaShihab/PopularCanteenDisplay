import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import ScheduleCard from './ScheduleCard';

const ScheduleList = ({ schedules, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule =>
      schedule.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [schedules, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search schedules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredSchedules.length} of {schedules.length} schedules
      </div>

      {/* Schedules Grid */}
      {filteredSchedules.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No schedules found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSchedules.map(schedule => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleList;
