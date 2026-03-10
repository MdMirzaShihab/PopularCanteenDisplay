import React, { useState, useEffect, useRef } from 'react';
import { isVideoUrl } from '../../../utils/fileUtils';

const ITEM_HEIGHT = 72;

const ElegantRenderer = React.memo(({ items, showPrices = true }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const { height } = entries[0].contentRect;
      const rows = Math.floor(height / (ITEM_HEIGHT + 8)) || 1;
      setItemsPerPage(Math.max(1, rows));
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
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col overflow-hidden"
    >
      <div className="flex-1 flex flex-col gap-2 px-4 py-2 overflow-hidden">
        {pageItems.map(item => (
          <div
            key={item.id}
            className="flex items-center gap-4 px-4 rounded-xl"
            style={{
              height: `${ITEM_HEIGHT}px`,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(212,175,55,0.1)'
            }}
          >
            {item.image && (
              <div
                className="w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden"
                style={{
                  border: '1px solid rgba(212,175,55,0.25)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}
              >
                {isVideoUrl(item.image) ? (
                  <video src={item.image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-body text-sm font-bold truncate drop-shadow-sm">{item.name}</p>
              {item.ingredients && (
                <p className="text-white/60 text-xs font-body truncate mt-0.5">{item.ingredients}</p>
              )}
            </div>
            {showPrices && (
              <span
                className="font-heading font-bold text-lg flex-shrink-0 tabular-nums tracking-wide"
                style={{ color: '#f0d060' }}
              >
                ৳{item.price.toFixed(0)}
              </span>
            )}
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
                backgroundColor: i === currentPage ? '#f0d060' : 'rgba(240,208,96,0.2)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default ElegantRenderer;
