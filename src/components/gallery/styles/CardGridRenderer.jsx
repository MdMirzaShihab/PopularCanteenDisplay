import React, { useState, useEffect, useRef } from 'react';
import { isVideoUrl } from '../../../utils/fileUtils';
import { usePageCrossfade } from '../../../hooks/usePageCrossfade';
import {
  getItemSizeClass,
  getPriceSizeClass,
  getItemHeight,
  getItemImageSize,
  getCardMinWidth,
  effectiveRowSize,
} from '../themes/typographyRegistry';

const VISUAL_STYLE_ID = 'card-grid';
const STAGGER_MS = 55;
const EXIT_DURATION = 520;

const CardGridRenderer = React.memo(({ items, showPrices = true, itemFont, itemColor, itemSize, priceFont, priceColor, priceSize }) => {
  const itemSizeClass = getItemSizeClass(VISUAL_STYLE_ID, itemSize);
  const priceSizeClass = getPriceSizeClass(VISUAL_STYLE_ID, priceSize);
  const effSize = effectiveRowSize(itemSize, priceSize);
  const cardHeight = getItemHeight(VISUAL_STYLE_ID, effSize);
  const imageSize = getItemImageSize(VISUAL_STYLE_ID, effSize);
  const minCardWidth = getCardMinWidth(VISUAL_STYLE_ID, effSize);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(6);

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
  const { activePage, prevPage, transitionKey } = usePageCrossfade(currentPage, EXIT_DURATION);
  const sliceFor = (p) => items.slice(p * itemsPerPage, (p + 1) * itemsPerPage);
  const activeItems = sliceFor(activePage);
  const prevItems = prevPage !== null ? sliceFor(prevPage) : [];

  const gridStyle = {
    gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
  };

  const renderCard = (item) => (
    <div
      className="relative overflow-hidden tv-glass-fallback"
      style={{
        height: `${cardHeight}px`,
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(8,12,24,0.78) 0%, rgba(18,22,40,0.62) 100%)',
        backdropFilter: 'blur(18px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.5)',
        boxShadow: '0 10px 28px -10px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.09)',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-[2px] pointer-events-none" style={{
        background: 'linear-gradient(90deg, rgba(94,234,212,0.95) 0%, rgba(244,114,182,0.95) 50%, rgba(251,191,36,0.95) 100%)'
      }} />

      <div className="absolute inset-0 pointer-events-none opacity-[0.18]" style={{
        background: 'repeating-linear-gradient(180deg, transparent 0px, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)'
      }} />

      <div className="relative flex items-center gap-3 px-3.5 h-full">
        {item.image && (
          <div
            className="flex-shrink-0 rounded-xl overflow-hidden relative"
            style={{
              width: `${imageSize}px`,
              height: `${imageSize}px`,
              boxShadow: '0 0 0 1px rgba(94,234,212,0.45), 0 4px 18px -2px rgba(94,234,212,0.22), 0 2px 8px rgba(0,0,0,0.35)',
            }}
          >
            {isVideoUrl(item.image) ? (
              <video src={item.image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
            ) : (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            )}
            <div className="absolute top-0 right-0 w-3 h-3 pointer-events-none" style={{
              background: 'linear-gradient(225deg, rgba(94,234,212,0.75) 0%, transparent 60%)',
            }} />
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p
            className={`font-semibold ${itemSizeClass} ${itemFont || 'font-body'} leading-snug line-clamp-2`}
            style={{
              color: itemColor || 'rgba(255,255,255,0.95)',
              letterSpacing: '0.01em',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
            }}
          >{item.name}</p>
          {showPrices && (
            <div className="mt-1 flex items-baseline gap-2">
              <p
                className={`${priceFont || 'font-heading'} font-bold ${priceSizeClass} tabular-nums tracking-wider`}
                style={{
                  color: priceColor || '#5eead4',
                  textShadow: '0 0 12px rgba(94,234,212,0.5), 0 0 3px rgba(94,234,212,0.9)',
                }}
              >৳{item.price.toFixed(0)}</p>
              <div className="flex-1 h-px" style={{
                background: 'linear-gradient(90deg, rgba(94,234,212,0.6) 0%, transparent 100%)'
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col">
      <div className="relative flex-1 min-h-0">
        {prevPage !== null && (
          <div
            key={`prev-${prevPage}`}
            className="absolute inset-0 grid gap-3 content-start p-1 menu-page-exit"
            style={gridStyle}
          >
            {prevItems.map((item) => (
              <div key={item._id}>{renderCard(item)}</div>
            ))}
          </div>
        )}
        <div
          key={`active-${transitionKey}`}
          className="absolute inset-0 grid gap-3 content-start p-1"
          style={gridStyle}
        >
          {activeItems.map((item, idx) => (
            <div
              key={item._id}
              className="menu-item-rise"
              style={{ animationDelay: `${idx * STAGGER_MS}ms` }}
            >
              {renderCard(item)}
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
              className="absolute top-[-6%] bottom-[-6%] w-[46%] menu-sweep-animate"
              style={{
                left: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(94,234,212,0.20) 35%, rgba(244,114,182,0.24) 55%, rgba(251,191,36,0.20) 75%, transparent 100%)',
                filter: 'blur(16px)',
                transform: 'translate3d(-110%,0,0) skewX(-14deg)',
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
                  ? 'linear-gradient(90deg, #5eead4 0%, #f472b6 100%)'
                  : 'rgba(255,255,255,0.22)',
                boxShadow: i === currentPage ? '0 0 8px rgba(94,234,212,0.5)' : 'none',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default CardGridRenderer;
