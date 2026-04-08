import { useState, useEffect, useCallback } from 'react';
import { usePagination } from './usePagination';
import { useNotification } from '../context/NotificationContext';
import * as logsApi from '../api/logs.api';

export const useLogs = (filters = {}) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination({ defaultLimit: 20 });
  const notification = useNotification();

  const filtersKey = JSON.stringify(filters);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const parsedFilters = JSON.parse(filtersKey);
      const response = await logsApi.getLogs({
        ...parsedFilters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setLogs(response.data);
      pagination.updateFromResponse(response.pagination);
    } catch (err) {
      notification.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filtersKey]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return { logs, loading, pagination, refresh: fetchLogs };
};
