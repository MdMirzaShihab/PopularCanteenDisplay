import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { fileToBase64, validateMediaFile, isVideoUrl } from '../../utils/fileUtils';

const ImageUpload = ({ value, onChange, accept = 'image/*,video/*', label = 'Upload Image/Video' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Validate file
    const validation = validateMediaFile(file);
    if (!validation.success) {
      alert(validation.error);
      return;
    }

    try {
      // Convert to base64
      const base64 = await fileToBase64(file);
      setPreview(base64);
      onChange(base64);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Failed to process file. Please try again.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {preview ? (
        <div className="relative">
          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            {isVideoUrl(preview) ? (
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
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-accent-200 text-white rounded-full hover:bg-accent-200/90 transition-colors shadow-lg"
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
              <ImageIcon className="w-8 h-8 text-gray-400" />
              <Video className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-100">
                <span className="text-primary-100 font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-text-200 mt-1">
                PNG, JPG, GIF, WebP, MP4, WebM (max 10MB)
              </p>
            </div>
            <Upload className="w-6 h-6 text-gray-400 mt-2" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
