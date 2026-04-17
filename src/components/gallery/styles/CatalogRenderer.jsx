import React, { useState, useEffect, useRef } from 'react';
import { isVideoUrl } from '../../../utils/fileUtils';
import {
  getItemSizeClass,
  getPriceSizeClass,
  getItemHeight,
  getCardMinWidth,
  effectiveRowSize,
} from '../themes/typographyRegistry';

const VISUAL_STYLE_ID = 'catalog';

const CornerBracket = ({ position }) => {
  const map = {
    'top-left':     { top: 10, left: 10, borderTop: true, borderLeft: true },
    'top-right':    { top: 10, right: 10, borderTop: true, borderRight: true },
    'bottom-left':  { bottom: 10, left: 10, borderBottom: true, borderLeft: true },
    'bottom-right': { bottom: 10, right: 10, borderBottom: true, borderRight: true },
  };
  const p = map[position];
  return (
    <div style={{
      position: 'absolute',
      ...p,
      width: '14px',
      height: '14px',
      borderTop: p.borderTop ? '1.5px solid rgba(255,255,255,0.55)' : 'none',
      borderLeft: p.borderLeft ? '1.5px solid rgba(255,255,255,0.55)' : 'none',
      borderRight: p.borderRight ? '1.5px solid rgba(255,255,255,0.55)' : 'none',
      borderBottom: p.borderBottom ? '1.5px solid rgba(255,255,255,0.55)' : 'none',
      pointerEvents: 'none',
    }} />
  );
};

const CatalogRenderer = React.memo(({ items, showPrices = true, itemFont, itemColor, itemSize, priceFont, priceColor, priceSize }) => {
  const itemSizeClass = getItemSizeClass(VISUAL_STYLE_ID, itemSize);
  const priceSizeClass = getPriceSizeClass(VISUAL_STYLE_ID, priceSize);
  const effSize = effectiveRowSize(itemSize, priceSize);
  const cardHeight = getItemHeight(VISUAL_STYLE_ID, effSize);
  const minCardWidth = getCardMinWidth(VISUAL_STYLE_ID, effSize);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      const cols = Math.floor(width / minCardWidth) || 1;
      const rows = Math.floor((height + 12) / (cardHeight + 12)) || 1;
      setItemsPerPage(Math.max(1, cols * rows));
      setCurrentPage(0);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [cardHeight, minCardWidth]);

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
  const resolvedPriceColor = priceColor || '#5eead4';

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col">
      <div className="flex-1 grid gap-3 content-start p-1" style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`
      }}>
        {pageItems.map(item => (
          <div
            key={item._id}
            className="relative overflow-hidden"
            style={{
              height: `${cardHeight}px`,
              borderRadius: '18px',
              boxShadow: '0 14px 40px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.09)',
            }}
          >
            {item.image ? (
              isVideoUrl(item.image) ? (
                <video src={item.image} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
              )
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
            )}

            {/* Cinematic bottom-weighted gradient */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.96) 100%)'
            }} />

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse at 50% 30%, transparent 45%, rgba(0,0,0,0.35) 100%)'
            }} />

            {/* Viewfinder corner brackets */}
            <CornerBracket position="top-left" />
            <CornerBracket position="top-right" />
            <CornerBracket position="bottom-left" />
            <CornerBracket position="bottom-right" />

            {/* Floating neon price pill — top right */}
            {showPrices && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full" style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(10px) saturate(1.3)',
                border: `1px solid ${resolvedPriceColor}66`,
                boxShadow: `0 0 22px -6px ${resolvedPriceColor}88, inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}>
                <span className={`${priceFont || 'font-heading'} font-black ${priceSizeClass} tabular-nums tracking-wider`} style={{
                  color: resolvedPriceColor,
                  textShadow: `0 0 8px ${resolvedPriceColor}aa`,
                }}>৳{item.price.toFixed(0)}</span>
              </div>
            )}

            {/* Item name — bottom-left with accent bar */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5">
              <div className="h-[2px] w-12 mb-2" style={{
                background: `linear-gradient(90deg, ${resolvedPriceColor} 0%, transparent 100%)`,
                boxShadow: `0 0 8px ${resolvedPriceColor}80`,
              }} />
              <p className={`${itemFont || 'font-display'} font-black ${itemSizeClass} leading-tight`} style={{
                color: itemColor || '#ffffff',
                letterSpacing: '0.025em',
                textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,0.6)',
              }}>{item.name}</p>
            </div>
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
                background: i === currentPage ? resolvedPriceColor : 'rgba(255,255,255,0.22)',
                boxShadow: i === currentPage ? `0 0 10px ${resolvedPriceColor}80` : 'none',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default CatalogRenderer;
