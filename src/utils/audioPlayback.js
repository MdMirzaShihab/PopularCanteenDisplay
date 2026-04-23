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

    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
      audio.oncanplaythrough = null;
    };

    audio.onended = () => { cleanup(); resolve(); };
    audio.onerror = () => { cleanup(); resolve(); };

    audio.src = url;
    audio.load();

    audio.oncanplaythrough = () => {
      audio.oncanplaythrough = null;
      audio.play().catch(() => {
        // Retry once after a short delay (Samsung TV autoplay quirk)
        setTimeout(() => audio.play().catch(() => { cleanup(); resolve(); }), 200);
      });
    };

    // Safety timeout — never block longer than 15s
    setTimeout(() => { cleanup(); resolve(); }, 15000);
  });
};
