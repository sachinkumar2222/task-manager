const mongoose = require('mongoose');

// Define the schema for our analytics events.
const AnalyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    trim: true,
  },
  workspaceId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AnalyticsEvent = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);

const Analytics = {
  /**
   * Saves a new event document to the database.
   * @param {object} eventData - The event data to save.
   * @returns {Promise<object>} The saved Mongoose document.
   */
  async createEvent(eventData) {
    const newEvent = new AnalyticsEvent(eventData);
    return await newEvent.save();
  },

  /**
   * Calculates key statistics for a given workspace's dashboard.
   * NOW INCLUDES TIME-BASED DATA for charts.
   */
  async getWorkspaceDashboardStats(workspaceId) {
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Get simple counts (Creation - Deletion)
    const [
      createdProjects,
      deletedProjects,
      createdTasks,
      deletedTasks,
      completedTasks,
      createdTasksLast7Days
    ] = await Promise.all([
      AnalyticsEvent.countDocuments({ workspaceId, eventType: 'PROJECT_CREATED' }),
      AnalyticsEvent.countDocuments({ workspaceId, eventType: 'PROJECT_DELETED' }),
      AnalyticsEvent.countDocuments({ workspaceId, eventType: 'TASK_CREATED' }),
      AnalyticsEvent.countDocuments({ workspaceId, eventType: 'TASK_DELETED' }),
      AnalyticsEvent.countDocuments({ workspaceId, eventType: 'TASK_COMPLETED' }),
      AnalyticsEvent.countDocuments({
        workspaceId,
        eventType: 'TASK_CREATED',
        createdAt: { $gte: sevenDaysAgo }
      })
    ]);

    const totalProjects = Math.max(0, createdProjects - deletedProjects);
    const totalTasks = Math.max(0, createdTasks - deletedTasks);

    // 2. Get data for line chart (Tasks Completed in Last 7 Days, grouped by day)
    // We use Mongoose Aggregation Pipeline for this
    const completionTrendData = await AnalyticsEvent.aggregate([
      {
        // Find events that match criteria
        $match: {
          workspaceId: workspaceId,
          eventType: 'TASK_COMPLETED',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        // Group by the date part of 'createdAt'
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, // Added timezone
          count: { $sum: 1 }
        }
      },
      {
        // Format the output
        $project: {
          _id: 0, // Exclude the _id field
          date: "$_id", // Rename _id to date
          count: 1 // Include the count
        }
      },
      {
        // Sort by date ascending
        $sort: { date: 1 }
      }
    ]);

    // 3. Format data for the chart (fill in missing days with 0)
    const taskTrendData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      // Ensure date string is in UTC to match aggregation
      const dateString = d.toISOString().split('T')[0];
      const found = completionTrendData.find(item => item.date === dateString);
      taskTrendData.push({
        date: dateString, // 'YYYY-MM-DD'
        name: d.toLocaleDateString('en-US', { weekday: 'short' }), // 'Mon', 'Tue'
        count: found ? found.count : 0
      });
    }

    // Calculate derived stats
    const activeTasks = totalTasks - completedTasks;
    const completedTasksLast7Days = taskTrendData.reduce((acc, day) => acc + day.count, 0);

    // Return all stats
    return {
      totalProjects,
      totalTasks,
      completedTasks,
      activeTasks,
      createdTasksLast7Days,
      completedTasksLast7Days, // This is now a calculated sum
      taskTrendData // This is the new array for the chart
    };
  },
};

module.exports = Analytics;

