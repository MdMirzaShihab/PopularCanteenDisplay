// Shared HTML5 Audio element for token TTS playback.
// Samsung Tizen autoplay quirks: use a persistent element, preload, retry once.

const API_BASE = import.meta.env.VITE_API_URL || '';

// Tiny silent WAV (44 bytes) used to consume a user gesture and unlock the
// shared audio element. Browsers separate "user has interacted with this page"
// from "user has interacted with this <audio>"; we need a successful play()
// inside a gesture to grant autoplay rights for subsequent token TTS.
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

let sharedAudio = null;
let unlocked = false;
let unlockInFlight = null;
const unlockListeners = new Set();

const getSharedAudio = () => {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = 'auto';
  }
  return sharedAudio;
};

export const isAudioUnlocked = () => unlocked;

export const onAudioUnlocked = (cb) => {
  if (unlocked) {
    try { cb(); } catch { /* ignore */ }
    return () => {};
  }
  unlockListeners.add(cb);
  return () => unlockListeners.delete(cb);
};

const markUnlocked = () => {
  if (unlocked) return;
  unlocked = true;
  console.info('[audioPlayback] unlocked');
  for (const cb of unlockListeners) {
    try { cb(); } catch { /* ignore */ }
  }
  unlockListeners.clear();
};

// Call this from a user-gesture handler (click / tap / keydown) to grant the
// shared audio element autoplay rights for the rest of the session. Safe to
// call multiple times — concurrent calls share a single in-flight unlock
// (otherwise their interleaved `audio.muted` reads/writes can leave the
// element permanently muted).
export const unlockAudio = async () => {
  if (unlocked) return true;
  if (unlockInFlight) return unlockInFlight;
  const audio = getSharedAudio();
  unlockInFlight = (async () => {
    try {
      audio.muted = true;
      audio.src = SILENT_WAV;
      audio.load();
      await audio.play();
      audio.pause();
      audio.muted = false;
      audio.removeAttribute('src');
      markUnlocked();
      return true;
    } catch (err) {
      audio.muted = false;
      console.warn('[audioPlayback] unlock failed:', err);
      return false;
    } finally {
      unlockInFlight = null;
    }
  })();
  return unlockInFlight;
};

export const playAudioUrl = (urlPath) => {
  if (!urlPath) return Promise.resolve();
  const url = `${API_BASE}${urlPath}`;

  return new Promise((resolve) => {
    const audio = getSharedAudio();
    let settled = false;
    let safetyTimer = null;

    const settle = () => {
      if (settled) return;
      settled = true;
      audio.onended = null;
      audio.onerror = null;
      if (safetyTimer) clearTimeout(safetyTimer);
      resolve();
    };

    audio.onended = settle;
    audio.onerror = settle;

    // Set the new src first so the element is never in an empty-source state
    // (an empty-src `load()` can fire a spurious `error` event that prematurely
    // settles this promise via the handler above). Forcing currentTime=0 and
    // calling load() restarts playback even if the same URL is requested again
    // (e.g. token-reannounce).
    try { audio.pause(); } catch { /* ignore */ }
    audio.src = url;
    try { audio.currentTime = 0; } catch { /* ignore */ }
    audio.load();

    const tryPlay = (attempt = 1) => {
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch((err) => {
          // Autoplay block: don't bother retrying — needs a user gesture.
          // Surface clearly so future intermittent reports are diagnosable.
          if (err && err.name === 'NotAllowedError') {
            console.warn(
              '[audioPlayback] blocked by autoplay policy (no user gesture yet):',
              url,
            );
            settle();
            return;
          }
          if (attempt < 2) {
            // Retry once after a short delay (Samsung TV transient quirks).
            setTimeout(() => tryPlay(attempt + 1), 200);
          } else {
            console.warn('[audioPlayback] play() failed after retry:', url, err);
            settle();
          }
        });
      }
    };

    tryPlay();

    // Safety timeout — never block the queue longer than 15s.
    safetyTimer = setTimeout(() => {
      console.warn('[audioPlayback] safety timeout (15s), forcing resolve:', url);
      settle();
    }, 15000);
  });
};
