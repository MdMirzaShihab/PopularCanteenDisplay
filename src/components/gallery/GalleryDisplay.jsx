import { useEffect, useState } from 'react';
import { isVideoUrl } from '../../utils/fileUtils';
import TimeBasedRenderer from './TimeBasedRenderer';

const GalleryDisplay = ({ screen }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-white text-xl">Loading display...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-auto">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {screen.backgroundMedia && (
          isVideoUrl(screen.backgroundMedia) ? (
            <video
              src={screen.backgroundMedia}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={screen.backgroundMedia}
              alt="Background"
              className="w-full h-full object-cover"
            />
          )
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <TimeBasedRenderer
          screen={screen}
          displaySettings={screen.displaySettings}
        />
      </div>
    </div>
  );
};

export default GalleryDisplay;
