// File upload utilities for handling images and videos in the demo

/**
 * Convert a File object to base64 data URL
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 data URL
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Validate file type
 * @param {File} file - The file to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} - Whether the file type is allowed
 */
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']) => {
  if (!file) return false;
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {boolean} - Whether the file size is valid
 */
export const validateFileSize = (file, maxSizeMB = 10) => {
  if (!file) return false;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Generate a unique filename
 * @param {string} originalName - Original filename
 * @returns {string} - Unique filename
 */
export const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
};

/**
 * Get file type category (image or video)
 * @param {File|string} file - File object or MIME type string
 * @returns {string} - 'image' or 'video'
 */
export const getFileCategory = (file) => {
  const type = typeof file === 'string' ? file : file?.type || '';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  return 'unknown';
};

/**
 * Create a preview URL for a file
 * @param {File} file - The file to preview
 * @returns {Promise<string>} - Preview URL
 */
export const createPreviewUrl = async (file) => {
  try {
    return await fileToBase64(file);
  } catch (error) {
    console.error('Error creating preview:', error);
    return null;
  }
};

/**
 * Validate image/video upload
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with success flag and error message
 */
export const validateMediaFile = (file) => {
  if (!file) {
    return { success: false, error: 'No file selected' };
  }

  if (!validateFileType(file)) {
    return { success: false, error: 'Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM)' };
  }

  if (!validateFileSize(file, 10)) {
    return { success: false, error: 'File size too large. Maximum size is 10MB' };
  }

  return { success: true };
};

/**
 * Check if a data URL is a video
 * @param {string} dataUrl - Base64 data URL
 * @returns {boolean} - Whether it's a video
 */
export const isVideoUrl = (dataUrl) => {
  if (!dataUrl) return false;
  return dataUrl.startsWith('data:video/');
};

/**
 * Check if a data URL is an image
 * @param {string} dataUrl - Base64 data URL
 * @returns {boolean} - Whether it's an image
 */
export const isImageUrl = (dataUrl) => {
  if (!dataUrl) return false;
  return dataUrl.startsWith('data:image/');
};
