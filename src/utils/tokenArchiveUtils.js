import { format, isToday, isYesterday, startOfDay, parseISO, differenceInSeconds } from 'date-fns';

export const groupEntriesByDate = (entries) => {
  const sorted = [...entries].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const map = new Map();

  sorted.forEach(entry => {
    const dayKey = startOfDay(new Date(entry.updatedAt)).toISOString();
    if (!map.has(dayKey)) {
      map.set(dayKey, { date: new Date(entry.updatedAt), entries: [] });
    }
    map.get(dayKey).entries.push(entry);
  });

  return Array.from(map.values()).map(group => {
    let label;
    if (isToday(group.date)) label = 'Today';
    else if (isYesterday(group.date)) label = 'Yesterday';
    else label = format(group.date, 'MMM dd, yyyy');
    return { label, date: group.date, entries: group.entries };
  });
};

export const filterEntries = (entries, { searchTerm = '', dateFilter = '' }) => {
  return entries.filter(entry => {
    const matchesSearch = searchTerm === '' ||
      String(entry.number).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter === '' ||
      format(parseISO(entry.updatedAt), 'yyyy-MM-dd') === dateFilter;
    return matchesSearch && matchesDate;
  });
};

/**
 * Calculate how long each token was active (time until the next token was called).
 * Returns a Map of updatedAt → duration string.
 * Entries must be sorted most-recent-first.
 */
export const calcDurations = (entries) => {
  const durations = new Map();
  for (let i = 0; i < entries.length; i++) {
    if (i === 0) {
      // Most recent token — still active or just called
      durations.set(entries[i].updatedAt, null);
    } else {
      const calledAt = new Date(entries[i].updatedAt);
      const replacedAt = new Date(entries[i - 1].updatedAt);
      const secs = differenceInSeconds(replacedAt, calledAt);
      durations.set(entries[i].updatedAt, formatDuration(secs));
    }
  }
  return durations;
};

const formatDuration = (totalSeconds) => {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
};

/**
 * Compute daily summary stats for a group of entries (sorted most-recent-first).
 */
export const calcDayStats = (entries) => {
  if (entries.length === 0) return null;

  // Hourly distribution (0-23)
  const hourCounts = new Array(24).fill(0);
  const operatorCounts = {};

  entries.forEach((entry) => {
    const hour = new Date(entry.updatedAt).getHours();
    hourCounts[hour]++;

    const name = entry.calledByName || entry.calledBy || 'Unknown';
    operatorCounts[name] = (operatorCounts[name] || 0) + 1;
  });

  // Peak hour
  const maxCount = Math.max(...hourCounts);
  const peakHour = hourCounts.indexOf(maxCount);

  // Busiest operator
  const operators = Object.entries(operatorCounts).sort((a, b) => b[1] - a[1]);
  const topOperator = operators[0];

  // Find active hour range (first and last hour with activity)
  const activeHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter((h) => h.count > 0);
  const firstHour = activeHours.length > 0 ? activeHours[0].hour : 0;
  const lastHour = activeHours.length > 0 ? activeHours[activeHours.length - 1].hour : 23;

  return {
    total: entries.length,
    peakHour,
    peakHourLabel: formatHour(peakHour),
    peakHourCount: maxCount,
    topOperator: topOperator ? { name: topOperator[0], count: topOperator[1] } : null,
    operators,
    hourCounts,
    firstHour,
    lastHour,
  };
};

const formatHour = (hour) => {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h} ${ampm}`;
};
