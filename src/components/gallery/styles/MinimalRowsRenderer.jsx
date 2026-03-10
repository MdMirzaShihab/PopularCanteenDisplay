import React, { useState, useEffect, useRef } from 'react';
import { isVideoUrl } from '../../../utils/fileUtils';

const ITEM_HEIGHT = 56;

const MinimalRowsRenderer = React.memo(({ items, showPrices = true }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const { height } = entries[0].contentRect;
      const rows = Math.floor(height / (ITEM_HEIGHT + 6)) || 1;
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
    <div ref={containerRef} className="w-full h-full flex flex-col">
      <div className="flex-1 flex flex-col gap-1.5 px-3 py-2 overflow-hidden">
        {pageItems.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-4 rounded-xl"
            style={{
              height: `${ITEM_HEIGHT}px`,
              background: idx % 2 === 0 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)',
              borderLeft: '3px solid rgba(143,151,121,0.6)'
            }}
          >
            {item.image && (
              <div
                className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {isVideoUrl(item.image) ? (
                  <video src={item.image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p
                className="text-white font-body text-base font-black truncate"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
              >
                {item.name}
              </p>
            </div>
            {showPrices && (
              <span
                className="text-white font-heading font-black text-lg flex-shrink-0 tabular-nums"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
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
                backgroundColor: i === currentPage ? '#8F9779' : 'rgba(143,151,121,0.25)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default MinimalRowsRenderer;
