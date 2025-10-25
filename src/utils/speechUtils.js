// Text-to-Speech utility functions using Web Speech API

/**
 * Check if the browser supports the Web Speech API
 * @returns {boolean} True if speech synthesis is supported
 */
export const isSpeechSupported = () => {
  return 'speechSynthesis' in window;
};

/**
 * Speak the token number announcement
 * @param {string|number} tokenNumber - The token number to announce
 * @param {object} options - Optional settings for the speech
 */
export const speakTokenNumber = (tokenNumber, options = {}) => {
  // Check if speech synthesis is supported
  if (!isSpeechSupported()) {
    console.warn('Speech synthesis is not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create the announcement text
  const text = `Current token is ${tokenNumber}`;

  // Create speech synthesis utterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Configure speech settings
  utterance.lang = options.lang || 'en-US'; // Language
  utterance.rate = options.rate || 0.9; // Speed (0.1 to 10, 1 is normal)
  utterance.pitch = options.pitch || 1.0; // Pitch (0 to 2, 1 is normal)
  utterance.volume = options.volume || 1.0; // Volume (0 to 1)

  // Error handling
  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event.error);
  };

  // Optional callback when speech starts
  if (options.onStart) {
    utterance.onstart = options.onStart;
  }

  // Optional callback when speech ends
  if (options.onEnd) {
    utterance.onend = options.onEnd;
  }

  // Speak the text
  try {
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Error speaking token number:', error);
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
 * @returns {Array} Array of available speech synthesis voices
 */
export const getAvailableVoices = () => {
  if (!isSpeechSupported()) {
    return [];
  }
  return window.speechSynthesis.getVoices();
};
