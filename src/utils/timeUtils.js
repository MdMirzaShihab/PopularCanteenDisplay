// Time-based utilities for menu scheduling

/**
 * Get current time in HH:MM format
 * @returns {string} - Current time as HH:MM
 */
export const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Get current day of week in lowercase
 * @returns {string} - Day name (monday, tuesday, etc.)
 */
export const getCurrentDayOfWeek = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const now = new Date();
  return days[now.getDay()];
};

/**
 * Convert time string to minutes since midnight
 * @param {string} timeString - Time in HH:MM format
 * @returns {number} - Minutes since midnight
 */
export const timeToMinutes = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to HH:MM format
 * @param {number} minutes - Minutes since midnight
 * @returns {string} - Time in HH:MM format
 */
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Check if current time is between start and end times
 * @param {string} currentTime - Current time in HH:MM format
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {boolean} - Whether current time is in range
 */
export const isTimeInRange = (currentTime, startTime, endTime) => {
  const current = timeToMinutes(currentTime);
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  // Handle cases where end time is past midnight
  if (end < start) {
    return current >= start || current <= end;
  }

  return current >= start && current <= end;
};

/**
 * Get the active menu for the current time based on schedule
 * @param {Object} schedule - Schedule object with timeSlots
 * @param {string} currentTime - Optional current time (defaults to now)
 * @param {string} currentDay - Optional current day (defaults to now)
 * @returns {Object|null} - Active time slot or null (first matching slot)
 */
export const getActiveTimeSlot = (schedule, currentTime = null, currentDay = null) => {
  if (!schedule || !schedule.timeSlots) return null;

  const time = currentTime || getCurrentTime();
  const day = currentDay || getCurrentDayOfWeek();

  // Find matching time slots (filter by both day and time)
  const matchingSlots = schedule.timeSlots.filter(slot => {
    // Check if day matches (if daysOfWeek is specified)
    const dayMatches = !slot.daysOfWeek || slot.daysOfWeek.length === 0 || slot.daysOfWeek.includes(day);

    // Check if time matches
    const timeMatches = isTimeInRange(time, slot.startTime, slot.endTime);

    return dayMatches && timeMatches;
  });

  // Return first matching slot (or null if none match)
  return matchingSlots.length > 0 ? matchingSlots[0] : null;
};

/**
 * Get ALL active time slots for the current time (supports multiple overlapping slots)
 * @param {Object} schedule - Schedule object with timeSlots
 * @param {string} currentTime - Optional current time (defaults to now)
 * @param {string} currentDay - Optional current day (defaults to now)
 * @returns {Array} - Array of active time slots
 */
export const getAllActiveTimeSlots = (schedule, currentTime = null, currentDay = null) => {
  if (!schedule || !schedule.timeSlots) return [];

  const time = currentTime || getCurrentTime();
  const day = currentDay || getCurrentDayOfWeek();

  // Find ALL matching time slots (filter by both day and time)
  const matchingSlots = schedule.timeSlots.filter(slot => {
    // Check if day matches (if daysOfWeek is specified)
    const dayMatches = !slot.daysOfWeek || slot.daysOfWeek.length === 0 || slot.daysOfWeek.includes(day);

    // Check if time matches
    const timeMatches = isTimeInRange(time, slot.startTime, slot.endTime);

    return dayMatches && timeMatches;
  });

  return matchingSlots;
};

/**
 * Get ALL unique menu IDs for current time (supports multiple overlapping menus)
 * @param {Object} schedule - Schedule object
 * @param {string} currentTime - Optional current time
 * @param {string} currentDay - Optional current day
 * @returns {Array<string>} - Array of unique menu IDs sorted by priority
 */
export const getAllCurrentMenuIds = (schedule, currentTime = null, currentDay = null) => {
  const activeSlots = getAllActiveTimeSlots(schedule, currentTime, currentDay);

  // Get unique menu IDs while preserving priority order
  const menuIds = [];
  const seen = new Set();

  activeSlots.forEach(slot => {
    if (slot.menuId && !seen.has(slot.menuId)) {
      menuIds.push(slot.menuId);
      seen.add(slot.menuId);
    }
  });

  return menuIds;
};

/**
 * Get the menu ID for current time based on schedule
 * @param {Object} schedule - Schedule object
 * @param {string} currentTime - Optional current time
 * @param {string} currentDay - Optional current day
 * @returns {string|null} - Menu ID from active time slot, or null if no slot matches
 */
export const getCurrentMenuId = (schedule, currentTime = null, currentDay = null) => {
  const activeSlot = getActiveTimeSlot(schedule, currentTime, currentDay);
  return activeSlot ? activeSlot.menuId : null; // Don't fall back to default menu
};

/**
 * Calculate row positions for timeline visualization with overlapping slots
 * Uses interval scheduling algorithm to minimize rows
 * @param {Array} timeSlots - Array of time slot objects
 * @returns {Object} - Map of slot.id -> { rowIndex, totalRows }
 */
export const calculateTimeSlotRows = (timeSlots) => {
  if (!timeSlots || timeSlots.length === 0) {
    return { slotRows: {}, totalRows: 0 };
  }

  // Sort slots by start time, then by end time
  const sortedSlots = [...timeSlots].sort((a, b) => {
    const aStart = timeToMinutes(a.startTime);
    const bStart = timeToMinutes(b.startTime);
    if (aStart !== bStart) return aStart - bStart;
    return timeToMinutes(a.endTime) - timeToMinutes(b.endTime);
  });

  // Track when each row becomes available (in minutes)
  const rows = [];
  const slotRows = {};

  // Assign each slot to the first available row
  sortedSlots.forEach(slot => {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    // Find the first row where this slot fits
    let assignedRow = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i] <= slotStart) {
        // This row is free at the slot's start time
        assignedRow = i;
        rows[i] = slotEnd; // Update when this row becomes free
        break;
      }
    }

    // If no existing row works, create a new one
    if (assignedRow === -1) {
      assignedRow = rows.length;
      rows.push(slotEnd);
    }

    slotRows[slot.id] = assignedRow;
  });

  return {
    slotRows,
    totalRows: rows.length
  };
};

/**
 * Format time for display (12-hour format with AM/PM)
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} - Formatted time
 */
export const formatTimeDisplay = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
};

/**
 * Get time range string for display
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {string} - Formatted time range
 */
export const formatTimeRange = (startTime, endTime) => {
  return `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`;
};

/**
 * Calculate duration between two times in minutes
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {number} - Duration in minutes
 */
export const calculateDuration = (startTime, endTime) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (end < start) {
    // Handle overnight duration
    return (24 * 60 - start) + end;
  }

  return end - start;
};

/**
 * Get percentage position of time in a 24-hour day
 * @param {string} timeString - Time in HH:MM format
 * @returns {number} - Percentage (0-100)
 */
export const getTimePercentage = (timeString) => {
  const minutes = timeToMinutes(timeString);
  return (minutes / (24 * 60)) * 100;
};

/**
 * Group time slots by day of week
 * @param {Array} timeSlots - Array of time slot objects
 * @returns {Object} - Object with day names as keys and arrays of slots as values
 */
export const groupSlotsByDay = (timeSlots) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const result = {};

  days.forEach(day => {
    result[day] = timeSlots.filter(slot =>
      !slot.daysOfWeek ||
      slot.daysOfWeek.length === 0 ||
      slot.daysOfWeek.includes(day)
    );
  });

  return result;
};

/**
 * Check if time string is valid HH:MM format
 * @param {string} timeString - Time string to validate
 * @returns {boolean} - Whether time is valid
 */
export const isValidTimeFormat = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return false;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

/**
 * Get next time slot change
 * @param {Object} schedule - Schedule object
 * @param {string} currentTime - Current time
 * @returns {Object|null} - Next slot and time until change
 */
export const getNextSlotChange = (schedule, currentTime = null) => {
  if (!schedule || !schedule.timeSlots) return null;

  const time = currentTime || getCurrentTime();
  const currentMinutes = timeToMinutes(time);

  // Find next slot
  const sortedSlots = [...schedule.timeSlots].sort((a, b) =>
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  for (const slot of sortedSlots) {
    const slotStart = timeToMinutes(slot.startTime);
    if (slotStart > currentMinutes) {
      const minutesUntil = slotStart - currentMinutes;
      return {
        slot,
        minutesUntil,
        changeTime: slot.startTime
      };
    }
  }

  // If no next slot today, return first slot of tomorrow
  if (sortedSlots.length > 0) {
    const firstSlot = sortedSlots[0];
    const minutesUntil = (24 * 60 - currentMinutes) + timeToMinutes(firstSlot.startTime);
    return {
      slot: firstSlot,
      minutesUntil,
      changeTime: firstSlot.startTime
    };
  }

  return null;
};

/**
 * Format days of week for display
 * @param {Array<string>} days - Array of day names
 * @returns {string} - Formatted string
 */
export const formatDaysOfWeek = (days) => {
  if (!days || days.length === 0) return 'All Days';
  if (days.length === 7) return 'All Days';

  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const weekend = ['saturday', 'sunday'];

  const isWeekdays = weekdays.every(day => days.includes(day)) && days.length === 5;
  const isWeekend = weekend.every(day => days.includes(day)) && days.length === 2;

  if (isWeekdays) return 'Weekdays';
  if (isWeekend) return 'Weekends';

  // Capitalize and join
  return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
};

/**
 * Get day abbreviation
 * @param {string} day - Full day name
 * @returns {string} - 3-letter abbreviation
 */
export const getDayAbbreviation = (day) => {
  const abbr = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  };
  return abbr[day] || day;
};
