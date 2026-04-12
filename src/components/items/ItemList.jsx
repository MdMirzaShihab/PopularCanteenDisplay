import { Search } from 'lucide-react';
import ItemCard from './ItemCard';
import SearchableSelect from '../common/SearchableSelect';
import { ITEM_CATEGORIES } from '../../utils/constants';

const ItemList = ({
  items,
  loading,
  search,
  category,
  isActive,
  onSearchChange,
  onCategoryChange,
  onIsActiveChange,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-300" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="w-48">
          <SearchableSelect
            value={category}
            onChange={onCategoryChange}
            options={ITEM_CATEGORIES}
            placeholder="All Categories"
          />
        </div>

        {/* Active Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => onIsActiveChange('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive === 'all'
                ? 'bg-primary-100 text-white'
                : 'bg-bg-100 text-text-100 hover:bg-bg-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onIsActiveChange('active')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive === 'active'
                ? 'bg-primary-100 text-white'
                : 'bg-bg-100 text-text-100 hover:bg-bg-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => onIsActiveChange('inactive')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive === 'inactive'
                ? 'bg-primary-100 text-white'
                : 'bg-bg-100 text-text-100 hover:bg-bg-200'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-text-200">Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-200">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <ItemCard
              key={item._id}
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
