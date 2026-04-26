// Shared HTML5 Audio element for token TTS playback.
// Samsung Tizen autoplay quirks: use a persistent element, preload, retry once.

const API_BASE = import.meta.env.VITE_API_URL || '';

let sharedAudio = null;
const getSharedAudio = () => {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = 'auto';
  }
  return sharedAudio;
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

    // Reset the element so the same URL (e.g. token-reannounce) re-triggers a
    // fresh load. Without this, browsers may treat the assignment as a no-op
    // and skip media events, leaving playback silently stuck.
    try { audio.pause(); } catch { /* ignore */ }
    audio.removeAttribute('src');
    audio.load();
    audio.src = url;

    const tryPlay = (attempt = 1) => {
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch((err) => {
          if (attempt < 2) {
            // Retry once after a short delay (Samsung TV autoplay quirk)
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
