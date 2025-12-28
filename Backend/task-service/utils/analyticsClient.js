const axios = require('axios');

/**
 * Sends an event to the analytics service.
 * @param {object} event - The event data (e.g., eventType, workspaceId, etc.).
 */
const sendAnalyticsEvent = async (event) => {
  try {
    const serviceUrl = process.env.ANALYTICS_SERVICE_URL; // e.g., http://localhost:4005
    const apiKey = process.env.INTERNAL_API_KEY;

    if (!serviceUrl || !apiKey) {
      console.error("[Task Service] Analytics service URL or API Key is not configured.");
      return;
    }

    // --- PATH UPDATED ---
    // Removed '/api/analytics' prefix.
    // The service (analytics-service) is listening on the root path '/events'.
    await axios.post(
      `${serviceUrl}/events`, // Corrected Path
      event, // Send the complete event object
      {
        headers: {
          'x-internal-api-key': apiKey,
        },
      }
    );
    // --- END UPDATE ---

    // console.log(`[Task Service] Analytics event "${event.eventType}" sent successfully.`);
  } catch (error) {
    // Log a more descriptive error
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error(`[Task Service] Analytics event send failed. Status: ${error.response.status}, Data:`, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received (e.g., analytics service is down)
      console.error(`[Task Service] Analytics event send failed. No response received from ${serviceUrl}/events`);
    } else {
      // Something happened in setting up the request
      console.error(`[Task Service] Analytics event setup error: ${error.message}`);
    }
  }
};

module.exports = { sendAnalyticsEvent };

