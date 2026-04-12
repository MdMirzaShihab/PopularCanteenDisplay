import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import MenuCard from './MenuCard';

const MenuList = ({ menus, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const filteredMenus = useMemo(() => {
    return menus.filter(menu => {
      const matchesSearch = menu.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           menu.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesActive = filterActive === 'all' ||
                           (filterActive === 'active' && menu.isActive !== false) ||
                           (filterActive === 'inactive' && menu.isActive === false);

      return matchesSearch && matchesActive;
    });
  }, [menus, searchTerm, filterActive]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-300" />
          <input
            type="text"
            placeholder="Search menus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Active Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterActive('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterActive === 'all'
                ? 'bg-primary-100 text-white'
                : 'bg-bg-100 text-text-100 hover:bg-bg-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterActive === 'active'
                ? 'bg-primary-100 text-white'
                : 'bg-bg-100 text-text-100 hover:bg-bg-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterActive === 'inactive'
                ? 'bg-primary-100 text-white'
                : 'bg-bg-100 text-text-100 hover:bg-bg-200'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-text-200">
        Showing {filteredMenus.length} of {menus.length} menus
      </div>

      {/* Menus Grid */}
      {filteredMenus.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-200">No menus found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenus.map(menu => (
            <MenuCard
              key={menu._id}
              menu={menu}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuList;
