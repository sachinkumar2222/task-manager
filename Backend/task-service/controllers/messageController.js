const { prisma } = require('../config/prismaClient');
const { sendNotification } = require('../utils/notificationClient');

/**
 * Creates a new chat message in a project.
 */
exports.createMessage = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { content } = req.body;
        const { userId } = req.userData; // Sender

        if (!content) {
            return res.status(400).json({ message: 'Content is required.' });
        }

        // 1. Save to Database
        const message = await prisma.message.create({
            data: {
                content,
                projectId,
                senderId: userId
            }
        });

        // 2. Broadcast via Notification Service (Socket)
        // We use a special internal event 'CHAT_MESSAGE' that notification service listens for
        // But notification service 'sendNotification' targets a specific USER.
        // We need to broadcast to a ROOM (Project).
        // Standard 'sendNotification' might not work directly if it expects userId.
        // However, we can use the same internal endpoint to send a 'PROJECT_EVENT'.
        // Or better: The notification service should handle 'broadcast' type events?
        // Let's use the 'sendNotification' utility but we need to see how it's implemented.
        // Ah, 'sendNotification(userId, event)'. It only takes userId.

        // workaround: We will loop through project members? NO, too expensive.
        // We need to update notificationClient to support broadcasting or room events.
        // OR: We send a special 'BROADCAST' event to the notification service, passing 'projectId' as the target.
        // The notification service needs to handle this.

        // Let's assume for now we will add a 'broadcastToProject' function to notificationClient later.
        // For this step, I'll use a placeholder or generic call.

        // Actually, let's update notificationClient.js to expose a 'sendProjectEvent' function.
        // But for now, let's just comment it out or send to the 'sender' as a test confirmation? No.

        // I will import a new function 'sendProjectEvent' (which I will implement next).
        const { sendProjectEvent } = require('../utils/notificationClient');
        sendProjectEvent(projectId, {
            type: 'CHAT_MESSAGE',
            message: content,
            payload: message // Send the full message object
        });

        res.status(201).json(message);
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Gets message history for a project.
 */
exports.getProjectMessages = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { limit = 50, cursor } = req.query;

        const messages = await prisma.message.findMany({
            where: { projectId },
            take: Number(limit),
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' }, // Newest first
        });

        // Reverse to show oldest first in chat UI? 
        // Typically UI wants oldest at top, but paginates backwards.
        // We'll return them as is (Newest first) and let Frontend reverse.

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Deletes a message.
 */
exports.deleteMessage = async (req, res) => {
    try {
        const { projectId, messageId } = req.params;
        const { userId, role } = req.userData;

        // 1. Find the message
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            return res.status(404).json({ message: 'Message not found.' });
        }

        // 2. Check permissions: sender or ADMIN
        // Note: role might come from checkAuth if it fetches user details? 
        // Typically checkAuth decodes token. Token should have role.
        // Assuming req.userData.role exists.

        if (message.senderId !== userId && role !== 'ADMIN' && role !== 'OWNER') {
            // Start stricter check: fetch project member role if needed?
            // For now, let's stick to Sender or Token Role (ADMIN/OWNER).
            return res.status(403).json({ message: 'Not authorized to delete this message.' });
        }

        // 3. Delete from DB
        await prisma.message.delete({
            where: { id: messageId }
        });

        console.log(`Message ${messageId} deleted from DB. Broadcasting event...`);

        // 4. Broadcast Deletion Event
        const { sendProjectEvent } = require('../utils/notificationClient');
        await sendProjectEvent(projectId, {
            type: 'MESSAGE_DELETED',
            messageId: messageId
        });

        console.log(`Broadcast event sent for message ${messageId} in project ${projectId}`);

        res.status(200).json({ message: 'Message deleted successfully.' });

    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
