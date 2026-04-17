import React, { useState, useEffect, useRef } from 'react';
import { isVideoUrl } from '../../../utils/fileUtils';
import {
  getItemSizeClass,
  getPriceSizeClass,
  effectiveRowSize,
} from '../themes/typographyRegistry';

const VISUAL_STYLE_ID = 'spotlight';

// Hybrid rotation: 1 hero + 4 smalls visible per page; hero rotates through each
// position every ROTATION_MS. After all 5 in the page have been hero, advance page.
const ITEMS_PER_PAGE = 5;
const ROTATION_MS = 4000;

// Hero item font sizes — one step larger than base for visual weight
const HERO_TITLE_MAP = {
  S: 'text-xl',
  M: 'text-2xl',
  L: 'text-3xl',
  XL: 'text-4xl',
  '2XL': 'text-5xl',
};
const HERO_PRICE_MAP = {
  S: 'text-2xl',
  M: 'text-3xl',
  L: 'text-4xl',
  XL: 'text-5xl',
  '2XL': 'text-6xl',
};

const FEATURED_LABEL = 'FEATURED';

const SpotlightRenderer = React.memo(({ items, showPrices = true, itemFont, itemColor, itemSize, priceFont, priceColor, priceSize }) => {
  const itemSizeClass = getItemSizeClass(VISUAL_STYLE_ID, itemSize);
  const priceSizeClass = getPriceSizeClass(VISUAL_STYLE_ID, priceSize);
  const effSize = effectiveRowSize(itemSize, priceSize);
  const heroTitleClass = HERO_TITLE_MAP[effSize] ?? HERO_TITLE_MAP.M;
  const heroPriceClass = HERO_PRICE_MAP[effSize] ?? HERO_PRICE_MAP.M;

  const [isWide, setIsWide] = useState(true);
  const [step, setStep] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setIsWide(width >= height * 1.35);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (items.length <= 1) {
      setStep(0);
      return;
    }
    const timer = setInterval(() => {
      setStep(prev => (prev + 1) % items.length);
    }, ROTATION_MS);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  // Derive page + hero position from the global step counter
  const currentPage = Math.floor(step / ITEMS_PER_PAGE);
  const heroPositionInPage = step % ITEMS_PER_PAGE;
  const pageItems = items.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);
  const pageSize = pageItems.length;

  // If the last page is partial and heroPositionInPage overshoots it,
  // clamp by wrapping — this only happens briefly during state settle, harmless.
  const effectiveHeroPos = heroPositionInPage < pageSize ? heroPositionInPage : 0;

  // Rotate pageItems so hero sits at displayItems[0]
  const displayItems = [
    ...pageItems.slice(effectiveHeroPos),
    ...pageItems.slice(0, effectiveHeroPos),
  ];
  const hero = displayItems[0];
  const smallItems = displayItems.slice(1);

  const accent = priceColor || '#5eead4';
  const accentGlow = 'rgba(94,234,212,0.5)';

  const renderHeroMedia = (item) => (
    item.image ? (
      isVideoUrl(item.image) ? (
        <video src={item.image} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
      ) : (
        <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
      )
    ) : (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
    )
  );

  const renderSmallMedia = (item) => (
    item.image ? (
      isVideoUrl(item.image) ? (
        <video src={item.image} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
      ) : (
        <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
      )
    ) : (
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(18,18,30,0.9), rgba(8,8,16,0.95))',
      }} />
    )
  );

  return (
    <div ref={containerRef} className={`w-full h-full flex gap-3 p-1 ${isWide ? 'flex-row' : 'flex-col'}`}>
      {/* HERO */}
      <div
        key={hero._id /* remount on change to retrigger enter animation */}
        className={`relative overflow-hidden spotlight-hero-enter ${isWide ? 'flex-[1.8]' : 'flex-[2.2]'}`}
        style={{
          borderRadius: '20px',
          boxShadow: `0 24px 60px -14px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.09), 0 0 40px -12px ${accentGlow}`,
        }}
      >
        {renderHeroMedia(hero)}

        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.97) 100%)',
        }} />

        <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${accent}55`,
          boxShadow: `0 0 18px -4px ${accentGlow}`,
        }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{
            background: accent,
            boxShadow: `0 0 6px ${accentGlow}, 0 0 12px ${accentGlow}`,
          }} />
          <span className="font-body text-[10px] font-bold tracking-[0.2em]" style={{ color: accent }}>
            {FEATURED_LABEL}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
          <div className="h-[2px] w-16 mb-3" style={{
            background: `linear-gradient(90deg, ${accent} 0%, transparent 100%)`,
            boxShadow: `0 0 8px ${accentGlow}`,
          }} />
          <p className={`${itemFont || 'font-display'} font-black ${heroTitleClass} leading-tight`} style={{
            color: itemColor || '#ffffff',
            letterSpacing: '0.015em',
            textShadow: '0 3px 16px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.7)',
          }}>{hero.name}</p>
          {showPrices && (
            <p className={`${priceFont || 'font-heading'} font-black ${heroPriceClass} mt-2 tabular-nums tracking-wider`} style={{
              color: accent,
              textShadow: `0 0 20px ${accentGlow}, 0 0 6px ${accentGlow}, 0 2px 6px rgba(0,0,0,0.8)`,
            }}>৳{hero.price.toFixed(0)}</p>
          )}
        </div>
      </div>

      {/* SMALL GRID */}
      {smallItems.length > 0 && (
        <div className={`flex gap-2 flex-1 ${isWide ? 'flex-col' : 'flex-row'}`}>
          {smallItems.map(item => (
            <div
              key={item._id}
              className="relative flex-1 overflow-hidden min-h-0 min-w-0"
              style={{
                borderRadius: '14px',
                boxShadow: '0 8px 24px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)',
              }}
            >
              {renderSmallMedia(item)}
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.95) 100%)',
              }} />
              <div className="absolute inset-x-0 bottom-0 px-3 pb-2.5">
                <p className={`${itemFont || 'font-body'} ${itemSizeClass} font-bold leading-tight line-clamp-2`} style={{
                  color: itemColor || '#ffffff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                }}>{item.name}</p>
                {showPrices && (
                  <p className={`${priceFont || 'font-heading'} ${priceSizeClass} font-black tabular-nums mt-0.5`} style={{
                    color: accent,
                    textShadow: `0 0 10px ${accentGlow}, 0 1px 3px rgba(0,0,0,0.8)`,
                  }}>৳{item.price.toFixed(0)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spotlightHeroEnter {
          from { opacity: 0; transform: scale(1.02); }
          to   { opacity: 1; transform: scale(1); }
        }
        .spotlight-hero-enter { animation: spotlightHeroEnter 600ms ease-out; }
      `}</style>
    </div>
  );
});

export default SpotlightRenderer;
