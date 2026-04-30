import { memo, useCallback, useEffect, useRef, useState } from 'react';

/**
 * Two stacked <video> elements with crossfade on URL change. Keeps the
 * previously-shown video playing until the incoming one has buffered
 * (`loadeddata`), preventing the black flash that happens when swapping
 * `src` on a single element.
 *
 * Also runs a health monitor and a visibility-change recovery so background
 * videos survive Samsung Tizen browser sleep / standby cycles where the page
 * is paused and the active <video> silently stops.
 */
const CrossfadeVideo = memo(({ url, cropStyle, className }) => {
  const [active, setActive] = useState(0);
  const [layers, setLayers] = useState(() => [url || null, null]);
  const refA = useRef(null);
  const refB = useRef(null);
  const refs = [refA, refB];
  const activeRef = useRef(active);
  activeRef.current = active;

  // Drive incoming URL into the inactive slot (or clear when null).
  useEffect(() => {
    if (!url) {
      setLayers([null, null]);
      return;
    }
    setLayers((prev) => {
      const a = activeRef.current;
      const inactive = 1 - a;
      const cur = prev[a];
      if (cur === url) {
        // Same URL as currently visible. Cancel any in-flight swap by
        // clearing the inactive slot.
        if (prev[inactive] === null) return prev;
        const next = [...prev];
        next[inactive] = null;
        return next;
      }
      if (cur === null) {
        // First mount or post-clear: load straight into active slot.
        const next = [...prev];
        next[a] = url;
        return next;
      }
      // Crossfade: load into inactive slot.
      const next = [...prev];
      next[inactive] = url;
      return next;
    });
  }, [url]);

  // When the inactive slot has a URL different from active's, wait for the
  // incoming video to buffer, then swap active. CSS opacity transition
  // performs the visual crossfade.
  useEffect(() => {
    const a = activeRef.current;
    const inactive = 1 - a;
    const newUrl = layers[inactive];
    const curUrl = layers[a];
    if (!newUrl || newUrl === curUrl) return;
    if (!curUrl) {
      // No previous; just promote without fade.
      setActive(inactive);
      return;
    }

    const newVid = refs[inactive].current;
    if (!newVid) return;

    let swapped = false;
    const swap = () => {
      if (swapped) return;
      swapped = true;
      newVid.play().catch(() => { /* will be retried by health monitor */ });
      setActive(inactive);
      // After the opacity transition completes, free the previously-active
      // slot so the browser can drop its buffer.
      setTimeout(() => {
        setLayers((prev) => {
          if (prev[a] === null) return prev;
          const next = [...prev];
          next[a] = null;
          return next;
        });
      }, 900);
    };

    newVid.addEventListener('loadeddata', swap);
    newVid.addEventListener('canplay', swap);
    if (newVid.readyState >= 2) swap();

    return () => {
      newVid.removeEventListener('loadeddata', swap);
      newVid.removeEventListener('canplay', swap);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers]);

  // Samsung TV / Tizen recovery: if the active video silently pauses or its
  // readyState drops, try to resume. Cheap recovery first (just play()) and
  // only escalate to a destructive vid.load() after several consecutive
  // failed ticks — load() drops the buffer and forces a re-fetch which on
  // older Tizen takes longer than the heal interval, so calling it on every
  // tick produces a reload-thrash loop where the video never finishes
  // loading and the background goes permanently black.
  useEffect(() => {
    let stuckCount = 0;
    let reloadInProgress = false;

    const heal = () => {
      const vid = refs[activeRef.current].current;
      if (!vid) return;

      // A reload from the previous tick is still buffering — give it time
      // instead of killing it with another load().
      if (reloadInProgress) {
        if (vid.readyState >= 2 && !vid.paused) reloadInProgress = false;
        return;
      }

      const stuck = vid.paused || vid.ended || vid.readyState < 2;
      if (!stuck) {
        stuckCount = 0;
        return;
      }

      stuckCount += 1;

      // Cheap recovery: handles autoplay-policy wakeups, transient pauses,
      // and ended-but-loop-failed cases without touching the buffer.
      if (stuckCount < 3) {
        if (vid.ended) {
          try { vid.currentTime = 0; } catch { /* ignore */ }
        }
        vid.play().catch(() => {});
        return;
      }

      // Sustained failure — full reload as last resort.
      reloadInProgress = true;
      stuckCount = 0;
      try {
        vid.load();
        vid.play().catch(() => {});
      } catch { /* ignore */ }
    };

    const intervalId = setInterval(heal, 8000);
    const onVisibility = () => {
      if (!document.hidden) {
        stuckCount = 0;
        reloadInProgress = false;
        heal();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleError = useCallback((e) => {
    const v = e.currentTarget;
    setTimeout(() => {
      try { v.load(); v.play().catch(() => {}); } catch { /* ignore */ }
    }, 1000);
  }, []);

  const handleStalled = useCallback((e) => {
    const v = e.currentTarget;
    setTimeout(() => { v.play().catch(() => {}); }, 500);
  }, []);

  // Manual loop instead of the native `loop` attribute — older Tizen builds
  // silently fail to restart looped playback after long idles.
  const handleEnded = useCallback((e) => {
    const v = e.currentTarget;
    try {
      v.currentTime = 0;
      v.play().catch(() => {});
    } catch { /* ignore */ }
  }, []);

  // Wrapper establishes a local stacking context (`isolation: isolate`) so the
  // internal z-index swap between the two video layers does not bubble up and
  // overlay foreground siblings — e.g. the food sections grid in
  // ScreenGridRenderer, which sits in the same parent and has no explicit
  // z-index.
  return (
    <div className={className} style={{ isolation: 'isolate' }}>
      {[0, 1].map((idx) => {
        const layerUrl = layers[idx];
        if (!layerUrl) return null;
        return (
          <video
            key={`bg-layer-${idx}`}
            ref={refs[idx]}
            src={layerUrl}
            autoPlay
            muted
            playsInline
            onError={handleError}
            onStalled={handleStalled}
            onEnded={handleEnded}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              ...cropStyle,
              opacity: active === idx ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              zIndex: active === idx ? 1 : 0,
            }}
          />
        );
      })}
    </div>
  );
});

CrossfadeVideo.displayName = 'CrossfadeVideo';

export default CrossfadeVideo;
