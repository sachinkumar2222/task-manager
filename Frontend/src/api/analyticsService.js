import apiClient from './apiClient';

/**
 * Fetches dashboard statistics for the current user's workspace.
 * @returns {Promise<object>} Dashboard stats (totalTasks, completedTasks, trendData, etc.)
 */
export const getDashboardStats = async () => {
  try {
    // The API Gateway routes /api/analytics -> Analytics Service
    const response = await apiClient.get('/api/analytics/dashboard');
    return response.data;
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error.response?.data || error.message);
    throw new Error("Failed to load dashboard data.");
  }
};
