import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { initialUsers } from '../../data/mockData';

const LogFilters = ({ onApplyFilters }) => {
  const [filters, setFilters] = useState({
    userId: '',
    resourceType: '',
    action: '',
    startDate: '',
    endDate: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const resourceTypes = ['item', 'menu', 'schedule', 'screen', 'user', 'system'];
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'RESET'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleClear = () => {
    const clearedFilters = {
      userId: '',
      resourceType: '',
      action: '',
      startDate: '',
      endDate: ''
    };
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-bg-200/60 backdrop-blur-3xl rounded-2xl shadow-sm overflow-hidden border-2 border-bg-300">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-bg-100 transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary-100" />
          <span className="font-medium text-text-100">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-primary-100 text-white text-xs font-medium rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="text-text-200 font-bold text-xl">
          {isExpanded ? '−' : '+'}
        </div>
      </button>

      {/* Filter Controls */}
      {isExpanded && (
        <div className="p-4 border-t border-bg-300 bg-bg-100/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* User Filter */}
            <div>
              <label className="block text-xs font-medium text-text-100 mb-1">
                User
              </label>
              <select
                name="userId"
                value={filters.userId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
              >
                <option value="">All users</option>
                {initialUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Type Filter */}
            <div>
              <label className="block text-xs font-medium text-text-100 mb-1">
                Resource Type
              </label>
              <select
                name="resourceType"
                value={filters.resourceType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
              >
                <option value="">All types</option>
                {resourceTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-xs font-medium text-text-100 mb-1">
                Action
              </label>
              <select
                name="action"
                value={filters.action}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
              >
                <option value="">All actions</option>
                {actions.map(action => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-medium text-text-100 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-medium text-text-100 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-100 rounded-lg hover:bg-primary-200 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-100 bg-bg-100 border border-bg-300 rounded-lg hover:bg-bg-200 hover:border-accent-200 transition-all duration-200"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogFilters;
