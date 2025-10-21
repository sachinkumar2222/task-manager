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
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"]
  }
});

// Initialize the WebSocket connection handler
initSocketHandler(io);

// Middleware
app.use(express.json());

// --- Routes ---
// This route will be used internally by other services to trigger notifications
app.use('/api/notify', eventListenerRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: "success", message: "Notification Service is healthy and running!" });
});

const PORT = process.env.PORT || 4003;
server.listen(PORT, () => {
  console.log(`🚀 Notification Service is live and listening on port ${PORT}`);
});
