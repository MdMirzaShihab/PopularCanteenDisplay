import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ActivityTable from '../components/logs/ActivityTable';
import LogFilters from '../components/logs/LogFilters';

const LogsPage = () => {
  const { isAdmin } = useAuth();
  const { getActivityLogs } = useData();
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  // Redirect if not admin
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    // Load logs with current filters
    const logs = getActivityLogs(activeFilters);
    setFilteredLogs(logs);
  }, [activeFilters, getActivityLogs]);

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-100">Activity Logs</h1>
        <p className="text-text-200 mt-1">
          View all system activities and changes (Admin Only)
        </p>
      </div>

      {/* Filters */}
      <LogFilters onApplyFilters={handleApplyFilters} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-bg-200/60 backdrop-blur-3xl rounded-2xl shadow-sm p-4 border-2 border-bg-300 hover:shadow-md transition-all duration-200">
          <p className="text-sm text-text-200 font-medium">Total Logs</p>
          <p className="text-3xl font-bold text-text-100 mt-2">{filteredLogs.length}</p>
        </div>
        <div className="bg-bg-200/60 backdrop-blur-3xl rounded-2xl shadow-sm p-4 border-2 border-bg-300 hover:shadow-md transition-all duration-200">
          <p className="text-sm text-text-200 font-medium">Create Actions</p>
          <p className="text-3xl font-bold text-primary-100 mt-2">
            {filteredLogs.filter(log => log.action === 'CREATE').length}
          </p>
        </div>
        <div className="bg-bg-200/60 backdrop-blur-3xl rounded-2xl shadow-sm p-4 border-2 border-bg-300 hover:shadow-md transition-all duration-200">
          <p className="text-sm text-text-200 font-medium">Update Actions</p>
          <p className="text-3xl font-bold text-primary-200 mt-2">
            {filteredLogs.filter(log => log.action === 'UPDATE').length}
          </p>
        </div>
        <div className="bg-bg-200/60 backdrop-blur-3xl rounded-2xl shadow-sm p-4 border-2 border-bg-300 hover:shadow-md transition-all duration-200">
          <p className="text-sm text-text-200 font-medium">Delete Actions</p>
          <p className="text-3xl font-bold text-accent-200 mt-2">
            {filteredLogs.filter(log => log.action === 'DELETE').length}
          </p>
        </div>
      </div>

      {/* Activity Table */}
      <ActivityTable logs={filteredLogs} />
    </div>
  );
};

export default LogsPage;
