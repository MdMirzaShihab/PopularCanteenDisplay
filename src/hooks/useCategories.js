import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import * as categoriesApi from '../api/categories.api';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const notification = useNotification();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await categoriesApi.getCategories();
      setCategories(response.data);
    } catch (err) {
      notification.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const createCategory = useCallback(async (data) => {
    const created = await categoriesApi.createCategory(data);
    await fetchCategories();
    return created;
  }, [fetchCategories]);

  const updateCategory = useCallback(async (id, data) => {
    const updated = await categoriesApi.updateCategory(id, data);
    await fetchCategories();
    return updated;
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id, opts) => {
    await categoriesApi.deleteCategory(id, opts);
    await fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, createCategory, updateCategory, deleteCategory, refresh: fetchCategories };
};
