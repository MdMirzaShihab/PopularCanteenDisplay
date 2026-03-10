import { useState, useEffect, useCallback, memo } from 'react';
import { getCurrentTime, getCurrentDayOfWeek, isTimeInRange } from '../../utils/timeUtils';
import { getStyleRenderer } from './styles/index.js';

const SectionRenderer = memo(function SectionRenderer({ section, items, menus, gridArea }) {
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

    if (content.type === 'menu') {
      const menu = menus.find(m => m.id === content.menuId);
      if (!menu) {
        return (
          <div className="w-full h-full flex items-center justify-center text-white/50">
            Menu not found
          </div>
        );
      }
      const menuItems = menu.itemIds
        .map(id => items.find(item => item.id === id))
        .filter(Boolean)
        .filter(item => item.isActive);
      const StyleRenderer = getStyleRenderer(content.visualStyle);
      const titleColor = content.titleColor || '#ffffff';
      return (
        <div className="w-full h-full flex flex-col">
          {/* Section Title with decorative accents */}
          <div className="flex-shrink-0 mb-2 px-1">
            <div className="flex items-center gap-3">
              <div className="h-[2px] w-8 rounded-full opacity-60" style={{ backgroundColor: titleColor }} />
              <h3
                className={`${content.titleFont || 'font-heading'} text-2xl 3xl:text-4xl uppercase tracking-[0.15em] drop-shadow-lg`}
                style={{ color: titleColor }}
              >
                {menu.title}
              </h3>
              <div className="flex-1 h-[1px] opacity-20" style={{ backgroundColor: titleColor }} />
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <StyleRenderer items={menuItems} showPrices={true} />
          </div>
        </div>
      );
    }

    if (content.type === 'image') {
      return <img src={content.media} className="w-full h-full object-cover rounded-xl" alt="" />;
    }

    if (content.type === 'video') {
      return (
        <video
          src={content.media}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover rounded-xl"
        />
      );
    }

    return null;
  };

  return (
    <div
      className="relative overflow-hidden rounded-xl p-4"
      style={{
        gridArea,
        backgroundColor: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.3)'
      }}
    >
      {renderContent()}
    </div>
  );
});

export default SectionRenderer;
