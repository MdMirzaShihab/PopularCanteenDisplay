// Validation utilities for forms and business logic

import { timeToMinutes } from './timeUtils';
import { VALID_LAYOUT_IDS, getLayoutTheme } from '../components/gallery/themes/layoutRegistry';
import { VALID_VISUAL_STYLE_IDS } from '../components/gallery/themes/visualStyleRegistry';

/**
 * Validate item form data
 * @param {Object} itemData - Item data to validate
 * @returns {Object} - Validation result with errors
 */
export const validateItem = (itemData) => {
  const errors = {};

  if (!itemData.name || itemData.name.trim().length === 0) {
    errors.name = 'Item name is required';
  } else if (itemData.name.trim().length < 2) {
    errors.name = 'Item name must be at least 2 characters';
  }

  if (!itemData.description || itemData.description.trim().length === 0) {
    errors.description = 'Description is required';
  }

  if (itemData.price === undefined || itemData.price === null || itemData.price === '') {
    errors.price = 'Price is required';
  } else if (isNaN(itemData.price) || parseFloat(itemData.price) < 0) {
    errors.price = 'Price must be a valid positive number';
  }

  if (!itemData.image) {
    errors.image = 'Item image is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate menu form data
 * @param {Object} menuData - Menu data to validate
 * @returns {Object} - Validation result with errors
 */
export const validateMenu = (menuData) => {
  const errors = {};

  if (!menuData.title || menuData.title.trim().length === 0) {
    errors.title = 'Menu title is required';
  }

  if (!menuData.description || menuData.description.trim().length === 0) {
    errors.description = 'Description is required';
  }

  if (!menuData.itemIds || menuData.itemIds.length === 0) {
    errors.itemIds = 'At least one item must be selected';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate schedule form data
 * @param {Object} scheduleData - Schedule data to validate
 * @returns {Object} - Validation result with errors
 */
export const validateSchedule = (scheduleData) => {
  const errors = {};

  if (!scheduleData.defaultMenuId) {
    errors.defaultMenuId = 'Default menu is required';
  }

  if (!scheduleData.timeSlots || scheduleData.timeSlots.length === 0) {
    errors.timeSlots = 'At least one time slot is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate food screen form data
 * @param {Object} screenData - Food screen data to validate
 * @returns {Object} - Validation result with errors
 */
export const validateFoodScreen = (screenData) => {
  const errors = {};

  if (!screenData.title || screenData.title.trim().length === 0) {
    errors.title = 'Screen title is required';
  }

  if (!screenData.screenId || screenData.screenId.trim().length === 0) {
    errors.screenId = 'Screen ID is required';
  }

  if (!screenData.layoutTheme || !VALID_LAYOUT_IDS.includes(screenData.layoutTheme)) {
    errors.layoutTheme = 'Please select a valid layout';
  } else {
    const expectedSections = getLayoutTheme(screenData.layoutTheme).sections;
    if (!screenData.sections || screenData.sections.length !== expectedSections) {
      errors.sectionCount = `Layout requires ${expectedSections} section${expectedSections !== 1 ? 's' : ''} but found ${screenData.sections?.length || 0}`;
    }
  }

  if (screenData.backgroundType !== 'color' && !screenData.backgroundMedia) {
    errors.backgroundMedia = 'Background image/video is required';
  }

  if (screenData.backgroundType === 'color' && !screenData.backgroundColor) {
    errors.backgroundColor = 'Background color is required';
  }

  // Validate each section
  const sectionErrors = [];
  if (screenData.sections && screenData.sections.length > 0) {
    screenData.sections.forEach((section, idx) => {
      const se = {};

      if (!section.defaultContent || !section.defaultContent.type) {
        se.defaultContent = 'Default content is required';
      } else if (section.defaultContent.type === 'menu') {
        if (!section.defaultContent.menuId) {
          se.defaultContent = 'Please select a default menu';
        }
        if (!section.defaultContent.visualStyle || !VALID_VISUAL_STYLE_IDS.includes(section.defaultContent.visualStyle)) {
          se.defaultContentStyle = 'Please select a visual style';
        }
      } else if (section.defaultContent.type === 'media' && (!Array.isArray(section.defaultContent.media) || section.defaultContent.media.length === 0)) {
        se.defaultContent = 'Please select at least one media item';
      }

      if (section.timeSlots && section.timeSlots.length > 0) {
        section.timeSlots.forEach((slot, slotIdx) => {
          if (!slot.startTime || !slot.endTime) {
            se[`timeSlot_${slotIdx}_time`] = 'Start and end time are required';
          }
          if (!slot.daysOfWeek || slot.daysOfWeek.length === 0) {
            se[`timeSlot_${slotIdx}_days`] = 'At least one day is required';
          }
          if (!slot.content || !slot.content.type) {
            se[`timeSlot_${slotIdx}_content`] = 'Content is required for each time slot';
          } else if (slot.content.type === 'menu' && !slot.content.menuId) {
            se[`timeSlot_${slotIdx}_content`] = 'Please select a menu';
          } else if (slot.content.type === 'media' && (!Array.isArray(slot.content.media) || slot.content.media.length === 0)) {
            se[`timeSlot_${slotIdx}_content`] = 'Please select at least one media item';
          }
        });

        const overlaps = checkSectionTimeSlotOverlaps(section.timeSlots);
        if (overlaps.length > 0) {
          se.timeSlotOverlaps = 'Time slots must not overlap within the same section';
        }
      }

      if (Object.keys(se).length > 0) {
        sectionErrors[idx] = se;
      }
    });
  }

  if (sectionErrors.some(e => e)) {
    errors.sections = sectionErrors;
  }

  // Build a flat map of tab -> first error message for auto-navigation
  const tabErrors = {};
  let firstErrorSectionIdx = 0;

  if (errors.title || errors.screenId || errors.layoutTheme || errors.sectionCount) {
    tabErrors.layout = errors.title || errors.screenId || errors.layoutTheme || errors.sectionCount;
  }
  if (errors.sections && Array.isArray(errors.sections)) {
    // Per-section content/timeslot errors
    const idx = errors.sections.findIndex(e => e);
    if (idx !== -1) {
      const sectionErrs = errors.sections[idx];
      const firstSectionError = Object.values(sectionErrs)[0];
      tabErrors.sections = `Section ${idx + 1}: ${firstSectionError}`;
      firstErrorSectionIdx = idx;
    }
  }
  if (errors.backgroundMedia || errors.backgroundColor) {
    tabErrors.settings = errors.backgroundMedia || errors.backgroundColor;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    tabErrors,
    firstErrorSectionIdx
  };
};

/**
 * Validate token screen form data
 * @param {Object} screenData - Token screen data to validate
 * @returns {Object} - Validation result with errors
 */
export const validateTokenScreen = (screenData) => {
  const errors = {};

  if (!screenData.title || screenData.title.trim().length === 0) {
    errors.title = 'Screen title is required';
  }

  if (!screenData.screenId || screenData.screenId.trim().length === 0) {
    errors.screenId = 'Screen ID is required';
  }

  const validBgTypes = ['image', 'video', 'color'];
  if (screenData.backgroundType && !validBgTypes.includes(screenData.backgroundType)) {
    errors.backgroundType = 'Invalid background type';
  }

  if (screenData.backgroundType === 'image' || screenData.backgroundType === 'video') {
    if (!screenData.backgroundMedia) {
      errors.backgroundMedia = 'Background media is required for image/video type';
    }
  }

  if (screenData.backgroundType === 'color') {
    if (!screenData.backgroundColor) {
      errors.backgroundColor = 'Background color is required';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Check if two time ranges overlap (handles overnight spans where end < start)
 * @param {number} aStart - Start of range A in minutes
 * @param {number} aEnd - End of range A in minutes
 * @param {number} bStart - Start of range B in minutes
 * @param {number} bEnd - End of range B in minutes
 * @returns {boolean} - Whether ranges overlap
 */
const isTimeRangeOverlapping = (aStart, aEnd, bStart, bEnd) => {
  // Handle overnight spans by normalizing to two ranges
  const aIsOvernight = aEnd <= aStart;
  const bIsOvernight = bEnd <= bStart;

  if (!aIsOvernight && !bIsOvernight) {
    // Simple case: neither crosses midnight
    return aStart < bEnd && aEnd > bStart;
  }

  if (aIsOvernight && !bIsOvernight) {
    // A crosses midnight: check [aStart, 1440) and [0, aEnd) against B
    return (aStart < bEnd && 1440 > bStart) || (0 < bEnd && aEnd > bStart);
  }

  if (!aIsOvernight && bIsOvernight) {
    // B crosses midnight: check A against [bStart, 1440) and [0, bEnd)
    return (aStart < 1440 && aEnd > bStart) || (aStart < bEnd && aEnd > 0);
  }

  // Both cross midnight — they always overlap (both cover midnight)
  return true;
};

/**
 * Check for overlapping time slots within a single section
 * @param {Array} timeSlots - Array of section time slot objects
 * @returns {Array} - Array of overlap objects { slotA, slotB, days }
 */
export const checkSectionTimeSlotOverlaps = (timeSlots) => {
  const overlaps = [];
  for (let i = 0; i < timeSlots.length; i++) {
    for (let j = i + 1; j < timeSlots.length; j++) {
      const a = timeSlots[i];
      const b = timeSlots[j];
      const sharedDays = a.daysOfWeek.filter(d => b.daysOfWeek.includes(d));
      if (sharedDays.length === 0) continue;
      // Use timeToMinutes for comparison
      const aStart = timeToMinutes(a.startTime);
      const aEnd = timeToMinutes(a.endTime);
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      // Check overlap (handle overnight spans)
      if (isTimeRangeOverlapping(aStart, aEnd, bStart, bEnd)) {
        overlaps.push({ slotA: i, slotB: j, days: sharedDays });
      }
    }
  }
  return overlaps;
};

/**
 * Check if time slots overlap (considering day-of-week)
 * @param {Array} timeSlots - Array of time slot objects
 * @returns {Object} - Overlap information with priority warnings
 */
export const checkTimeSlotOverlaps = (timeSlots) => {
  if (!timeSlots || timeSlots.length < 2) {
    return { hasOverlap: false, overlaps: [], warnings: [] };
  }

  const overlaps = [];
  const warnings = [];

  for (let i = 0; i < timeSlots.length; i++) {
    for (let j = i + 1; j < timeSlots.length; j++) {
      const slot1 = timeSlots[i];
      const slot2 = timeSlots[j];

      // Check if days overlap
      const daysOverlap = doDaysOverlap(slot1.daysOfWeek, slot2.daysOfWeek);

      // Check if times overlap
      const timesOverlap = doTimeSlotsOverlap(slot1, slot2);

      if (daysOverlap && timesOverlap) {
        overlaps.push({
          slot1Index: i,
          slot2Index: j,
          slot1: slot1,
          slot2: slot2
        });
      }
    }
  }

  return {
    hasOverlap: overlaps.length > 0,
    overlaps,
    warnings
  };
};

/**
 * Check if two day arrays overlap
 * @param {Array<string>} days1 - First array of days
 * @param {Array<string>} days2 - Second array of days
 * @returns {boolean} - Whether days overlap
 */
const doDaysOverlap = (days1, days2) => {
  // If either is empty or not specified, assume all days
  if (!days1 || days1.length === 0 || !days2 || days2.length === 0) {
    return true;
  }

  // Check if any day appears in both arrays
  return days1.some(day => days2.includes(day));
};

/**
 * Check if two time slots overlap
 * @param {Object} slot1 - First time slot
 * @param {Object} slot2 - Second time slot
 * @returns {boolean} - Whether slots overlap
 */
export const doTimeSlotsOverlap = (slot1, slot2) => {
  const start1 = timeToMinutes(slot1.startTime);
  const end1 = timeToMinutes(slot1.endTime);
  const start2 = timeToMinutes(slot2.startTime);
  const end2 = timeToMinutes(slot2.endTime);

  // Check for overlap
  return (start1 < end2 && end1 > start2);
};

/**
 * Validate time slot
 * @param {Object} slot - Time slot to validate
 * @returns {Object} - Validation result
 */
export const validateTimeSlot = (slot) => {
  const errors = {};

  if (!slot.startTime) {
    errors.startTime = 'Start time is required';
  }

  if (!slot.endTime) {
    errors.endTime = 'End time is required';
  }

  if (!slot.menuId) {
    errors.menuId = 'Menu is required';
  }

  if (slot.startTime && slot.endTime) {
    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);

    if (start >= end) {
      errors.endTime = 'End time must be after start time';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate price format
 * @param {number|string} price - Price to validate
 * @returns {boolean} - Whether price is valid
 */
export const isValidPrice = (price) => {
  if (price === '' || price === null || price === undefined) return false;
  const num = parseFloat(price);
  return !isNaN(num) && num >= 0 && num < 10000;
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} - Whether value is provided
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Validate min length
 * @param {string} value - String to validate
 * @param {number} minLength - Minimum length
 * @returns {boolean} - Whether string meets minimum length
 */
export const hasMinLength = (value, minLength) => {
  if (!value || typeof value !== 'string') return false;
  return value.trim().length >= minLength;
};

/**
 * Validate max length
 * @param {string} value - String to validate
 * @param {number} maxLength - Maximum length
 * @returns {boolean} - Whether string is within maximum length
 */
export const hasMaxLength = (value, maxLength) => {
  if (!value || typeof value !== 'string') return true;
  return value.trim().length <= maxLength;
};

/**
 * Validate user form data
 * @param {Object} userData - User data to validate
 * @param {boolean} isEditing - Whether this is an edit (password optional)
 * @returns {Object} - Validation result with errors
 */
export const validateUser = (userData, isEditing = false) => {
  const errors = {};

  if (!userData.name || userData.name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters';
  }

  if (!userData.email || !isValidEmail(userData.email)) {
    errors.email = 'A valid email address is required';
  }

  if (!userData.username || userData.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters';
  } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
    errors.username = 'Username may only contain letters, numbers, and underscores';
  }

  if (!isEditing) {
    if (!userData.password || userData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
  } else if (userData.password && userData.password.length > 0 && userData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!userData.role || !['admin', 'restaurant_user', 'token_operator'].includes(userData.role)) {
    errors.role = 'A valid role must be selected';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
