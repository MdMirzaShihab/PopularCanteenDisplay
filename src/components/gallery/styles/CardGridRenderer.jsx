import React, { useState, useEffect, useRef } from 'react';
import { isVideoUrl } from '../../../utils/fileUtils';

const MIN_CARD_WIDTH = 200;
const CARD_HEIGHT = 120;

const CardGridRenderer = React.memo(({ items, showPrices = true }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(6);

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
            className="rounded-xl flex items-center gap-3 px-3 py-2.5"
            style={{
              height: `${CARD_HEIGHT}px`,
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {item.image && (
              <div
                className="w-[70px] h-[70px] flex-shrink-0 rounded-xl overflow-hidden"
                style={{ boxShadow: '0 3px 12px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {isVideoUrl(item.image) ? (
                  <video src={item.image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                )}
              </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="font-semibold text-white/90 text-sm font-body leading-snug line-clamp-2">{item.name}</p>
              {item.ingredients && (
                <p className="text-white/30 text-[10px] font-body truncate mt-0.5 italic">{item.ingredients}</p>
              )}
              {showPrices && (
                <p className="font-heading font-bold text-base mt-1 tracking-wide" style={{ color: '#6ee7b7' }}>
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

export default CardGridRenderer;
