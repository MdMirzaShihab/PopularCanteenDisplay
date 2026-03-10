import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { Search, X } from 'lucide-react';

const TokenArchiveFilters = ({ searchTerm, dateFilter, onSearchChange, onDateChange }) => {
  const dateOptions = useMemo(() => {
    const today = new Date();
    return [
      { label: 'All', value: '' },
      { label: 'Today', value: format(today, 'yyyy-MM-dd') },
      { label: 'Yesterday', value: format(subDays(today, 1), 'yyyy-MM-dd') },
      { label: format(subDays(today, 2), 'MMM dd'), value: format(subDays(today, 2), 'yyyy-MM-dd') }
    ];
  }, []);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-300" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by token number..."
          className="w-full pl-10 pr-9 py-2 text-sm border border-bg-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-bg-100 text-text-100"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-300 hover:text-text-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Date toggle buttons */}
      <div className="flex gap-2">
        {dateOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onDateChange(dateFilter === option.value ? '' : option.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
              dateFilter === option.value
                ? 'bg-primary-100 text-white border-primary-100'
                : 'bg-bg-100 text-text-200 border-bg-300 hover:bg-bg-200 hover:border-primary-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TokenArchiveFilters;
