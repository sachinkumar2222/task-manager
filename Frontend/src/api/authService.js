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
 * Fetches all workspaces the currently logged-in user is a member of. (NEW FUNCTION)
 * @returns {Promise<Array>} A list of workspace membership objects.
 */
export const getUserWorkspaces = async () => {
    try {
        // Make a GET request to the /mine endpoint
        const response = await apiClient.get('/api/workspaces/mine');
        // The response will be an array like: [{ userId, workspaceId, role, workspace: { id, name } }, ...]
        return response.data; 
    } catch (error) {
        console.error('Get User Workspaces API Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch workspaces.');
    }
};

/**
 * Creates a new workspace. (NEW FUNCTION - Moved from taskService for consistency)
 * @param {object} workspaceData - Data for the new workspace { name }
 * @returns {Promise<object>} The newly created workspace object.
 */
export const createWorkspace = async (workspaceData) => {
  try {
    // Make a POST request to the workspaces endpoint
    const response = await apiClient.post('/api/workspaces', workspaceData);
    return response.data; // Return the created workspace { message, workspace }
  } catch (error) {
    console.error('Create Workspace API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create workspace.');
  }
};

