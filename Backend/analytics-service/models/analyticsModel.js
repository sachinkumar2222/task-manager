const mongoose = require('mongoose');

// Define the schema for our analytics events.
// A schema is a blueprint for the documents in a MongoDB collection.
const AnalyticsEventSchema = new mongoose.Schema({
  // The type of event that occurred (e.g., 'TASK_COMPLETED', 'PROJECT_CREATED').
  eventType: {
    type: String,
    required: true,
    trim: true,
  },
  // The ID of the workspace this event belongs to. This is crucial for separating data.
  workspaceId: {
    type: String,
    required: true,
    index: true, // We add an index to make queries by workspaceId much faster.
  },
  // The ID of the user who triggered the event.
  userId: {
    type: String,
    required: true,
  },
  // A flexible payload to store any additional data related to the event.
  // For a 'TASK_COMPLETED' event, this might include the taskId and projectId.
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // The timestamp of when the event occurred.
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Mongoose model from the schema.
// This model is what we will use to interact with the 'analyticsevents' collection in MongoDB.
const AnalyticsEvent = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);

// Create an object to export our database functions.
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
   * @param {string} workspaceId - The ID of the workspace to get stats for.
   * @returns {Promise<object>} An object containing the calculated stats.
   */
  async getWorkspaceDashboardStats(workspaceId) {
    // We use Promise.all to run multiple database queries in parallel for better performance.
    const [totalProjects, totalTasks, completedTasks] = await Promise.all([
      // Count all documents where the eventType is 'PROJECT_CREATED' for this workspace.
      AnalyticsEvent.countDocuments({ workspaceId, eventType: 'PROJECT_CREATED' }),
      // Count all documents where the eventType is 'TASK_CREATED' for this workspace.
      AnalyticsEvent.countDocuments({ workspaceId, eventType: 'TASK_CREATED' }),
      // Count all documents where the eventType is 'TASK_COMPLETED' for this workspace.
      AnalyticsEvent.countDocuments({ workspaceId, eventType: 'TASK_COMPLETED' }),
    ]);

    // Calculate the number of active tasks.
    const activeTasks = totalTasks - completedTasks;

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      activeTasks,
    };
  },
};

// Export the Analytics model object.
module.exports = Analytics;

