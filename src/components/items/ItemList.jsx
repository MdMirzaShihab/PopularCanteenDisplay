import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import ItemCard from './ItemCard';

const ItemList = ({ items, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Active filter
      const matchesActive = filterActive === 'all' ||
                           (filterActive === 'active' && item.isActive) ||
                           (filterActive === 'inactive' && !item.isActive);

      return matchesSearch && matchesActive;
    });
  }, [items, searchTerm, filterActive]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Active Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterActive('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterActive === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-bg-100 text-text-100 hover:bg-bg-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterActive === 'active'
                ? 'bg-primary-600 text-white'
                : 'bg-bg-100 text-text-100 hover:bg-bg-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterActive === 'inactive'
                ? 'bg-primary-600 text-white'
                : 'bg-bg-100 text-text-100 hover:bg-bg-200'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-text-200">
        Showing {filteredItems.length} of {items.length} items
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemList;
