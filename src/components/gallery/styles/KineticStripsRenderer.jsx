import React, { useState, useEffect, useRef } from 'react';
import { isVideoUrl } from '../../../utils/fileUtils';
import { usePageCrossfade } from '../../../hooks/usePageCrossfade';
import {
  getItemSizeClass,
  getPriceSizeClass,
  effectiveRowSize,
} from '../themes/typographyRegistry';

const VISUAL_STYLE_ID = 'kinetic-strips';
const STAGGER_MS = 70;
const EXIT_DURATION = 520;

// Rotating neon panel palette — kinetic energy, vaporwave-ish
const PANEL_HUES = [
  { bar: '#5eead4', glow: 'rgba(94,234,212,0.55)'  }, // cyan
  { bar: '#f472b6', glow: 'rgba(244,114,182,0.55)' }, // pink
  { bar: '#fbbf24', glow: 'rgba(251,191,36,0.55)'  }, // amber
  { bar: '#a78bfa', glow: 'rgba(167,139,250,0.55)' }, // violet
  { bar: '#34d399', glow: 'rgba(52,211,153,0.55)'  }, // emerald
  { bar: '#fb923c', glow: 'rgba(251,146,60,0.55)'  }, // orange
];

const MIN_PANEL_WIDTHS = { S: 110, M: 140, L: 170, XL: 210, '2XL': 260 };

const CLIP_PATH = 'polygon(14% 0, 100% 0, 86% 100%, 0% 100%)';

const KineticStripsRenderer = React.memo(({ items, showPrices = true, itemFont, itemColor, itemSize, priceFont, priceColor, priceSize }) => {
  const itemSizeClass = getItemSizeClass(VISUAL_STYLE_ID, itemSize);
  const priceSizeClass = getPriceSizeClass(VISUAL_STYLE_ID, priceSize);
  const effSize = effectiveRowSize(itemSize, priceSize);
  const minPanelWidth = MIN_PANEL_WIDTHS[effSize] ?? MIN_PANEL_WIDTHS.M;

  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      const cols = Math.max(2, Math.min(8, Math.floor((width - 16) / (minPanelWidth + 8))));
      setItemsPerPage(cols);
      setCurrentPage(0);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [minPanelWidth]);

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

  const renderPanel = (item, i) => {
    const hue = PANEL_HUES[i % PANEL_HUES.length];
    const resolvedPriceColor = priceColor || hue.bar;
    return (
      <div className="flex-1 relative min-w-0 h-full" style={{
        clipPath: CLIP_PATH,
        background: 'linear-gradient(180deg, rgba(16,16,28,0.65) 0%, rgba(8,8,16,0.92) 100%)',
      }}>
        {item.image && (
          isVideoUrl(item.image) ? (
            <video src={item.image} className="absolute inset-0 w-full h-full object-cover opacity-85" autoPlay muted loop playsInline />
          ) : (
            <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-85" />
          )
        )}

        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.95) 100%)',
        }} />

        <div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={{
          background: `linear-gradient(180deg, ${hue.bar}00 40%, ${hue.bar}38 100%)`,
        }} />

        <div className="absolute top-0 left-0 right-0 h-[4px] pointer-events-none" style={{
          background: hue.bar,
          boxShadow: `0 0 12px ${hue.glow}, 0 0 24px ${hue.glow}`,
        }} />

        <div className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-6">
          <div className="h-[2px] w-8 mb-2" style={{
            background: hue.bar,
            boxShadow: `0 0 6px ${hue.glow}`,
          }} />
          <p className={`${itemFont || 'font-display'} ${itemSizeClass} font-black leading-tight line-clamp-2`} style={{
            color: itemColor || '#ffffff',
            letterSpacing: '0.015em',
            textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.6)',
          }}>{item.name}</p>
          {showPrices && (
            <p className={`${priceFont || 'font-heading'} ${priceSizeClass} font-black tabular-nums mt-1 tracking-wider`} style={{
              color: resolvedPriceColor,
              textShadow: `0 0 14px ${hue.glow}, 0 0 4px ${hue.glow}, 0 1px 2px rgba(0,0,0,0.7)`,
            }}>৳{item.price.toFixed(0)}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col px-2 py-1">
      <div className="relative flex-1 min-h-0">
        {prevPage !== null && (
          <div
            key={`prev-${prevPage}`}
            className="absolute inset-0 flex items-stretch gap-2 menu-page-exit"
          >
            {prevItems.map((item, i) => (
              <div key={item._id} className="flex-1 min-w-0">
                {renderPanel(item, i)}
              </div>
            ))}
          </div>
        )}
        <div
          key={`active-${transitionKey}`}
          className="absolute inset-0 flex items-stretch gap-2"
        >
          {activeItems.map((item, i) => (
            <div
              key={item._id}
              className="flex-1 min-w-0 menu-item-slide-r"
              style={{ animationDelay: `${i * STAGGER_MS}ms` }}
            >
              {renderPanel(item, i)}
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
              className="absolute top-[-6%] bottom-[-6%] w-[58%] menu-sweep-animate"
              style={{
                left: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(94,234,212,0.18) 20%, rgba(244,114,182,0.22) 40%, rgba(167,139,250,0.20) 60%, rgba(251,191,36,0.18) 80%, transparent 100%)',
                filter: 'blur(22px)',
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
                width: i === currentPage ? '26px' : '6px',
                height: '4px',
                background: i === currentPage
                  ? 'linear-gradient(90deg, #5eead4 0%, #f472b6 50%, #fbbf24 100%)'
                  : 'rgba(255,255,255,0.22)',
                boxShadow: i === currentPage ? '0 0 10px rgba(244,114,182,0.55)' : 'none',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default KineticStripsRenderer;
