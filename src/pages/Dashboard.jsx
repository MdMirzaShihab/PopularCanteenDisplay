import { Link } from 'react-router-dom';
import { UtensilsCrossed, BookOpen, Monitor, Activity, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const { items, menus, schedules, screens, activityLogs } = useData();

  const stats = [
    { label: 'Total Items', value: items.length, icon: UtensilsCrossed, color: 'bg-primary-100', link: '/items' },
    { label: 'Menus', value: menus.length, icon: BookOpen, color: 'bg-primary-200', link: '/menus' },
    { label: 'Schedules', value: schedules.length, icon: Activity, color: 'bg-accent-100', link: '/schedules' },
    { label: 'Screens', value: screens.length, icon: Monitor, color: 'bg-accent-200', link: '/screens' },
  ];

  // Filter activity logs to show only current user's activity
  const recentLogs = activityLogs
    .filter(log => log.userId === user?.id)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-200 to-primary-300 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-bg-100">
          Manage your canteen operations efficiently with our demo system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 border border-bg-300 hover:border-primary-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-text-100">{stat.value}</span>
              </div>
              <p className="text-sm font-medium text-text-200">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-text-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/items"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-bg-300 hover:border-primary-100"
          >
            <div className="w-10 h-10 bg-primary-100/20 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary-100" />
            </div>
            <span className="font-medium text-text-100">Add New Item</span>
          </Link>

          <Link
            to="/menus"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-bg-300 hover:border-primary-200"
          >
            <div className="w-10 h-10 bg-primary-200/20 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary-200" />
            </div>
            <span className="font-medium text-text-100">Create Menu</span>
          </Link>

          <Link
            to="/schedules"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-bg-300 hover:border-accent-100"
          >
            <div className="w-10 h-10 bg-accent-100/20 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-accent-100" />
            </div>
            <span className="font-medium text-text-100">New Schedule</span>
          </Link>

          <Link
            to="/gallery"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-bg-300 hover:border-accent-200"
          >
            <div className="w-10 h-10 bg-accent-200/20 rounded-lg flex items-center justify-center">
              <Monitor className="w-5 h-5 text-accent-200" />
            </div>
            <span className="font-medium text-text-100">View Gallery</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-100">My Recent Activity</h2>
          <Link to="/logs" className="text-sm text-primary-100 hover:text-primary-200 font-medium">
            View All
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-bg-300">
          {recentLogs.length === 0 ? (
            <div className="p-8 text-center text-text-200">
              No recent activity
            </div>
          ) : (
            <div className="divide-y divide-bg-300">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-bg-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-lg ${
                          log.action === 'CREATE' ? 'bg-primary-100/20 text-primary-100 border border-primary-100' :
                          log.action === 'UPDATE' ? 'bg-primary-200/20 text-primary-200 border border-primary-200' :
                          log.action === 'DELETE' ? 'bg-accent-200/20 text-accent-200 border border-accent-200' :
                          'bg-bg-300/20 text-text-100 border border-bg-300'
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-xs font-medium text-text-200">{log.resourceType}</span>
                      </div>
                      <p className="text-sm font-medium text-text-100">{log.resourceName}</p>
                      <p className="text-xs text-text-200 mt-1">{log.details}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-text-200">
                        {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
