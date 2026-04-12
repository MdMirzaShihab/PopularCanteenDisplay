import { useState, useEffect, useCallback, useRef } from 'react';
import { usePagination } from './usePagination';
import { useNotification } from '../context/NotificationContext';
import * as itemsApi from '../api/items.api';

export const useItems = ({ search = '', category = '', isActive = 'all', limit = 20 } = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination({ defaultLimit: limit });
  const notification = useNotification();
  const prevFiltersRef = useRef({ search, category, isActive });

  // Reset to page 1 when filters change
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (prev.search !== search || prev.category !== category || prev.isActive !== isActive) {
      pagination.resetPage();
      prevFiltersRef.current = { search, category, isActive };
    }
  }, [search, category, isActive, pagination.resetPage]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (search) params.search = search;
      if (category) params.category = category;
      if (isActive !== 'all') params.isActive = isActive === 'active' ? 'true' : 'false';

      const response = await itemsApi.getItems(params);
      setItems(response.data);
      pagination.updateFromResponse(response.pagination);
    } catch (err) {
      notification.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, search, category, isActive]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const createItem = useCallback(async (data) => {
    const newItem = await itemsApi.createItem(data);
    await fetchItems();
    return newItem;
  }, [fetchItems]);

  const updateItem = useCallback(async (id, data) => {
    const updated = await itemsApi.updateItem(id, data);
    await fetchItems();
    return updated;
  }, [fetchItems]);

  const deleteItem = useCallback(async (id) => {
    await itemsApi.deleteItem(id);
    await fetchItems();
  }, [fetchItems]);

  return { items, loading, pagination, createItem, updateItem, deleteItem, refresh: fetchItems };
};
