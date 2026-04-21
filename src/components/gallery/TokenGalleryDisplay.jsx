import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { useSocketTokens } from '../../hooks/useSocketTokens';
import { getCurrentTime, formatTimeDisplay, formatDateDisplay } from '../../utils/timeUtils';
import { Hash, Clock, Calendar } from 'lucide-react';
import { hospitalLogo } from '../../assets';
import { resolveMediaUrl } from '../../utils/mediaUtils';

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Play a server-generated TTS audio file via HTML5 Audio.
 * Samsung TV compatible: preloads before playing, retries once on failure,
 * and uses a persistent audio element to avoid Samsung Tizen autoplay issues.
 */
let sharedAudio = null;
const getSharedAudio = () => {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = 'auto';
  }
  return sharedAudio;
};

const playAudioUrl = (urlPath) => {
  if (!urlPath) return Promise.resolve();
  const url = `${API_BASE}${urlPath}`;

  return new Promise((resolve) => {
    const audio = getSharedAudio();

    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
      audio.oncanplaythrough = null;
    };

    audio.onended = () => { cleanup(); resolve(); };
    audio.onerror = () => { cleanup(); resolve(); };

    audio.src = url;
    audio.load();

    audio.oncanplaythrough = () => {
      audio.oncanplaythrough = null;
      audio.play().catch(() => {
        // Retry once after a short delay (Samsung TV autoplay quirk)
        setTimeout(() => audio.play().catch(() => { cleanup(); resolve(); }), 200);
      });
    };

    // Safety timeout — never block longer than 15s
    setTimeout(() => { cleanup(); resolve(); }, 15000);
  });
};

/**
 * Background layer — image / video / color. Isolated in its own memoed
 * component so that the video element is NOT re-rendered when unrelated
 * state changes (socket token events, clock tick, admin edits to fonts or
 * colors). Re-renders only when the background itself changes — i.e. the
 * admin swaps the background media, color, or position/scale from the
 * edit panel. Shallow-prop memo is sufficient because all props are
 * primitives (strings and numbers).
 */
const GalleryBackground = memo(
  ({ backgroundType, backgroundMediaUrl, backgroundColor, positionX, positionY, scale }) => {
    const bgVideoRef = useRef(null);

    // Samsung TV video health monitor — recover from silent drops
    useEffect(() => {
      if (backgroundType !== 'video') return;
      const check = setInterval(() => {
        const vid = bgVideoRef.current;
        if (!vid) return;
        if (vid.paused || vid.ended || vid.readyState < 2) {
          vid.load();
          vid.play().catch(() => {});
        }
      }, 5000);
      return () => clearInterval(check);
    }, [backgroundType]);

    const cropStyle = useMemo(() => ({
      objectPosition: `${positionX ?? 50}% ${positionY ?? 50}%`,
      transform: `scale(${scale ?? 1})`,
      transformOrigin: `${positionX ?? 50}% ${positionY ?? 50}%`,
    }), [positionX, positionY, scale]);

    const handleVideoError = useCallback((e) => {
      // Samsung TV: reload video on error
      const vid = e.currentTarget;
      setTimeout(() => { vid.load(); vid.play().catch(() => {}); }, 1000);
    }, []);

    const handleVideoStalled = useCallback((e) => {
      const vid = e.currentTarget;
      setTimeout(() => { vid.play().catch(() => {}); }, 500);
    }, []);

    if (backgroundType === 'image' && backgroundMediaUrl) {
      return (
        <img
          src={backgroundMediaUrl}
          alt=""
          className="fixed inset-0 w-full h-full object-cover"
          style={cropStyle}
        />
      );
    }

    if (backgroundType === 'video' && backgroundMediaUrl) {
      return (
        <video
          ref={bgVideoRef}
          src={backgroundMediaUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={handleVideoError}
          onStalled={handleVideoStalled}
          className="fixed inset-0 w-full h-full object-cover"
          style={cropStyle}
        />
      );
    }

    if (backgroundType === 'color') {
      return (
        <div className="fixed inset-0" style={{ backgroundColor: backgroundColor || '#1f2937' }} />
      );
    }

    return (
      <div
        className="fixed inset-0"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
      />
    );
  },
);

GalleryBackground.displayName = 'GalleryBackground';

/**
 * Live socket-driven region: "Now Serving" with the big token number, and
 * the Previous Tokens strip. Owns the socket subscription and the audio
 * announce / re-announce effects.
 *
 * Kept separate from the shell so that socket events (firing on every
 * token call) re-render only this subtree — leaving the background layer
 * above untouched. This fixes the Samsung TV video flash on token calls.
 */
const TokenLiveArea = memo(({ screen }) => {
  const {
    currentToken: servingToken, tokenHistory,
    shouldAnnounce, audioUrl,
    reannounceNumber, reannounceAudioUrl, clearReannounce,
  } = useSocketTokens();
  const prevTokenRef = useRef(null);

  // Voice announcement when token changes (only if not silent)
  useEffect(() => {
    if (servingToken && servingToken.number !== prevTokenRef.current) {
      if (shouldAnnounce && audioUrl) {
        playAudioUrl(audioUrl).catch(() => {});
      }
      prevTokenRef.current = servingToken.number;
    } else if (!servingToken) {
      prevTokenRef.current = null;
    }
  }, [servingToken, shouldAnnounce, audioUrl]);

  // Re-announce: replay cached audio without changing token
  useEffect(() => {
    if (reannounceNumber && reannounceAudioUrl) {
      playAudioUrl(reannounceAudioUrl).catch(() => {});
      clearReannounce();
    } else if (reannounceNumber) {
      clearReannounce();
    }
  }, [reannounceNumber, reannounceAudioUrl, clearReannounce]);

  const previousTokens = tokenHistory;

  return (
    <>
      {/* Main Token Area */}
      <div
        className="flex-1 min-h-0 flex flex-col items-center justify-center"
        style={{ padding: 'clamp(10px, 1.2vw, 32px) clamp(16px, 2vw, 48px)' }}
      >
        {servingToken ? (
          <>
            {/* NOW SERVING Label */}
            <div style={{ marginBottom: 'clamp(10px, 1.2vw, 28px)' }}>
              <div className="flex items-center" style={{ gap: 'clamp(10px, 1.3vw, 26px)' }}>
                <div
                  style={{
                    height: '2px',
                    width: 'clamp(40px, 4vw, 96px)',
                    background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.5))',
                  }}
                />
                <span
                  className={`font-bold uppercase tracking-[0.25em] ${screen.servingFont || 'font-heading'}`}
                  style={{
                    color: screen.servingColor || '#facc15',
                    opacity: 0.85,
                    fontSize: 'clamp(26px, 3vw, 72px)',
                  }}
                >
                  Now Serving
                </span>
                <div
                  style={{
                    height: '2px',
                    width: 'clamp(40px, 4vw, 96px)',
                    background: 'linear-gradient(to left, transparent, rgba(250,204,21,0.5))',
                  }}
                />
              </div>
            </div>

            {/* Token Number */}
            <div className="relative" style={{ marginBottom: 'clamp(8px, 1vw, 22px)' }}>
              {/* Ambient glow */}
              <div
                className="absolute animate-pulse"
                style={{
                  inset: '-6vmin',
                  background: 'radial-gradient(ellipse, rgba(250,204,21,0.15) 0%, transparent 70%)',
                }}
              />
              <div
                className="relative"
                style={{
                  padding: 'clamp(10px, 1.2vw, 28px) clamp(24px, 3vw, 64px)',
                  background: 'linear-gradient(145deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 100%)',
                  borderRadius: 'clamp(18px, 1.8vw, 40px)',
                  border: '2px solid rgba(250,204,21,0.2)',
                  boxShadow: '0 0 100px rgba(250,204,21,0.08), 0 8px 40px rgba(0,0,0,0.15)',
                }}
              >
                <div
                  className={`font-black leading-none text-center ${screen.servingFont || 'font-heading'}`}
                  style={{
                    fontSize: 'clamp(6rem, min(26vw, 38vh), 60rem)',
                    color: screen.servingColor || '#facc15',
                    filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.3))',
                    WebkitFilter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.3))'
                  }}
                >
                  {servingToken.number}
                </div>
              </div>
            </div>

            {/* Collect message */}
            <p
              className={`font-semibold uppercase ${screen.collectFont || 'font-body'}`}
              style={{
                letterSpacing: '0.15em',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                color: screen.collectColor || '#ffffff',
                opacity: 0.9,
                fontSize: 'clamp(18px, 2.2vw, 56px)',
              }}
            >
              Please collect your order
            </p>
          </>
        ) : (
          <div className="text-center">
            <div
              className="rounded-3xl mx-auto flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                width: 'clamp(90px, 10vw, 220px)',
                height: 'clamp(90px, 10vw, 220px)',
                marginBottom: 'clamp(16px, 2vw, 48px)',
              }}
            >
              <Hash className="text-white/15" style={{ width: 'clamp(50px, 5.5vw, 120px)', height: 'clamp(50px, 5.5vw, 120px)' }} />
            </div>
            <p
              className="font-semibold text-white/30 font-heading tracking-wider"
              style={{ fontSize: 'clamp(28px, 3.4vw, 80px)' }}
            >
              No Active Token
            </p>
            <p
              className="text-white/15 font-body"
              style={{ fontSize: 'clamp(14px, 1.7vw, 40px)', marginTop: 'clamp(6px, 0.8vw, 18px)' }}
            >
              Waiting for next customer
            </p>
          </div>
        )}
      </div>

      {/* Bottom History Strip */}
      <div
        className="flex-shrink-0"
        style={{
          background: 'rgba(0,0,0,0.12)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)'
        }}
      >
        {/* Label */}
        <div
          className="flex items-center"
          style={{
            gap: 'clamp(10px, 1.2vw, 24px)',
            padding: 'clamp(8px, 1vw, 22px) clamp(16px, 2.2vw, 48px) clamp(4px, 0.6vw, 14px)',
          }}
        >
          <div className="flex items-center" style={{ gap: 'clamp(6px, 0.8vw, 16px)' }}>
            <div
              className="rounded-full animate-pulse"
              style={{
                width: 'clamp(7px, 0.7vw, 14px)',
                height: 'clamp(7px, 0.7vw, 14px)',
                backgroundColor: '#facc15',
                boxShadow: '0 0 10px rgba(250,204,21,0.5)',
              }}
            />
            <span
              className="font-bold uppercase tracking-[0.2em] font-heading"
              style={{ color: 'rgba(250,204,21,0.7)', fontSize: 'clamp(11px, 1.15vw, 24px)' }}
            >
              Previous Tokens
            </span>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(250,204,21,0.15), transparent)' }} />
          <span
            className="font-body"
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(11px, 1.0vw, 22px)' }}
          >
            {previousTokens.length > 0 ? `${previousTokens.length} called` : 'Waiting'}
          </span>
        </div>

        {/* Token Chips */}
        <div style={{ padding: 'clamp(2px, 0.2vw, 6px) clamp(12px, 1.8vw, 40px) clamp(8px, 1vw, 22px)' }}>
          {previousTokens.length > 0 ? (
            <div className="flex items-center overflow-x-auto scrollbar-hide" style={{ gap: 'clamp(6px, 0.8vw, 16px)' }}>
              {previousTokens.map((token, index) => {
                const isFirst = index === 0;
                // Yellow for most recent, then fade to white over 3-4 cards
                const chipBg = isFirst
                  ? 'rgba(0,0,0,0.45)'
                  : index <= 3
                    ? 'rgba(0,0,0,0.40)'
                    : 'rgba(0,0,0,0.35)';
                const chipBorder = isFirst
                  ? 'rgba(250,204,21,0.3)'
                  : index <= 3
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(255,255,255,0.08)';
                const textColor = isFirst
                  ? '#fef08a'       // yellow
                  : index === 1
                    ? '#fde68a'     // light yellow
                    : index === 2
                      ? '#e5e7eb'   // warm white
                      : '#ffffff';  // full white
                const chipFontSize = isFirst
                  ? 'clamp(18px, 1.9vw, 40px)'
                  : index <= 2
                    ? 'clamp(16px, 1.65vw, 34px)'
                    : 'clamp(14px, 1.4vw, 30px)';
                const chipPadding = isFirst
                  ? 'clamp(8px, 0.9vw, 18px) clamp(14px, 1.8vw, 36px)'
                  : 'clamp(6px, 0.7vw, 14px) clamp(10px, 1.4vw, 28px)';
                return (
                  <div
                    key={token.updatedAt}
                    className="flex-shrink-0 flex items-center rounded-xl tv-glass-fallback"
                    style={{
                      gap: 'clamp(6px, 0.7vw, 14px)',
                      padding: chipPadding,
                      background: chipBg,
                      backdropFilter: 'blur(14px) saturate(1.3)',
                      WebkitBackdropFilter: 'blur(14px) saturate(1.3)',
                      border: `1px solid ${chipBorder}`,
                      boxShadow: isFirst
                        ? 'inset 0 1px 0 rgba(250,204,21,0.08), 0 2px 12px rgba(0,0,0,0.15)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Hash
                      style={{
                        width: 'clamp(13px, 1.15vw, 22px)',
                        height: 'clamp(13px, 1.15vw, 22px)',
                        color: isFirst ? 'rgba(250,204,21,0.6)' : 'rgba(255,255,255,0.4)',
                      }}
                    />
                    <span
                      className="font-bold font-heading tracking-wide"
                      style={{
                        fontSize: chipFontSize,
                        color: textColor,
                      }}
                    >
                      {token.number}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center" style={{ padding: 'clamp(6px, 0.8vw, 14px) 0' }}>
              <span
                className="italic font-body"
                style={{ color: 'rgba(255,255,255,0.15)', fontSize: 'clamp(11px, 1.0vw, 22px)' }}
              >
                No previous tokens yet
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

TokenLiveArea.displayName = 'TokenLiveArea';

const TokenGalleryDisplay = ({ screen }) => {
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [currentDate, setCurrentDate] = useState(formatDateDisplay());

  // Update clock and date every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setCurrentDate(formatDateDisplay());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const backgroundMediaUrl = resolveMediaUrl(screen.backgroundMedia);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden gallery-gpu-layer">
      {/* Background Layer — memoed; re-renders only when bg-specific props change */}
      <GalleryBackground
        backgroundType={screen.backgroundType}
        backgroundMediaUrl={backgroundMediaUrl}
        backgroundColor={screen.backgroundColor}
        positionX={screen.backgroundPositionX}
        positionY={screen.backgroundPositionY}
        scale={screen.backgroundScale}
      />
      {/* Overlay removed — client requires clear background (transparency layer 0) */}

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">

        {/* Header Bar — solid background, no blur (Samsung TV compatible) */}
        <div
          className="flex-shrink-0"
          style={{
            background: 'rgba(0,0,0,0.45)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              padding: 'clamp(6px, 0.7vw, 14px) clamp(12px, 1.3vw, 28px)',
              gap: 'clamp(8px, 1.2vw, 26px)',
            }}
          >
            {/* Logo & Branding */}
            <div className="flex items-center min-w-0" style={{ gap: 'clamp(6px, 0.9vw, 18px)' }}>
              <div
                className="shrink-0 bg-white rounded-lg flex items-center justify-center"
                style={{ padding: 'clamp(3px, 0.35vw, 7px)' }}
              >
                <img
                  src={hospitalLogo}
                  alt="PMCH Logo"
                  className="w-auto object-contain"
                  style={{ height: 'clamp(26px, 2.5vw, 46px)' }}
                />
              </div>
              <div
                className="shrink-0"
                style={{
                  width: '2px',
                  height: 'clamp(26px, 2.8vw, 52px)',
                  background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.25), transparent)',
                }}
              />
              <div className="flex flex-col min-w-0">
                <span
                  className="font-bold tracking-wide font-body leading-tight whitespace-nowrap"
                  style={{
                    color: screen.brandingColor || '#ffffff',
                    fontSize: 'clamp(11px, 1.15vw, 26px)',
                  }}
                >
                  Popular Medical College and Hospital
                </span>
                <span
                  className="font-body italic tracking-[0.2em] whitespace-nowrap"
                  style={{
                    color: screen.brandingColor || '#ffffff',
                    opacity: 0.5,
                    fontSize: 'clamp(8px, 0.8vw, 18px)',
                    marginTop: '2px',
                  }}
                >
                  We Care for Life
                </span>
              </div>
            </div>

            {/* Screen Title */}
            <h1
              className={`font-bold tracking-[0.08em] whitespace-nowrap shrink-0 ${screen.titleFont || 'font-heading'}`}
              style={{
                color: screen.titleColor || '#ffffff',
                fontSize: 'clamp(16px, 1.8vw, 44px)',
              }}
            >
              {screen.title}
            </h1>

            {/* Date & Time */}
            <div
              className="flex items-center rounded-xl shrink-0 whitespace-nowrap"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                gap: 'clamp(6px, 0.8vw, 18px)',
                padding: 'clamp(5px, 0.55vw, 12px) clamp(10px, 1.1vw, 22px)',
              }}
            >
              <div className="flex items-center" style={{ gap: 'clamp(4px, 0.5vw, 10px)' }}>
                <Calendar
                  className="shrink-0"
                  style={{
                    color: screen.dateTimeColor || '#ffffff',
                    opacity: 0.5,
                    width: 'clamp(13px, 1.2vw, 22px)',
                    height: 'clamp(13px, 1.2vw, 22px)',
                  }}
                />
                <span
                  className={`font-medium tracking-wide ${screen.dateTimeFont || 'font-body'}`}
                  style={{
                    color: screen.dateTimeColor || '#ffffff',
                    opacity: 0.9,
                    fontSize: 'clamp(11px, 1.0vw, 22px)',
                  }}
                >
                  {currentDate}
                </span>
              </div>
              <div style={{ width: '1px', height: 'clamp(14px, 1.4vw, 30px)', background: 'rgba(255,255,255,0.12)' }} />
              <div className="flex items-center" style={{ gap: 'clamp(4px, 0.5vw, 10px)' }}>
                <Clock
                  className="shrink-0"
                  style={{
                    color: screen.dateTimeColor || '#ffffff',
                    opacity: 0.5,
                    width: 'clamp(13px, 1.2vw, 22px)',
                    height: 'clamp(13px, 1.2vw, 22px)',
                  }}
                />
                <span
                  className={`font-bold tracking-wider ${screen.dateTimeFont || 'font-body'}`}
                  style={{
                    color: screen.dateTimeColor || '#ffffff',
                    fontSize: 'clamp(14px, 1.35vw, 30px)',
                  }}
                >
                  {formatTimeDisplay(currentTime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live socket-driven region: Now Serving + Previous Tokens */}
        <TokenLiveArea screen={screen} />
      </div>
    </div>
  );
};

export default TokenGalleryDisplay;
