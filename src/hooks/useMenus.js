import { useState, useEffect, useCallback } from 'react';
import { usePagination } from './usePagination';
import { useNotification } from '../context/NotificationContext';
import * as menusApi from '../api/menus.api';

export const useMenus = ({ limit = 20 } = {}) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination({ defaultLimit: limit });
  const notification = useNotification();

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await menusApi.getMenus({ page: pagination.page, limit: pagination.limit });
      setMenus(response.data);
      pagination.updateFromResponse(response.pagination);
    } catch (err) {
      notification.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);

  const createMenu = useCallback(async (data) => {
    const newMenu = await menusApi.createMenu(data);
    await fetchMenus();
    return newMenu;
  }, [fetchMenus]);

  const updateMenu = useCallback(async (id, data) => {
    const updated = await menusApi.updateMenu(id, data);
    await fetchMenus();
    return updated;
  }, [fetchMenus]);

  const deleteMenu = useCallback(async (id) => {
    await menusApi.deleteMenu(id);
    await fetchMenus();
  }, [fetchMenus]);

  return { menus, loading, pagination, createMenu, updateMenu, deleteMenu, refresh: fetchMenus };
};
