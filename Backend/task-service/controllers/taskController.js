const Task = require('../models/taskModel');
const { sendNotification } = require('../utils/notificationClient');
// Analytics client ko import karein
const { sendAnalyticsEvent } = require('../utils/analyticsClient');

/**
 * Ek naya task banata hai aur notifications/analytics events bhejta hai.
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assigneeId } = req.body;
    // JWT se creator ki ID aur workspace ki ID nikalo
    const { userId, workspaceId } = req.userData;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title aur Project ID zaroori hain.' });
    }

    const newTask = await Task.create({
      title,
      description,
      projectId,
      creatorId: userId,
      assigneeId,
    });

    // --- ANALYTICS LOGIC ---
    // Naya task banne ka event bhejo
    sendAnalyticsEvent({
      eventType: 'TASK_CREATED',
      workspaceId,
      userId,
      payload: { taskId: newTask.id, projectId: newTask.projectId },
    });

    // --- NOTIFICATION LOGIC ---
    // Agar task banate waqt hi kisi ko assign kiya gaya hai, to use notification bhejo.
    if (assigneeId) {
      sendNotification(assigneeId, {
        type: 'TASK_ASSIGNED',
        message: `Aapko ek naya task assign kiya gaya hai: "${newTask.title}"`,
        payload: { taskId: newTask.id, projectId: newTask.projectId },
      });
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Task banane mein error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Ek specific project ke saare tasks ko fetch karta hai.
 */
exports.getTasksForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.findByProject(projectId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Tasks fetch karne mein error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Ek maujooda task ko update karta hai aur zaroori events bhejta hai.
 */
exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, status, assigneeId } = req.body;
        const { userId, workspaceId } = req.userData;
        
        // Task ka purana data database se nikalo taaki hum compare kar sakein
        const oldTask = await Task.findById(taskId);
        if (!oldTask) {
            return res.status(404).json({ message: "Task nahi mila." });
        }

        const updatedTask = await Task.update(taskId, { title, description, status, assigneeId });

        // --- ANALYTICS LOGIC ---
        // Agar task ka status 'COMPLETED' hua hai (aur pehle nahi tha), to event bhejo
        if (status === 'COMPLETED' && oldTask.status !== 'COMPLETED') {
            sendAnalyticsEvent({
                eventType: 'TASK_COMPLETED',
                workspaceId,
                userId,
                payload: { taskId: updatedTask.id, projectId: updatedTask.projectId }
            });
        }

        // --- NOTIFICATION LOGIC ---
        // Check karo ki kya task naye user ko assign hua hai
        if (assigneeId && oldTask.assigneeId !== assigneeId) {
          sendNotification(assigneeId, {
            type: 'TASK_ASSIGNED',
            message: `Aapko ek task assign kiya gaya hai: "${updatedTask.title}"`,
            payload: { taskId: updatedTask.id, projectId: updatedTask.projectId },
          });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Task update karne mein error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Ek task ko delete karta hai.
 */
exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        await Task.delete(taskId);
        res.status(200).json({ message: 'Task सफलतापूर्वक delete ho gaya.' });
    } catch (error) {
        console.error("Task delete karne mein error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

