import { useEffect, useRef, useState } from 'react';
import { useData } from '../../context/DataContext';
import { speakTokenNumber } from '../../utils/speechUtils';
import { getCurrentTime, formatTimeDisplay, formatDateDisplay } from '../../utils/timeUtils';
import { Hash, Clock, Calendar, Users, ChevronRight } from 'lucide-react';

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
      {/* Default fallback if no backgroundType */}
      {!screen.backgroundType && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      )}
      {/* Dark overlay for image/video readability */}
      {(screen.backgroundType === 'image' || screen.backgroundType === 'video') && (
        <div className="fixed inset-0 bg-black/40" />
      )}

      {/* Content (with relative z-10 to sit above background) */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500/85 via-emerald-500/85 to-teal-500/85 backdrop-blur-md shadow-xl">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-white" />
                <h1 className="text-4xl xl:text-5xl font-bold text-white drop-shadow-xl font-heading tracking-wider">
                  {screen.title}
                </h1>
              </div>
              <div className="flex items-center gap-5 px-6 py-3 bg-black/30 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-white/90" />
                  <span className="text-lg xl:text-xl font-semibold text-white drop-shadow-md font-body tracking-wide">
                    {currentDate}
                  </span>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-white/90" />
                  <span className="text-xl xl:text-2xl font-bold text-white drop-shadow-md font-heading tracking-wider">
                    {formatTimeDisplay(currentTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Token Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {servingToken ? (
            <>
              {/* NOW SERVING Badge */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white bg-opacity-10 rounded-full backdrop-blur-sm border border-white/20">
                  <Hash className="w-8 h-8 text-yellow-400" />
                  <span className="text-2xl xl:text-3xl font-bold text-white uppercase tracking-widest">
                    Now Serving
                  </span>
                </div>
              </div>

              {/* Large Token Number */}
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-yellow-400 opacity-20 blur-[100px] rounded-full animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white rounded-[2rem] px-16 py-12 shadow-2xl">
                  <div className="text-[12rem] xl:text-[16rem] font-black leading-none drop-shadow-2xl text-center">
                    {servingToken.number}
                  </div>
                </div>
              </div>

              {/* Please collect message */}
              <p className="text-2xl text-gray-300 mb-8">Please collect your order</p>
            </>
          ) : (
            <div className="text-center text-gray-400">
              <Hash className="w-32 h-32 mx-auto mb-8 opacity-30" />
              <p className="text-4xl font-semibold">No Active Token</p>
              <p className="text-xl mt-4 opacity-70">Waiting for next customer</p>
            </div>
          )}
        </div>

        {/* Full-Width Bottom Strip — Called Tokens History */}
        <div className="border-t border-white/10 bg-black/60 backdrop-blur-md">
          {/* Label Row */}
          <div className="flex items-center gap-3 px-6 pt-3 pb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-yellow-400/90 uppercase tracking-[0.2em] font-heading">
                Called Tokens
              </span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-yellow-400/30 to-transparent"></div>
            <span className="text-xs text-gray-500 font-body">
              {tokenHistory.length > 1 ? `${tokenHistory.length - 1} previous` : 'Waiting'}
            </span>
          </div>

          {/* Token Strip */}
          <div className="px-4 pb-3 pt-1">
            {tokenHistory.length > 1 ? (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {tokenHistory.slice(1).map((token, index) => (
                  <div
                    key={token.updatedAt}
                    className={`flex-shrink-0 flex items-center gap-2 rounded-lg border transition-all duration-300 ${
                      index === 0
                        ? 'bg-yellow-400/15 border-yellow-400/40 px-5 py-2.5'
                        : index === 1
                          ? 'bg-white/8 border-white/20 px-4 py-2'
                          : 'bg-white/5 border-white/10 px-4 py-2'
                    }`}
                  >
                    <Hash className={`w-3.5 h-3.5 ${
                      index === 0 ? 'text-yellow-400/70' : 'text-gray-500'
                    }`} />
                    <span className={`font-bold font-heading tracking-wide ${
                      index === 0
                        ? 'text-2xl xl:text-3xl text-yellow-100'
                        : index === 1
                          ? 'text-xl xl:text-2xl text-gray-300'
                          : 'text-lg xl:text-xl text-gray-400'
                    }`}>
                      {token.number}
                    </span>
                    {index === 0 && (
                      <ChevronRight className="w-4 h-4 text-yellow-400/40 ml-1" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-2">
                <span className="text-sm text-gray-600 italic font-body">No previous tokens yet</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenGalleryDisplay;
