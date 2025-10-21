const jwt = require('jsonwebtoken');

const userSocketMap = {};
let ioInstance; 

const initSocketHandler = (io) => {
  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: Token not provided.'));
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token.'));
      }
      socket.userData = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    const userId = socket.userData.userId;

    // Store the user's socket ID
    userSocketMap[userId] = socket.id;
    
    // A user joins a "room" named after their own userId.
    // This makes it easy to send a message to a specific user.
    socket.join(userId);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // Clean up the map when the user disconnects
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
      }
    });
  });
};


const sendNotificationToUser = (userId, event) => {
  if (ioInstance && userSocketMap[userId]) {
    // Emitting to the room named after the userId
    ioInstance.to(userId).emit('notification', event);
    console.log(`Notification sent to user ${userId}`);
  } else {
    console.log(`User ${userId} is not connected. Notification not sent.`);
  }
};

module.exports = {
  initSocketHandler,
  sendNotificationToUser,
};
