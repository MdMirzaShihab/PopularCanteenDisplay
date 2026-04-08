import { useState, useEffect, useCallback } from 'react';
import { usePagination } from './usePagination';
import { useNotification } from '../context/NotificationContext';
import * as usersApi from '../api/users.api';

export const useUsers = ({ limit = 20 } = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination({ defaultLimit: limit });
  const notification = useNotification();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await usersApi.getUsers({ page: pagination.page, limit: pagination.limit });
      setUsers(response.data);
      pagination.updateFromResponse(response.pagination);
    } catch (err) {
      notification.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const createUser = useCallback(async (data) => {
    const newUser = await usersApi.createUser(data);
    await fetchUsers();
    return newUser;
  }, [fetchUsers]);

  const updateUser = useCallback(async (id, data) => {
    const updated = await usersApi.updateUser(id, data);
    await fetchUsers();
    return updated;
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id) => {
    await usersApi.deleteUser(id);
    await fetchUsers();
  }, [fetchUsers]);

  return { users, loading, pagination, createUser, updateUser, deleteUser, refresh: fetchUsers };
};
