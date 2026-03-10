import { useState, useMemo } from 'react';
import { Clock, History } from 'lucide-react';
import { filterEntries, groupEntriesByDate } from '../../utils/tokenArchiveUtils';
import TokenArchiveFilters from './TokenArchiveFilters';
import TokenArchiveGroup from './TokenArchiveGroup';

const TokenArchiveSection = ({ archiveEntries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredEntries = useMemo(
    () => filterEntries(archiveEntries, { searchTerm, dateFilter }),
    [archiveEntries, searchTerm, dateFilter]
  );

  const groups = useMemo(
    () => groupEntriesByDate(filteredEntries),
    [filteredEntries]
  );

  return (
    <div className="bg-bg-100 rounded-xl shadow-md p-6 border border-bg-300 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-primary-100" />
          <h3 className="text-lg font-semibold text-text-100">Token History</h3>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-text-200">
          <Clock className="w-4 h-4" />
          <span>{archiveEntries.length} token{archiveEntries.length !== 1 ? 's' : ''} in the last 3 days</span>
        </div>
      </div>

      <TokenArchiveFilters
        searchTerm={searchTerm}
        dateFilter={dateFilter}
        onSearchChange={setSearchTerm}
        onDateChange={setDateFilter}
      />

      {archiveEntries.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-12 h-12 mx-auto text-text-300 mb-3" />
          <p className="text-text-200">No token history yet</p>
          <p className="text-sm text-text-300 mt-1">Tokens will appear here after they are called</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-200">No tokens match your filters</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {groups.map((group) => (
            <TokenArchiveGroup
              key={group.label}
              label={group.label}
              entries={group.entries}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenArchiveSection;
