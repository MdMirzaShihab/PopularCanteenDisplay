// Text-to-Speech utility functions using Web Speech API
// Professional airport-style voice announcements

/**
 * Check if the browser supports the Web Speech API
 * @returns {boolean} True if speech synthesis is supported
 */
export const isSpeechSupported = () => {
  return 'speechSynthesis' in window;
};

/**
 * Select the best female voice for professional announcements
 * Prioritizes clear, natural-sounding English female voices
 * @param {Array} voices - Array of available SpeechSynthesisVoice objects
 * @returns {SpeechSynthesisVoice|null} Selected voice or null
 */
const selectBestFemaleVoice = (voices) => {
  if (!voices || voices.length === 0) return null;

  // Priority list of preferred female voices (airport/professional quality)
  const preferredVoices = [
    // Google voices (best quality)
    'Google UK English Female',
    'Google US English Female',

    // Microsoft voices (Windows)
    'Microsoft Zira Desktop',
    'Microsoft Zira',

    // Apple voices (macOS/iOS)
    'Samantha',
    'Karen',
    'Victoria',

    // Other quality voices
    'Fiona',
    'Moira',
    'Tessa'
  ];

  // First, try to find exact match from preferred list
  for (const preferredName of preferredVoices) {
    const voice = voices.find(v => v.name === preferredName);
    if (voice) {
      return voice;
    }
  }

  // Second, find any English female voice
  const femaleVoice = voices.find(v =>
    v.lang.startsWith('en') &&
    (v.name.toLowerCase().includes('female') ||
     v.name.toLowerCase().includes('woman') ||
     // Known female voice names
     ['samantha', 'karen', 'victoria', 'fiona', 'moira', 'tessa', 'zira', 'hazel']
       .some(name => v.name.toLowerCase().includes(name)))
  );

  if (femaleVoice) {
    return femaleVoice;
  }

  // Third, any English voice
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  if (englishVoice) {
    return englishVoice;
  }

  // Fallback to first available voice
  return voices[0] || null;
};

/**
 * Wait for voices to load (they load asynchronously)
 * @returns {Promise<Array>} Promise that resolves with available voices
 */
const waitForVoices = () => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Voices not loaded yet, wait for them
    const voicesChanged = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      if (loadedVoices.length > 0) {
        window.speechSynthesis.removeEventListener('voiceschanged', voicesChanged);
        resolve(loadedVoices);
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', voicesChanged);

    // Timeout fallback after 2 seconds
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', voicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 2000);
  });
};

/**
 * Speak the token number announcement with professional female voice
 * Airport-style announcement with natural pacing
 * @param {string|number} tokenNumber - The token number to announce
 * @param {object} options - Optional settings for the speech
 */
export const speakTokenNumber = async (tokenNumber, options = {}) => {
  // Check if speech synthesis is supported
  if (!isSpeechSupported()) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Small delay to ensure cancel completes
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    // Wait for voices to be available
    const voices = await waitForVoices();

    // Select the best female voice
    const selectedVoice = selectBestFemaleVoice(voices);

    // Create the announcement text with natural pauses
    // The comma creates a natural pause in speech synthesis
    const text = `Current token is, ${tokenNumber}`;

    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Assign the selected voice
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = options.lang || 'en-US';
    }

    // Configure speech settings for professional airport-style announcement
    utterance.rate = options.rate || 0.75;  // Slower for clarity (0.75 = 25% slower than normal)
    utterance.pitch = options.pitch || 1.1; // Slightly higher pitch for female voice
    utterance.volume = options.volume || 1.0; // Full volume

    // Return a promise that resolves when speech ends
    return new Promise((resolve, reject) => {
      // Error handling
      utterance.onerror = (event) => {
        reject(event.error);
      };

      // When speech starts
      utterance.onstart = () => {
        if (options.onStart) options.onStart();
      };

      // When speech ends
      utterance.onend = () => {
        if (options.onEnd) options.onEnd();
        resolve();
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);
    });

  } catch (error) {
    throw error;
  }
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
 * @returns {Promise<Array>} Promise that resolves with array of available voices
 */
export const getAvailableVoices = async () => {
  if (!isSpeechSupported()) {
    return [];
  }
  return await waitForVoices();
};

/**
 * Test the voice announcement (for debugging)
 * @param {string|number} tokenNumber - Token number to test
 */
export const testVoice = async (tokenNumber = '123') => {
  console.log('Testing voice announcement...');
  const voices = await getAvailableVoices();
  console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
  await speakTokenNumber(tokenNumber);
};
