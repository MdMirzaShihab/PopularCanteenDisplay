import { isVideoUrl } from '../../utils/fileUtils';
import TimeBasedRenderer from './TimeBasedRenderer';

const GalleryDisplay = ({ screen }) => {
  return (
    <div className="fixed inset-0 overflow-auto">
      {/* Background - Visible through frosted glass content */}
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
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
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
