import apiClient from './client.js';

export const getPresignedUrl = ({ fileName, fileType, fileSize, folder }) =>
  apiClient
    .post('/upload/presign', { fileName, fileType, fileSize, folder })
    .then((r) => r.data);

export const uploadToR2 = async (presignedUrl, file) => {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }
  return response;
};

export const deleteUpload = (key) =>
  apiClient.delete(`/upload/${key}`).then((r) => r.data);

export const uploadFile = async (file, folder = 'items') => {
  const { uploadUrl, fileUrl } = await getPresignedUrl({
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    folder,
  });
  await uploadToR2(uploadUrl, file);
  return fileUrl;
};
