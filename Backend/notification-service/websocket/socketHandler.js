const jwt = require('jsonwebtoken');

const userSocketMap = {};
let ioInstance;

const initSocketHandler = (io) => {
  ioInstance = io;

  io.use((socket, next) => {
    let token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: Token not provided.'));
    }

    // Strip 'Bearer ' if present
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }

    if (!process.env.JWT_SECRET) {
      console.error("[Socket] CRITICAL: JWT_SECRET is missing in environment variables!");
      return next(new Error('Server error: Configuration missing.'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error(`[Socket] Token verification failed for ${socket.id}: ${err.message}`);
        return next(new Error(`Authentication error: ${err.message}`));
      }
      socket.userData = decoded;
      // console.log(`[Socket] User ${decoded.userId} authenticated. ID: ${socket.id}`);
      next();
    });
  });

  io.on('connection', (socket) => {

    const userId = socket.userData.userId;

    // Store the user's socket ID
    userSocketMap[userId] = socket.id;

    // A user joins a "room" named after their own userId.
    // This makes it easy to send a message to a specific user.
    socket.join(userId);

    socket.on('disconnect', () => {

      // Clean up the map when the user disconnects
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
      }
    });

    // Handle joining project chat rooms
    socket.on('join_project', (projectId) => {
      const roomName = `project_${projectId}`;
      socket.join(roomName);

    });
  });
};


const sendNotificationToUser = (userId, event) => {
  if (ioInstance && userSocketMap[userId]) {
    // Emitting to the room named after the userId
    ioInstance.to(userId).emit('notification', event);

  }
};

const sendToProject = (projectId, event) => {
  if (ioInstance) {
    const roomName = `project_${projectId}`;

    ioInstance.to(roomName).emit('project_event', event);
    // We emit 'project_event' (generic) or 'chat_message' (specific).
    // Let's use 'project_event' and let frontend handle types.


  }
};

module.exports = {
  initSocketHandler,
  sendNotificationToUser,
  sendToProject
};
