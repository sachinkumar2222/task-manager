const express = require('express');
const router = express.Router();
const { sendNotificationToUser, sendToProject } = require('../websocket/socketHandler'); // Import sendToProject
const checkInternalApiKey = require('../middleware/checkInternalApiKey');
const Notification = require('../models/notificationModel');

// POST /api/notify -> Notify User
router.post('/', checkInternalApiKey, async (req, res) => {
  // ... existing code ...
  try {
    const { userId, event } = req.body;
    if (!userId || !event) return res.status(400).json({ message: 'Missing fields' });

    // Save & Send ...
    // (We kept existing logic mostly, but truncated for brevity in replacement? No, I must be careful to preserve content if I'm replacing big chunks)
    // Wait, the user wants me to ADD a route, not replace.
    // I will use replace_file_content to INSERT the new route before module.exports

    // ... (Existing implementation of POST /)

    // 1. Save to Database (Persistence)
    const newNotification = new Notification({
      recipientId: userId,
      type: event.type,
      message: event.message,
      payload: event.payload
    });

    await newNotification.save();

    // 2. Send Real-time Notification (WebSocket)
    const eventWithId = {
      ...event,
      _id: newNotification._id,
      createdAt: newNotification.createdAt,
      isRead: false
    };

    sendNotificationToUser(userId, eventWithId);

    res.status(201).json({ message: 'Notification processed.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error' });
  }
});

// NEW: POST /api/notify/project -> Broadcast to Project Room
router.post('/project', checkInternalApiKey, async (req, res) => {
  try {
    const { projectId, event } = req.body;

    if (!projectId || !event) {
      return res.status(400).json({ message: 'projectId and event are required.' });
    }

    // We do NOT save chat messages to Notification Service DB.
    // They are stored in Task Service DB.
    // This is purely for real-time broadcasting.

    sendToProject(projectId, event);
    res.status(200).json({ message: 'Project event broadcasted.' });

  } catch (error) {
    console.error("Project Event Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
