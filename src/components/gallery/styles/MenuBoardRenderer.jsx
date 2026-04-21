import React, { useState, useEffect, useRef } from 'react';
import { usePageCrossfade } from '../../../hooks/usePageCrossfade';
import {
  getItemSizeClass,
  getPriceSizeClass,
  getItemHeight,
  effectiveRowSize,
} from '../themes/typographyRegistry';

const VISUAL_STYLE_ID = 'menu-board';
const STAGGER_MS = 60;
const EXIT_DURATION = 520;

// Rotating neon accents — vaporwave palette. One hue per row, cycling every 3 rows.
const NEON_HUES = [
  { line: '#5eead4', text: '#67e8f9', glow: 'rgba(94,234,212,0.5)'  }, // cyan
  { line: '#f472b6', text: '#f9a8d4', glow: 'rgba(244,114,182,0.5)' }, // pink
  { line: '#fbbf24', text: '#fde68a', glow: 'rgba(251,191,36,0.5)'  }, // amber
];

const MenuBoardRenderer = React.memo(({ items, showPrices = true, itemFont, itemColor, itemSize, priceFont, priceColor, priceSize }) => {
  const itemSizeClass = getItemSizeClass(VISUAL_STYLE_ID, itemSize);
  const priceSizeClass = getPriceSizeClass(VISUAL_STYLE_ID, priceSize);
  const effSize = effectiveRowSize(itemSize, priceSize);
  const itemHeight = getItemHeight(VISUAL_STYLE_ID, effSize);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const { height } = entries[0].contentRect;
      const rows = Math.floor(height / (itemHeight + 6)) || 1;
      setItemsPerPage(Math.max(1, rows));
      setCurrentPage(0);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [itemHeight]);

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
  const { activePage, prevPage, transitionKey } = usePageCrossfade(currentPage, EXIT_DURATION);
  const sliceFor = (p) => items.slice(p * itemsPerPage, (p + 1) * itemsPerPage);
  const activeItems = sliceFor(activePage);
  const prevItems = prevPage !== null ? sliceFor(prevPage) : [];
  const priceColorOverride = priceColor;

  const renderRow = (item, idx) => {
    const hue = NEON_HUES[idx % NEON_HUES.length];
    const resolvedPriceColor = priceColorOverride || hue.text;
    return (
      <div
        className="relative flex items-center gap-3 pl-6 pr-3 overflow-hidden tv-glass-fallback"
        style={{
          height: `${itemHeight}px`,
          borderRadius: '12px',
          background: idx % 2 === 0
            ? 'linear-gradient(90deg, rgba(12,10,24,0.72) 0%, rgba(18,14,30,0.58) 100%)'
            : 'linear-gradient(90deg, rgba(16,14,28,0.55) 0%, rgba(22,18,34,0.42) 100%)',
          backdropFilter: 'blur(14px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(14px) saturate(1.3)',
          boxShadow: `0 2px 12px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}
      >
        <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full pointer-events-none" style={{
          background: hue.line,
          boxShadow: `0 0 8px ${hue.glow}, 0 0 16px ${hue.glow}`,
        }} />

        <div className="flex-shrink-0 w-2 h-2 rounded-full" style={{
          background: hue.line,
          boxShadow: `0 0 6px ${hue.glow}, 0 0 14px ${hue.glow}`,
        }} />

        <span
          className={`${itemFont || 'font-handwritten'} ${itemSizeClass} font-black flex-1 truncate`}
          style={{
            color: itemColor || '#ffffff',
            textShadow: `0 1px 4px rgba(0,0,0,0.65), 0 0 12px ${hue.glow}`,
          }}
        >{item.name}</span>

        <div className="flex-1 mx-2 self-end mb-[0.35em]" style={{
          borderBottom: `2px dotted ${hue.line}`,
          opacity: 0.45,
          minWidth: '20px',
          maxWidth: '140px',
        }} />

        {showPrices && (
          <div className="flex-shrink-0 px-3 py-1 rounded-full" style={{
            background: 'rgba(0,0,0,0.55)',
            border: `1px solid ${hue.line}`,
            boxShadow: `0 0 14px -2px ${hue.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}>
            <span
              className={`${priceFont || 'font-marker'} ${priceSizeClass} font-black tabular-nums`}
              style={{
                color: resolvedPriceColor,
                textShadow: `0 0 8px ${hue.glow}`,
              }}
            >৳{item.price.toFixed(0)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col overflow-hidden">
      <div className="relative flex-1 min-h-0">
        {prevPage !== null && (
          <div
            key={`prev-${prevPage}`}
            className="absolute inset-0 flex flex-col gap-1.5 px-4 py-2 overflow-hidden menu-page-exit"
          >
            {prevItems.map((item, idx) => (
              <div key={item._id}>{renderRow(item, idx)}</div>
            ))}
          </div>
        )}
        <div
          key={`active-${transitionKey}`}
          className="absolute inset-0 flex flex-col gap-1.5 px-4 py-2 overflow-hidden"
        >
          {activeItems.map((item, idx) => (
            <div
              key={item._id}
              className="menu-item-slide-l"
              style={{ animationDelay: `${idx * STAGGER_MS}ms` }}
            >
              {renderRow(item, idx)}
            </div>
          ))}
        </div>
        {totalPages > 1 && transitionKey > 0 && (
          <div
            key={`sweep-${transitionKey}`}
            className="absolute inset-0 overflow-hidden pointer-events-none"
            aria-hidden="true"
          >
            <div
              className="absolute top-[-6%] bottom-[-6%] w-[54%] menu-sweep-animate"
              style={{
                left: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(94,234,212,0.22) 30%, rgba(244,114,182,0.26) 55%, rgba(251,191,36,0.22) 80%, transparent 100%)',
                filter: 'blur(20px)',
                transform: 'translate3d(-110%,0,0) skewX(-16deg)',
                mixBlendMode: 'screen',
              }}
            />
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 py-2.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 ${i === currentPage ? 'menu-dot-pulse' : ''}`}
              style={{
                width: i === currentPage ? '22px' : '6px',
                height: '4px',
                background: i === currentPage
                  ? 'linear-gradient(90deg, #5eead4 0%, #f472b6 50%, #fbbf24 100%)'
                  : 'rgba(255,255,255,0.22)',
                boxShadow: i === currentPage ? '0 0 10px rgba(244,114,182,0.5)' : 'none',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default MenuBoardRenderer;
