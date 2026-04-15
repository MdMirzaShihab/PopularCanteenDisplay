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

  // Update clock and date every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setCurrentDate(formatDateDisplay());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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
          src={resolveMediaUrl(screen.backgroundMedia)}
          autoPlay
          muted
          loop
          playsInline
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

        {/* Header Bar */}
        <div
          className="flex-shrink-0 tv-glass-fallback"
          style={{
            backdropFilter: 'blur(16px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
            background: 'rgba(0,0,0,0.35)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.08)'
          }}
        >
          <div className="px-10 py-5 flex items-center justify-between">
            {/* Logo & Branding */}
            <div className="flex items-center gap-5">
              <img
                src={hospitalLogo}
                alt="PMCH Logo"
                className="h-16 w-auto object-contain brightness-0 invert"
              />
              <div
                className="h-12"
                style={{ width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent)' }}
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-wide font-body leading-tight">
                  Popular Medical College and Hospital
                </span>
                <span className="text-sm text-white/40 font-body italic tracking-widest text-right mt-0.5">
                  We Care for Life
                </span>
              </div>
            </div>

            {/* Screen Title */}
            <h1
              className={`text-4xl font-bold tracking-[0.15em] ${screen.titleFont || 'font-heading'}`}
              style={{ color: screen.titleColor || '#ffffff' }}
            >
              {screen.title}
            </h1>

            {/* Date & Time */}
            <div
              className="flex items-center gap-6 px-7 py-4 rounded-2xl tv-glass-fallback"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.15)',
              }}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-white/40" />
                <span className="text-lg font-medium text-white/70 font-body tracking-wide">
                  {currentDate}
                </span>
              </div>
              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-white/40" />
                <span className="text-2xl font-bold text-white/90 font-heading tracking-wider">
                  {formatTimeDisplay(currentTime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Token Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-4">
          {servingToken ? (
            <>
              {/* NOW SERVING Label */}
              <div className="mb-4">
                <div className="flex items-center gap-5">
                  <div className="h-[2px] w-20" style={{ background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.5))' }} />
                  <span
                    className="text-4xl font-bold uppercase tracking-[0.35em] font-heading"
                    style={{ color: 'rgba(250,204,21,0.7)' }}
                  >
                    Now Serving
                  </span>
                  <div className="h-[2px] w-20" style={{ background: 'linear-gradient(to left, transparent, rgba(250,204,21,0.5))' }} />
                </div>
              </div>

              {/* Token Number */}
              <div className="relative mb-4">
                {/* Ambient glow */}
                <div
                  className="absolute -inset-16 animate-pulse"
                  style={{
                    background: 'radial-gradient(ellipse, rgba(250,204,21,0.15) 0%, transparent 70%)',
                  }}
                />
                <div
                  className="relative tv-glass-fallback"
                  style={{
                    padding: '2rem 5rem',
                    background: 'linear-gradient(145deg, rgba(250,204,21,0.08) 0%, rgba(251,146,60,0.04) 100%)',
                    backdropFilter: 'blur(20px) saturate(1.5)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
                    borderRadius: '2.5rem',
                    border: '2px solid rgba(250,204,21,0.2)',
                    boxShadow: '0 0 100px rgba(250,204,21,0.08), inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.15)',
                  }}
                >
                  <div
                    className="font-black leading-none text-center font-heading"
                    style={{
                      fontSize: '18rem',
                      fontSize: 'clamp(12rem, 28vw, 22rem)',
                      background: 'linear-gradient(180deg, #fde68a 0%, #facc15 30%, #f59e0b 70%, #d97706 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      color: 'transparent',
                      filter: 'drop-shadow(0 6px 20px rgba(250,204,21,0.3))',
                      WebkitFilter: 'drop-shadow(0 6px 20px rgba(250,204,21,0.3))'
                    }}
                  >
                    {servingToken.number}
                  </div>
                </div>
              </div>

              {/* Collect message */}
              <p
                className="text-3xl text-white/35 font-body tracking-widest uppercase"
                style={{ letterSpacing: '0.2em' }}
              >
                Please collect your order
              </p>
            </>
          ) : (
            <div className="text-center">
              <div
                className="w-36 h-36 rounded-3xl mx-auto mb-8 flex items-center justify-center tv-glass-fallback"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(16px) saturate(1.3)',
                  WebkitBackdropFilter: 'blur(16px) saturate(1.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.1)'
                }}
              >
                <Hash className="w-20 h-20 text-white/15" />
              </div>
              <p className="text-5xl font-semibold text-white/30 font-heading tracking-wider">
                No Active Token
              </p>
              <p className="text-2xl mt-4 text-white/15 font-body">
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
          <div className="flex items-center gap-4 px-10 pt-4 pb-2">
            <div className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: '#facc15', boxShadow: '0 0 10px rgba(250,204,21,0.5)' }}
              />
              <span className="text-sm font-bold uppercase tracking-[0.2em] font-heading" style={{ color: 'rgba(250,204,21,0.7)' }}>
                Previous Tokens
              </span>
            </div>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(250,204,21,0.15), transparent)' }} />
            <span className="text-sm font-body" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {previousTokens.length > 0 ? `${previousTokens.length} called` : 'Waiting'}
            </span>
          </div>

          {/* Token Chips */}
          <div className="px-8 pb-5 pt-1">
            {previousTokens.length > 0 ? (
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                {previousTokens.map((token, index) => {
                  const isFirst = index === 0;
                  const isSecond = index === 1;
                  return (
                    <div
                      key={token.updatedAt}
                      className="flex-shrink-0 flex items-center gap-2.5 rounded-xl"
                      style={{
                        padding: isFirst ? '10px 22px' : '8px 18px',
                        background: isFirst
                          ? 'rgba(250,204,21,0.08)'
                          : isSecond
                            ? 'rgba(255,255,255,0.04)'
                            : 'rgba(255,255,255,0.02)',
                        backdropFilter: 'blur(14px) saturate(1.3)',
                        WebkitBackdropFilter: 'blur(14px) saturate(1.3)',
                        border: `1px solid ${
                          isFirst
                            ? 'rgba(250,204,21,0.25)'
                            : isSecond
                              ? 'rgba(255,255,255,0.12)'
                              : 'rgba(255,255,255,0.06)'
                        }`,
                        boxShadow: isFirst
                          ? 'inset 0 1px 0 rgba(250,204,21,0.06), 0 2px 12px rgba(0,0,0,0.1)'
                          : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.08)',
                      }}
                    >
                      <Hash
                        className="w-4 h-4"
                        style={{
                          color: isFirst ? 'rgba(250,204,21,0.5)' : 'rgba(255,255,255,0.2)'
                        }}
                      />
                      <span
                        className="font-bold font-heading tracking-wide"
                        style={{
                          fontSize: isFirst ? '1.6rem' : isSecond ? '1.4rem' : '1.25rem',
                          color: isFirst
                            ? 'rgba(254,240,138,0.9)'
                            : isSecond
                              ? 'rgba(255,255,255,0.6)'
                              : 'rgba(255,255,255,0.35)'
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
