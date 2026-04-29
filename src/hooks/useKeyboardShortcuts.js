import { useEffect, useRef } from 'react';

/**
 * Listens for keyboard combinations and runs the matching handler.
 *
 * Pass a map keyed by lowercase combos using `+` as separator and these
 * modifier names: `ctrl`, `alt`, `shift`, `meta`. The base key is the
 * lowercased `event.key` (e.g. `enter`, `escape`, `r`, `n`, ` ` for space).
 *
 *   useKeyboardShortcuts({
 *     'alt+r': handleReannounce,
 *     'alt+z': handleUndo,
 *     'alt+n': handleNext,
 *   }, { enabled: !dialogOpen });
 *
 * Handlers run with the keydown event passed in; the hook calls
 * `preventDefault()` automatically so the matched combo doesn't bubble to
 * the browser (e.g. Alt+R won't open the View menu).
 */
export const useKeyboardShortcuts = (shortcuts, { enabled = true } = {}) => {
  // Keep the latest map in a ref so handlers can change between renders
  // without re-binding the document listener.
  const shortcutsRef = useRef(shortcuts);
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      const parts = [];
      if (event.ctrlKey) parts.push('ctrl');
      if (event.altKey) parts.push('alt');
      if (event.shiftKey) parts.push('shift');
      if (event.metaKey) parts.push('meta');

      // For modifier combos prefer event.code (physical key) so the binding is
      // stable across keyboard layouts. macOS Alt mutates event.key into a
      // special character (e.g. Alt+R → "®") which would never match the
      // intended "r" combo. event.code on a letter key is "KeyR".
      const hasModifier = event.ctrlKey || event.altKey || event.metaKey;
      let baseKey;
      if (hasModifier && event.code && event.code.startsWith('Key')) {
        baseKey = event.code.slice(3).toLowerCase();
      } else if (hasModifier && event.code && event.code.startsWith('Digit')) {
        baseKey = event.code.slice(5);
      } else {
        baseKey = event.key.toLowerCase();
      }
      parts.push(baseKey);
      const combo = parts.join('+');

      const handler = shortcutsRef.current[combo];
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
};
