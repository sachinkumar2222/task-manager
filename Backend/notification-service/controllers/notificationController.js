const Notification = require('../models/notificationModel');

/**
 * Get all notifications for the logged-in user.
 */
exports.getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.userData; // From checkAuth middleware

        const notifications = await Notification.find({ recipientId: userId })
            .sort({ createdAt: -1 }) // Newest first
            .limit(50); // Limit to last 50 notifications

        const unreadCount = await Notification.countDocuments({ recipientId: userId, isRead: false });

        res.status(200).json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Mark a specific notification as read.
 */
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { userId } = req.userData;

        // Ensure the notification belongs to the user
        const notification = await Notification.findOne({ _id: notificationId, recipientId: userId });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ message: "Marked as read", notification });
    } catch (error) {
        console.error("Mark Read Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Mark ALL notifications as read for the user.
 */
exports.markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.userData;

        await Notification.updateMany(
            { recipientId: userId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Mark All Read Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Delete a specific notification.
 */
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { userId } = req.userData;

        const result = await Notification.deleteOne({ _id: notificationId, recipientId: userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
        console.error("Delete Notification Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
