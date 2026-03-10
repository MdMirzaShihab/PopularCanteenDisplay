import { useEffect, useRef, useState } from 'react';
import { useData } from '../../context/DataContext';
import { speakTokenNumber } from '../../utils/speechUtils';
import { getCurrentTime, formatTimeDisplay, formatDateDisplay } from '../../utils/timeUtils';
import { Hash, Clock, Calendar } from 'lucide-react';

const TokenGalleryDisplay = ({ screen }) => {
  const { servingToken, tokenHistory } = useData();
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

  const previousTokens = tokenHistory.slice(1);

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Background Layer */}
      {screen.backgroundType === 'image' && screen.backgroundMedia && (
        <img src={screen.backgroundMedia} alt="" className="fixed inset-0 w-full h-full object-cover" />
      )}
      {screen.backgroundType === 'video' && screen.backgroundMedia && (
        <video src={screen.backgroundMedia} autoPlay muted loop playsInline className="fixed inset-0 w-full h-full object-cover" />
      )}
      {screen.backgroundType === 'color' && (
        <div className="fixed inset-0" style={{ backgroundColor: screen.backgroundColor || '#1f2937' }} />
      )}
      {!screen.backgroundType && (
        <div className="fixed inset-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }} />
      )}
      {/* Overlay for image/video */}
      {(screen.backgroundType === 'image' || screen.backgroundType === 'video') && (
        <div className="fixed inset-0 bg-black/50" />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">

        {/* Header Bar */}
        <div
          className="flex-shrink-0"
          style={{
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.06)'
          }}
        >
          <div className="px-8 py-5 flex items-center justify-between">
            {/* Title */}
            <div>
              <h1
                className={`text-3xl xl:text-4xl font-bold tracking-[0.12em] ${screen.titleFont || 'font-heading'}`}
                style={{ color: screen.titleColor || '#ffffff' }}
              >
                {screen.title}
              </h1>
            </div>

            {/* Date & Time */}
            <div
              className="flex items-center gap-5 px-6 py-3 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4.5 h-4.5 text-white/50" />
                <span className="text-base xl:text-lg font-medium text-white/80 font-body tracking-wide">
                  {currentDate}
                </span>
              </div>
              <div className="w-px h-7" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <div className="flex items-center gap-2.5">
                <Clock className="w-4.5 h-4.5 text-white/50" />
                <span className="text-lg xl:text-xl font-bold text-white/90 font-heading tracking-wider">
                  {formatTimeDisplay(currentTime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Token Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {servingToken ? (
            <>
              {/* NOW SERVING Label */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-12 xl:w-20" style={{ background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.4))' }} />
                  <span className="text-xl xl:text-2xl font-bold text-white/60 uppercase tracking-[0.3em] font-heading">
                    Now Serving
                  </span>
                  <div className="h-[1px] w-12 xl:w-20" style={{ background: 'linear-gradient(to left, transparent, rgba(250,204,21,0.4))' }} />
                </div>
              </div>

              {/* Token Number Card */}
              <div className="relative mb-8">
                {/* Glow */}
                <div
                  className="absolute -inset-12 rounded-full animate-pulse"
                  style={{
                    background: 'radial-gradient(ellipse, rgba(250,204,21,0.18) 0%, transparent 70%)',
                    filter: 'blur(50px)'
                  }}
                />
                <div
                  className="relative px-28 xl:px-40 py-14 xl:py-20"
                  style={{
                    background: 'linear-gradient(145deg, rgba(250,204,21,0.12) 0%, rgba(251,146,60,0.08) 100%)',
                    borderRadius: '3rem',
                    border: '2px solid rgba(250,204,21,0.2)',
                    boxShadow: '0 0 80px rgba(250,204,21,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                  }}
                >
                  <div
                    className="text-[14rem] xl:text-[20rem] font-black leading-none text-center font-heading"
                    style={{
                      background: 'linear-gradient(180deg, #fde68a 0%, #facc15 30%, #f59e0b 70%, #d97706 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 4px 12px rgba(250,204,21,0.3))'
                    }}
                  >
                    {servingToken.number}
                  </div>
                </div>
              </div>

              {/* Collect message */}
              <p className="text-xl xl:text-2xl text-white/40 font-body tracking-wide">
                Please collect your order
              </p>
            </>
          ) : (
            <div className="text-center">
              <div
                className="w-28 h-28 xl:w-36 xl:h-36 rounded-3xl mx-auto mb-8 flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <Hash className="w-14 h-14 xl:w-18 xl:h-18 text-white/15" />
              </div>
              <p className="text-3xl xl:text-4xl font-semibold text-white/30 font-heading tracking-wider">
                No Active Token
              </p>
              <p className="text-lg mt-3 text-white/15 font-body">
                Waiting for next customer
              </p>
            </div>
          )}
        </div>

        {/* Bottom History Strip */}
        <div
          className="flex-shrink-0"
          style={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          {/* Label */}
          <div className="flex items-center gap-3 px-8 pt-4 pb-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: '#facc15', boxShadow: '0 0 8px rgba(250,204,21,0.4)' }}
              />
              <span className="text-xs font-bold uppercase tracking-[0.2em] font-heading" style={{ color: 'rgba(250,204,21,0.7)' }}>
                Previous Tokens
              </span>
            </div>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(250,204,21,0.15), transparent)' }} />
            <span className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {previousTokens.length > 0 ? `${previousTokens.length} called` : 'Waiting'}
            </span>
          </div>

          {/* Token Chips */}
          <div className="px-6 pb-4 pt-1">
            {previousTokens.length > 0 ? (
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                {previousTokens.map((token, index) => {
                  const isFirst = index === 0;
                  const isSecond = index === 1;
                  return (
                    <div
                      key={token.updatedAt}
                      className="flex-shrink-0 flex items-center gap-2 rounded-xl transition-all duration-300"
                      style={{
                        padding: isFirst ? '10px 20px' : '8px 16px',
                        background: isFirst
                          ? 'rgba(250,204,21,0.1)'
                          : isSecond
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${
                          isFirst
                            ? 'rgba(250,204,21,0.25)'
                            : isSecond
                              ? 'rgba(255,255,255,0.1)'
                              : 'rgba(255,255,255,0.05)'
                        }`,
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <Hash
                        className="w-3.5 h-3.5"
                        style={{
                          color: isFirst ? 'rgba(250,204,21,0.5)' : 'rgba(255,255,255,0.2)'
                        }}
                      />
                      <span
                        className="font-bold font-heading tracking-wide"
                        style={{
                          fontSize: isFirst ? '1.5rem' : isSecond ? '1.25rem' : '1.1rem',
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
              <div className="flex items-center justify-center py-2">
                <span className="text-sm italic font-body" style={{ color: 'rgba(255,255,255,0.15)' }}>
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
