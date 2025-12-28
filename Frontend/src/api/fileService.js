import apiClient from './apiClient';

/**
 * Upload a file for a task.
 * - Do NOT set 'Content-Type' manually when sending FormData; the browser/axios will set the boundary.
 * - Optional onUploadProgress callback receives a ProgressEvent (useful to update progress bars).
 *
 * @param {File} file
 * @param {string} taskId
 * @param {(progressEvent: ProgressEvent) => void} [onUploadProgress]
 * @returns {Promise<object>} response data
 */
export const uploadFile = async (file, taskId, onUploadProgress) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);

    const response = await apiClient.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': undefined,
      },
      onUploadProgress,
    });

    return response.data;
  } catch (error) {
    // More robust error logging
    const payload = error?.response?.data || error.message || error;
    console.error('Upload File API Error:', payload);
    throw new Error(error?.response?.data?.message || 'Failed to upload file.');
  }
};

/**
 * Get metadata list of files for a task.
 * Returns metadata (not the file binary) to keep responses small.
 *
 * @param {string} taskId
 * @returns {Promise<Array>}
 */
export const getFilesForTask = async (taskId) => {
  try {
    const response = await apiClient.get(`/api/files/task/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Get Files for Task ${taskId} API Error:`, error?.response?.data || error.message);
    throw new Error('Failed to fetch files.');
  }
};

/**
 * Download (and trigger browser download) for a file by id.
 *
 * @param {string} fileId
 * @param {string} fileName - suggested filename for download
 * @returns {Promise<void>}
 */
export const downloadFile = async (fileId, fileName) => {
  try {
    const response = await apiClient.get(`/api/files/download/${fileId}`, {
      responseType: 'blob', // treat response as binary data
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'download');
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.remove();
    // Revoke object URL after a short delay to ensure download started
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error(`Download File ${fileId} API Error:`, error);
    throw new Error('Failed to download file.');
  }
};
