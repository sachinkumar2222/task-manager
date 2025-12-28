// Import the configured Axios instance
import apiClient from './apiClient';

/**
 * Fetches all projects for the currently logged-in user's workspace.
 * @returns {Promise<Array>} A list of project objects.
 */
export const getProjects = async () => {
  try {
    const response = await apiClient.get('/api/projects');
    return response.data;
  } catch (error) {
    console.error('Get Projects API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch projects.');
  }
};

/**
 * Fetches real-time workspace stats (Total Projects, Tasks) from Task Service.
 * @returns {Promise<object>} { totalProjects, totalTasks, activeTasks, completedTasks }
 */
export const getWorkspaceStats = async () => {
  try {
    // Add timestamp to prevent caching
    const response = await apiClient.get(`/api/projects/stats?t=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.error('Get Workspace Stats API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch workspace stats.');
  }
};

/**
 * Creates a new project.
 * @param {object} projectData - Data for the new project { name, description }
 * @returns {Promise<object>} The newly created project object.
 */
export const createProject = async (projectData) => {
  try {
    const response = await apiClient.post('/api/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('Create Project API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create project.');
  }
};

/**
 * Fetches details for a single project by its ID.
 * @param {string} projectId - The ID of the project to fetch.
 * @returns {Promise<object>} The project object with its details.
 */
export const getProjectDetails = async (projectId) => {
  try {
    const response = await apiClient.get(`/api/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`Get Project Details ${projectId} API Error:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch project details.');
  }
};

/**
 * Updates a project. (NEW FUNCTION)
 * @param {string} projectId - The ID of the project to update.
 * @param {object} updateData - The data to update { name, description }.
 * @returns {Promise<object>} The updated project object.
 */
export const updateProject = async (projectId, updateData) => {
  try {
    const response = await apiClient.patch(`/api/projects/${projectId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Update Project ${projectId} API Error:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update project.');
  }
};

/**
 * Deletes a project. (NEW FUNCTION)
 * @param {string} projectId - The ID of the project to delete.
 * @returns {Promise<void>}
 */
export const deleteProject = async (projectId) => {
  try {
    await apiClient.delete(`/api/projects/${projectId}`);
  } catch (error) {
    console.error(`Delete Project ${projectId} API Error:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete project.');
  }
};

export const getUserTasks = async (filter) => {
  try {
    const response = await apiClient.get(`/api/tasks/user?filter=${filter}`);
    return response.data;
  } catch (error) {
    console.error("Get User Tasks Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch tasks.");
  }
};


/**
 * Fetches all tasks for a specific project.
 * @param {string} projectId - The ID of the project whose tasks are needed.
 * @returns {Promise<Array>} A list of task objects for that project.
 */
export const getTasksForProject = async (projectId) => {
  try {
    const response = await apiClient.get(`/api/projects/${projectId}/tasks`);
    return response.data;
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
    const response = await apiClient.post('/api/tasks', taskData);
    return response.data;
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
    const response = await apiClient.patch(`/api/tasks/${taskId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Update Task ${taskId} API Error:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update task.');
  }
};

/**
 * Deletes a specific task.
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<void>} Resolves on successful deletion.
 */
export const deleteTask = async (taskId) => {
  try {
    await apiClient.delete(`/api/tasks/${taskId}`);
  } catch (error) {
    console.error(`Delete Task ${taskId} API Error:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete task.');
  }
};

export const getCommentsForTask = async (taskId) => {
  try {
    const response = await apiClient.get(`/api/tasks/${taskId}/comments`);
    return response.data;
  } catch (error) {
    console.error(`Get Comments for ${taskId} API Error:`, error.response?.data || error.message);
    throw new Error('Failed to fetch comments.');
  }
};


export const createComment = async (taskId, content) => {
  try {
    const response = await apiClient.post(`/api/tasks/${taskId}/comments`, { content });
    return response.data;
  } catch (error) {
    console.error(`Create Comment API Error:`, error.response?.data || error.message);
    throw new Error('Failed to post comment.');
  }
};

export const deleteComment = async (commentId) => {
  try {
    // Gateway maps /api/comments to task-service
    await apiClient.delete(`/api/comments/${commentId}`);
  } catch (error) {
    console.error(`Delete Comment API Error:`, error.response?.data || error.message);
    throw new Error('Failed to delete comment.');
  }
};

export const checkDeadlines = async () => {
  try {
    const response = await apiClient.post('/api/tasks/check-deadlines');
    return response.data;
  } catch (error) {
    console.error("Check Deadlines API Error:", error.response?.data || error.message);
    throw new Error('Failed to check deadlines.');
  }
};

// --- Subtask APIs ---
export const createSubtask = async (taskId, title) => {
  try {
    const response = await apiClient.post(`/api/tasks/${taskId}/subtasks`, { title });
    return response.data;
  } catch (error) {
    console.error("Create Subtask API Error:", error.response?.data || error.message);
    throw new Error('Failed to create subtask.');
  }
};

export const getSubtasks = async (taskId) => {
  try {
    const response = await apiClient.get(`/api/tasks/${taskId}/subtasks`);
    return response.data;
  } catch (error) {
    console.error("Get Subtasks API Error:", error.response?.data || error.message);
    throw new Error('Failed to fetch subtasks.');
  }
};

export const updateSubtask = async (subtaskId, updates) => {
  try {
    const response = await apiClient.patch(`/api/subtasks/${subtaskId}`, updates);
    return response.data;
  } catch (error) {
    console.error("Update Subtask API Error:", error.response?.data || error.message);
    throw new Error('Failed to update subtask.');
  }
};

export const deleteSubtask = async (subtaskId) => {
  try {
    await apiClient.delete(`/api/subtasks/${subtaskId}`);
  } catch (error) {
    console.error("Delete Subtask API Error:", error.response?.data || error.message);
    throw new Error('Failed to delete subtask.');
  }
};