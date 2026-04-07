import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getScreenById } from '../api/screens.api';
import GalleryDisplay from '../components/gallery/GalleryDisplay';
import TokenGalleryDisplay from '../components/gallery/TokenGalleryDisplay';

const GalleryViewPage = () => {
  const { screenId } = useParams();
  const containerRef = useRef(null);
  const [screen, setScreen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getScreenById(screenId)
      .then((data) => setScreen(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [screenId]);

  // Auto-enter fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      if (!containerRef.current) return;
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
          await containerRef.current.webkitRequestFullscreen();
        }
      } catch { /* Silently fail */ }
    };
    const timeoutId = setTimeout(enterFullscreen, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-white text-xl">Loading display...</p>
        </div>
      </div>
    );
  }

  if (error || !screen) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Screen Not Found</h1>
          <p className="text-xl text-gray-400">The requested screen does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      {screen.type === 'token' ? (
        <TokenGalleryDisplay screen={screen} />
      ) : (
        <GalleryDisplay screen={screen} />
      )}
    </div>
  );
};

export default GalleryViewPage;
