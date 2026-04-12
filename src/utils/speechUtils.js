// Text-to-Speech utility functions using Web Speech API + pre-recorded Bangla audio
// Bilingual announcements: English (Web Speech API) + Bangla (native audio clips)

/**
 * Check if the browser supports the Web Speech API
 * @returns {boolean} True if speech synthesis is supported
 */
export const isSpeechSupported = () => {
  return 'speechSynthesis' in window;
};

// ---------------------------------------------------------------------------
// English helpers
// ---------------------------------------------------------------------------

const digitToEnglish = {
  '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
  '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
};

/** Convert a token string to digit-by-digit English words */
const tokenToEnglishWords = (token) =>
  String(token).split('').map(ch => digitToEnglish[ch] || ch).join(', ');

// ---------------------------------------------------------------------------
// Bangla audio playback
// ---------------------------------------------------------------------------

const BANGLA_AUDIO_BASE = '/audio/bangla';

/** AudioBuffer cache — decoded PCM data ready for instant playback */
const bufferCache = new Map();
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
};

/** Fetch and decode an audio clip into an AudioBuffer */
const loadBuffer = async (filename) => {
  const url = `${BANGLA_AUDIO_BASE}/${filename}.mp3`;
  if (bufferCache.has(url)) return bufferCache.get(url);

  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await getAudioContext().decodeAudioData(arrayBuffer);
  bufferCache.set(url, audioBuffer);
  return audioBuffer;
};

/**
 * Break a number (0–99999) into audio clip filenames.
 * e.g. 1005 → ['1', 'hazar', '5']
 * e.g. 253  → ['2', 'sho', '53']
 * e.g. 42   → ['42']
 */
const numberToClipSequence = (n) => {
  if (n <= 99) return [String(n)];

  const clips = [];

  if (n >= 1000) {
    clips.push(String(Math.floor(n / 1000)), 'hazar');
    n %= 1000;
  }

  if (n >= 100) {
    clips.push(String(Math.floor(n / 100)), 'sho');
    n %= 100;
  }

  if (n > 0) {
    clips.push(String(n));
  }

  return clips;
};

/**
 * Build the sequence of audio clip filenames for a token.
 * Pure numbers → proper Bangla number composition.
 * Alphanumeric → digit-by-digit clips.
 */
const tokenToClipSequence = (token) => {
  const str = String(token);
  const num = Number(str);

  // Pure numeric token
  if (/^\d+$/.test(str) && num >= 0 && num <= 99999) {
    return numberToClipSequence(num);
  }

  // Alphanumeric — digit-by-digit for number chars, skip letters
  return str.split('')
    .filter(ch => /\d/.test(ch))
    .map(ch => ch);
};

/**
 * Concatenate multiple AudioBuffers into one continuous buffer.
 * Plays as a single seamless sound — no gaps between words.
 */
const concatenateBuffers = (buffers) => {
  const ctx = getAudioContext();
  const sampleRate = buffers[0].sampleRate;
  const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);
  const channels = buffers[0].numberOfChannels;
  const merged = ctx.createBuffer(channels, totalLength, sampleRate);

  for (let ch = 0; ch < channels; ch++) {
    const output = merged.getChannelData(ch);
    let offset = 0;
    for (const buf of buffers) {
      output.set(buf.getChannelData(ch), offset);
      offset += buf.length;
    }
  }
  return merged;
};

/** Load all clips, merge into one buffer, and play as a single continuous sound */
const playBanglaSequence = async (tokenNumber) => {
  const clips = tokenToClipSequence(tokenNumber);
  if (clips.length === 0) return;

  // Load all clips in parallel
  const buffers = await Promise.all(clips.map(c => loadBuffer(c)));

  // Merge into one seamless audio buffer
  const merged = concatenateBuffers(buffers);

  // Play the merged buffer
  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  source.buffer = merged;
  source.connect(ctx.destination);

  return new Promise((resolve) => {
    source.onended = resolve;
    source.start(0);
  });
};

// ---------------------------------------------------------------------------
// English voice selection
// ---------------------------------------------------------------------------

const selectEnglishVoice = (voices) => {
  if (!voices || voices.length === 0) return null;

  const preferred = [
    'Google UK English Female', 'Google US English Female',
    'Microsoft Zira Desktop', 'Microsoft Zira',
    'Samantha', 'Karen', 'Victoria', 'Fiona', 'Moira', 'Tessa',
  ];

  for (const name of preferred) {
    const v = voices.find(v => v.name === name);
    if (v) return v;
  }

  const female = voices.find(v =>
    v.lang.startsWith('en') &&
    (v.name.toLowerCase().includes('female') ||
     ['samantha', 'karen', 'victoria', 'fiona', 'moira', 'tessa', 'zira', 'hazel']
       .some(n => v.name.toLowerCase().includes(n)))
  );
  if (female) return female;

  return voices.find(v => v.lang.startsWith('en')) || null;
};

// ---------------------------------------------------------------------------
// Speech helpers
// ---------------------------------------------------------------------------

const waitForVoices = () => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    const voicesChanged = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      if (loadedVoices.length > 0) {
        window.speechSynthesis.removeEventListener('voiceschanged', voicesChanged);
        resolve(loadedVoices);
      }
    };
    window.speechSynthesis.addEventListener('voiceschanged', voicesChanged);

    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', voicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 2000);
  });
};

/** Speak English text via Web Speech API */
const speakEnglish = (text, { voice, rate = 0.85, pitch = 1.1, volume = 1.0 } = {}) => {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'en-US';
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e.error);
    window.speechSynthesis.speak(utterance);
  });
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Speak the token number bilingually:
 * 1. English via Web Speech API: "Token number is, one, zero, zero, five"
 * 2. Bangla via pre-recorded audio: এক হাজার পাঁচ (native neural voice)
 */
export const speakTokenNumber = async (tokenNumber, options = {}) => {
  if (!isSpeechSupported()) return;

  window.speechSynthesis.cancel();
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const voices = await waitForVoices();
    const englishVoice = selectEnglishVoice(voices);

    const rate = options.rate || 0.85;
    const pitch = options.pitch || 1.1;
    const volume = options.volume || 1.0;

    // --- English announcement (digit-by-digit via Web Speech API) ---
    const englishText = `Token number is, ${tokenToEnglishWords(tokenNumber)}`;

    if (options.onStart) options.onStart();

    await speakEnglish(englishText, { voice: englishVoice, rate, pitch, volume });

    // Pause between languages
    await new Promise(resolve => setTimeout(resolve, 500));

    // --- Bangla announcement (pre-recorded native audio clips) ---
    await playBanglaSequence(tokenNumber);

    if (options.onEnd) options.onEnd();
  } catch {
    // Silently handle speech errors
  }
};

/**
 * Preload Bangla audio clips for faster first playback.
 * Call once on component mount.
 */
export const preloadBanglaAudio = async () => {
  // Preload commonly used clips (0-9 + sho + hazar)
  const clips = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'sho', 'hazar'];
  await Promise.all(clips.map(c => loadBuffer(c).catch(() => {})));
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Get available voices
 */
export const getAvailableVoices = async () => {
  if (!isSpeechSupported()) return [];
  return await waitForVoices();
};

/**
 * Test the voice announcement (for debugging)
 */
export const testVoice = async (tokenNumber = '1005') => {
  console.log('Testing bilingual voice announcement...');
  console.log('English:', `Token number is, ${tokenToEnglishWords(tokenNumber)}`);
  console.log('Bangla clips:', tokenToClipSequence(tokenNumber));
  await speakTokenNumber(tokenNumber);
};
