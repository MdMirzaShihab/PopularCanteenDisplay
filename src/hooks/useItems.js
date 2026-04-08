import { useState, useEffect, useCallback } from 'react';
import { usePagination } from './usePagination';
import { useNotification } from '../context/NotificationContext';
import * as itemsApi from '../api/items.api';

export const useItems = ({ limit = 20 } = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination({ defaultLimit: limit });
  const notification = useNotification();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await itemsApi.getItems({ page: pagination.page, limit: pagination.limit });
      setItems(response.data);
      pagination.updateFromResponse(response.pagination);
    } catch (err) {
      notification.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

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
