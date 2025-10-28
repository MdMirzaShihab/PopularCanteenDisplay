import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import GalleryDisplay from '../components/gallery/GalleryDisplay';

const GalleryViewPage = () => {
  const { screenId } = useParams();
  const { getScreenById } = useData();
  const containerRef = useRef(null);

  const screen = getScreenById(screenId);

  // Auto-enter fullscreen mode on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      if (!containerRef.current) return;

      try {
        // Try standard fullscreen API
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
        // Fallback for Safari/older browsers
        else if (containerRef.current.webkitRequestFullscreen) {
          await containerRef.current.webkitRequestFullscreen();
        }
        // Fallback for older Firefox
        else if (containerRef.current.mozRequestFullScreen) {
          await containerRef.current.mozRequestFullScreen();
        }
        // Fallback for IE/Edge
        else if (containerRef.current.msRequestFullscreen) {
          await containerRef.current.msRequestFullscreen();
        }
        console.log('✅ Fullscreen mode activated');
      } catch (error) {
        console.warn('⚠️ Fullscreen request failed:', error);
        // Silently fail - user can still view the content normally
      }
    };

    // Delay slightly to ensure DOM is fully ready
    const timeoutId = setTimeout(enterFullscreen, 100);

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (isFullscreen) {
        console.log('📺 Entered fullscreen mode');
      } else {
        console.log('🔙 Exited fullscreen mode');
      }
    };

    // Add event listeners for all browser variants
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  if (!screen) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Screen Not Found</h1>
          <p className="text-xl text-gray-400">
            The requested screen does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <GalleryDisplay screen={screen} />
    </div>
  );
};

export default GalleryViewPage;
