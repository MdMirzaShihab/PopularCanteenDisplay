import { isVideoUrl } from '../../utils/fileUtils';
import { Sparkles } from 'lucide-react';

const MenuItemDisplay = ({ item, showPrices, showIngredients, layoutStyle }) => {
  if (layoutStyle === 'list') {
    return (
      <div className="group flex items-center gap-4 bg-bg-200/60 backdrop-blur-3xl rounded-xl p-2 lg:p-3 shadow-md hover:shadow-2xl transition-all duration-300 border border-bg-300 hover:border-accent-100">
        {/* Image */}
        <div className="flex-shrink-0 w-24 h-24 lg:w-28 lg:h-28 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
          {item.image && (
            isVideoUrl(item.image) ? (
              <video
                src={item.image}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                muted
                loop
                autoPlay
              />
            ) : (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            )
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-text-100 mb-1 group-hover:text-primary-100 transition-colors line-clamp-1">
            {item.name}
          </h3>
          {showIngredients && item.ingredients && (
            <div className="flex items-start gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-accent-100 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-text-200 italic line-clamp-1">{item.ingredients}</p>
            </div>
          )}
          <p className="text-sm text-text-100 leading-relaxed line-clamp-2">{item.description}</p>
        </div>

        {/* Price */}
        {showPrices && (
          <div className="flex-shrink-0 text-right">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 text-white px-4 py-2 rounded-lg shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-90 mb-0.5">Price</p>
              <span className="text-2xl font-black">৳ {item.price.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Grid layout - Premium Card Design (Optimized for 55" displays)
  return (
    <div className="group bg-bg-200/60 backdrop-blur-3xl rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-bg-300 hover:border-accent-100">
      {/* Image Container - Responsive height */}
      <div className="relative h-24 xl:h-32 bg-gradient-to-br from-bg-100 to-bg-200 overflow-hidden">
        {item.image && (
          isVideoUrl(item.image) ? (
            <video
              src={item.image}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              muted
              loop
              autoPlay
            />
          ) : (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          )
        )}

        {/* Overlay gradient for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {/* Price Badge - Responsive sizing */}
        {showPrices && (
          <div className="absolute top-2 right-2">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 text-white px-2.5 xl:px-3 py-1 xl:py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
              <span className="text-sm xl:text-base font-bold">৳ {item.price.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content - Responsive padding */}
      <div className="p-3 xl:p-4">
        <h3 className="text-xl xl:text-2xl font-bold text-text-100 mb-1.5 group-hover:text-primary-100 transition-colors line-clamp-1">
          {item.name}
        </h3>

        <p className="text-sm text-text-100 mb-2 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {showIngredients && item.ingredients && (
          <div className="pt-2 border-t border-bg-300">
            <div className="flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-100 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-text-200 uppercase tracking-wide mb-0.5">Ingredients</p>
                <p className="text-xs text-text-200 line-clamp-2 italic">{item.ingredients}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hover indicator - Reduced margin */}
        <div className="mt-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-1 w-16 bg-gradient-to-r from-accent-100 to-accent-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDisplay;
