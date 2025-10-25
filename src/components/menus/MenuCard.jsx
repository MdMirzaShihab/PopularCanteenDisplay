import { Edit2, Trash2, UtensilsCrossed } from 'lucide-react';
import { useData } from '../../context/DataContext';

const MenuCard = ({ menu, onEdit, onDelete }) => {
  const { getItemsByIds } = useData();
  const menuItems = getItemsByIds(menu.itemIds);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-bg-300 hover:border-accent-100">
      {/* Preview Images */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
        {menuItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 h-full p-2">
            {menuItems.slice(0, 4).map((item, idx) => (
              <div key={idx} className="bg-bg-200 rounded-lg overflow-hidden group/item">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <UtensilsCrossed className="w-16 h-16 text-white opacity-50" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {/* Item Count Badge */}
        <div className="absolute bottom-2 right-2">
          <div className="bg-gradient-to-br from-accent-100 to-accent-200 text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
            <span className="text-xs font-bold">{menuItems.length} items</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-text-100 mb-2 group-hover:text-primary-100 transition-colors line-clamp-1">{menu.title}</h3>
        <p className="text-sm text-text-100 mb-4 line-clamp-2 leading-relaxed">{menu.description}</p>

        {/* Item Names Preview */}
        {menuItems.length > 0 && (
          <div className="mb-4 pt-3 border-t border-bg-300">
            <p className="text-xs font-semibold text-text-200 uppercase tracking-wide mb-1">Menu Items</p>
            <p className="text-xs text-text-200 line-clamp-2 italic">
              {menuItems.map(item => item.name).join(', ')}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit(menu)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-200 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(menu)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-accent-200 bg-accent-200/10 rounded-lg hover:bg-accent-200/20 transition-all duration-200 border border-transparent hover:border-accent-200"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>

        {/* Hover indicator */}
        <div className="mt-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-1 w-16 bg-gradient-to-r from-accent-100 to-accent-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
