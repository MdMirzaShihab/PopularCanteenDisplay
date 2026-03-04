import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { getAllCurrentMenuIds, getCurrentTime, getCurrentDayOfWeek, formatTimeDisplay } from '../../utils/timeUtils';
import { isVideoUrl } from '../../utils/fileUtils';
import MenuItemDisplay from './MenuItemDisplay';
import { Clock } from 'lucide-react';

const TimeBasedRenderer = ({ screen }) => {
  const { items, menus } = useData();
  const [currentMenuIds, setCurrentMenuIds] = useState([]);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Refs for measuring container size
  const gridContainerRef = useRef(null);

  // Derive layout from theme
  const theme = screen.theme || 'classic-grid';
  const isPortrait = theme === 'portrait-list';
  const showForegroundMedia = theme === 'media-focus' && screen.foregroundMedia;
  const isForegroundFullScreen = theme === 'none';
  const foregroundMediaSize = 20; // percentage for media-focus theme

  // Update current menu based on time AND day using screen's own timeSlots
  useEffect(() => {
    const updateMenu = () => {
      const time = getCurrentTime();
      const day = getCurrentDayOfWeek();
      setCurrentTime(time);

      const screenSchedule = {
        timeSlots: screen.timeSlots || [],
        defaultMenuId: screen.defaultMenuId
      };

      const menuIds = getAllCurrentMenuIds(screenSchedule, time, day);

      if (menuIds.length === 0 && screen.defaultMenuId) {
        setCurrentMenuIds([screen.defaultMenuId]);
      } else if (menuIds.length > 0) {
        setCurrentMenuIds(menuIds);
      } else {
        setCurrentMenuIds([]);
      }
    };

    updateMenu();
    const interval = setInterval(updateMenu, 60000);
    return () => clearInterval(interval);
  }, [screen, menus]);

  // Get items from ALL active menus and merge them (memoized for performance)
  const activeItems = useMemo(() => {
    const allItemIds = currentMenuIds.flatMap(menuId => {
      const menu = menus.find(m => m.id === menuId);
      return menu ? menu.itemIds : [];
    });

    const uniqueItemIds = [...new Set(allItemIds)];
    const menuItems = items.filter(i => uniqueItemIds.includes(i.id));
    return menuItems.filter(item => item.isActive);
  }, [currentMenuIds, menus, items]);

  // Calculate items per page based on container size and fixed card dimensions
  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (!gridContainerRef.current) return;

      const container = gridContainerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      if (containerWidth === 0 || containerHeight === 0) return;

      const cardWidth = isPortrait ? 200 : 250;
      const cardHeight = 320;
      const gap = isPortrait ? 12 : 24;
      const padding = isPortrait ? 12 : 0;

      const availableWidth = containerWidth - (padding * 2);
      const availableHeight = containerHeight - (padding * 2);

      const columns = Math.floor((availableWidth + gap) / (cardWidth + gap)) || 1;
      const rows = Math.floor((availableHeight + gap) / (cardHeight + gap)) || 1;

      const calculatedItems = columns * rows;
      const minItems = isPortrait ? 2 : 4;
      setItemsPerPage(Math.max(minItems, calculatedItems));
    };

    const timeoutId = setTimeout(() => {
      calculateItemsPerPage();
    }, 300);

    let resizeTimeoutId;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(() => {
        calculateItemsPerPage();
      }, 300);
    });

    if (gridContainerRef.current) {
      resizeObserver.observe(gridContainerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(resizeTimeoutId);
      resizeObserver.disconnect();
    };
  }, [isPortrait, showForegroundMedia]);

  // Auto-rotation carousel
  useEffect(() => {
    if (activeItems.length <= itemsPerPage) {
      setCurrentPage(0);
      setIsTransitioning(false);
      return;
    }

    const totalPages = Math.ceil(activeItems.length / itemsPerPage);
    const transitionDuration = screen.transitionDuration || 500;
    const displayDuration = screen.slideDelay || 5000;

    let displayTimeoutId;
    let transitionTimeoutId;
    let isCancelled = false;

    const scheduleNextTransition = () => {
      if (isCancelled) return;

      displayTimeoutId = setTimeout(() => {
        if (isCancelled) return;

        setIsTransitioning(true);

        transitionTimeoutId = setTimeout(() => {
          if (isCancelled) return;

          setCurrentPage(prev => {
            const nextPage = (prev + 1) % totalPages;
            return nextPage;
          });
          setIsTransitioning(false);

          scheduleNextTransition();
        }, transitionDuration);
      }, displayDuration);
    };

    scheduleNextTransition();

    return () => {
      isCancelled = true;
      clearTimeout(displayTimeoutId);
      clearTimeout(transitionTimeoutId);
    };
  }, [activeItems.length, itemsPerPage, screen.transitionDuration, screen.slideDelay]);

  // Calculate visible items for current page
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleItems = activeItems.slice(startIndex, endIndex);
  const totalPages = Math.ceil(activeItems.length / itemsPerPage);

  if (currentMenuIds.length === 0 || activeItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            No menu available at this time
          </h2>
          <p className="text-xl text-white text-opacity-80">
            Current time: {formatTimeDisplay(currentTime)}
          </p>
        </div>
      </div>
    );
  }

  // FULLSCREEN FOREGROUND MEDIA MODE - Special case
  if (isForegroundFullScreen && screen.foregroundMedia) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header - Frosted Glass */}
        <div className="sticky top-0 z-40 bg-gradient-to-r from-green-500/85 via-emerald-500/85 to-teal-500/85 backdrop-blur-md shadow-xl">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <h1 className="text-5xl xl:text-6xl font-bold text-white drop-shadow-xl font-heading tracking-wider">
                {screen.title}
              </h1>
              <div className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Clock className="w-5 h-5 text-white" />
                <span className="text-lg font-bold text-white font-heading tracking-wider">{formatTimeDisplay(currentTime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Foreground Media */}
        <div className="flex-1 relative">
          {isVideoUrl(screen.foregroundMedia) ? (
            <video
              src={screen.foregroundMedia}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={screen.foregroundMedia}
              alt="Foreground Media"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
    );
  }

  // NORMAL MODES - Layout based on theme
  if (isPortrait) {
    // PORTRAIT MODE - Vertical stacking: Header -> Media -> Menu
    return (
      <div className="h-screen flex flex-col fade-in overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-gradient-to-r from-green-500/85 via-emerald-500/85 to-teal-500/85 backdrop-blur-md shadow-xl flex-shrink-0">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl lg:text-4xl font-bold text-white drop-shadow-xl font-heading tracking-wider">
                {screen.title}
              </h1>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white font-heading tracking-wider">{formatTimeDisplay(currentTime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Foreground Media */}
        {showForegroundMedia && (
          <div
            className="bg-gray-900 flex-shrink-0 relative"
            style={{ height: `${foregroundMediaSize}vh` }}
          >
            {isVideoUrl(screen.foregroundMedia) ? (
              <video src={screen.foregroundMedia} className="w-full h-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <img src={screen.foregroundMedia} alt="Foreground Media" className="w-full h-full object-cover" />
            )}
          </div>
        )}

        {/* Menu Items Grid */}
        <div ref={gridContainerRef} className="flex-1 overflow-hidden p-3 bg-white/25 backdrop-blur-md relative">
          <MenuGrid
            items={visibleItems}
            showPrices={screen.showPrices}
            isPortrait={true}
            isTransitioning={isTransitioning}
            transitionDuration={screen.transitionDuration || 500}
          />

          {totalPages > 1 && (
            <PageIndicators currentPage={currentPage} totalPages={totalPages} />
          )}
        </div>
      </div>
    );
  }

  // LANDSCAPE MODE (16:9) - Horizontal layout
  return (
    <div className="h-screen flex flex-row fade-in overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - Frosted Glass */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-green-500/85 via-emerald-500/85 to-teal-500/85 backdrop-blur-md shadow-xl">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <h1 className="text-5xl xl:text-6xl font-bold text-white drop-shadow-xl font-heading tracking-wider">
                {screen.title}
              </h1>
              <div className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Clock className="w-5 h-5 text-white" />
                <span className="text-lg font-bold text-white font-heading tracking-wider">{formatTimeDisplay(currentTime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Column: Foreground Media (Top) + Menu Grid (Bottom) */}
        <div className="flex-1 flex flex-col gap-4 p-4 bg-white/25 backdrop-blur-md overflow-hidden">
          {/* Foreground Media (Top, Full Width, Landscape) */}
          {showForegroundMedia && (
            <div
              className="flex-shrink-0 bg-gray-900 rounded-xl overflow-hidden shadow-2xl w-full"
              style={{ height: `${foregroundMediaSize}vh` }}
            >
              {isVideoUrl(screen.foregroundMedia) ? (
                <video src={screen.foregroundMedia} className="w-full h-full object-cover" autoPlay loop muted playsInline />
              ) : (
                <img src={screen.foregroundMedia} alt="Foreground Media" className="w-full h-full object-cover" />
              )}
            </div>
          )}

          {/* Menu Items Grid - Bottom, Remaining Space */}
          <div ref={gridContainerRef} className="flex-1 overflow-hidden relative">
            <MenuGrid
              items={visibleItems}
              showPrices={screen.showPrices}
              isTransitioning={isTransitioning}
              transitionDuration={screen.transitionDuration || 500}
            />

            {totalPages > 1 && (
              <PageIndicators currentPage={currentPage} totalPages={totalPages} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ SHARED COMPONENTS ============

// Menu Grid Component - Fixed card size with dynamic fitting
const MenuGrid = React.memo(({ items, showPrices, isTransitioning = false, transitionDuration = 500, isPortrait = false }) => {
  const gapClass = isPortrait ? 'gap-3' : 'gap-6';
  const minCardSize = isPortrait ? '200px' : '250px';
  const maxCardSize = isPortrait ? '200px' : '250px';

  return (
    <div
      className="h-full transition-opacity"
      style={{
        opacity: isTransitioning ? 0 : 1,
        transitionDuration: `${transitionDuration}ms`
      }}
    >
      <div
        className={`grid ${gapClass} mx-auto h-full content-start`}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(${minCardSize}, ${maxCardSize}))`
        }}
      >
        {items.map((item) => (
          <div key={item.id}>
            <MenuItemDisplay
              item={item}
              showPrices={showPrices}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

// Page Indicators Component
const PageIndicators = React.memo(({ currentPage, totalPages }) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-green-600/80 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg z-10">
      {Array.from({ length: totalPages }).map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full transition-all ${
            index === currentPage
              ? 'bg-white w-8 shadow-md'
              : 'bg-white/50'
          }`}
        />
      ))}
    </div>
  );
});

export default TimeBasedRenderer;
