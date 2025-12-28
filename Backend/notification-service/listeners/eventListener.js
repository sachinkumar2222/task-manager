const express = require('express');
const router = express.Router();
const { sendNotificationToUser } = require('../websocket/socketHandler');
const checkInternalApiKey = require('../middleware/checkInternalApiKey');
const Notification = require('../models/notificationModel');

// This is an internal endpoint that other services will call.
// It must be protected by our internal API key.
router.post('/', checkInternalApiKey, async (req, res) => {
  try {
    const { userId, event } = req.body;

    if (!userId || !event) {
      return res.status(400).json({ message: 'userId and event payload are required.' });
    }

    // 1. Save to Database (Persistence)
    const newNotification = new Notification({
      recipientId: userId,
      type: event.type,
      message: event.message,
      payload: event.payload
    });

    await newNotification.save();

    // 2. Send Real-time Notification (WebSocket)
    // We attach the DB ID so the frontend can mark it as read later
    const eventWithId = {
      ...event,
      _id: newNotification._id,
      createdAt: newNotification.createdAt,
      isRead: false
    };

    sendNotificationToUser(userId, eventWithId);

    res.status(201).json({ message: 'Notification processed and saved.' });

  } catch (error) {
    console.error("Notification Event Error:", error);
    res.status(500).json({ message: "Internal server error processing notification." });
  }
});

module.exports = router;
