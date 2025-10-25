import { useState, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';

const MenuItemSelector = ({ selectedItemIds, onChange }) => {
  const { items } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const activeItems = items.filter(item => item.isActive);

  const filteredItems = useMemo(() => {
    return activeItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeItems, searchTerm]);

  const toggleItem = (itemId) => {
    if (selectedItemIds.includes(itemId)) {
      onChange(selectedItemIds.filter(id => id !== itemId));
    } else {
      onChange([...selectedItemIds, itemId]);
    }
  };

  const removeItem = (itemId) => {
    onChange(selectedItemIds.filter(id => id !== itemId));
  };

  const selectedItems = items.filter(item => selectedItemIds.includes(item.id));

  return (
    <div className="space-y-4">
      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-100 mb-2">
            Selected Items ({selectedItems.length})
          </label>
          <div className="flex flex-wrap gap-2 p-3 bg-bg-100 rounded-lg border border-gray-200">
            {selectedItems.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-800 rounded-lg text-sm"
              >
                <span className="font-medium">{item.name}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-text-100 mb-2">
          Add Items
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Available Items */}
      <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No items found' : 'No active items available'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredItems.map(item => {
              const isSelected = selectedItemIds.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-bg-100 transition-colors ${
                    isSelected ? 'bg-primary-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItem(item.id)}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
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
                    <span className="text-sm font-semibold text-primary-600">
                      ৳ {item.price.toFixed(2)}
                    </span>
                    {isSelected && (
                      <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
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
