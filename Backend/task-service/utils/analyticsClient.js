const axios = require('axios');

/**
 * Analytics service ko ek event bhejta hai.
 * @param {object} event - Event ka data (jaise eventType, workspaceId, etc.).
 */
const sendAnalyticsEvent = async (event) => {
  try {
    const serviceUrl = process.env.ANALYTICS_SERVICE_URL; // Yeh .env mein add karna hoga
    const apiKey = process.env.INTERNAL_API_KEY;

    if (!serviceUrl || !apiKey) {
      console.error("Analytics service URL ya API Key configure nahi hai.");
      return;
    }

    await axios.post(
      `${serviceUrl}/api/analytics/events`,
      event, // Poora event object bhejo
      {
        headers: {
          'x-internal-api-key': apiKey,
        },
      }
    );

    console.log(`Analytics event "${event.eventType}" सफलतापूर्वक भेजा gaya.`);
  } catch (error) {
    console.error(`Analytics event bhejne mein error aaya: ${error.message}`);
  }
};

module.exports = { sendAnalyticsEvent };
