import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import ScreenCard from './ScreenCard';

const ScreenList = ({ screens, onEdit, onDelete, onDuplicate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredScreens = useMemo(() => {
    return screens.filter(screen =>
      screen.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screen.scheduleName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [screens, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search screens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredScreens.length} of {screens.length} screens
      </div>

      {/* Screens Grid */}
      {filteredScreens.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No screens found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScreens.map(screen => (
            <ScreenCard
              key={screen.id}
              screen={screen}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ScreenList;
