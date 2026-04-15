import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getScreenById } from '../api/screens.api';
import GalleryDisplay from '../components/gallery/GalleryDisplay';
import TokenGalleryDisplay from '../components/gallery/TokenGalleryDisplay';

const POLL_INTERVAL = 5000;

const GalleryViewPage = () => {
  const { screenId } = useParams();
  const containerRef = useRef(null);
  const [screen, setScreen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref holds the JSON snapshot of the current screen for diffing
  const snapshotRef = useRef(null);
  // Controls the crossfade opacity on data change
  const [opacity, setOpacity] = useState(1);

  // Initial fetch
  useEffect(() => {
    getScreenById(screenId)
      .then((data) => {
        snapshotRef.current = JSON.stringify(data);
        setScreen(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [screenId]);

  // Silent poll — fires every 5 s after initial load succeeds
  const poll = useCallback(async () => {
    try {
      const data = await getScreenById(screenId);
      const json = JSON.stringify(data);
      if (json === snapshotRef.current) return; // unchanged

      // Data changed — subtle crossfade: dip opacity then restore
      snapshotRef.current = json;
      setOpacity(0);
      // Wait for the fade-out to finish, then swap data and fade back in
      setTimeout(() => {
        setScreen(data);
        // Allow one frame for React to commit the new DOM before fading in
        requestAnimationFrame(() => setOpacity(1));
      }, 400);
    } catch {
      // Silently ignore poll errors — keep showing the current screen
    }
  }, [screenId]);

  useEffect(() => {
    if (loading || error) return;
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [loading, error, poll]);

  // Set TV display mode on body (dark bg, no cursor/selection/scroll)
  useEffect(() => {
    document.documentElement.classList.add('gallery-display-root');
    document.body.classList.add('gallery-display-root');
    return () => {
      document.documentElement.classList.remove('gallery-display-root');
      document.body.classList.remove('gallery-display-root');
    };
  }, []);

  // Auto-enter fullscreen on mount (with Tizen/Samsung TV fallbacks)
  useEffect(() => {
    const enterFullscreen = async () => {
      if (!containerRef.current) return;
      try {
        const el = containerRef.current;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
        }
      } catch { /* Silently fail — TV browsers often run fullscreen by default */ }
    };
    const timeoutId = setTimeout(enterFullscreen, 300);
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
      <div
        style={{
          opacity,
          transition: 'opacity 0.4s ease-in-out',
          width: '100%',
          height: '100%',
        }}
      >
        {screen.type === 'token' ? (
          <TokenGalleryDisplay screen={screen} />
        ) : (
          <GalleryDisplay screen={screen} />
        )}
      </div>
    </div>
  );
};

export default GalleryViewPage;
