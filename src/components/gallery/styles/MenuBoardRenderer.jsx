import React, { useState, useEffect, useRef } from 'react';

const ITEM_HEIGHT = 46;

const MenuBoardRenderer = React.memo(({ items, showPrices = true }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col overflow-hidden"
    >
      <div className="flex-1 flex flex-col gap-1.5 px-4 py-2 overflow-hidden">
        {pageItems.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-4 rounded-xl"
            style={{
              height: `${ITEM_HEIGHT}px`,
              background: idx % 2 === 0 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)',
              borderLeft: '3px solid rgba(245,215,120,0.5)'
            }}
          >
            <span
              className="text-white font-handwritten text-lg font-black flex-1 truncate"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}
            >
              {item.name}
            </span>
            <div
              className="flex-1 mx-2"
              style={{
                borderBottom: '2px dotted rgba(245,215,120,0.3)',
                minWidth: '20px',
                maxWidth: '120px'
              }}
            />
            {showPrices && (
              <span
                className="font-marker text-xl font-black flex-shrink-0 tabular-nums"
                style={{ color: '#f5d778', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
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
                backgroundColor: i === currentPage ? '#f5d778' : 'rgba(245,215,120,0.2)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default MenuBoardRenderer;
