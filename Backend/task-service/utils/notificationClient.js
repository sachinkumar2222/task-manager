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

    console.log(`Notification event sent successfully for user ${userId}.`);
  } catch (error) {
    // If the notification service is down or an error occurs, log it
    // but don’t crash the main application.
    console.error(`Error while sending notification: ${error.message}`);
  }
};

module.exports = { sendNotification };
