import { useState, useEffect, useCallback } from 'react';
import { usePagination } from './usePagination';
import { useNotification } from '../context/NotificationContext';
import * as tokensApi from '../api/tokens.api';

export const useTokens = () => {
  const [currentToken, setCurrentToken] = useState(null);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Archive has its own state and pagination
  const [archiveEntries, setArchiveEntries] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const archivePagination = usePagination({ defaultLimit: 50 });

  const notification = useNotification();

  const fetchCurrent = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tokensApi.getCurrent();
      setCurrentToken(data.currentToken);
      setTokenHistory(data.history || []);
    } catch (err) {
      notification.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchCurrent(); }, [fetchCurrent]);

  const fetchArchive = useCallback(async (filters = {}) => {
    setArchiveLoading(true);
    try {
      const response = await tokensApi.getArchive({
        ...filters,
        page: archivePagination.page,
        limit: archivePagination.limit,
      });
      setArchiveEntries(response.data);
      archivePagination.updateFromResponse(response.pagination);
    } catch (err) {
      notification.error(err.message);
    } finally {
      setArchiveLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archivePagination.page, archivePagination.limit]);

  useEffect(() => { fetchArchive(); }, [fetchArchive]);

  const updateToken = useCallback(async (number) => {
    const data = await tokensApi.updateToken(number);
    setCurrentToken(data.currentToken);
    setTokenHistory(data.history || []);
    fetchArchive();
    return data;
  }, [fetchArchive]);

  const clearToken = useCallback(async () => {
    const data = await tokensApi.clearToken();
    setCurrentToken(data.currentToken);
    setTokenHistory(data.history || []);
    fetchArchive();
  }, [fetchArchive]);

  const reannounceToken = useCallback(async () => {
    await tokensApi.reannounceToken();
  }, []);

  return {
    currentToken,
    tokenHistory,
    loading,
    updateToken,
    clearToken,
    reannounceToken,
    refreshCurrent: fetchCurrent,
    archiveEntries,
    archiveLoading,
    archivePagination,
    fetchArchive,
  };
};
