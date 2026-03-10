import { useState, useEffect, useCallback } from 'react';
import { loadArchive, saveArchive, purgeExpiredEntries } from '../utils/tokenArchiveUtils';

export const useTokenArchive = () => {
  const [archiveEntries, setArchiveEntries] = useState(() => loadArchive());

  useEffect(() => {
    saveArchive(archiveEntries);
  }, [archiveEntries]);

  const recordToken = useCallback((tokenData) => {
    const archiveEntry = {
      id: crypto.randomUUID(),
      number: tokenData.number,
      recordedAt: tokenData.updatedAt ?? new Date().toISOString()
    };
    setArchiveEntries(prev => [archiveEntry, ...purgeExpiredEntries(prev)]);
  }, []);

  return { archiveEntries, recordToken };
};
