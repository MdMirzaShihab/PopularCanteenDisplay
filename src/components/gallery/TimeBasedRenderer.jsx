import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { getAllCurrentMenuIds, getCurrentTime, getCurrentDayOfWeek, formatTimeDisplay } from '../../utils/timeUtils';
import { isVideoUrl } from '../../utils/fileUtils';
import MenuItemDisplay from './MenuItemDisplay';
import { Clock } from 'lucide-react';

// ============ ITEM RENDERERS ============

// PORTRAIT 1: Clean List — premium price-list rows with round thumbnails & dotted connector
const CleanListItem = ({ item, showPrices }) => (
  <div className="flex items-center gap-3 2xl:gap-5 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2 2xl:px-6 2xl:py-3 border border-white/60 shadow-md h-full">
    {item.image && (
      <div className="w-14 h-14 2xl:w-[4.5rem] 2xl:h-[4.5rem] flex-shrink-0 rounded-full overflow-hidden shadow-lg ring-2 ring-emerald-300/40">
        {isVideoUrl(item.image) ? (
          <video src={item.image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
        ) : (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        )}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="font-bold text-gray-900 text-sm 2xl:text-lg font-display truncate">{item.name}</p>
    </div>
    {showPrices && <>
      <div className="flex-shrink min-w-4 max-w-24 border-b-2 border-dotted border-gray-300/70 mx-1" />
      <span className="text-emerald-700 font-bold font-heading text-xl 2xl:text-2xl flex-shrink-0 tabular-nums">৳{item.price.toFixed(0)}</span>
    </>}
  </div>
);

// PORTRAIT 2: Elegant — gold-accented luxury cards with script font & ornamental dividers
const ElegantItem = ({ item, showPrices }) => (
  <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl p-4 2xl:p-5 border border-amber-400/25 shadow-lg shadow-amber-900/20 h-full">
    <div className="w-24 h-24 2xl:w-32 2xl:h-32 rounded-full overflow-hidden border-[3px] border-amber-300/60 shadow-xl shadow-amber-900/30 mb-3 flex-shrink-0 bg-gray-900/30">
      {item.image && (
        isVideoUrl(item.image) ? (
          <video src={item.image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
        ) : (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        )
      )}
    </div>
    <p className="text-white font-script text-lg 2xl:text-2xl text-center leading-tight mb-1.5 drop-shadow-md">{item.name}</p>
    <div className="w-12 2xl:w-16 h-[2px] bg-gradient-to-r from-transparent via-amber-300/70 to-transparent rounded mb-2" />
    <p className="text-white/65 text-xs 2xl:text-sm text-center line-clamp-2 font-body flex-1">{item.description}</p>
    {showPrices && (
      <span className="mt-2 text-amber-300 font-bold font-heading text-lg 2xl:text-xl drop-shadow-sm">৳{item.price.toFixed(0)}</span>
    )}
  </div>
);

// PORTRAIT 3: Compact — dense information grid with alternating tones
const CompactItem = ({ item, showPrices, index }) => (
  <div className={`flex items-center justify-between backdrop-blur-sm rounded-lg px-3 py-2 2xl:px-4 2xl:py-3 h-full border border-white/10 ${index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'}`}>
    <span className="text-white font-body text-sm 2xl:text-base font-semibold truncate flex-1 mr-2 drop-shadow-sm">{item.name}</span>
    {showPrices && (
      <span className="text-white font-heading font-bold text-sm 2xl:text-base flex-shrink-0 bg-emerald-500/30 border border-emerald-400/20 px-2.5 py-0.5 2xl:px-3 2xl:py-1 rounded-full tabular-nums">
        ৳{item.price.toFixed(0)}
      </span>
    )}
  </div>
);

// PORTRAIT 4: Catalog — magazine-style image cards with cinematic gradient overlay
const CatalogItem = ({ item, showPrices }) => (
  <div className="relative rounded-2xl overflow-hidden shadow-xl h-full bg-gray-900">
    {item.image && (
      isVideoUrl(item.image) ? (
        <video src={item.image} className="w-full h-3/5 object-cover" autoPlay muted loop playsInline />
      ) : (
        <img src={item.image} alt={item.name} className="w-full h-3/5 object-cover" />
      )
    )}
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 2xl:p-5">
      <p className="text-white font-display font-bold text-base 2xl:text-lg leading-tight drop-shadow-md">{item.name}</p>
      {showPrices && (
        <p className="text-emerald-300 font-heading font-bold text-lg 2xl:text-xl mt-1 drop-shadow-sm">৳{item.price.toFixed(0)}</p>
      )}
    </div>
  </div>
);

// PORTRAIT 5: Showcase — dramatic hero cards with full-bleed imagery
const ShowcaseItem = ({ item, showPrices }) => (
  <div className="relative rounded-3xl overflow-hidden shadow-2xl h-full bg-gray-900">
    {item.image && (
      isVideoUrl(item.image) ? (
        <video src={item.image} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
      ) : (
        <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
      )
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
    <div className="absolute bottom-0 left-0 right-0 p-5 2xl:p-7">
      <p className="text-white font-heading text-2xl xl:text-3xl 2xl:text-4xl tracking-wide leading-tight drop-shadow-xl">{item.name}</p>
      <p className="text-white/75 text-sm 2xl:text-base font-body mt-1 line-clamp-2 drop-shadow-md">{item.description}</p>
      {showPrices && (
        <p className="text-emerald-300 font-heading text-xl 2xl:text-2xl font-bold mt-2 drop-shadow-lg">৳{item.price.toFixed(0)}</p>
      )}
    </div>
  </div>
);

// LANDSCAPE 1: Color Blocks — vibrant gradient tiles with bold pricing
const COLOR_PALETTE = [
  'from-emerald-500 to-emerald-700',
  'from-teal-500 to-teal-700',
  'from-cyan-600 to-cyan-800',
  'from-blue-500 to-blue-700',
  'from-indigo-500 to-indigo-700',
  'from-violet-500 to-violet-700',
  'from-purple-500 to-purple-700',
  'from-pink-500 to-pink-700',
  'from-rose-500 to-rose-700',
  'from-orange-500 to-orange-700',
  'from-amber-500 to-amber-700',
  'from-lime-500 to-lime-700',
];

const ColorBlocksItem = ({ item, showPrices, index }) => {
  const gradient = COLOR_PALETTE[index % COLOR_PALETTE.length];
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl overflow-hidden shadow-xl h-full flex flex-col ring-1 ring-white/10`}>
      {item.image && (
        <div className="h-3/5 overflow-hidden">
          {isVideoUrl(item.image) ? (
            <video src={item.image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
          ) : (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          )}
        </div>
      )}
      <div className="flex-1 flex flex-col justify-center p-3 2xl:p-4 text-center">
        <p className="text-white font-display font-bold text-base xl:text-lg 2xl:text-xl leading-tight drop-shadow-md">{item.name}</p>
        {showPrices && (
          <p className="text-white font-heading font-bold text-2xl 2xl:text-3xl mt-1 drop-shadow-lg">৳{item.price.toFixed(0)}</p>
        )}
      </div>
    </div>
  );
};

// LANDSCAPE 2: Menu Board — authentic chalkboard diner aesthetic
const MenuBoardItem = ({ item, showPrices, index }) => (
  <div className={`flex items-center gap-3 2xl:gap-4 border-b border-white/15 py-3 px-3 2xl:py-4 2xl:px-4 h-full ${index % 2 === 0 ? 'bg-white/[0.03]' : ''}`}>
    <span className="text-amber-300/50 font-heading text-base 2xl:text-lg flex-shrink-0 w-5 2xl:w-6 text-center">{'\u2666'}</span>
    <p className="text-white font-marker text-lg xl:text-xl 2xl:text-2xl flex-shrink-0 max-w-[55%] truncate drop-shadow-sm">{item.name}</p>
    <div className="flex-1 border-b-2 border-dotted border-white/40 mx-2 min-w-[20px]" />
    {showPrices && (
      <span className="text-yellow-300 font-heading font-bold text-xl 2xl:text-2xl flex-shrink-0 drop-shadow-md tabular-nums">৳{item.price.toFixed(0)}</span>
    )}
  </div>
);

// LANDSCAPE 3: Card Grid — reuses existing MenuItemDisplay
const CardGridItem = ({ item, showPrices }) => (
  <MenuItemDisplay item={item} showPrices={showPrices} />
);

// LANDSCAPE 4: Split — editorial two-panel layout with image and text
const SplitItem = ({ item, showPrices }) => (
  <div className="flex gap-0 bg-white/15 backdrop-blur-sm rounded-xl overflow-hidden h-full border border-white/25 shadow-lg">
    {item.image && (
      <div className="w-2/5 flex-shrink-0">
        {isVideoUrl(item.image) ? (
          <video src={item.image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
        ) : (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        )}
      </div>
    )}
    <div className="flex-1 flex flex-col justify-center p-4 2xl:p-5">
      <p className="text-white font-display font-bold text-base xl:text-lg 2xl:text-xl leading-tight drop-shadow-md">{item.name}</p>
      <p className="text-white/65 text-xs 2xl:text-sm line-clamp-2 font-body mt-1.5">{item.description}</p>
      {showPrices && <>
        <div className="w-10 h-[2px] bg-emerald-400/40 rounded mt-2 mb-1.5" />
        <p className="text-emerald-300 font-heading font-bold text-xl 2xl:text-2xl drop-shadow-sm">৳{item.price.toFixed(0)}</p>
      </>}
    </div>
  </div>
);

// LANDSCAPE 5: Minimal Rows — Swiss-inspired precision with strong accent bar
const MinimalRowsItem = ({ item, showPrices }) => (
  <div className="flex items-center gap-4 2xl:gap-6 h-full px-5 2xl:px-7 border-l-[5px] 2xl:border-l-[6px] border-emerald-400/70 bg-white/[0.08] backdrop-blur-sm rounded-r-lg">
    {item.image && (
      <div className="w-14 h-14 2xl:w-[4.5rem] 2xl:h-[4.5rem] flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
        {isVideoUrl(item.image) ? (
          <video src={item.image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
        ) : (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        )}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-white font-body text-base xl:text-lg 2xl:text-xl font-semibold truncate">{item.name}</p>
      <p className="text-white/60 text-xs 2xl:text-sm font-body truncate">{item.description}</p>
    </div>
    {showPrices && (
      <span className="text-white font-heading font-bold text-xl 2xl:text-2xl ml-4 flex-shrink-0 tabular-nums">৳{item.price.toFixed(0)}</span>
    )}
  </div>
);

// ============ THEME CONFIG ============

const THEME_CONFIG = {
  // --- Portrait (optimized for 43" TV in portrait: 1080x1920) ---
  'clean-list': {
    isPortrait: true,
    cardW: 500, cardH: 95, gap: 10,
    gridCols: 'repeat(1, 1fr)',
    contentBg: 'bg-black/30 backdrop-blur-sm',
    headerGradient: 'bg-gradient-to-r from-slate-700/90 to-slate-900/90',
    headerTextDark: false,
    ItemRenderer: CleanListItem,
  },
  'elegant': {
    isPortrait: true,
    cardW: 230, cardH: 340, gap: 14,
    gridCols: null,
    contentBg: 'bg-black/40 backdrop-blur-md',
    headerGradient: 'bg-gradient-to-r from-amber-800/85 via-yellow-900/85 to-amber-900/85',
    headerTextDark: false,
    ItemRenderer: ElegantItem,
  },
  'compact': {
    isPortrait: true,
    cardW: 220, cardH: 58, gap: 8,
    gridCols: 'repeat(2, 1fr)',
    contentBg: 'bg-black/50 backdrop-blur-md',
    headerGradient: 'bg-gradient-to-r from-orange-600/85 to-amber-700/85',
    headerTextDark: false,
    ItemRenderer: CompactItem,
  },
  'catalog': {
    isPortrait: true,
    cardW: 240, cardH: 310, gap: 14,
    gridCols: null,
    contentBg: 'bg-black/30 backdrop-blur-sm',
    headerGradient: 'bg-gradient-to-r from-rose-700/85 to-pink-900/85',
    headerTextDark: false,
    ItemRenderer: CatalogItem,
  },
  'showcase': {
    isPortrait: true,
    cardW: 320, cardH: 400, gap: 18,
    gridCols: null,
    contentBg: 'bg-black/20 backdrop-blur-sm',
    headerGradient: 'bg-gradient-to-r from-teal-700/85 to-cyan-900/85',
    headerTextDark: false,
    ItemRenderer: ShowcaseItem,
  },

  // --- Landscape (optimized for 43" TV: 1920x1080) ---
  'color-blocks': {
    isPortrait: false,
    cardW: 250, cardH: 310, gap: 16,
    gridCols: null,
    contentBg: 'bg-black/20',
    headerGradient: 'bg-gradient-to-r from-gray-900/95 to-gray-800/95',
    headerTextDark: false,
    ItemRenderer: ColorBlocksItem,
  },
  'menu-board': {
    isPortrait: false,
    cardW: 500, cardH: 78, gap: 2,
    gridCols: 'repeat(2, 1fr)',
    contentBg: 'bg-gray-900/80 backdrop-blur-md',
    headerGradient: 'bg-gradient-to-r from-stone-900/95 to-neutral-900/95',
    headerTextDark: false,
    ItemRenderer: MenuBoardItem,
  },
  'card-grid': {
    isPortrait: false,
    cardW: 280, cardH: 360, gap: 24,
    gridCols: null,
    contentBg: 'bg-white/25 backdrop-blur-md',
    headerGradient: 'bg-gradient-to-r from-green-500/85 via-emerald-500/85 to-teal-500/85',
    headerTextDark: false,
    ItemRenderer: CardGridItem,
  },
  'split': {
    isPortrait: false,
    cardW: 380, cardH: 210, gap: 14,
    gridCols: null,
    contentBg: 'bg-black/30 backdrop-blur-sm',
    headerGradient: 'bg-gradient-to-r from-blue-700/85 to-blue-900/85',
    headerTextDark: false,
    ItemRenderer: SplitItem,
  },
  'minimal-rows': {
    isPortrait: false,
    cardW: 600, cardH: 88, gap: 8,
    gridCols: 'repeat(1, 1fr)',
    contentBg: 'bg-black/30 backdrop-blur-sm',
    headerGradient: 'bg-gradient-to-r from-emerald-700/85 to-green-900/85',
    headerTextDark: false,
    ItemRenderer: MinimalRowsItem,
  },

  // --- Special (media-focus uses card-grid layout) ---
  'media-focus': {
    isPortrait: false,
    cardW: 280, cardH: 360, gap: 24,
    gridCols: null,
    contentBg: 'bg-white/25 backdrop-blur-md',
    headerGradient: 'bg-gradient-to-r from-green-500/85 via-emerald-500/85 to-teal-500/85',
    headerTextDark: false,
    ItemRenderer: CardGridItem,
  },
};

// ============ MAIN COMPONENT ============

const TimeBasedRenderer = ({ screen }) => {
  const { items, menus } = useData();
  const [currentMenuIds, setCurrentMenuIds] = useState([]);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const gridContainerRef = useRef(null);

  const theme = screen.theme || 'card-grid';
  const config = THEME_CONFIG[theme] ?? THEME_CONFIG['card-grid'];
  const isForegroundFullScreen = theme === 'none';
  const showForegroundMedia = theme === 'media-focus' && screen.foregroundMedia;
  const foregroundMediaSize = 20;

  // Time-based menu resolution
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

  // Active items
  const activeItems = useMemo(() => {
    const allItemIds = currentMenuIds.flatMap(menuId => {
      const menu = menus.find(m => m.id === menuId);
      return menu ? menu.itemIds : [];
    });
    const uniqueItemIds = [...new Set(allItemIds)];
    return items.filter(i => uniqueItemIds.includes(i.id)).filter(item => item.isActive);
  }, [currentMenuIds, menus, items]);

  // Config-driven itemsPerPage calculation
  useEffect(() => {
    if (isForegroundFullScreen) return;
    const { cardW, cardH, gap } = config;

    const calculateItemsPerPage = () => {
      if (!gridContainerRef.current) return;
      const containerWidth = gridContainerRef.current.clientWidth;
      const containerHeight = gridContainerRef.current.clientHeight;
      if (containerWidth === 0 || containerHeight === 0) return;

      const padding = config.isPortrait ? 12 : 0;
      const availW = containerWidth - (padding * 2);
      const availH = containerHeight - (padding * 2);

      const columns = config.gridCols
        ? parseInt(config.gridCols.match(/\d+/)?.[0] ?? '1', 10)
        : Math.floor((availW + gap) / (cardW + gap)) || 1;
      const rows = Math.floor((availH + gap) / (cardH + gap)) || 1;

      const calculated = columns * rows;
      setItemsPerPage(Math.max(2, calculated));
    };

    const timeoutId = setTimeout(calculateItemsPerPage, 300);
    let resizeTimeoutId;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(calculateItemsPerPage, 300);
    });
    if (gridContainerRef.current) {
      resizeObserver.observe(gridContainerRef.current);
    }
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(resizeTimeoutId);
      resizeObserver.disconnect();
    };
  }, [config, isForegroundFullScreen]);

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
    let isCancelled = false;
    let displayTimeoutId;
    let transitionTimeoutId;

    const scheduleNextTransition = () => {
      if (isCancelled) return;
      displayTimeoutId = setTimeout(() => {
        if (isCancelled) return;
        setIsTransitioning(true);
        transitionTimeoutId = setTimeout(() => {
          if (isCancelled) return;
          setCurrentPage(prev => (prev + 1) % totalPages);
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

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleItems = activeItems.slice(startIndex, endIndex);
  const totalPages = Math.ceil(activeItems.length / itemsPerPage);

  // Empty state (not for 'none' theme)
  if (!isForegroundFullScreen && (currentMenuIds.length === 0 || activeItems.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-4xl 2xl:text-5xl font-bold text-white mb-4">No menu available at this time</h2>
          <p className="text-xl 2xl:text-2xl text-white text-opacity-80">Current time: {formatTimeDisplay(currentTime)}</p>
        </div>
      </div>
    );
  }

  // ===== FULLSCREEN / ANNOUNCEMENT MODE =====
  if (isForegroundFullScreen) {
    const customMessages = screen.customMessages || [];
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <ThemeHeader
          title={screen.title}
          currentTime={currentTime}
          gradient="bg-gradient-to-r from-green-500/85 via-emerald-500/85 to-teal-500/85"
          compact={false}
        />
        <div className="flex-1 relative">
          {screen.foregroundMedia && (
            isVideoUrl(screen.foregroundMedia) ? (
              <video src={screen.foregroundMedia} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <img src={screen.foregroundMedia} alt="Foreground Media" className="absolute inset-0 w-full h-full object-cover" />
            )
          )}
          {customMessages.length > 0 && (
            <CustomMessageOverlay
              messages={customMessages}
              slideDelay={screen.slideDelay || 5000}
              transitionDuration={screen.transitionDuration || 500}
            />
          )}
        </div>
      </div>
    );
  }

  // ===== UNIVERSAL THEME RENDER =====
  const isPortrait = config.isPortrait;

  return (
    <div className={`h-screen flex ${isPortrait ? 'flex-col' : 'flex-col'} fade-in overflow-hidden`}>
      {/* Header */}
      <ThemeHeader
        title={screen.title}
        currentTime={currentTime}
        gradient={config.headerGradient}
        compact={isPortrait}
        textDark={config.headerTextDark}
      />

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Foreground media strip (media-focus only) */}
        {showForegroundMedia && (
          <div className="flex-shrink-0 bg-gray-900 relative" style={{ height: `${foregroundMediaSize}vh` }}>
            {isVideoUrl(screen.foregroundMedia) ? (
              <video src={screen.foregroundMedia} className="w-full h-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <img src={screen.foregroundMedia} alt="Foreground Media" className="w-full h-full object-cover" />
            )}
          </div>
        )}

        {/* Item grid */}
        <div ref={gridContainerRef} className={`flex-1 overflow-hidden relative ${isPortrait ? 'p-3 2xl:p-5' : 'p-4 2xl:p-6'} ${config.contentBg}`}>
          <ThemeGrid
            items={visibleItems}
            showPrices={screen.showPrices}
            isTransitioning={isTransitioning}
            transitionDuration={screen.transitionDuration || 500}
            config={config}
          />
          {totalPages > 1 && (
            <PageIndicators currentPage={currentPage} totalPages={totalPages} />
          )}
        </div>
      </div>
    </div>
  );
};

// ============ SHARED COMPONENTS ============

// Unified header bar
const ThemeHeader = React.memo(({ title, currentTime, gradient, compact = false, textDark = false }) => {
  const textColor = textDark ? 'text-gray-900' : 'text-white';
  return (
    <div className={`sticky top-0 z-40 ${gradient} backdrop-blur-md shadow-xl flex-shrink-0`}>
      <div className={compact ? 'px-4 py-3 2xl:px-6 2xl:py-4' : 'px-6 py-5 2xl:px-8 2xl:py-6'}>
        <div className="flex items-center justify-between">
          <h1 className={`${compact ? 'text-3xl lg:text-4xl 2xl:text-5xl' : 'text-5xl xl:text-6xl 2xl:text-7xl'} font-bold ${textColor} drop-shadow-xl font-heading tracking-wider`}>
            {title}
          </h1>
          <div className={`flex items-center gap-2 ${compact ? 'px-3 py-2 2xl:px-4 2xl:py-3' : 'px-5 py-3 2xl:px-6 2xl:py-4'} bg-white/20 backdrop-blur-sm rounded-xl border border-white/30`}>
            <Clock className={`${compact ? 'w-4 h-4 2xl:w-5 2xl:h-5' : 'w-5 h-5 2xl:w-6 2xl:h-6'} ${textColor}`} />
            <span className={`${compact ? 'text-sm 2xl:text-base' : 'text-lg 2xl:text-xl'} font-bold ${textColor} font-heading tracking-wider`}>
              {formatTimeDisplay(currentTime)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

// Theme-aware grid
const ThemeGrid = React.memo(({ items, showPrices, isTransitioning, transitionDuration, config }) => {
  const { gridCols, cardW, cardH, gap } = config;
  const Renderer = config.ItemRenderer;
  const colsStyle = gridCols ?? `repeat(auto-fit, minmax(${cardW}px, ${cardW}px))`;

  return (
    <div
      className="h-full transition-opacity"
      style={{
        opacity: isTransitioning ? 0 : 1,
        transitionDuration: `${transitionDuration}ms`
      }}
    >
      <div
        className="grid h-full content-start"
        style={{
          gridTemplateColumns: colsStyle,
          gap: `${gap}px`,
          justifyContent: 'center'
        }}
      >
        {items.map((item, index) => (
          <div key={item.id} style={{ height: `${cardH}px` }}>
            <Renderer item={item} showPrices={showPrices} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
});

// Page indicators
const PageIndicators = React.memo(({ currentPage, totalPages }) => {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2.5 bg-black/60 px-5 py-3 rounded-full backdrop-blur-sm shadow-lg z-10">
      {Array.from({ length: totalPages }).map((_, index) => (
        <div
          key={index}
          className={`w-3 h-3 rounded-full transition-all ${
            index === currentPage
              ? 'bg-white w-10 shadow-md'
              : 'bg-white/50'
          }`}
        />
      ))}
    </div>
  );
});

// Custom message overlay for 'none' theme
const CustomMessageOverlay = React.memo(({ messages, slideDelay, transitionDuration }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (messages.length <= 1) return;
    let isCancelled = false;
    let displayTimeoutId;
    let transitionTimeoutId;

    const scheduleNext = () => {
      if (isCancelled) return;
      displayTimeoutId = setTimeout(() => {
        if (isCancelled) return;
        setIsTransitioning(true);
        transitionTimeoutId = setTimeout(() => {
          if (isCancelled) return;
          setCurrentIndex(prev => (prev + 1) % messages.length);
          setIsTransitioning(false);
          scheduleNext();
        }, transitionDuration);
      }, slideDelay);
    };
    scheduleNext();
    return () => {
      isCancelled = true;
      clearTimeout(displayTimeoutId);
      clearTimeout(transitionTimeoutId);
    };
  }, [messages.length, slideDelay, transitionDuration]);

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-12">
      <p
        className="text-5xl xl:text-6xl 2xl:text-7xl 3xl:text-8xl font-heading text-white text-center leading-tight drop-shadow-2xl tracking-wide transition-opacity"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transitionDuration: `${transitionDuration}ms`
        }}
      >
        {messages[currentIndex]}
      </p>
    </div>
  );
});

export default TimeBasedRenderer;
