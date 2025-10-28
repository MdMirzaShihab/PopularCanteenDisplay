import { useEffect, useState, useRef, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { getAllCurrentMenuIds, getCurrentTime, getCurrentDayOfWeek, formatTimeDisplay } from '../../utils/timeUtils';
import { speakTokenNumber } from '../../utils/speechUtils';
import { isVideoUrl } from '../../utils/fileUtils';
import MenuItemDisplay from './MenuItemDisplay';
import { Hash, Clock, Users } from 'lucide-react';

const TimeBasedRenderer = ({ screen, displaySettings }) => {
  const { menus, getMenuById, getItemsByIds, servingToken, tokenHistory } = useData();
  const [currentMenuIds, setCurrentMenuIds] = useState([]);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(8); // Default, will be calculated
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Refs for measuring container size
  const gridContainerRef = useRef(null);
  const prevTokenRef = useRef(null);

  // Voice announcement when token changes
  useEffect(() => {
    const announceToken = async () => {
      if (servingToken && servingToken.number !== prevTokenRef.current) {
        if (prevTokenRef.current !== null) {
          try {
            await speakTokenNumber(servingToken.number);
          } catch {
            // Silently handle errors
          }
        }
        prevTokenRef.current = servingToken.number;
      } else if (!servingToken) {
        prevTokenRef.current = null;
      }
    };

    announceToken();
  }, [servingToken]);

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
      const menu = getMenuById(menuId);
      return menu ? menu.itemIds : [];
    });

    const uniqueItemIds = [...new Set(allItemIds)];
    const menuItems = getItemsByIds(uniqueItemIds);
    return menuItems.filter(item => item.isActive);
  }, [currentMenuIds, menus, getMenuById, getItemsByIds]);

  // Get display settings (moved before useEffect to avoid initialization errors)
  const tokenWindowState = displaySettings.tokenWindow || 'off';
  const foregroundMediaDisplay = displaySettings.foregroundMediaDisplay || 'off';
  const orientation = displaySettings.orientation || 'landscape';
  const isPortrait = orientation === 'portrait';

  // Calculate panel sizes
  const showTokenPanel = tokenWindowState !== 'off';
  const showForegroundMedia = foregroundMediaDisplay !== 'off' && screen.foregroundMedia;
  const isForegroundFullScreen = foregroundMediaDisplay === 'fullScreen';

  // Token panel sizes (adjusted for portrait)
  const tokenSize = tokenWindowState === 'large' ? 40 : (isPortrait ? 12 : 10); // percentage - portrait slightly larger for readability

  // Foreground media size
  const foregroundMediaSize = 20; // percentage

  // Calculate items per page based on container size and fixed card dimensions
  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (!gridContainerRef.current) return;

      const container = gridContainerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Safety check: container not rendered yet
      if (containerWidth === 0 || containerHeight === 0) {
        return;
      }

      // Fixed card dimensions
      const currentIsPortrait = (displaySettings.orientation || 'landscape') === 'portrait';
      const cardWidth = currentIsPortrait ? 200 : 250; // min card width in px
      const cardHeight = 320; // approximate card height in px
      const gap = currentIsPortrait ? 12 : 24; // gap between cards in px
      // Portrait grid has p-3 (12px) padding, landscape grid has no padding (parent has padding)
      const padding = currentIsPortrait ? 12 : 0; // container padding in px

      // Calculate available space (subtract padding if any)
      const availableWidth = containerWidth - (padding * 2);
      const availableHeight = containerHeight - (padding * 2);

      // Calculate how many columns and rows fit
      const columns = Math.floor((availableWidth + gap) / (cardWidth + gap)) || 1;
      const rows = Math.floor((availableHeight + gap) / (cardHeight + gap)) || 1;

      const calculatedItems = columns * rows;

      // Ensure at least 4 items per page, but be more conservative in portrait
      const minItems = currentIsPortrait ? 2 : 4;
      setItemsPerPage(Math.max(minItems, calculatedItems));
    };

    // Initial calculation with longer delay to ensure layout is settled (especially for portrait mode)
    const timeoutId = setTimeout(() => {
      calculateItemsPerPage();
    }, 300);

    // Use ResizeObserver with debounce to watch container size changes
    let resizeTimeoutId;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(() => {
        calculateItemsPerPage();
      }, 300); // 300ms debounce for better stability
    });

    if (gridContainerRef.current) {
      resizeObserver.observe(gridContainerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(resizeTimeoutId);
      resizeObserver.disconnect();
    };
  }, [displaySettings.orientation, tokenWindowState, showTokenPanel, showForegroundMedia]);

  // Auto-rotation carousel
  useEffect(() => {
    console.log('⚙️  Display settings:', {
      transitionDuration: displaySettings.transitionDuration,
      slideDelay: displaySettings.slideDelay,
      orientation: displaySettings.orientation
    });

    if (activeItems.length <= itemsPerPage) {
      setCurrentPage(0);
      setIsTransitioning(false);
      return;
    }

    const totalPages = Math.ceil(activeItems.length / itemsPerPage);
    const transitionDuration = displaySettings.transitionDuration || 500;
    const displayDuration = displaySettings.slideDelay || 5000;


    // Recursive function for carousel rotation
    let displayTimeoutId;
    let transitionTimeoutId;
    let isCancelled = false;

    const scheduleNextTransition = () => {
      if (isCancelled) return;

      // Wait for display duration, then start transition
      displayTimeoutId = setTimeout(() => {
        if (isCancelled) return;

        setIsTransitioning(true);

        // After transition duration, change page and schedule next
        transitionTimeoutId = setTimeout(() => {
          if (isCancelled) return;

          setCurrentPage(prev => {
            const nextPage = (prev + 1) % totalPages;
            return nextPage;
          });
          setIsTransitioning(false);

          // Schedule the next transition
          scheduleNextTransition();
        }, transitionDuration);
      }, displayDuration);
    };

    // Start the carousel
    scheduleNextTransition();

    return () => {
      isCancelled = true;
      clearTimeout(displayTimeoutId);
      clearTimeout(transitionTimeoutId);
    };
  }, [activeItems.length, itemsPerPage, displaySettings.transitionDuration, displaySettings.slideDelay]);

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

  // NORMAL MODES - Layout based on orientation
  if (isPortrait) {
    // PORTRAIT MODE (9:16) - Vertical stacking: Header → Token → Media → Menu
    return (
      <div className="h-screen flex flex-col fade-in overflow-hidden">
        {/* Header - Always at Top - Frosted Glass */}
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

        {/* Token Panel (Below Header) - Portrait - Enhanced Blur */}
        {showTokenPanel && (
          <div
            className="bg-gradient-to-br from-gray-900/60 via-gray-800/60 to-gray-900/60 backdrop-blur-lg border-b-4 border-yellow-500 flex-shrink-0"
            style={{ height: `${tokenSize}vh` }}
          >
            <TokenPanelPortrait
              servingToken={servingToken}
              isCompact={tokenWindowState === 'on'}
            />
          </div>
        )}

        {/* Foreground Media (Below Token) */}
        {showForegroundMedia && !isForegroundFullScreen && (
          <div
            className="bg-gray-900 flex-shrink-0 relative"
            style={{ height: `${foregroundMediaSize}vh` }}
          >
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
        )}

        {/* Menu Items Grid - Portrait Compact - Frosted Glass Background */}
        <div ref={gridContainerRef} className="flex-1 overflow-hidden p-3 bg-white/25 backdrop-blur-md relative">
          <MenuGrid
            items={visibleItems}
            showPrices={displaySettings.showPrices}
            isPortrait={true}
            isTransitioning={isTransitioning}
            transitionDuration={displaySettings.transitionDuration || 500}
          />

          {/* Page Indicators */}
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
      {/* Token Panel (Left Side) - Landscape - Enhanced Blur */}
      {showTokenPanel && (
        <div
          className="bg-gradient-to-br from-gray-900/60 via-gray-800/60 to-gray-900/60 backdrop-blur-lg border-r-4 border-yellow-500 flex-shrink-0 h-full"
          style={{ width: `${tokenSize}vw` }}
        >
          <TokenPanelLandscape
            servingToken={servingToken}
            tokenHistory={tokenHistory}
            currentTime={currentTime}
            isCompact={tokenWindowState === 'on'}
          />
        </div>
      )}

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
          {showForegroundMedia && !isForegroundFullScreen && (
            <div
              className="flex-shrink-0 bg-gray-900 rounded-xl overflow-hidden shadow-2xl w-full"
              style={{ height: `${foregroundMediaSize}vh` }}
            >
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
          )}

          {/* Menu Items Grid - Bottom, Remaining Space */}
          <div ref={gridContainerRef} className="flex-1 overflow-hidden relative">
            <MenuGrid
              items={visibleItems}
              showPrices={displaySettings.showPrices}
              isTransitioning={isTransitioning}
              transitionDuration={displaySettings.transitionDuration || 500}
            />

            {/* Page Indicators */}
            {totalPages > 1 && (
              <PageIndicators currentPage={currentPage} totalPages={totalPages} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ PORTRAIT MODE COMPONENTS ============

// Portrait Token Panel - Adaptive Layout (Compact/Large)
const TokenPanelPortrait = ({ servingToken, isCompact }) => {
  // COMPACT MODE (12vh) - Horizontal Layout
  if (isCompact) {
    return (
      <div className="h-full flex items-center justify-between px-4 py-2">
        {/* Left: Queue Management Header - Compact */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">Queue Management</h2>
            <p className="text-xs text-gray-400 leading-tight">Real-time tracking</p>
          </div>
        </div>

        {/* Center: NOW SERVING Badge */}
        <div className="flex items-center gap-2 px-2 py-1 bg-white bg-opacity-10 rounded-full backdrop-blur-sm">
          <Hash className="w-3 h-3 text-yellow-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wide">Now Serving</span>
        </div>

        {/* Right: Token Number - Compact */}
        {servingToken ? (
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 opacity-20 blur-xl rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white rounded-xl px-4 py-2 shadow-xl">
              <div className="text-4xl font-black leading-none drop-shadow-xl">
                {servingToken.number}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <Hash className="w-8 h-8 opacity-30" />
            <span className="text-sm font-semibold">No Token</span>
          </div>
        )}
      </div>
    );
  }

  // LARGE MODE (40vh) - Vertical Centered Layout
  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      {/* Queue Management Header - Compact */}
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-yellow-400" />
        <div className="text-center">
          <h2 className="text-base font-bold text-white leading-tight">Queue Management</h2>
          <p className="text-xs text-gray-400 leading-tight">Real-time tracking</p>
        </div>
      </div>

      {/* Token Display - Large */}
      {servingToken ? (
        <div className="text-center">
          {/* NOW SERVING Badge */}
          <div className="mb-4">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white bg-opacity-10 rounded-full backdrop-blur-sm">
              <Hash className="w-5 h-5 text-yellow-400" />
              <span className="text-base font-bold text-white uppercase tracking-widest">Now Serving</span>
            </div>
          </div>

          {/* Large Token Number */}
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform">
              <div className="text-8xl font-black leading-none drop-shadow-2xl">
                {servingToken.number}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400">
          <Hash className="w-20 h-20 mx-auto mb-4 opacity-30" />
          <p className="text-2xl font-semibold">No Active Token</p>
          <p className="text-sm mt-2 opacity-70">Waiting for next customer</p>
        </div>
      )}
    </div>
  );
};

// ============ LANDSCAPE MODE COMPONENTS ============

// Landscape Token Panel - Vertical Layout (Original)
const TokenPanelLandscape = ({ servingToken, tokenHistory, currentTime, isCompact }) => {
  return (
    <div className="h-full flex flex-col justify-between">
      {/* Top Section - Branding */}
      <div className={`${isCompact ? 'p-4' : 'p-8'} text-center border-b border-gray-700`}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <Users className={`${isCompact ? 'w-6 h-6' : 'w-8 h-8'} text-yellow-400`} />
          <h2 className={`${isCompact ? 'text-xl' : 'text-2xl'} font-bold text-white tracking-wide`}>Queue Management</h2>
        </div>
        <p className="text-gray-400 text-sm">Real-time order tracking</p>
      </div>

      {/* Center Section - NOW SERVING */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
        {servingToken ? (
          <>
            {/* Current Token */}
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white bg-opacity-10 rounded-full backdrop-blur-sm">
                  <Hash className={`${isCompact ? 'w-4 h-4' : 'w-6 h-6'} text-yellow-400`} />
                  <span className={`${isCompact ? 'text-sm' : 'text-xl'} font-bold text-white uppercase tracking-widest`}>Now Serving</span>
                </div>
              </div>

              {/* Token Number */}
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform">
                  <div className={`${isCompact ? 'text-6xl' : 'text-9xl'} font-black leading-none drop-shadow-2xl`}>
                    {servingToken.number}
                  </div>
                </div>
              </div>

              {/* Subtext */}
              <div className="mt-4 text-gray-300 text-sm">
                <p className="mb-2">Please collect your order</p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {formatTimeDisplay(currentTime)}</span>
                </div>
              </div>
            </div>

            {/* Recently Called Tokens */}
            {!isCompact && tokenHistory.length > 1 && (
              <div className="w-full max-w-md">
                <div className="bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 text-center">
                    Recently Called
                  </h3>
                  <div className="flex justify-center gap-3">
                    {tokenHistory.slice(1, 3).map((token, index) => (
                      <div
                        key={index}
                        className="bg-gray-700 bg-opacity-50 backdrop-blur-sm px-6 py-3 rounded-lg border border-gray-600"
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-2xl font-bold text-gray-300">{token.number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-400">
            <Hash className={`${isCompact ? 'w-16 h-16' : 'w-24 h-24'} mx-auto mb-4 opacity-30`} />
            <p className={`${isCompact ? 'text-xl' : 'text-2xl'} font-semibold`}>No Active Token</p>
            <p className="text-sm mt-2 opacity-70">Waiting for next customer</p>
          </div>
        )}
      </div>

      {/* Bottom Section - Queue Info */}
      <div className={`${isCompact ? 'p-3' : 'p-6'} border-t border-gray-700 bg-black bg-opacity-30`}>
        <div className="text-center space-y-2">
          <p className="text-gray-400 text-sm font-medium">Please wait for your number</p>
          <div className="flex items-center justify-center gap-2 text-yellow-400 text-xs">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>Live Updates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ SHARED COMPONENTS ============

// Menu Grid Component - Fixed card size with dynamic fitting
const MenuGrid = ({ items, showPrices, isTransitioning = false, transitionDuration = 500, isPortrait = false }) => {
  // Portrait uses tighter spacing and smaller fixed card size
  const gapClass = isPortrait ? 'gap-3' : 'gap-6';
  const minCardSize = isPortrait ? '200px' : '250px';
  const maxCardSize = isPortrait ? '200px' : '250px'; // Fixed size

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
};

// Page Indicators Component
const PageIndicators = ({ currentPage, totalPages }) => {
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
};

export default TimeBasedRenderer;
