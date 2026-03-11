// Media utilities for multi-media slideshow support

import { isVideoUrl } from './fileUtils';

export const MAX_MEDIA_ITEMS = 10;
export const DEFAULT_SLIDE_DURATION = 5;
export const DEFAULT_TRANSITION = 'crossfade';

export const TRANSITION_EFFECTS = {
  crossfade: { id: 'crossfade', label: 'Crossfade' },
  slide: { id: 'slide', label: 'Slide' },
  fadeBlack: { id: 'fadeBlack', label: 'Fade to Black' },
  zoom: { id: 'zoom', label: 'Zoom In' },
  cut: { id: 'cut', label: 'Cut' }
};

export const VALID_TRANSITIONS = Object.keys(TRANSITION_EFFECTS);

/**
 * Detect whether a media src is a video or image
 * @param {string} src - Media URL or base64 string
 * @returns {'image'|'video'} - Media type
 */
export const getMediaType = (src) => {
  return isVideoUrl(src) ? 'video' : 'image';
};

/**
 * Normalize legacy content objects to the new multi-media format.
 * Handles backward compatibility for screens saved with old type:'image' or type:'video' shapes.
 * @param {Object} content - Content object from a section or time slot
 * @returns {Object} - Normalized content object
 */
export const normalizeContent = (content) => {
  if (!content) return content;

  // Menu content passes through unchanged
  if (content.type === 'menu') return content;

  // Already new format
  if (content.type === 'media' && Array.isArray(content.media)) return content;

  // Legacy single-string media (type: 'image' or 'video')
  if ((content.type === 'image' || content.type === 'video') && typeof content.media === 'string') {
    return {
      type: 'media',
      media: [content.media],
      slideDuration: content.slideDuration || DEFAULT_SLIDE_DURATION,
      transition: content.transition || DEFAULT_TRANSITION
    };
  }

  // Edge case: type:'media' but media is a string instead of array
  if (content.type === 'media' && typeof content.media === 'string') {
    return {
      ...content,
      media: [content.media]
    };
  }

  return content;
};
