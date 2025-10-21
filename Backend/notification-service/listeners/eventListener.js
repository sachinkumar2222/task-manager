const express = require('express');
const router = express.Router();
const { sendNotificationToUser } = require('../websocket/socketHandler');
const checkInternalApiKey = require('../middleware/checkInternalApiKey'); // We'll reuse this middleware

// This is an internal endpoint that other services will call.
// It must be protected by our internal API key.
router.post('/', checkInternalApiKey, (req, res) => {
  const { userId, event } = req.body;

  if (!userId || !event) {
    return res.status(400).json({ message: 'userId and event payload are required.' });
  }

  // Call the function to send the real-time notification
  sendNotificationToUser(userId, event);

  res.status(202).json({ message: 'Notification event accepted.' });
});

module.exports = router;
