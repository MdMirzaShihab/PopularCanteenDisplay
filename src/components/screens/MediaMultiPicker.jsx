import { useState, useRef } from 'react';
import { FolderOpen, Upload, X, GripVertical } from 'lucide-react';
import { getAllMedia } from '../../assets/media';
import ImageUpload from '../common/ImageUpload';
import { useNotification } from '../../context/NotificationContext';
import { isVideoUrl } from '../../utils/fileUtils';
import { MAX_MEDIA_ITEMS } from '../../utils/mediaUtils';

const MediaMultiPicker = ({ value = [], onChange, maxItems = MAX_MEDIA_ITEMS }) => {
  const { error: showError } = useNotification();
  const [activeTab, setActiveTab] = useState('gallery');
  const dragIndexRef = useRef(null);
  const dragListRef = useRef(value);
  dragListRef.current = value;
  const allMedia = getAllMedia();

  const isAtLimit = value.length >= maxItems;

  const handleGalleryToggle = (src) => {
    const idx = value.indexOf(src);
    if (idx !== -1) {
      // Remove
      onChange(value.filter((_, i) => i !== idx));
    } else {
      if (isAtLimit) {
        showError(`Maximum ${maxItems} media items allowed`);
        return;
      }
      onChange([...value, src]);
    }
  };

  const handleUpload = (base64) => {
    if (!base64) return;
    if (isAtLimit) {
      showError(`Maximum ${maxItems} media items allowed`);
      return;
    }
    onChange([...value, base64]);
  };

  const handleUploadError = (errorMsg) => {
    showError(errorMsg);
  };

  const handleRemove = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  // Drag-to-reorder handlers
  const handleDragStart = (idx) => {
    dragIndexRef.current = idx;
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIndexRef.current === null || dragIndexRef.current === idx) return;

    const reordered = [...dragListRef.current];
    const [dragged] = reordered.splice(dragIndexRef.current, 1);
    reordered.splice(idx, 0, dragged);
    dragIndexRef.current = idx;
    dragListRef.current = reordered;
    onChange(reordered);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
  };

  const getSelectionOrder = (src) => {
    const idx = value.indexOf(src);
    return idx !== -1 ? idx + 1 : null;
  };

  return (
    <div className="space-y-3">
      {/* Item count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-200">
          {value.length}/{maxItems} selected
        </span>
      </div>

      {/* Gallery / Upload toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            activeTab === 'gallery'
              ? 'border-primary-100 bg-primary-100/10 text-primary-100'
              : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Gallery
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            activeTab === 'upload'
              ? 'border-primary-100 bg-primary-100/10 text-primary-100'
              : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Gallery grid */}
      {activeTab === 'gallery' && (
        <div>
          <label className="block text-sm font-medium text-text-200 mb-2">
            Select from Gallery
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {allMedia.map((item) => {
              const order = getSelectionOrder(item.src);
              const isSelected = order !== null;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleGalleryToggle(item.src)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    isSelected
                      ? 'border-primary-100 ring-2 ring-primary-100/30'
                      : isAtLimit
                        ? 'border-bg-300 opacity-50 cursor-not-allowed'
                        : 'border-bg-300 hover:border-primary-100/50'
                  }`}
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.src}
                      alt={item.name}
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <video
                      src={item.src}
                      muted
                      className="w-full aspect-video object-cover"
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                    />
                  )}
                  {/* Type badge */}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-black/60 text-white">
                    {item.type === 'video' ? 'VID' : 'IMG'}
                  </div>
                  {/* Name */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-1">
                    <span className="text-[10px] text-white font-medium truncate block">{item.name}</span>
                  </div>
                  {/* Selection order badge */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{order}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload */}
      {activeTab === 'upload' && (
        <div>
          {isAtLimit ? (
            <div className="p-4 bg-bg-200 rounded-lg text-center text-sm text-text-200">
              Maximum {maxItems} items reached. Remove an item to upload more.
            </div>
          ) : (
            <ImageUpload
              value={null}
              onChange={handleUpload}
              onError={handleUploadError}
              accept="image/*,video/*"
              label="Upload Image or Video"
            />
          )}
        </div>
      )}

      {/* Selected items strip */}
      {value.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-200 mb-2">
            Playback Order (drag to reorder)
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {value.map((src, idx) => (
              <div
                key={`${src.substring(0, 40)}-${idx}`}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className="relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 border-bg-300 group cursor-grab active:cursor-grabbing"
              >
                {isVideoUrl(src) ? (
                  <video src={src} muted className="w-full h-full object-cover" />
                ) : (
                  <img src={src} alt="" className="w-full h-full object-cover" />
                )}
                {/* Order number */}
                <div className="absolute bottom-0 left-0 px-1.5 py-0.5 bg-black/70 rounded-tr text-[10px] font-bold text-white">
                  {idx + 1}
                </div>
                {/* Type badge */}
                <div className="absolute top-0 left-0 px-1 py-0.5 bg-black/60 rounded-br text-[8px] font-bold uppercase text-white">
                  {isVideoUrl(src) ? 'VID' : 'IMG'}
                </div>
                {/* Grip icon */}
                <div className="absolute top-0 right-5 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-3 h-3 text-white drop-shadow" />
                </div>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-0 right-0 p-0.5 bg-accent-200/90 text-white rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaMultiPicker;
