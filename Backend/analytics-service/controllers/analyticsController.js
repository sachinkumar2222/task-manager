const Analytics = require('../models/analyticsModel');
const { processEvent } = require('../listeners/eventProcessor');

/**
 * Controller to log an incoming event from another microservice.
 * This is an internal endpoint protected by an API key.
 */
exports.logEvent = async (req, res) => {
  try {
    const eventData = req.body;

    // Basic validation to ensure the event has the necessary data
    if (!eventData.eventType || !eventData.workspaceId) {
      return res.status(400).json({ message: 'eventType and workspaceId are required.' });
    }

    // Pass the event to the model to be saved in the MongoDB database
    await Analytics.createEvent(eventData);

    // (Optional but good practice) Pass the event to a separate processor for any
    // complex, real-time calculations that might be needed in the future.
    // For now, this step is simple and just logs the event.
    await processEvent(eventData);

    // Respond with a 202 "Accepted" status. This tells the sending service
    // that the event was received successfully but might be processed asynchronously.
    res.status(202).json({ message: 'Event accepted for processing.' });
  } catch (error) {
    console.error('Log Event Error:', error);
    res.status(500).json({ message: 'Internal server error while processing event.' });
  }
};

/**
 * Controller to fetch aggregated dashboard statistics for a specific workspace.
 * This is a public-facing endpoint protected by the user's JWT.
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // The user's workspaceId is attached to the request by the checkAuth middleware
    const { workspaceId } = req.userData;

    // Call the model function to query the database and calculate the stats
    const stats = await Analytics.getWorkspaceDashboardStats(workspaceId);

    // Send the calculated stats back to the frontend
    res.status(200).json(stats);
  } catch (error){
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Internal server error while fetching dashboard stats.' });
  }
};

