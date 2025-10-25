import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  BookOpen,
  Clock,
  Monitor,
  Image as ImageIcon,
  FileText,
  ChefHat,
  Hash,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin, isTokenOperator } = useAuth();

  // Define all available navigation items
  const allNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'restaurant_user'] },
    { path: '/current-menu', icon: ChefHat, label: 'Current Menu', roles: ['admin', 'restaurant_user'] },
    { path: '/token', icon: Hash, label: 'Token Display', roles: ['admin', 'restaurant_user', 'token_operator'] },
    { path: '/items', icon: UtensilsCrossed, label: 'Items', roles: ['admin', 'restaurant_user'] },
    { path: '/menus', icon: BookOpen, label: 'Menus', roles: ['admin', 'restaurant_user'] },
    { path: '/schedules', icon: Clock, label: 'Schedule', roles: ['admin', 'restaurant_user'] },
    { path: '/screens', icon: Monitor, label: 'Screens', roles: ['admin', 'restaurant_user'] },
    { path: '/gallery', icon: ImageIcon, label: 'Gallery', roles: ['admin', 'restaurant_user'] },
    { path: '/logs', icon: FileText, label: 'Activity Logs', roles: ['admin'] },
  ];

  // Filter navigation items based on user role
  const navItems = isTokenOperator()
    ? allNavItems.filter(item => item.roles.includes('token_operator'))
    : isAdmin()
    ? allNavItems.filter(item => item.roles.includes('admin'))
    : allNavItems.filter(item => item.roles.includes('restaurant_user'));

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-[70px] left-0 h-[calc(100vh-70px)] w-64 bg-white border-r border-bg-300 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-bg-300">
            <h2 className="font-semibold text-text-100">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-bg-100 transition-colors"
            >
              <X className="w-5 h-5 text-text-200" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-100 text-white font-medium'
                            : 'text-text-100 hover:bg-bg-200'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-bg-300">
            <div className="bg-bg-100 rounded-lg p-3">
              <p className="text-xs font-medium text-primary-100">Demo Mode</p>
              <p className="text-xs text-text-200 mt-1">
                All data is stored locally and will persist across sessions.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
