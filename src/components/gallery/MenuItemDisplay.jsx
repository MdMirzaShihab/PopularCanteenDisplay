import { isVideoUrl } from '../../utils/fileUtils';

const MenuItemDisplay = ({ item, showPrices }) => {
  // Circular Image Card Design - Inspired by the reference image
  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 h-full flex flex-col p-4 xl:p-6">
      {/* Circular Image Container with Decorative Border */}
      <div className="relative mx-auto mb-4 flex-shrink-0">
        {/* Outer decorative ring */}
        <div className="relative w-32 h-32 xl:w-40 xl:h-40">
          {/* Border ring effect */}
          <div className="absolute inset-0 rounded-full border-4 border-green-100 group-hover:border-green-300 transition-colors duration-300"></div>
          
          {/* Image circle */}
          <div className="absolute inset-2 rounded-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner">
            {item.image && (
              isVideoUrl(item.image) ? (
                <video
                  src={item.image}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              )
            )}
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
          </div>
        </div>

        {/* Price Badge - Positioned on top right of circle */}
        {showPrices && (
          <div className="absolute -top-2 -right-2 xl:-top-3 xl:-right-3">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-3 py-1.5 xl:px-4 xl:py-2 rounded-full shadow-lg">
              <span className="text-sm xl:text-base font-bold font-heading">৳{item.price.toFixed(0)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col text-center">
        {/* Green decorative line - matching the reference image */}
        <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-green-500 mx-auto mb-3 rounded-full"></div>
        
        <h3 className="text-lg xl:text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors break-words font-display leading-tight px-2">
          {item.name}
        </h3>
        
        {/* Description lines - subtle and minimal like the reference */}
        <div className="space-y-1 mb-2">
          <div className="h-0.5 bg-gray-200 w-3/4 mx-auto rounded"></div>
          <div className="h-0.5 bg-gray-200 w-2/3 mx-auto rounded"></div>
          <div className="h-0.5 bg-gray-200 w-1/2 mx-auto rounded"></div>
        </div>
        
        <p className="text-xs xl:text-sm text-gray-600 line-clamp-2 leading-relaxed font-body px-2">
          {item.description}
        </p>
      </div>
    </div>
  );
};

export default MenuItemDisplay;