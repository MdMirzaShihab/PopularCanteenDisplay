import { format, isToday, isYesterday, startOfDay, parseISO } from 'date-fns';

export const ARCHIVE_KEY = 'canteen_token_archive';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export const purgeExpiredEntries = (entries) => {
  const cutoff = Date.now() - THREE_DAYS_MS;
  return entries.filter(e => new Date(e.recordedAt).getTime() >= cutoff);
};

export const groupEntriesByDate = (entries) => {
  const sorted = [...entries].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
  const map = new Map();

  sorted.forEach(entry => {
    const dayKey = startOfDay(new Date(entry.recordedAt)).toISOString();
    if (!map.has(dayKey)) {
      map.set(dayKey, { date: new Date(entry.recordedAt), entries: [] });
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
      format(parseISO(entry.recordedAt), 'yyyy-MM-dd') === dateFilter;
    return matchesSearch && matchesDate;
  });
};

export const loadArchive = () => {
  try {
    const saved = localStorage.getItem(ARCHIVE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return purgeExpiredEntries(parsed);
  } catch {
    return [];
  }
};

export const saveArchive = (entries) => {
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(entries));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded for token archive.');
    }
  }
};
