import { useEffect, useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { getAllCurrentMenuIds, getCurrentTime, getCurrentDayOfWeek, formatTimeDisplay } from '../../utils/timeUtils';
import { speakTokenNumber } from '../../utils/speechUtils';
import MenuItemDisplay from './MenuItemDisplay';
import { Hash, Clock, Users } from 'lucide-react';

const TimeBasedRenderer = ({ screen, displaySettings }) => {
  const { getMenuById, getItemsByIds, servingToken, tokenHistory } = useData();
  const [currentMenuId, setCurrentMenuId] = useState(null);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // Carousel pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Track previous token to detect changes
  const prevTokenRef = useRef(null);

  // Voice announcement when token changes
  useEffect(() => {
    // Check if token exists and has changed
    if (servingToken && servingToken.number !== prevTokenRef.current) {
      // Only announce if this is not the first load (prevTokenRef.current is not null)
      if (prevTokenRef.current !== null) {
        // Announce the new token number
        speakTokenNumber(servingToken.number);
      }
      // Update the previous token reference
      prevTokenRef.current = servingToken.number;
    } else if (!servingToken) {
      // Reset when token is cleared
      prevTokenRef.current = null;
    }
  }, [servingToken]);

  // Update current menu based on time AND day using screen's own timeSlots
  useEffect(() => {
    const updateMenu = () => {
      const time = getCurrentTime();
      const day = getCurrentDayOfWeek();
      setCurrentTime(time);

      // Create a schedule-like object from screen's timeSlots
      const screenSchedule = {
        timeSlots: screen.timeSlots || [],
        defaultMenuId: screen.defaultMenuId
      };

      const menuIds = getAllCurrentMenuIds(screenSchedule, time, day);

      // Fallback to default menu if no active time slots
      if (menuIds.length === 0 && screen.defaultMenuId) {
        setCurrentMenuId(screen.defaultMenuId);
      } else if (menuIds.length > 0) {
        setCurrentMenuId(menuIds[0]); // Use first active menu
      } else {
        setCurrentMenuId(null);
      }
    };

    // Initial update
    updateMenu();

    // Update every minute
    const interval = setInterval(updateMenu, 60000);

    return () => clearInterval(interval);
  }, [screen]);

  const currentMenu = getMenuById(currentMenuId);
  const menuItems = currentMenu ? getItemsByIds(currentMenu.itemIds) : [];

  // Filter only active items
  const activeItems = menuItems.filter(item => item.isActive);

  // Calculate items per page based on viewport (Optimized for 55" displays)
  useEffect(() => {
    const calculateItemsPerPage = () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // More accurate measurements
      const headerHeight = 100; // Reduced from 120 for more accurate measurement
      const indicatorHeight = 40; // Reserve space for page indicators
      const paddingVertical = 48; // Top and bottom padding (24px each)
      const availableHeight = viewportHeight - headerHeight - indicatorHeight - paddingVertical;

      if (displaySettings.layoutStyle === 'list') {
        // List layout: More accurate item height measurement
        const itemHeight = 165; // 160px (h-40 image = 10rem) + gap
        const gap = 16; // gap-4 in list layout
        // Account for gaps: (height + gap) / (itemHeight + gap)
        const rows = Math.floor((availableHeight + gap) / (itemHeight + gap));
        return Math.max(1, rows);
      } else {
        // Grid layout - calculate based on actual right panel width
        const rightPanelWidth = viewportWidth * 0.65; // 65% for right panel on large screens

        // Column calculation for larger displays (55" monitors)
        let cols = 1;
        if (rightPanelWidth >= 2000) cols = 5; // Ultra-wide 4K displays
        else if (rightPanelWidth >= 1536) cols = 4; // 2xl
        else if (rightPanelWidth >= 1280) cols = 3; // xl
        else if (rightPanelWidth >= 768) cols = 2; // md

        // Updated card height for optimized design: h-44 (176px) + content (~84px)
        const cardHeight = 260; // 176 (image) + 84 (content with reduced padding)
        const gap = 24; // gap-6 in grid layout
        // Account for gaps between rows
        const rows = Math.floor((availableHeight + gap) / (cardHeight + gap));

        return Math.max(1, rows * cols);
      }
    };

    const updateItemsPerPage = () => {
      setItemsPerPage(calculateItemsPerPage());
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);

    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, [displaySettings.layoutStyle]);

  // Auto-rotation carousel
  useEffect(() => {
    if (activeItems.length <= itemsPerPage) {
      // Don't rotate if all items fit on one page
      setCurrentPage(0);
      return;
    }

    const totalPages = Math.ceil(activeItems.length / itemsPerPage);
    const transitionDuration = displaySettings.transitionDuration || 500;
    const displayDuration = 5000; // Show each page for 5 seconds
    const totalCycleDuration = transitionDuration + displayDuration;

    const rotationInterval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentPage(prev => (prev + 1) % totalPages);
        setIsTransitioning(false);
      }, transitionDuration);

    }, totalCycleDuration);

    return () => clearInterval(rotationInterval);
  }, [activeItems.length, itemsPerPage, displaySettings.transitionDuration]);

  // Calculate visible items for current page
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleItems = activeItems.slice(startIndex, endIndex);
  const totalPages = Math.ceil(activeItems.length / itemsPerPage);

  if (!currentMenu || activeItems.length === 0) {
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

  return (
    <div className="min-h-screen fade-in flex flex-col lg:flex-row">
      {/* LEFT PANEL - Customer Service Zone (Token Display) */}
      <div className="lg:w-[35%] bg-gradient-to-br from-gray-900/50 via-gray-800 to-gray-900/50 backdrop-blur-sm flex flex-col justify-between min-h-screen lg:min-h-0 lg:fixed lg:left-0 lg:top-0 lg:bottom-0 border-r-4 border-yellow-500">

        {/* Top Section - Branding */}
        <div className="p-8 text-center border-b border-gray-700">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Users className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white tracking-wide">Queue Management</h2>
          </div>
          <p className="text-gray-400 text-sm">Real-time order tracking system</p>
        </div>

        {/* Center Hero Section - NOW SERVING */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
          {servingToken ? (
            <>
              {/* Current Token - Large Display */}
              <div className="text-center transform transition-all duration-500">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white bg-opacity-10 rounded-full backdrop-blur-sm">
                    <Hash className="w-6 h-6 text-yellow-400" />
                    <span className="text-xl font-bold text-white uppercase tracking-widest">Now Serving</span>
                  </div>
                </div>

                {/* Massive Token Number */}
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white rounded-3xl p-12 shadow-2xl transform hover:scale-105 transition-transform">
                    <div className="text-9xl font-black leading-none drop-shadow-2xl">
                      {servingToken.number}
                    </div>
                  </div>
                </div>

                {/* Subtext */}
                <div className="mt-8 text-gray-300 text-lg">
                  <p className="mb-2">Please collect your order</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Updated: {formatTimeDisplay(currentTime)}</span>
                  </div>
                </div>
              </div>

              {/* Recently Called Tokens */}
              {tokenHistory.length > 1 && (
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
              <Hash className="w-24 h-24 mx-auto mb-4 opacity-30" />
              <p className="text-2xl font-semibold">No Active Token</p>
              <p className="text-sm mt-2 opacity-70">Waiting for next customer</p>
            </div>
          )}
        </div>

        {/* Bottom Section - Queue Info */}
        <div className="p-6 border-t border-gray-700 bg-black bg-opacity-30">
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm font-medium">Please wait for your number to be called</p>
            <div className="flex items-center justify-center gap-2 text-yellow-400 text-xs">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Menu Showcase */}
      <div className="flex-1 lg:ml-[35%] h-screen overflow-hidden bg-gradient-to-br from-white/10 to-gray-50/10 backdrop-blur-sm flex flex-col">

        {/* Slim Menu Header */}
        <div className="sticky top-0 z-40 bg-white/50 shadow-md border-b-2 border-yellow-500">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Food Menu
                </h1>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{formatTimeDisplay(currentTime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items Grid - Fixed Height with Transitions */}
        <div className="flex-1 overflow-hidden p-6">
          <div
            className="h-full transition-opacity"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transitionDuration: `${displaySettings.transitionDuration || 500}ms`
            }}
          >
            {displaySettings.layoutStyle === 'list' ? (
              <div className="max-w-5xl mx-auto space-y-4 h-full flex flex-col justify-center">
                {visibleItems.map((item, index) => (
                  <div key={item.id}>
                    <MenuItemDisplay
                      item={item}
                      showPrices={displaySettings.showPrices}
                      showIngredients={displaySettings.showIngredients}
                      layoutStyle="list"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-rows-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mx-auto h-full content-center">
                {visibleItems.map((item, index) => (
                  <div key={item.id}>
                    <MenuItemDisplay
                      item={item}
                      showPrices={displaySettings.showPrices}
                      showIngredients={displaySettings.showIngredients}
                      layoutStyle="grid"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Page Indicators */}
          {totalPages > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-40 px-4 py-2 rounded-full backdrop-blur-sm">
              {Array.from({ length: totalPages }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentPage
                      ? 'bg-yellow-400 w-8'
                      : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeBasedRenderer;
