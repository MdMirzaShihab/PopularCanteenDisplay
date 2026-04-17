import React, { useState, useEffect, useRef } from 'react';
import { isVideoUrl } from '../../../utils/fileUtils';
import {
  getItemSizeClass,
  getPriceSizeClass,
  effectiveRowSize,
} from '../themes/typographyRegistry';

const VISUAL_STYLE_ID = 'kinetic-strips';

// Rotating neon panel palette — kinetic energy, vaporwave-ish
const PANEL_HUES = [
  { bar: '#5eead4', glow: 'rgba(94,234,212,0.55)'  }, // cyan
  { bar: '#f472b6', glow: 'rgba(244,114,182,0.55)' }, // pink
  { bar: '#fbbf24', glow: 'rgba(251,191,36,0.55)'  }, // amber
  { bar: '#a78bfa', glow: 'rgba(167,139,250,0.55)' }, // violet
  { bar: '#34d399', glow: 'rgba(52,211,153,0.55)'  }, // emerald
  { bar: '#fb923c', glow: 'rgba(251,146,60,0.55)'  }, // orange
];

// Minimum panel width per size step — determines how many panels fit per row
const MIN_PANEL_WIDTHS = { S: 110, M: 140, L: 170, XL: 210, '2XL': 260 };

// Parallelogram clip-path — panels lean right
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
      // Subtract gaps between panels (8px each) and side padding (16px)
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
  const pageItems = items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col px-2 py-1">
      <div className="flex-1 flex items-stretch gap-2 min-h-0">
        {pageItems.map((item, i) => {
          const hue = PANEL_HUES[i % PANEL_HUES.length];
          const resolvedPriceColor = priceColor || hue.bar;
          return (
            <div key={item._id} className="flex-1 relative min-w-0" style={{
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

              {/* Darker bottom gradient for text readability */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.95) 100%)',
              }} />

              {/* Inner color tint that breathes life into the panel */}
              <div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={{
                background: `linear-gradient(180deg, ${hue.bar}00 40%, ${hue.bar}38 100%)`,
              }} />

              {/* Neon top accent bar, clipped to panel shape */}
              <div className="absolute top-0 left-0 right-0 h-[4px] pointer-events-none" style={{
                background: hue.bar,
                boxShadow: `0 0 12px ${hue.glow}, 0 0 24px ${hue.glow}`,
              }} />

              {/* Content bottom */}
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
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 py-2.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
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
