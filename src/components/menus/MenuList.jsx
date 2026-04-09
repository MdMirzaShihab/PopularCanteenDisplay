import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import MenuCard from './MenuCard';

const MenuList = ({ menus, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMenus = useMemo(() => {
    return menus.filter(menu =>
      menu.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menus, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-300" />
        <input
          type="text"
          placeholder="Search menus..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
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
