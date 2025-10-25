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
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Default to frontend dev server
    methods: ["GET", "POST"]
  }
});

// Initialize the WebSocket connection handler
initSocketHandler(io);

// Middleware
app.use(express.json());

// --- Routes ---
// --- ROUTE REGISTRATION UPDATED ---
// Register eventListenerRoutes at the root ('/') because the API Gateway adds '/api/notify'
app.use('/', eventListenerRoutes); 

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: "success", message: "Notification Service is healthy and running!" });
});

// Use the correct port for the notification service from our plan
const PORT = process.env.PORT || 4003; 
server.listen(PORT, () => {
  console.log(`🚀 Notification Service is live and listening on port ${PORT}`);
});

