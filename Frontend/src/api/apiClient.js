import axios from 'axios';
import { getToken } from '../utils/tokenManager';

const ACTIVE_WORKSPACE_KEY = 'tasksphere_active_workspace';
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `${token}`;
    }

    // --- UPDATED LOGIC: Add ID AND Role ---
    const isWorkspaceSpecific = config.url.startsWith('/api/projects') ||
                                config.url.startsWith('/api/tasks') ||
                                config.url.startsWith('/api/comments') ||
                                config.url.startsWith('/api/analytics') ||
                                config.url.startsWith('/api/files');

    if (isWorkspaceSpecific) {
        const savedWorkspace = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
        if (savedWorkspace) {
            try {
                const activeWorkspace = JSON.parse(savedWorkspace);
                if (activeWorkspace && activeWorkspace.id) {
                    config.headers['X-Workspace-ID'] = activeWorkspace.id;
                    
                    // Send the Role if available (added this)
                    if (activeWorkspace.role) {
                        config.headers['X-Workspace-Role'] = activeWorkspace.role;
                    }
                }
            } catch (e) {
                console.error("Failed to parse active workspace from storage:", e);
            }
        }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Response Error:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiClient;