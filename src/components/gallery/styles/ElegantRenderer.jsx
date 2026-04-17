import React, { useState, useEffect, useRef } from 'react';
import { isVideoUrl } from '../../../utils/fileUtils';
import {
  getItemSizeClass,
  getPriceSizeClass,
  getItemHeight,
  getItemImageSize,
  effectiveRowSize,
} from '../themes/typographyRegistry';

const VISUAL_STYLE_ID = 'elegant';
const GOLD = 'rgba(212,175,55,';
const GOLD_BRIGHT = '#f0d060';

const TriangleOrnament = ({ position }) => {
  const isTop = position.startsWith('top');
  const isLeft = position.endsWith('left');
  return (
    <div className="absolute pointer-events-none" style={{
      [isTop ? 'top' : 'bottom']: 0,
      [isLeft ? 'left' : 'right']: 0,
      width: 0,
      height: 0,
      [isTop ? 'borderTop' : 'borderBottom']: `14px solid ${GOLD}0.4)`,
      [isLeft ? 'borderRight' : 'borderLeft']: '14px solid transparent',
    }} />
  );
};

const ElegantRenderer = React.memo(({ items, showPrices = true, itemFont, itemColor, itemSize, priceFont, priceColor, priceSize }) => {
  const itemSizeClass = getItemSizeClass(VISUAL_STYLE_ID, itemSize);
  const priceSizeClass = getPriceSizeClass(VISUAL_STYLE_ID, priceSize);
  const effSize = effectiveRowSize(itemSize, priceSize);
  const itemHeight = getItemHeight(VISUAL_STYLE_ID, effSize);
  const imageSize = getItemImageSize(VISUAL_STYLE_ID, effSize);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const { height } = entries[0].contentRect;
      const rows = Math.floor(height / (itemHeight + 8)) || 1;
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
  const pageItems = items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const resolvedPriceColor = priceColor || GOLD_BRIGHT;

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col gap-2 px-4 py-2 overflow-hidden">
        {pageItems.map(item => (
          <div
            key={item._id}
            className="relative flex items-center gap-4 px-5 overflow-hidden tv-glass-fallback"
            style={{
              height: `${itemHeight}px`,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(24,20,15,0.82) 0%, rgba(30,24,18,0.68) 100%)',
              backdropFilter: 'blur(16px) saturate(1.35)',
              WebkitBackdropFilter: 'blur(16px) saturate(1.35)',
              // Dual gold border: outer glow + inner hairline
              boxShadow: `0 0 0 1px ${GOLD}0.35), inset 0 0 0 3px transparent, inset 0 0 0 4px ${GOLD}0.18), 0 6px 18px rgba(0,0,0,0.28), inset 0 1px 0 ${GOLD}0.1)`,
            }}
          >
            <TriangleOrnament position="top-left" />
            <TriangleOrnament position="bottom-right" />

            {item.image && (
              <div className="flex-shrink-0 rounded-full overflow-hidden relative" style={{
                width: `${imageSize}px`,
                height: `${imageSize}px`,
                // Triple ring: gold outer + dark gap + gold inner shimmer
                boxShadow: `0 0 0 2px ${GOLD}0.55), 0 0 0 3px rgba(24,20,15,1), 0 0 0 4px ${GOLD}0.28), 0 0 18px -2px ${GOLD}0.4), 0 4px 12px rgba(0,0,0,0.35)`,
              }}>
                {isVideoUrl(item.image) ? (
                  <video src={item.image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className={`${itemFont || 'font-body'} ${itemSizeClass} font-bold truncate`} style={{
                color: itemColor || '#f5ecd9',
                letterSpacing: '0.045em',
                textShadow: '0 1px 3px rgba(0,0,0,0.45)',
              }}>{item.name}</p>
            </div>

            {/* Gold vertical divider with diamond accent */}
            <div className="relative flex-shrink-0 w-px self-stretch my-2.5" style={{
              background: `linear-gradient(180deg, transparent 0%, ${GOLD}0.6) 50%, transparent 100%)`,
            }}>
              <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45" style={{
                background: resolvedPriceColor,
                boxShadow: `0 0 6px ${GOLD}0.6)`,
              }} />
            </div>

            {showPrices && (
              <div className="flex-shrink-0 relative px-4 py-1">
                {/* Plaque: gold top/bottom lines */}
                <div className="absolute inset-x-0 top-0 h-[1px]" style={{
                  background: `linear-gradient(90deg, transparent 0%, ${GOLD}0.6) 50%, transparent 100%)`,
                }} />
                <div className="absolute inset-x-0 bottom-0 h-[1px]" style={{
                  background: `linear-gradient(90deg, transparent 0%, ${GOLD}0.6) 50%, transparent 100%)`,
                }} />
                <span className={`${priceFont || 'font-heading'} font-bold ${priceSizeClass} tabular-nums`} style={{
                  color: resolvedPriceColor,
                  letterSpacing: '0.08em',
                  textShadow: `0 0 10px ${GOLD}0.4)`,
                }}>৳{item.price.toFixed(0)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 py-2.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentPage ? '22px' : '6px',
                height: '4px',
                background: i === currentPage
                  ? `linear-gradient(90deg, ${GOLD_BRIGHT} 0%, ${GOLD}0.6) 100%)`
                  : `${GOLD}0.22)`,
                boxShadow: i === currentPage ? `0 0 8px ${GOLD}0.5)` : 'none',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default ElegantRenderer;
