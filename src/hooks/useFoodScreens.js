import { useState, useEffect, useCallback } from 'react';
import { usePagination } from './usePagination';
import { useNotification } from '../context/NotificationContext';
import * as foodScreensApi from '../api/foodScreens.api';

export const useFoodScreens = ({ limit = 20 } = {}) => {
  const [foodScreens, setFoodScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination({ defaultLimit: limit });
  const notification = useNotification();

  const fetchFoodScreens = useCallback(async () => {
    setLoading(true);
    try {
      const response = await foodScreensApi.getFoodScreens({ page: pagination.page, limit: pagination.limit });
      setFoodScreens(response.data);
      pagination.updateFromResponse(response.pagination);
    } catch (err) {
      notification.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  useEffect(() => { fetchFoodScreens(); }, [fetchFoodScreens]);

  const createFoodScreen = useCallback(async (data) => {
    const newFoodScreen = await foodScreensApi.createFoodScreen(data);
    await fetchFoodScreens();
    return newFoodScreen;
  }, [fetchFoodScreens]);

  const updateFoodScreen = useCallback(async (id, data) => {
    const updated = await foodScreensApi.updateFoodScreen(id, data);
    await fetchFoodScreens();
    return updated;
  }, [fetchFoodScreens]);

  const deleteFoodScreen = useCallback(async (id) => {
    await foodScreensApi.deleteFoodScreen(id);
    await fetchFoodScreens();
  }, [fetchFoodScreens]);

  const duplicateFoodScreen = useCallback(async (id) => {
    const duplicated = await foodScreensApi.duplicateFoodScreen(id);
    await fetchFoodScreens();
    return duplicated;
  }, [fetchFoodScreens]);

  return { foodScreens, loading, pagination, createFoodScreen, updateFoodScreen, deleteFoodScreen, duplicateFoodScreen, refresh: fetchFoodScreens };
};
