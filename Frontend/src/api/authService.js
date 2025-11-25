// frontend/src/api/authService.js
// Import the configured Axios instance
import apiClient from './apiClient';

/**
 * Sends a signup request to the backend.
 * @param {object} userData - User data { fullName, email, password }
 * @returns {Promise<object>} The response data from the server.
 */
export const signupUser = async (userData) => {
  try {
    const response = await apiClient.post('/api/auth/signup', userData);
    return response.data;
  } catch (error) {
    console.error('Signup API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Signup failed. Please try again.');
  }
};

/**
 * Sends a login request to the backend.
 * @param {object} credentials - User credentials { email, password }
 * @returns {Promise<object>} The response data, typically including the JWT token.
 */
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
  }
};

/**
 * Sends a request to accept a workspace invitation.
 * @param {object} inviteData - Invitation data { token, fullName, password }
 * @returns {Promise<object>} The response data from the server.
 */
export const acceptInvite = async (inviteData) => {
  try {
    const response = await apiClient.post('/api/auth/accept-invite', inviteData);
    return response.data;
  } catch (error) {
    console.error('Accept Invite API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to accept invitation. The token might be invalid or expired.');
  }
};

/**
 * Fetches all workspaces the currently logged-in user is a member of.
 * @returns {Promise<Array>} A list of workspace membership objects.
 */
export const getUserWorkspaces = async () => {
    try {
        const response = await apiClient.get('/api/workspaces/mine');
        return response.data;
    } catch (error) {
        console.error('Get User Workspaces API Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch workspaces.');
    }
};

/**
 * Creates a new workspace.
 * @param {object} workspaceData - Data for the new workspace { name }
 * @returns {Promise<object>} The newly created workspace object { message, workspace }.
 */
export const createWorkspace = async (workspaceData) => {
  try {
    const response = await apiClient.post('/api/workspaces', workspaceData);
    return response.data;
  } catch (error) {
    console.error('Create Workspace API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create workspace.');
  }
};

/**
 * Updates a specific workspace's details (e.g., name). (NEW FUNCTION)
 * Requires the user to be an ADMIN of the workspace.
 * @param {string} workspaceId - The ID of the workspace to update.
 * @param {object} updateData - The data to update (e.g., { name: 'New Name' }).
 * @returns {Promise<object>} The updated workspace object { message, workspace }.
 */
export const updateWorkspace = async (workspaceId, updateData) => {
    try {
        // Make a PATCH request to the specific workspace endpoint
        const response = await apiClient.patch(`/api/workspaces/${workspaceId}`, updateData);
        return response.data; // Return the success response { message, workspace }
    } catch (error) {
        console.error(`Update Workspace ${workspaceId} API Error:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to update workspace.');
    }
};

/**
 * Deletes a specific workspace. (NEW FUNCTION)
 * Requires the user to be an ADMIN of the workspace.
 * @param {string} workspaceId - The ID of the workspace to delete.
 * @returns {Promise<void>} Resolves on successful deletion.
 */
export const deleteWorkspace = async (workspaceId) => {
    try {
        // Make a DELETE request to the specific workspace endpoint
        await apiClient.delete(`/api/workspaces/${workspaceId}`);
        // No content is returned on successful deletion (204 status)
    } catch (error) {
        console.error(`Delete Workspace ${workspaceId} API Error:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to delete workspace.');
    }
};

export const getWorkspaceMemberCount = async (workspaceId) => {
    try {
        // Make a GET request to the /members/count endpoint
        // Note: apiClient sends the token, backend checkAuth verifies membership
        const response = await apiClient.get(`/api/workspaces/${workspaceId}/members/count`);
        return response.data; // Return { count: 5 }
    } catch (error) {
        console.error(`Get Member Count for ${workspaceId} API Error:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch member count.');
    }
};

export const getWorkspaceMembers = async (workspaceId) => {
    try {
        const response = await apiClient.get(`/api/workspaces/${workspaceId}/members`);
        return response.data;
    } catch (error) {
        console.error(`Get Members for ${workspaceId} API Error:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch workspace members.');
    }
};

export const sendInvite = async (workspaceId, email) => {
    try {
        const response = await apiClient.post(`/api/workspaces/${workspaceId}/invite`, { email });
        return response.data; 
    } catch (error) {
        console.error(`Send Invite API Error:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to send invitation.');
    }
};