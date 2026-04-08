import { useState, useCallback } from 'react';

export const usePagination = ({ defaultLimit = 20 } = {}) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(defaultLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const goToPage = useCallback((n) => {
    setPage(Math.max(1, Math.min(n, totalPages || 1)));
  }, [totalPages]);

  const updateFromResponse = useCallback((pagination) => {
    // pagination shape from backend: { page, limit, total, totalPages }
    setTotal(pagination.total);
    setTotalPages(pagination.totalPages);
  }, []);

  const resetPage = useCallback(() => setPage(1), []);

  return { page, limit, total, totalPages, goToPage, updateFromResponse, resetPage };
};
