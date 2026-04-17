import React, { useState, useEffect, useRef } from 'react';
import { isVideoUrl } from '../../../utils/fileUtils';
import {
  getItemSizeClass,
  getPriceSizeClass,
  effectiveRowSize,
} from '../themes/typographyRegistry';

const VISUAL_STYLE_ID = 'bento';

// Hybrid rotation: 6 items visible per page; hero rotates through each position
// every ROTATION_MS. After all 6 have been hero, advance to next page.
const ITEMS_PER_PAGE = 6;
const ROTATION_MS = 4000;

const HUES = [
  { accent: '#5eead4', glow: 'rgba(94,234,212,0.5)'  },
  { accent: '#f472b6', glow: 'rgba(244,114,182,0.5)' },
  { accent: '#fbbf24', glow: 'rgba(251,191,36,0.5)'  },
  { accent: '#a78bfa', glow: 'rgba(167,139,250,0.5)' },
  { accent: '#34d399', glow: 'rgba(52,211,153,0.5)'  },
  { accent: '#fb923c', glow: 'rgba(251,146,60,0.5)'  },
];

// Cell positions (3x3 grid). First cell is the HERO (2x2 span).
const CELL_AREAS = [
  '1 / 1 / 3 / 3',  // hero (2x2)
  '1 / 3 / 2 / 4',
  '2 / 3 / 3 / 4',
  '3 / 1 / 4 / 2',
  '3 / 2 / 4 / 3',
  '3 / 3 / 4 / 4',
];

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

const renderMedia = (item) => (
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

const BentoRenderer = React.memo(({ items, showPrices = true, itemFont, itemColor, itemSize, priceFont, priceColor, priceSize }) => {
  const itemSizeClass = getItemSizeClass(VISUAL_STYLE_ID, itemSize);
  const priceSizeClass = getPriceSizeClass(VISUAL_STYLE_ID, priceSize);
  const effSize = effectiveRowSize(itemSize, priceSize);
  const heroTitleClass = HERO_TITLE_MAP[effSize] ?? HERO_TITLE_MAP.M;
  const heroPriceClass = HERO_PRICE_MAP[effSize] ?? HERO_PRICE_MAP.M;

  const [step, setStep] = useState(0);
  const containerRef = useRef(null);

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

  const currentPage = Math.floor(step / ITEMS_PER_PAGE);
  const heroPositionInPage = step % ITEMS_PER_PAGE;
  const pageItems = items.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);
  const pageSize = pageItems.length;
  const effectiveHeroPos = heroPositionInPage < pageSize ? heroPositionInPage : 0;

  // Rotate pageItems so hero sits at displayItems[0]
  const displayItems = [
    ...pageItems.slice(effectiveHeroPos),
    ...pageItems.slice(0, effectiveHeroPos),
  ];

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col px-1 py-1">
      <div className="flex-1 grid gap-2 min-h-0" style={{
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
      }}>
        {displayItems.map((item, idx) => {
          const gridArea = CELL_AREAS[idx];
          if (!gridArea) return null;
          const isHero = idx === 0;
          // Rotate hue based on original item position so colors are consistent per item
          const originalIdx = items.indexOf(item);
          const hue = HUES[originalIdx % HUES.length];
          const resolvedPriceColor = priceColor || hue.accent;

          return (
            <div
              key={item._id}
              className={`relative overflow-hidden min-w-0 min-h-0 ${isHero ? 'bento-hero-enter' : ''}`}
              style={{
                gridArea,
                borderRadius: isHero ? '20px' : '14px',
                boxShadow: isHero
                  ? `0 16px 44px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.09), 0 0 36px -12px ${hue.glow}`
                  : '0 8px 22px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)',
              }}
            >
              {renderMedia(item)}

              <div className="absolute inset-0" style={{
                background: isHero
                  ? 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.96) 100%)'
                  : 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.96) 100%)',
              }} />

              <div className="absolute top-0 inset-x-0 h-[3px]" style={{
                background: `linear-gradient(90deg, ${hue.accent} 0%, ${hue.accent}33 100%)`,
                boxShadow: `0 0 10px ${hue.glow}`,
              }} />

              {isHero && (
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${hue.accent}55`,
                  boxShadow: `0 0 16px -4px ${hue.glow}`,
                }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{
                    background: hue.accent,
                    boxShadow: `0 0 8px ${hue.glow}`,
                  }} />
                  <span className="font-body text-[10px] font-bold tracking-[0.2em]" style={{ color: hue.accent }}>
                    SIGNATURE
                  </span>
                </div>
              )}

              <div className={`absolute inset-x-0 bottom-0 ${isHero ? 'px-5 pb-4' : 'px-3 pb-2.5'}`}>
                {isHero && (
                  <div className="h-[2px] w-12 mb-2" style={{
                    background: `linear-gradient(90deg, ${hue.accent} 0%, transparent 100%)`,
                    boxShadow: `0 0 6px ${hue.glow}`,
                  }} />
                )}
                <p className={`${itemFont || 'font-display'} ${isHero ? heroTitleClass : itemSizeClass} font-black leading-tight ${isHero ? '' : 'line-clamp-2'}`} style={{
                  color: itemColor || '#ffffff',
                  letterSpacing: '0.02em',
                  textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.6)',
                }}>{item.name}</p>
                {showPrices && (
                  <p className={`${priceFont || 'font-heading'} ${isHero ? heroPriceClass : priceSizeClass} font-black tabular-nums mt-1 tracking-wider`} style={{
                    color: resolvedPriceColor,
                    textShadow: `0 0 ${isHero ? '16px' : '10px'} ${hue.glow}, 0 1px 3px rgba(0,0,0,0.8)`,
                  }}>৳{item.price.toFixed(0)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes bentoHeroEnter {
          from { opacity: 0.2; }
          to   { opacity: 1; }
        }
        .bento-hero-enter { animation: bentoHeroEnter 600ms ease-out; }
      `}</style>
    </div>
  );
});

export default BentoRenderer;
