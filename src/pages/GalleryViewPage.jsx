import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getScreenById } from '../api/screens.api';
import GalleryDisplay from '../components/gallery/GalleryDisplay';
import TokenGalleryDisplay from '../components/gallery/TokenGalleryDisplay';

const POLL_INTERVAL = 5000;

const isFullscreenActive = () =>
  !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);

const requestFullscreenOn = async (el) => {
  if (!el) return;
  if (el.requestFullscreen) return el.requestFullscreen();
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  if (el.msRequestFullscreen) return el.msRequestFullscreen();
};

const GalleryViewPage = () => {
  const { screenId } = useParams();
  const containerRef = useRef(null);
  const [screen, setScreen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsGesture, setNeedsGesture] = useState(false);

  const snapshotRef = useRef(null);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    getScreenById(screenId)
      .then((data) => {
        snapshotRef.current = JSON.stringify(data);
        setScreen(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [screenId]);

  const poll = useCallback(async () => {
    try {
      const data = await getScreenById(screenId);
      const json = JSON.stringify(data);
      if (json === snapshotRef.current) return;

      snapshotRef.current = json;
      setOpacity(0);
      setTimeout(() => {
        setScreen(data);
        requestAnimationFrame(() => setOpacity(1));
      }, 400);
    } catch {
      // Silently ignore poll errors
    }
  }, [screenId]);

  useEffect(() => {
    if (loading || error) return;
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [loading, error, poll]);

  useEffect(() => {
    document.documentElement.classList.add('gallery-display-root');
    document.body.classList.add('gallery-display-root');
    return () => {
      document.documentElement.classList.remove('gallery-display-root');
      document.body.classList.remove('gallery-display-root');
    };
  }, []);

  // Attempt auto-fullscreen on mount. If the browser blocks it (no user
  // activation, e.g. direct URL paste), surface a tap-to-enter prompt and
  // satisfy the gesture requirement on the first user interaction.
  useEffect(() => {
    if (loading || error) return;

    let cancelled = false;

    const tryEnter = async () => {
      try {
        await requestFullscreenOn(containerRef.current);
      } catch {
        // Auto-entry rejected — will fall through to gesture path
      }
      if (!cancelled && !isFullscreenActive()) setNeedsGesture(true);
    };

    const timeoutId = setTimeout(tryEnter, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [loading, error]);

  // Hide the prompt once fullscreen is actually active (and restore if exited)
  useEffect(() => {
    const handleChange = () => {
      if (isFullscreenActive()) setNeedsGesture(false);
      else if (!loading && !error) setNeedsGesture(true);
    };
    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange);
    };
  }, [loading, error]);

  // First-gesture fullscreen: any click/tap/key anywhere on the document
  useEffect(() => {
    if (!needsGesture) return;

    const handler = async () => {
      try {
        await requestFullscreenOn(containerRef.current);
      } catch {
        // User may have denied permission — leave prompt visible so they can retry
      }
    };
    document.addEventListener('click', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('keydown', handler);
    };
  }, [needsGesture]);

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
      {needsGesture && <FullscreenPrompt />}
    </div>
  );
};

const FullscreenPrompt = () => (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center"
    style={{
      background: 'radial-gradient(ellipse at center, rgba(8,10,20,0.55) 0%, rgba(0,0,0,0.78) 70%)',
      backdropFilter: 'blur(6px) saturate(1.2)',
      WebkitBackdropFilter: 'blur(6px) saturate(1.2)',
      cursor: 'pointer',
      animation: 'fade-in 450ms ease-out both',
    }}
    aria-label="Tap anywhere to enter fullscreen"
  >
    <div
      className="flex flex-col items-center gap-5 px-10 py-8 rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, rgba(18,22,40,0.72) 0%, rgba(10,12,24,0.55) 100%)',
        border: '1px solid rgba(94,234,212,0.28)',
        boxShadow: '0 24px 60px -20px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04), 0 0 48px -12px rgba(94,234,212,0.35)',
      }}
    >
      <div
        className="relative flex items-center justify-center w-20 h-20 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(94,234,212,0.14) 0%, rgba(244,114,182,0.12) 100%)',
          border: '1px solid rgba(94,234,212,0.35)',
          boxShadow: '0 0 32px -6px rgba(94,234,212,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#5eead4', filter: 'drop-shadow(0 0 8px rgba(94,234,212,0.6))' }}>
          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
          <path d="M3 16v3a2 2 0 0 0 2 2h3" />
          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p
          className="font-heading text-3xl tracking-[0.12em]"
          style={{
            color: '#ffffff',
            textShadow: '0 2px 12px rgba(0,0,0,0.6), 0 0 24px rgba(94,234,212,0.25)',
          }}
        >
          TAP TO ENTER FULLSCREEN
        </p>
        <p
          className="font-body text-sm tracking-wider uppercase"
          style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.22em' }}
        >
          click · tap · press any key
        </p>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#5eead4', boxShadow: '0 0 8px rgba(94,234,212,0.8)', animation: 'fade-in 900ms ease-in-out infinite alternate' }} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#f472b6', boxShadow: '0 0 8px rgba(244,114,182,0.8)', animation: 'fade-in 900ms ease-in-out infinite alternate', animationDelay: '300ms' }} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#fbbf24', boxShadow: '0 0 8px rgba(251,191,36,0.8)', animation: 'fade-in 900ms ease-in-out infinite alternate', animationDelay: '600ms' }} />
      </div>
    </div>
  </div>
);

export default GalleryViewPage;
