const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: String,
        required: true,
        index: true // Index for faster queries by user
    },
    type: {
        type: String, // e.g., 'TASK_ASSIGNED', 'COMMENT_ADDED', 'PROJECT_INVITE'
        required: true
    },
    message: {
        type: String,
        required: true
    },
    payload: {
        type: Map, // Flexible key-value pairs for extra data (taskId, projectId, etc.)
        of: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 30 // Optional: Auto-delete after 30 days
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
