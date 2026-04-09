import { format, isToday, isYesterday, startOfDay, parseISO } from 'date-fns';

export const groupEntriesByDate = (entries) => {
  const sorted = [...entries].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
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
