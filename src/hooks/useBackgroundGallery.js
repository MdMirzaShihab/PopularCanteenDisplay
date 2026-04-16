import { useEffect, useRef, useState, useCallback } from 'react';
import { getMedia, deleteMedia } from '../api/media.api';
import { useNotification } from '../context/NotificationContext';

export const useBackgroundGallery = ({ onDeleted } = {}) => {
  const { error: showError } = useNotification();
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [confirmState, setConfirmState] = useState({ open: false, target: null, warning: '' });

  const onDeletedRef = useRef(onDeleted);
  useEffect(() => { onDeletedRef.current = onDeleted; }, [onDeleted]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getMedia({ limit: 100, folder: 'backgrounds' });
        if (!cancelled) setGalleryMedia(result.data || []);
      } catch (err) {
        console.error('Failed to load background gallery:', err);
      } finally {
        if (!cancelled) setGalleryLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const notifyDeleted = useCallback((id) => {
    setGalleryMedia(prev => prev.filter(m => m._id !== id));
    onDeletedRef.current?.(id);
  }, []);

  const addMedia = useCallback((mediaItem) => {
    if (!mediaItem?._id) return;
    setGalleryMedia(prev => (prev.some(m => m._id === mediaItem._id) ? prev : [mediaItem, ...prev]));
  }, []);

  const handleDeleteMedia = useCallback(async (mediaItem) => {
    try {
      await deleteMedia(mediaItem._id);
      notifyDeleted(mediaItem._id);
    } catch (err) {
      if (err.message && err.message.includes('used by')) {
        setConfirmState({
          open: true,
          target: mediaItem,
          warning: err.message + ' Deleting it will remove it from those screens.',
        });
      } else {
        showError('Failed to delete media');
      }
    }
  }, [notifyDeleted, showError]);

  const confirmForceDelete = useCallback(async () => {
    const target = confirmState.target;
    if (!target) return;
    try {
      await deleteMedia(target._id, true);
      notifyDeleted(target._id);
    } catch {
      showError('Failed to delete media');
    } finally {
      setConfirmState({ open: false, target: null, warning: '' });
    }
  }, [confirmState.target, notifyDeleted, showError]);

  const closeConfirm = useCallback(() => {
    setConfirmState({ open: false, target: null, warning: '' });
  }, []);

  const confirmDialogProps = {
    isOpen: confirmState.open,
    onClose: closeConfirm,
    onConfirm: confirmForceDelete,
    title: 'Delete Media',
    message: confirmState.warning,
    confirmText: 'Delete',
    type: 'danger',
  };

  return { galleryMedia, galleryLoading, handleDeleteMedia, addMedia, confirmDialogProps };
};
