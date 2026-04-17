import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Check } from 'lucide-react';
import { useItems } from '../../hooks/useItems';
import { useCategories } from '../../hooks/useCategories';
import SearchableSelect from '../common/SearchableSelect';

const MenuItemSelector = ({ selectedItemIds, initialItems = [], onChange }) => {
  const { categories } = useCategories();
  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories]);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Server-side filtered items for browsing (active items only)
  const { items, loading } = useItems({
    search: debouncedSearch,
    category,
    isActive: 'active',
    limit: 50,
  });

  // Cache selected item objects for chip display (survives filter changes)
  const selectedCacheRef = useRef({});

  // Initialize cache from initialItems (when editing an existing menu)
  useEffect(() => {
    const cache = {};
    initialItems.forEach(item => {
      if (item && typeof item === 'object' && item._id) {
        cache[item._id] = item;
      }
    });
    selectedCacheRef.current = cache;
  }, [initialItems]);

  // Update cache when new items load that are in the selected list
  useEffect(() => {
    items.forEach(item => {
      if (selectedItemIds.includes(item._id)) {
        selectedCacheRef.current[item._id] = item;
      }
    });
  }, [items, selectedItemIds]);

  const toggleItem = (item) => {
    if (selectedItemIds.includes(item._id)) {
      onChange(selectedItemIds.filter(id => id !== item._id));
      delete selectedCacheRef.current[item._id];
    } else {
      onChange([...selectedItemIds, item._id]);
      selectedCacheRef.current[item._id] = item;
    }
  };

  const removeItem = (itemId) => {
    onChange(selectedItemIds.filter(id => id !== itemId));
    delete selectedCacheRef.current[itemId];
  };

  const selectedItems = selectedItemIds
    .map(id => selectedCacheRef.current[id])
    .filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-100 mb-2">
            Selected Items ({selectedItems.length})
          </label>
          <div className="flex flex-wrap gap-2 p-3 bg-bg-100 rounded-lg border border-bg-300">
            {selectedItems.map(item => (
              <div
                key={item._id}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-white rounded-lg text-sm"
              >
                <span className="font-medium">{item.name}</span>
                <button
                  onClick={() => removeItem(item._id)}
                  className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + Category Filter */}
      <div>
        <label className="block text-sm font-medium text-text-100 mb-2">
          Add Items
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-300" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="w-48">
            <SearchableSelect
              value={category}
              onChange={setCategory}
              options={categoryNames}
              placeholder="All Categories"
            />
          </div>
        </div>
      </div>

      {/* Available Items */}
      <div className="border border-bg-300 rounded-lg max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-text-200">
            Loading items...
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-text-200">
            {searchTerm || category ? 'No items found' : 'No active items available'}
          </div>
        ) : (
          <div className="divide-y divide-bg-300">
            {items.map(item => {
              const isSelected = selectedItemIds.includes(item._id);
              return (
                <label
                  key={item._id}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-bg-100 transition-colors ${
                    isSelected ? 'bg-primary-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItem(item)}
                    className="w-5 h-5 text-primary-100 border-bg-300 rounded focus:ring-primary-100"
                  />

                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-100">{item.name}</p>
                    <p className="text-sm text-text-200 truncate">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.category && (
                      <span className="text-xs text-primary-200 bg-primary-100/15 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-primary-100">
                      ৳ {item.price.toFixed(0)}
                    </span>
                    {isSelected && (
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemSelector;
