import React, { useState, useEffect, useRef } from 'react';

const ITEM_HEIGHT = 44;

const CompactRenderer = React.memo(({ items, showPrices = true }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      const cols = width >= 300 ? 2 : 1;
      const rows = Math.floor(height / (ITEM_HEIGHT + 6)) || 1;
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
      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5 content-start px-3 py-2">
        {pageItems.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center px-4 rounded-xl"
            style={{
              height: `${ITEM_HEIGHT}px`,
              background: index % 2 === 0 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)',
              borderLeft: '3px solid rgba(255,255,255,0.2)'
            }}
          >
            <span
              className="text-white text-base font-body font-black truncate flex-1 mr-2"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
            >
              {item.name}
            </span>
            {showPrices && (
              <>
                <div
                  className="flex-1 mx-1"
                  style={{ borderBottom: '2px dotted rgba(255,255,255,0.25)', minWidth: '16px', maxWidth: '60px' }}
                />
                <span
                  className="text-white font-heading text-lg font-black flex-shrink-0 tabular-nums"
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                >
                  ৳{item.price.toFixed(0)}
                </span>
              </>
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
                backgroundColor: i === currentPage ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default CompactRenderer;
