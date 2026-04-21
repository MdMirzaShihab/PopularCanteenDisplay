import { useEffect, useRef, useState } from 'react';

/**
 * Tracks an outgoing + incoming page across a crossfade window so both layers
 * can be rendered simultaneously while the old one fades out and the new one
 * staggers in. Returns `{ activePage, prevPage, transitionKey }`:
 *   - activePage: the page to render as the entering layer
 *   - prevPage:  the page still being rendered as the exiting layer (null when idle)
 *   - transitionKey: bumps every time a new transition starts — use as React `key`
 *                    on the entering container so it remounts and restarts
 *                    staggered child animations.
 */
export const usePageCrossfade = (currentPage, exitDuration = 520) => {
  const [activePage, setActivePage] = useState(currentPage);
  const [prevPage, setPrevPage] = useState(null);
  const [transitionKey, setTransitionKey] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (currentPage === activePage) return;
    setPrevPage(activePage);
    setActivePage(currentPage);
    setTransitionKey((k) => k + 1);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPrevPage(null), exitDuration);
    return () => clearTimeout(timerRef.current);
  }, [currentPage, activePage, exitDuration]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { activePage, prevPage, transitionKey };
};
