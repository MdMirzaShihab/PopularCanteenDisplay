import { useState, useEffect, useCallback, memo } from 'react';
import { getCurrentTime, getCurrentDayOfWeek, isTimeInRange } from '../../utils/timeUtils';
import { getStyleRenderer } from './styles/index.js';
import { normalizeContent, resolveMediaUrls } from '../../utils/mediaUtils';
import { getTitleSizeClass } from './themes/typographyRegistry';
import MediaSlideshow from './MediaSlideshow';
import AnnouncementRenderer from './AnnouncementRenderer';

// Append an alpha channel to a #RRGGBB or #RGB hex color.
const withAlpha = (hex, alpha) => {
  if (typeof hex !== 'string' || !hex.startsWith('#')) return hex;
  const full = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex.slice(0, 7);
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${full}${a}`;
};

// Warm cream fallback for media sections (matches app's bg-100).
const MEDIA_ACCENT_FALLBACK = '#F2EFE9';

const SectionRenderer = memo(function SectionRenderer({ section, gridArea }) {
  const resolveContent = useCallback(() => {
    const currentTime = getCurrentTime();
    const currentDay = getCurrentDayOfWeek();

    for (const slot of (section.timeSlots || [])) {
      if (!slot.daysOfWeek.includes(currentDay)) continue;
      if (isTimeInRange(currentTime, slot.startTime, slot.endTime)) {
        return slot.content;
      }
    }
    return section.defaultContent;
  }, [section]);

  const [content, setContent] = useState(() => resolveContent());

  useEffect(() => {
    setContent(resolveContent());
    const interval = setInterval(() => {
      setContent(resolveContent());
    }, 60000);
    return () => clearInterval(interval);
  }, [resolveContent]);

  const renderContent = () => {
    if (!content) return null;

    const normalized = normalizeContent(content);

    if (normalized.type === 'menu') {
      const menu = normalized.menuId;
      if (!menu || typeof menu !== 'object') {
        return (
          <div className="w-full h-full flex items-center justify-center text-white/50">
            Menu not found
          </div>
        );
      }
      const menuItems = (menu.items || [])
        .filter(Boolean)
        .filter(item => item.isActive);
      const StyleRenderer = getStyleRenderer(normalized.visualStyle);
      const titleColor = normalized.titleColor || '#ffffff';
      return (
        <div className="w-full h-full flex flex-col">
          {/* Section Title with decorative accents */}
          <div className="flex-shrink-0 mb-2 px-1">
            <div className="flex items-center gap-3">
              <div className="h-[2px] w-8 rounded-full opacity-60" style={{ backgroundColor: titleColor }} />
              <h3
                className={`${normalized.titleFont || 'font-heading'} ${getTitleSizeClass(normalized.titleSize)} uppercase tracking-[0.15em] drop-shadow-lg`}
                style={{ color: titleColor }}
              >
                {menu.title}
              </h3>
              <div className="flex-1 h-[1px] opacity-35" style={{ backgroundColor: titleColor }} />
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <StyleRenderer
              items={menuItems}
              showPrices={true}
              itemFont={normalized.itemFont}
              itemColor={normalized.itemColor}
              itemSize={normalized.itemSize}
              priceFont={normalized.priceFont}
              priceColor={normalized.priceColor}
              priceSize={normalized.priceSize}
            />
          </div>
        </div>
      );
    }

    if (normalized.type === 'media') {
      const urls = resolveMediaUrls(normalized.media);
      if (urls.length === 0) return null;
      return (
        <MediaSlideshow
          mediaItems={urls}
          slideDuration={normalized.slideDuration}
          transition={normalized.transition}
        />
      );
    }

    if (normalized.type === 'announcement') {
      if (!normalized.announcement) return null;
      return <AnnouncementRenderer announcement={normalized.announcement} />;
    }

    return null;
  };

  const normalized = content ? normalizeContent(content) : null;
  const isAnnouncement = normalized?.type === 'announcement';
  const accentColor = normalized?.type === 'menu'
    ? (normalized.titleColor || '#ffffff')
    : MEDIA_ACCENT_FALLBACK;

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${isAnnouncement ? 'bg-transparent border-0' : 'p-4'}`}
      style={isAnnouncement ? { gridArea } : {
        gridArea,
        border: `1.5px solid ${withAlpha(accentColor, 0.4)}`,
        boxShadow: `inset 0 0 0 1px ${withAlpha(accentColor, 0.08)}, inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 28px rgba(0,0,0,0.18)`,
      }}
    >
      {renderContent()}
    </div>
  );
});

export default SectionRenderer;
