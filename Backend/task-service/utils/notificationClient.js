const axios = require('axios');

/**
 * Sends an event to the notification service.
 * @param {string} userId - The ID of the user to whom the notification should be sent.
 * @param {object} event - The event data (such as type and message).
 */
const sendNotification = async (userId, event) => {
  try {
    // Read URL and secret key from the .env file
    const serviceUrl = process.env.NOTIFICATION_SERVICE_URL;
    const apiKey = process.env.INTERNAL_API_KEY;

    if (!serviceUrl || !apiKey) {
      console.error("Notification service URL or API Key is not configured.");
      return;
    }

    // Use Axios to call the internal endpoint of the notification service
    await axios.post(
      `${serviceUrl}/api/notify`,
      {
        userId,
        event,
      },
      {
        // Set the special internal header
        headers: {
          'x-internal-api-key': apiKey,
        },
      }
    );

  } catch (error) {
    // If the notification service is down or an error occurs, log it
    // but don’t crash the main application.
    console.error(`Error while sending notification: ${error.message}`);
  }
};



/**
 * Sends a broadcast event to a project room via notification service.
 * @param {string} projectId - The ID of the project room.
 * @param {object} event - The event data (type, message, payload).
 */
const sendProjectEvent = async (projectId, event) => {
  try {
    const serviceUrl = process.env.NOTIFICATION_SERVICE_URL;
    const apiKey = process.env.INTERNAL_API_KEY;

    if (!serviceUrl || !apiKey) return;

    await axios.post(
      `${serviceUrl}/api/notify/project`, // Endpoint we will create
      { projectId, event },
      { headers: { 'x-internal-api-key': apiKey } }
    );

  } catch (error) {
    console.error(`Error sending project event: ${error.message}`);
  }
};

module.exports = { sendNotification, sendProjectEvent };
