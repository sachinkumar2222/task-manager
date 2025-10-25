const Task = require('../models/taskModel');
const { sendNotification } = require('../utils/notificationClient');
// Import Analytics client
const { sendAnalyticsEvent } = require('../utils/analyticsClient');

/**
 * Creates a new task and sends notifications/analytics events.
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assigneeId } = req.body;
    // Extract creator ID and workspace ID from JWT
    const { userId, workspaceId } = req.userData;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and Project ID are required.' });
    }

    const newTask = await Task.create({
      title,
      description,
      projectId,
      creatorId: userId,
      assigneeId,
    });

    // --- ANALYTICS LOGIC ---
    // Send event for new task creation
    sendAnalyticsEvent({
      eventType: 'TASK_CREATED',
      workspaceId,
      userId,
      payload: { taskId: newTask.id, projectId: newTask.projectId },
    });

    // --- NOTIFICATION LOGIC ---
    // If a user was assigned during creation, send them a notification
    if (assigneeId) {
      sendNotification(assigneeId, {
        type: 'TASK_ASSIGNED',
        message: `You have been assigned a new task: "${newTask.title}"`,
        payload: { taskId: newTask.id, projectId: newTask.projectId },
      });
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Fetches all tasks for a specific project.
 */
exports.getTasksForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.findByProject(projectId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Updates an existing task and sends necessary events.
 */
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, assigneeId } = req.body;
    const { userId, workspaceId } = req.userData;

    // Fetch old task data to compare
    const oldTask = await Task.findById(taskId);
    if (!oldTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    const updatedTask = await Task.update(taskId, { title, description, status, assigneeId });

    // --- ANALYTICS LOGIC ---
    // If task status changed to 'COMPLETED', send an event
    if (status === 'COMPLETED' && oldTask.status !== 'COMPLETED') {
      sendAnalyticsEvent({
        eventType: 'TASK_COMPLETED',
        workspaceId,
        userId,
        payload: { taskId: updatedTask.id, projectId: updatedTask.projectId }
      });
    }

    // --- NOTIFICATION LOGIC ---
    // If the task was reassigned to a new user, send notification
    if (assigneeId && oldTask.assigneeId !== assigneeId) {
      sendNotification(assigneeId, {
        type: 'TASK_ASSIGNED',
        message: `You have been assigned a task: "${updatedTask.title}"`,
        payload: { taskId: updatedTask.id, projectId: updatedTask.projectId },
      });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Deletes a task.
 */
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    await Task.delete(taskId);
    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
