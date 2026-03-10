import React, { useState, useEffect, useRef } from 'react';
import { isVideoUrl } from '../../../utils/fileUtils';

const MIN_CARD_WIDTH = 200;
const CARD_HEIGHT = 180;

const CatalogRenderer = React.memo(({ items, showPrices = true }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      const cols = Math.floor(width / MIN_CARD_WIDTH) || 1;
      const rows = Math.floor((height + 12) / (CARD_HEIGHT + 12)) || 1;
      setItemsPerPage(Math.max(1, cols * rows));
      setCurrentPage(0);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    if (totalPages <= 1) {
      setCurrentPage(0);
      return;
    }
    const timer = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % totalPages);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length, itemsPerPage]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const pageItems = items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col">
      <div className="flex-1 grid gap-3 content-start p-1" style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${MIN_CARD_WIDTH}px, 1fr))`
      }}>
        {pageItems.map(item => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-xl"
            style={{
              height: `${CARD_HEIGHT}px`,
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
            }}
          >
            {item.image ? (
              isVideoUrl(item.image) ? (
                <video src={item.image} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
              )
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
            )}
            {/* Gradient overlay — stronger for readability */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.2) 60%, transparent 100%)'
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
              <p
                className="text-white font-display font-black text-lg leading-snug"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
              >
                {item.name}
              </p>
              {showPrices && (
                <p
                  className="font-heading font-black text-xl mt-1"
                  style={{ color: '#6ee7b7', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
                >
                  ৳{item.price.toFixed(0)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-2.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentPage ? '24px' : '8px',
                height: '8px',
                backgroundColor: i === currentPage ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default CatalogRenderer;
