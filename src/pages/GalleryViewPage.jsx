import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import GalleryDisplay from '../components/gallery/GalleryDisplay';

const GalleryViewPage = () => {
  const { screenId } = useParams();
  const { getScreenById, screens } = useData();
  const containerRef = useRef(null);
  const [isDataReady, setIsDataReady] = useState(false);

  const screen = getScreenById(screenId);

  // Mark data as ready once screens have been loaded from localStorage
  useEffect(() => {
    if (screens !== undefined) {
      setIsDataReady(true);
    }
  }, [screens]);

  // Auto-enter fullscreen mode on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      if (!containerRef.current) return;

      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
          await containerRef.current.webkitRequestFullscreen();
        }
      } catch {
        // Silently fail - user can still view the content normally
      }
    };

    // Delay slightly to ensure DOM is fully ready
    const timeoutId = setTimeout(enterFullscreen, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Still loading data from localStorage
  if (!isDataReady) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-white text-xl">Loading display...</p>
        </div>
      </div>
    );
  }

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
