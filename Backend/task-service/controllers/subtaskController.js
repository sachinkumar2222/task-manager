const { prisma } = require('../config/prismaClient');

exports.createSubtask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const subtask = await prisma.subtask.create({
            data: {
                title,
                taskId
            }
        });

        res.status(201).json(subtask);
    } catch (error) {
        console.error("Create Subtask Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateSubtask = async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const { title, isCompleted } = req.body;

        const data = {};
        if (title !== undefined) data.title = title;
        if (isCompleted !== undefined) data.isCompleted = isCompleted;

        const updatedSubtask = await prisma.subtask.update({
            where: { id: subtaskId },
            data
        });

        res.status(200).json(updatedSubtask);
    } catch (error) {
        console.error("Update Subtask Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteSubtask = async (req, res) => {
    try {
        const { subtaskId } = req.params;

        await prisma.subtask.delete({
            where: { id: subtaskId }
        });

        res.status(200).json({ message: "Subtask deleted" });
    } catch (error) {
        console.error("Delete Subtask Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getSubtasksByTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const subtasks = await prisma.subtask.findMany({
            where: { taskId },
            orderBy: { createdAt: 'asc' }
        });

        res.status(200).json(subtasks);
    } catch (error) {
        console.error("Get Subtasks Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
