// Import the configured Axios instance
import apiClient from './apiClient';

/**
 * Fetches dashboard statistics for the currently logged-in user's workspace.
 * The user's workspace and authentication are determined by the JWT token sent automatically by apiClient.
 * @returns {Promise<object>} An object containing dashboard stats (e.g., { totalProjects, activeTasks, completedTasks }).
 */
export const getDashboardStats = async () => {
  try {
    // Make a GET request to the dashboard stats endpoint via the API Gateway
    const response = await apiClient.get('/api/analytics/dashboard');
    return response.data; // Return the stats object
  } catch (error) {
    console.error('Get Dashboard Stats API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics.');
  }
};

// Add more analytics-related API functions here later if needed
// e.g., getProjectSpecificStats, getTeamPerformance, etc.
