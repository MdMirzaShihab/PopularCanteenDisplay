import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const ActivityTable = ({ logs }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  const toggleRow = (logId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedLogs = [...logs].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === 'timestamp') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'CREATE':
        return 'bg-primary-100/20 text-primary-100 border border-primary-100';
      case 'UPDATE':
        return 'bg-primary-200/20 text-primary-200 border border-primary-200';
      case 'DELETE':
        return 'bg-accent-200/20 text-accent-200 border border-accent-200';
      case 'RESET':
        return 'bg-accent-100/20 text-accent-100 border border-accent-100';
      default:
        return 'bg-bg-300/20 text-text-100 border border-bg-300';
    }
  };

  const getResourceBadgeClass = (type) => {
    const colors = {
      item: 'bg-primary-100/10 text-primary-100 border border-primary-100',
      menu: 'bg-primary-200/10 text-primary-200 border border-primary-200',
      schedule: 'bg-primary-300/10 text-primary-300 border border-primary-300',
      screen: 'bg-accent-100/10 text-accent-100 border border-accent-100',
      user: 'bg-accent-200/10 text-accent-200 border border-accent-200',
      system: 'bg-text-200/10 text-text-200 border border-text-200'
    };
    return colors[type] || 'bg-bg-300/10 text-text-100 border border-bg-300';
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border border-bg-300">
        <p className="text-text-200">No activity logs found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-bg-300">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-100/50 border-b border-bg-300">
            <tr>
              <th className="w-10"></th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-text-100 uppercase tracking-wider cursor-pointer hover:bg-bg-200 transition-colors"
                onClick={() => handleSort('timestamp')}
              >
                Timestamp {sortBy === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-text-100 uppercase tracking-wider cursor-pointer hover:bg-bg-200 transition-colors"
                onClick={() => handleSort('userName')}
              >
                User {sortBy === 'userName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-text-100 uppercase tracking-wider cursor-pointer hover:bg-bg-200 transition-colors"
                onClick={() => handleSort('action')}
              >
                Action {sortBy === 'action' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-text-100 uppercase tracking-wider cursor-pointer hover:bg-bg-200 transition-colors"
                onClick={() => handleSort('resourceType')}
              >
                Resource {sortBy === 'resourceType' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-100 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bg-300">
            {sortedLogs.map((log) => (
              <>
                <tr key={log.id} className="hover:bg-bg-100 transition-all duration-200">
                  <td className="px-4 py-3">
                    {(log.beforeData || log.afterData) && (
                      <button
                        onClick={() => toggleRow(log.id)}
                        className="text-text-200 hover:text-primary-100 transition-colors"
                      >
                        {expandedRows.has(log.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-100 whitespace-nowrap font-medium">
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-100 font-medium">
                    {log.userName}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg ${getActionBadgeClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg ${getResourceBadgeClass(log.resourceType)}`}>
                      {log.resourceType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-100">
                    <div className="max-w-md">
                      <p className="font-semibold">{log.resourceName}</p>
                      <p className="text-text-200 text-xs">{log.details}</p>
                    </div>
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRows.has(log.id) && (log.beforeData || log.afterData) && (
                  <tr key={`${log.id}-expanded`} className="bg-bg-100">
                    <td colSpan="6" className="px-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                        {/* Before Data */}
                        {log.beforeData && (
                          <div>
                            <h4 className="text-xs font-semibold text-text-100 uppercase mb-2">
                              Before
                            </h4>
                            <pre className="bg-white p-3 rounded-lg border border-bg-300 text-xs overflow-x-auto text-text-100">
                              {JSON.stringify(log.beforeData, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* After Data */}
                        {log.afterData && (
                          <div>
                            <h4 className="text-xs font-semibold text-text-100 uppercase mb-2">
                              After
                            </h4>
                            <pre className="bg-white p-3 rounded-lg border border-bg-300 text-xs overflow-x-auto text-text-100">
                              {JSON.stringify(log.afterData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;
