import { useEffect, useRef, useState } from 'react';
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

const getCropStyle = (screen) => ({
  objectPosition: `${screen.backgroundPositionX ?? 50}% ${screen.backgroundPositionY ?? 50}%`,
  transform: `scale(${screen.backgroundScale ?? 1})`,
  transformOrigin: `${screen.backgroundPositionX ?? 50}% ${screen.backgroundPositionY ?? 50}%`,
});

const TokenGalleryDisplay = ({ screen }) => {
  const {
    currentToken: servingToken, tokenHistory,
    shouldAnnounce, audioUrl,
    reannounceNumber, reannounceAudioUrl, clearReannounce,
  } = useSocketTokens();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [currentDate, setCurrentDate] = useState(formatDateDisplay());
  const prevTokenRef = useRef(null);
  const bgVideoRef = useRef(null);

  // Update clock and date every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setCurrentDate(formatDateDisplay());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Samsung TV video health monitor — recover from silent drops
  useEffect(() => {
    if (screen.backgroundType !== 'video') return;
    const check = setInterval(() => {
      const vid = bgVideoRef.current;
      if (!vid) return;
      // If video has stalled or paused unexpectedly, reload and play
      if (vid.paused || vid.ended || vid.readyState < 2) {
        vid.load();
        vid.play().catch(() => {});
      }
    }, 5000);
    return () => clearInterval(check);
  }, [screen.backgroundType]);

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
    <div className="fixed inset-0 flex flex-col overflow-hidden gallery-gpu-layer">
      {/* Background Layer */}
      {screen.backgroundType === 'image' && resolveMediaUrl(screen.backgroundMedia) && (
        <img
          src={resolveMediaUrl(screen.backgroundMedia)}
          alt=""
          className="fixed inset-0 w-full h-full object-cover"
          style={getCropStyle(screen)}
        />
      )}
      {screen.backgroundType === 'video' && resolveMediaUrl(screen.backgroundMedia) && (
        <video
          ref={bgVideoRef}
          src={resolveMediaUrl(screen.backgroundMedia)}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={(e) => {
            // Samsung TV: reload video on error
            const vid = e.currentTarget;
            setTimeout(() => { vid.load(); vid.play().catch(() => {}); }, 1000);
          }}
          onStalled={(e) => {
            const vid = e.currentTarget;
            setTimeout(() => { vid.play().catch(() => {}); }, 500);
          }}
          className="fixed inset-0 w-full h-full object-cover"
          style={getCropStyle(screen)}
        />
      )}
      {screen.backgroundType === 'color' && (
        <div className="fixed inset-0" style={{ backgroundColor: screen.backgroundColor || '#1f2937' }} />
      )}
      {!screen.backgroundType && (
        <div className="fixed inset-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }} />
      )}
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
          <div className="px-6 py-3 flex items-center justify-between gap-6">
            {/* Logo & Branding */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="shrink-0 bg-white rounded-lg p-1.5 flex items-center justify-center">
                <img
                  src={hospitalLogo}
                  alt="PMCH Logo"
                  className="h-11 w-auto object-contain"
                />
              </div>
              <div
                className="h-12 shrink-0"
                style={{ width: '2px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.25), transparent)' }}
              />
              <div className="flex flex-col min-w-0">
                <span
                  className="text-xl xl:text-2xl font-bold tracking-wide font-body leading-tight whitespace-nowrap"
                  style={{ color: screen.brandingColor || '#ffffff' }}
                >
                  Popular Medical College and Hospital
                </span>
                <span
                  className="text-sm xl:text-base font-body italic tracking-[0.2em] mt-0.5 whitespace-nowrap"
                  style={{ color: screen.brandingColor || '#ffffff', opacity: 0.5 }}
                >
                  We Care for Life
                </span>
              </div>
            </div>

            {/* Screen Title */}
            <h1
              className={`text-2xl xl:text-3xl 2xl:text-4xl font-bold tracking-[0.08em] whitespace-nowrap shrink-0 ${screen.titleFont || 'font-heading'}`}
              style={{ color: screen.titleColor || '#ffffff' }}
            >
              {screen.title}
            </h1>

            {/* Date & Time */}
            <div
              className="flex items-center gap-4 px-5 py-2.5 rounded-xl shrink-0 whitespace-nowrap"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 shrink-0" style={{ color: screen.dateTimeColor || '#ffffff', opacity: 0.5 }} />
                <span
                  className={`text-base xl:text-lg font-medium tracking-wide ${screen.dateTimeFont || 'font-body'}`}
                  style={{ color: screen.dateTimeColor || '#ffffff', opacity: 0.9 }}
                >
                  {currentDate}
                </span>
              </div>
              <div className="w-px h-7" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 shrink-0" style={{ color: screen.dateTimeColor || '#ffffff', opacity: 0.5 }} />
                <span
                  className={`text-xl xl:text-2xl font-bold tracking-wider ${screen.dateTimeFont || 'font-body'}`}
                  style={{ color: screen.dateTimeColor || '#ffffff' }}
                >
                  {formatTimeDisplay(currentTime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Token Area */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-8 py-4">
          {servingToken ? (
            <>
              {/* NOW SERVING Label */}
              <div className="mb-4">
                <div className="flex items-center gap-5">
                  <div className="h-[2px] w-20" style={{ background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.5))' }} />
                  <span
                    className={`text-5xl xl:text-6xl font-bold uppercase tracking-[0.25em] ${screen.servingFont || 'font-heading'}`}
                    style={{ color: screen.servingColor || '#facc15', opacity: 0.85 }}
                  >
                    Now Serving
                  </span>
                  <div className="h-[2px] w-20" style={{ background: 'linear-gradient(to left, transparent, rgba(250,204,21,0.5))' }} />
                </div>
              </div>

              {/* Token Number */}
              <div className="relative mb-3">
                {/* Ambient glow */}
                <div
                  className="absolute -inset-12 animate-pulse"
                  style={{
                    background: 'radial-gradient(ellipse, rgba(250,204,21,0.15) 0%, transparent 70%)',
                  }}
                />
                <div
                  className="relative"
                  style={{
                    padding: '1rem 3rem',
                    background: 'linear-gradient(145deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 100%)',
                    borderRadius: '2rem',
                    border: '2px solid rgba(250,204,21,0.2)',
                    boxShadow: '0 0 100px rgba(250,204,21,0.08), 0 8px 40px rgba(0,0,0,0.15)',
                  }}
                >
                  <div
                    className={`font-black leading-none text-center ${screen.servingFont || 'font-heading'}`}
                    style={{
                      fontSize: 'clamp(10rem, 26vw, 22rem)',
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
                className={`text-4xl xl:text-5xl font-semibold uppercase ${screen.collectFont || 'font-body'}`}
                style={{
                  letterSpacing: '0.15em',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  color: screen.collectColor || '#ffffff',
                  opacity: 0.9,
                }}
              >
                Please collect your order
              </p>
            </>
          ) : (
            <div className="text-center">
              <div
                className="w-36 h-36 rounded-3xl mx-auto mb-8 flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Hash className="w-20 h-20 text-white/15" />
              </div>
              <p className="text-6xl font-semibold text-white/30 font-heading tracking-wider">
                No Active Token
              </p>
              <p className="text-3xl mt-4 text-white/15 font-body">
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
          <div className="flex items-center gap-4 px-10 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: '#facc15', boxShadow: '0 0 10px rgba(250,204,21,0.5)' }}
              />
              <span className="text-xl font-bold uppercase tracking-[0.2em] font-heading" style={{ color: 'rgba(250,204,21,0.7)' }}>
                Previous Tokens
              </span>
            </div>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(250,204,21,0.15), transparent)' }} />
            <span className="text-lg font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {previousTokens.length > 0 ? `${previousTokens.length} called` : 'Waiting'}
            </span>
          </div>

          {/* Token Chips */}
          <div className="px-8 pb-5 pt-1">
            {previousTokens.length > 0 ? (
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
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
                  return (
                    <div
                      key={token.updatedAt}
                      className="flex-shrink-0 flex items-center gap-3 rounded-xl tv-glass-fallback"
                      style={{
                        padding: isFirst ? '14px 28px' : '10px 22px',
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
                        className="w-5 h-5"
                        style={{
                          color: isFirst ? 'rgba(250,204,21,0.6)' : 'rgba(255,255,255,0.4)'
                        }}
                      />
                      <span
                        className="font-bold font-heading tracking-wide"
                        style={{
                          fontSize: isFirst ? '2rem' : index <= 2 ? '1.75rem' : '1.5rem',
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
              <div className="flex items-center justify-center py-3">
                <span className="text-lg italic font-body" style={{ color: 'rgba(255,255,255,0.15)' }}>
                  No previous tokens yet
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenGalleryDisplay;
