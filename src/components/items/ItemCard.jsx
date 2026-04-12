import { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, UtensilsCrossed } from 'lucide-react';
import { isVideoUrl } from '../../utils/fileUtils';

const ItemCard = ({ item, onEdit, onDelete }) => {
  const [imgError, setImgError] = useState(false);
  const videoRef = useRef(null);
  const isVideo = item.image && isVideoUrl(item.image);

  // IntersectionObserver: only play video when card is visible
  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    const video = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isVideo]);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-bg-300 hover:border-accent-100">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-bg-100 to-bg-200 overflow-hidden">
        {item.image && !imgError ? (
          isVideo ? (
            <video
              ref={videoRef}
              src={item.image}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              muted
              loop
              playsInline
              onError={() => setImgError(true)}
            />
          ) : (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={() => setImgError(true)}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="w-12 h-12 text-text-300" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {/* Status Badge */}
        {!item.isActive && (
          <div className="absolute top-2 right-2 px-3 py-1.5 bg-accent-200 text-white text-xs font-semibold rounded-lg shadow-lg backdrop-blur-sm">
            Inactive
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-2 left-2">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
            <span className="text-base font-bold">৳ {item.price.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-text-100 mb-1 group-hover:text-primary-100 transition-colors line-clamp-1">{item.name}</h3>
        {item.category && (
          <span className="inline-block px-2 py-0.5 text-xs font-medium text-primary-200 bg-primary-100/15 rounded-full mb-2">
            {item.category}
          </span>
        )}
        <p className="text-sm text-text-100 mb-3 line-clamp-2 leading-relaxed">{item.description}</p>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-200 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(item)}
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

export default ItemCard;
