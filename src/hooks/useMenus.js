import { useState, useEffect, useCallback, useRef } from 'react';
import { usePagination } from './usePagination';
import { useNotification } from '../context/NotificationContext';
import * as menusApi from '../api/menus.api';

export const useMenus = ({ search = '', isActive = 'all', limit = 20 } = {}) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination({ defaultLimit: limit });
  const notification = useNotification();
  const prevFiltersRef = useRef({ search, isActive });
  const fetchCountRef = useRef(0);

  // Reset to page 1 when filters change
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (prev.search !== search || prev.isActive !== isActive) {
      pagination.resetPage();
      prevFiltersRef.current = { search, isActive };
    }
  }, [search, isActive, pagination.resetPage]);

  const fetchMenus = useCallback(async () => {
    const fetchId = ++fetchCountRef.current;
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (search) params.search = search;
      if (isActive !== 'all') params.isActive = isActive === 'active' ? 'true' : 'false';

      const response = await menusApi.getMenus(params);
      if (fetchId !== fetchCountRef.current) return;
      setMenus(response.data);
      pagination.updateFromResponse(response.pagination);
    } catch (err) {
      if (fetchId !== fetchCountRef.current) return;
      notification.error(err.message);
    } finally {
      if (fetchId === fetchCountRef.current) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, search, isActive]);

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
