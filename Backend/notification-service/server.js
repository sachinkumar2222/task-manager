require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { initSocketHandler } = require('./websocket/socketHandler');
const eventListenerRoutes = require('./listeners/eventListener');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.CORS_ORIGIN
    ].filter(Boolean), // Allow multiple origins
    methods: ["GET", "POST"],
    credentials: true // Important for cookies/headers if needed
  }
});

// Initialize the WebSocket connection handler
initSocketHandler(io);

// Middleware
app.use(express.json());

// --- Routes ---

// Internal Event Listener (for other microservices)
// Internal Event Listener (for other microservices)
// Handle both paths to support Direct calls (preserving /api/notify) AND Gateway calls (stripping to /)
app.use('/api/notify', eventListenerRoutes);
app.use('/', eventListenerRoutes);

// User-facing Notification Routes
const notificationController = require('./controllers/notificationController');
const checkAuth = require('./middleware/checkAuth');
const router = express.Router();

router.get('/', checkAuth, notificationController.getUserNotifications);
router.put('/:notificationId/read', checkAuth, notificationController.markAsRead);
router.delete('/:notificationId', checkAuth, notificationController.deleteNotification);
router.put('/read-all', checkAuth, notificationController.markAllAsRead);

// Gateway strips /api/notifications -> /
app.use('/', router);

// Connect to MongoDB
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL || 'mongodb+srv://sachin2322006:analytics-service@analytics-service.c7ml3v.mongodb.net/notification-service?retryWrites=true&w=majority&appName=notification-service')
  .then(() => console.log('✅ Notification Service MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: "success", message: "Notification Service is healthy and running!" });
});

// Use the correct port for the notification service from our plan
const PORT = process.env.PORT || 4003;
server.listen(PORT, () => {
  console.log(`🚀 Notification Service is live and listening on port ${PORT}`);
});

