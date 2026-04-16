import { memo, useEffect, useRef, useState } from 'react';
import { resolveMediaUrl } from '../../utils/mediaUtils';
import { ANNOUNCEMENT_ICONS } from './AnnouncementRenderer.constants';

const PRESET_STYLES = {
  poster: {
    headlineHeightRatio: 0.20,
    subtextHeightRatio: 0.06,
    iconHeightRatio: 0.11,
    padRatio: 0.08,
    iconLayout: 'stacked',
    decoration: null,
    headlineClass: 'uppercase tracking-[0.08em] leading-[1.02] font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]',
    subtextClass: 'font-body opacity-90 tracking-wide',
  },
  notice: {
    headlineHeightRatio: 0.16,
    subtextHeightRatio: 0.055,
    iconHeightRatio: 0.09,
    padRatio: 0.06,
    iconLayout: 'inline-left',
    decoration: 'left-bar',
    headlineClass: 'leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]',
    subtextClass: 'font-body opacity-85',
  },
  chalkboard: {
    headlineHeightRatio: 0.18,
    subtextHeightRatio: 0.07,
    iconHeightRatio: 0.10,
    padRatio: 0.06,
    iconLayout: 'stacked',
    decoration: 'dashed-frame',
    headlineClass: 'leading-[1.1] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]',
    subtextClass: 'font-handwritten opacity-90',
  },
  banner: {
    headlineHeightRatio: 0.24,
    subtextHeightRatio: 0.06,
    iconHeightRatio: 0.20,
    padRatio: 0.05,
    iconLayout: 'inline-left',
    decoration: null,
    headlineClass: 'uppercase tracking-[0.06em] leading-none font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]',
    subtextClass: 'font-body opacity-90 uppercase tracking-[0.2em]',
  },
};

const ALIGN_CLASS = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
};

const ALIGN_JUSTIFY = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

const MIN_HEADLINE_PX = 14;
const MIN_SUBTEXT_PX = 10;
const MIN_ICON_PX = 12;
const MAX_PAD_PX = 80;

const AnnouncementRenderer = memo(function AnnouncementRenderer({ announcement }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!announcement) return null;

  const styleId = PRESET_STYLES[announcement.visualStyle] ? announcement.visualStyle : 'poster';
  const preset = PRESET_STYLES[styleId];

  const headline = announcement.headline || '';
  const subtext = announcement.subtext || '';
  const textAlign = announcement.textAlign || 'center';
  const textFont = announcement.textFont || 'font-heading';
  const textColor = announcement.textColor || '#ffffff';
  const backgroundMode = announcement.backgroundMode || 'transparent';
  const backgroundColor = announcement.backgroundColor || '#1a1a2e';
  const bgImageUrl = resolveMediaUrl(announcement.backgroundMedia);
  const IconComponent = announcement.icon ? ANNOUNCEMENT_ICONS[announcement.icon] : null;

  const showImage = (backgroundMode === 'image' || backgroundMode === 'image-overlay') && bgImageUrl;
  const showColor = backgroundMode !== 'transparent' && !showImage;

  const { width, height } = size;
  const hasMeasure = width > 0 && height > 0;

  // Font sizing: height-driven, capped by horizontal fit so long headlines shrink to fit.
  const headlineHeightPx = height * preset.headlineHeightRatio;
  const headlineWidthCap = headline.length > 0
    ? (width * 0.92) / Math.max(5, headline.length * 0.48)
    : headlineHeightPx;
  const headlineSize = hasMeasure
    ? Math.max(MIN_HEADLINE_PX, Math.min(headlineHeightPx, headlineWidthCap))
    : 48;

  const subtextHeightPx = height * preset.subtextHeightRatio;
  const subtextWidthCap = subtext.length > 0
    ? (width * 0.9) / Math.max(8, subtext.length * 0.4)
    : subtextHeightPx;
  const subtextSize = hasMeasure
    ? Math.max(MIN_SUBTEXT_PX, Math.min(subtextHeightPx, subtextWidthCap))
    : 18;

  const iconSize = hasMeasure
    ? Math.max(MIN_ICON_PX, height * preset.iconHeightRatio)
    : 48;

  const padX = hasMeasure ? Math.min(width * preset.padRatio, MAX_PAD_PX) : 24;
  const padY = hasMeasure ? Math.min(height * preset.padRatio, MAX_PAD_PX) : 24;
  const inlineGap = hasMeasure ? Math.min(headlineSize * 0.4, 32) : 16;

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-xl">
      {/* Background layer */}
      {showColor && (
        <div className="absolute inset-0" style={{ backgroundColor }} />
      )}
      {showImage && (
        <img
          src={bgImageUrl}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: 'cover',
            objectPosition: `${announcement.backgroundPositionX ?? 50}% ${announcement.backgroundPositionY ?? 50}%`,
            transform: `scale(${announcement.backgroundScale ?? 1})`,
            transformOrigin: `${announcement.backgroundPositionX ?? 50}% ${announcement.backgroundPositionY ?? 50}%`,
          }}
        />
      )}
      {showImage && backgroundMode === 'image-overlay' && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: announcement.overlayColor || '#000000',
            opacity: announcement.overlayOpacity ?? 0.4,
          }}
        />
      )}

      {/* Preset decoration layer */}
      {preset.decoration === 'left-bar' && (
        <div
          className="absolute left-0 rounded-r-full"
          style={{
            top: padY,
            bottom: padY,
            width: Math.max(3, (hasMeasure ? width : 400) * 0.006),
            backgroundColor: textColor,
            opacity: 0.6,
          }}
        />
      )}
      {preset.decoration === 'dashed-frame' && (
        <div
          className="absolute rounded-lg pointer-events-none"
          style={{
            inset: Math.max(6, padX * 0.3),
            border: `${Math.max(1.5, (hasMeasure ? width : 400) * 0.0018)}px dashed ${textColor}`,
            opacity: 0.4,
          }}
        />
      )}

      {/* Foreground content */}
      <div
        className={`absolute inset-0 flex flex-col justify-center ${ALIGN_CLASS[textAlign]}`}
        style={{
          color: textColor,
          paddingLeft: padX,
          paddingRight: padX,
          paddingTop: padY,
          paddingBottom: padY,
        }}
      >
        {IconComponent && preset.iconLayout === 'stacked' && (
          <IconComponent
            className="opacity-95 flex-shrink-0"
            style={{ width: iconSize, height: iconSize, marginBottom: iconSize * 0.3 }}
            strokeWidth={1.75}
          />
        )}

        {IconComponent && preset.iconLayout === 'inline-left' ? (
          <div
            className={`flex items-center ${ALIGN_JUSTIFY[textAlign]}`}
            style={{ gap: inlineGap, maxWidth: '100%' }}
          >
            <IconComponent
              className="flex-shrink-0"
              style={{ width: iconSize, height: iconSize }}
              strokeWidth={1.75}
            />
            <h1
              className={`${textFont} ${preset.headlineClass} min-w-0 line-clamp-3`}
              style={{ fontSize: headlineSize }}
            >
              {headline}
            </h1>
          </div>
        ) : (
          <h1
            className={`${textFont} ${preset.headlineClass} max-w-full line-clamp-3`}
            style={{ fontSize: headlineSize }}
          >
            {headline}
          </h1>
        )}

        {subtext && (
          <p
            className={`${preset.subtextClass} max-w-full line-clamp-2`}
            style={{
              fontSize: subtextSize,
              marginTop: subtextSize * 0.6,
            }}
          >
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
});

export default AnnouncementRenderer;
