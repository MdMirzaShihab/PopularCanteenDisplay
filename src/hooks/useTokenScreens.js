import { useState, useEffect, useCallback } from 'react';
import { usePagination } from './usePagination';
import { useNotification } from '../context/NotificationContext';
import * as tokenScreensApi from '../api/tokenScreens.api';

export const useTokenScreens = ({ limit = 20 } = {}) => {
  const [tokenScreens, setTokenScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination({ defaultLimit: limit });
  const notification = useNotification();

  const fetchTokenScreens = useCallback(async () => {
    setLoading(true);
    try {
      const response = await tokenScreensApi.getTokenScreens({ page: pagination.page, limit: pagination.limit });
      setTokenScreens(response.data);
      pagination.updateFromResponse(response.pagination);
    } catch (err) {
      notification.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  useEffect(() => { fetchTokenScreens(); }, [fetchTokenScreens]);

  const createTokenScreen = useCallback(async (data) => {
    const newTokenScreen = await tokenScreensApi.createTokenScreen(data);
    await fetchTokenScreens();
    return newTokenScreen;
  }, [fetchTokenScreens]);

  const updateTokenScreen = useCallback(async (id, data) => {
    const updated = await tokenScreensApi.updateTokenScreen(id, data);
    await fetchTokenScreens();
    return updated;
  }, [fetchTokenScreens]);

  const deleteTokenScreen = useCallback(async (id) => {
    await tokenScreensApi.deleteTokenScreen(id);
    await fetchTokenScreens();
  }, [fetchTokenScreens]);

  return { tokenScreens, loading, pagination, createTokenScreen, updateTokenScreen, deleteTokenScreen, refresh: fetchTokenScreens };
};
