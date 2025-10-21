const axios = require('axios');

/**
 * Notification service ko ek event bhejta hai.
 * @param {string} userId - Jis user ko notification bhejna hai uski ID.
 * @param {object} event - Event ka data (jaise type aur message).
 */
const sendNotification = async (userId, event) => {
  try {
    // .env file se URL aur secret key ko padho
    const serviceUrl = process.env.NOTIFICATION_SERVICE_URL;
    const apiKey = process.env.INTERNAL_API_KEY;

    if (!serviceUrl || !apiKey) {
      console.error("Notification service URL ya API Key configure nahi hai.");
      return;
    }

    // Axios ka use karke notification service ke internal endpoint ko call karo
    await axios.post(
      `${serviceUrl}/api/notify`,
      {
        userId,
        event,
      },
      {
        // Yahan par hum woh special header set kar rahe hain
        headers: {
          'x-internal-api-key': apiKey,
        },
      }
    );

    console.log(`Notification event user ${userId} ke liye सफलतापूर्वक भेजा gaya.`);
  } catch (error) {
    // Agar notification service band hai ya koi error aata hai, to hum use log karenge
    // lekin main application ko crash nahi hone denge.
    console.error(`Notification bhejne mein error aaya: ${error.message}`);
  }
};

module.exports = { sendNotification };
