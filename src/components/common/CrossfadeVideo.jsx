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
  // readyState drops, force a reload + play. Also re-attempt on
  // visibilitychange (the page being unhidden after standby is the most
  // common cause of a stuck background video).
  useEffect(() => {
    const heal = () => {
      const vid = refs[activeRef.current].current;
      if (!vid) return;
      if (vid.paused || vid.ended || vid.readyState < 2) {
        try {
          vid.load();
          vid.play().catch(() => {});
        } catch { /* ignore */ }
      }
    };

    const intervalId = setInterval(heal, 3000);
    const onVisibility = () => { if (!document.hidden) heal(); };
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
            loop
            muted
            playsInline
            preload="auto"
            onError={handleError}
            onStalled={handleStalled}
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
