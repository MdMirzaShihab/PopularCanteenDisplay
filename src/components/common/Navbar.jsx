import { LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hospitalLogo } from '../../assets';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-bg-300 px-4 py-3 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-bg-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-text-200" />
          </button>

          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1.5 border border-bg-300">
              <img
                src={hospitalLogo}
                alt="Popular Medical College Hospital"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-text-100">Popular Medical College Hospital</h1>
              <p className="text-xs text-text-200">Canteen Management System</p>
            </div>
            <div className="md:hidden">
              <h1 className="text-base font-bold text-text-100">PMCH</h1>
              <p className="text-xs text-text-200">Canteen</p>
            </div>
          </div>
        </div>

        {/* User Info and Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-bg-200 rounded-lg">
            <User className="w-4 h-4 text-text-200" />
            <div className="text-sm">
              <p className="font-medium text-text-100">{user?.name}</p>
              <p className="text-xs text-text-200 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent-200 hover:bg-accent-100 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
