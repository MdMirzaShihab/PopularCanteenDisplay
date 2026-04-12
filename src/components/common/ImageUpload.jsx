import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { validateMediaFile, isVideoUrl } from '../../utils/fileUtils';
import { uploadFile, uploadFileAndCreateMedia } from '../../api/upload.api';
import { deleteMedia } from '../../api/media.api';

const ImageUpload = ({ value, onChange, onError, accept = 'image/*,video/*', label = 'Upload Image/Video', folder = 'items' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const [isVideo, setIsVideo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);
  const blobUrlRef = useRef(null);
  // Track URLs uploaded during this session (not the original value)
  const sessionUploadRef = useRef(null);
  const initialValueRef = useRef(value);

  useEffect(() => {
    const url = value?.url || value;
    setPreview(url || null);
    if (url && typeof url === 'string') {
      setIsVideo(isVideoUrl(url));
    }
  }, [value]);

  // Reset tracking only when a genuinely new initial value is loaded
  // (not when value updates to the session upload we just provided)
  useEffect(() => {
    const valueId = value?._id || value;
    if (valueId !== sessionUploadRef.current) {
      initialValueRef.current = value;
      sessionUploadRef.current = null;
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const tryDeleteSessionUpload = async (mediaId) => {
    if (!mediaId) return;
    try {
      await deleteMedia(mediaId, true);
    } catch (err) {
      console.error('Failed to clean up uploaded media:', err);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;

    const validation = validateMediaFile(file);
    if (!validation.success) {
      if (onError) onError(validation.error);
      return;
    }

    try {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }

      const blobUrl = URL.createObjectURL(file);
      blobUrlRef.current = blobUrl;
      setPreview(blobUrl);
      setIsVideo(file.type.startsWith('video/'));
      setIsUploading(true);

      // Clean up previous session upload if user is replacing it
      if (sessionUploadRef.current) {
        await tryDeleteSessionUpload(sessionUploadRef.current);
      }

      if (folder === 'items') {
        // Item images: upload only, no Media record
        const fileUrl = await uploadFile(file, folder);
        sessionUploadRef.current = null;
        onChange(fileUrl);
      } else {
        // Screen media: create Media record for gallery management
        const mediaDoc = await uploadFileAndCreateMedia(file, folder);
        sessionUploadRef.current = mediaDoc._id;
        onChange(mediaDoc);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setPreview(value?.url || value || null);
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      if (onError) onError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = async () => {
    if (isUploading) return;
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    // Delete from R2 if it was uploaded during this session (not the original)
    if (sessionUploadRef.current) {
      await tryDeleteSessionUpload(sessionUploadRef.current);
      sessionUploadRef.current = null;
    }
    setPreview(null);
    setIsVideo(false);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!isUploading) inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-100 mb-2">
        {label}
      </label>

      {preview ? (
        <div className="relative">
          <div className="relative w-full h-64 bg-bg-200 rounded-lg overflow-hidden">
            {isVideo ? (
              <video
                src={preview}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                  <span className="text-sm text-white font-medium">Uploading...</span>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            className="absolute top-2 right-2 p-2 bg-accent-200 text-white rounded-full hover:bg-accent-200/90 transition-colors shadow-lg disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-primary-100 bg-primary-100/10'
              : 'border-bg-300 hover:border-primary-100 bg-bg-100'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              <ImageIcon className="w-8 h-8 text-text-300" />
              <Video className="w-8 h-8 text-text-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-100">
                <span className="text-primary-100 font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-text-200 mt-1">
                PNG, JPG, GIF, WebP, MP4, WebM (max 2MB)
              </p>
            </div>
            <Upload className="w-6 h-6 text-text-300 mt-2" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
