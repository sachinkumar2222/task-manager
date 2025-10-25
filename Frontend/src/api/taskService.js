// Import the configured Axios instance
import apiClient from './apiClient';

/**
 * Fetches all projects for the currently logged-in user's workspace.
 * The user's workspace is determined by the JWT token.
 * @returns {Promise<Array>} A list of project objects.
 */
export const getProjects = async () => {
  try {
    // Make a GET request to the projects endpoint via the API Gateway
    const response = await apiClient.get('/api/projects');
    return response.data; // Return the array of projects
  } catch (error) {
    console.error('Get Projects API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch projects.');
  }
};

/**
 * Creates a new project.
 * @param {object} projectData - Data for the new project { name, description }
 * @returns {Promise<object>} The newly created project object.
 */
export const createProject = async (projectData) => {
  try {
    // Make a POST request to the projects endpoint
    const response = await apiClient.post('/api/projects', projectData);
    return response.data; // Return the created project
  } catch (error) {
    console.error('Create Project API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create project.');
  }
};

/**
 * Fetches all tasks for a specific project.
 * @param {string} projectId - The ID of the project whose tasks are needed.
 * @returns {Promise<Array>} A list of task objects for that project.
 */
export const getTasksForProject = async (projectId) => {
  try {
    // Make a GET request to the project-specific tasks endpoint
    const response = await apiClient.get(`/api/projects/${projectId}/tasks`);
    return response.data; // Return the array of tasks
  } catch (error) {
    console.error(`Get Tasks for Project ${projectId} API Error:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch tasks for the project.');
  }
};

/**
 * Creates a new task within a project.
 * @param {object} taskData - Data for the new task { title, description, projectId, assigneeId? }
 * @returns {Promise<object>} The newly created task object.
 */
export const createTask = async (taskData) => {
  try {
    // Make a POST request to the tasks endpoint
    const response = await apiClient.post('/api/tasks', taskData);
    return response.data; // Return the created task
  } catch (error) {
    console.error('Create Task API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create task.');
  }
};

/**
 * Updates an existing task.
 * @param {string} taskId - The ID of the task to update.
 * @param {object} updateData - The fields to update { title?, description?, status?, assigneeId? }
 * @returns {Promise<object>} The updated task object.
 */
export const updateTask = async (taskId, updateData) => {
  try {
    // Make a PATCH request to the specific task endpoint
    const response = await apiClient.patch(`/api/tasks/${taskId}`, updateData);
    return response.data; // Return the updated task
  } catch (error) {
    console.error(`Update Task ${taskId} API Error:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update task.');
  }
};

// Add more functions for comments, deleting tasks, etc. as needed
// export const getCommentsForTask = async (taskId) => { ... };
// export const createComment = async (taskId, commentData) => { ... };
// export const deleteTask = async (taskId) => { ... };
