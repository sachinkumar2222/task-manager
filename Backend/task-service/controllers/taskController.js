const Task = require('../models/taskModel');
const { sendNotification } = require('../utils/notificationClient');
const { sendAnalyticsEvent } = require('../utils/analyticsClient');

/**
 * Creates a new task.
 * SECURITY: Only ADMINs can create tasks.
 */
exports.createTask = async (req, res) => {
  try {
    // 1. Check User Role
    const { role } = req.userData;
    if (role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Only Admins can create new tasks.' });
    }

    // Get assigneeIds array from request
    const { title, description, projectId, assigneeIds, dueDate } = req.body;
    const { userId, workspaceId } = req.userData;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and Project ID are required.' });
    }

    // Pass the array to the model
    const newTask = await Task.create({
      title,
      description,
      projectId,
      creatorId: userId,
      assigneeIds: Array.isArray(assigneeIds) ? assigneeIds : [], // Ensure it's an array
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    // Analytics
    sendAnalyticsEvent({
      eventType: 'TASK_CREATED',
      workspaceId,
      userId,
      payload: { taskId: newTask.id, projectId: newTask.projectId },
    });

    // --- NOTIFICATION LOGIC FOR MULTIPLE USERS ---
    // Loop through all assignee IDs and send a notification to each
    if (newTask.assigneeIds && newTask.assigneeIds.length > 0) {
      newTask.assigneeIds.forEach(assigneeId => {
        sendNotification(assigneeId, {
          type: 'TASK_ASSIGNED',
          message: `You have been assigned a new task: "${newTask.title}"`,
          payload: { taskId: newTask.id, projectId: newTask.projectId },
        });
      });
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTasksForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    // Extract role and userId
    const { role, userId } = req.userData;

    let tasks;
    if (role === 'ADMIN') {
      tasks = await Task.findByProject(projectId);
    } else {
      // Members see only tasks assigned to them
      tasks = await Task.findByProjectAndUser(projectId, userId);
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Updates an existing task.
 * Supports updating multiple assignees.
 */
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    // Get assigneeIds array
    const { title, description, status, assigneeIds, dueDate } = req.body;
    const { userId, workspaceId, role } = req.userData;

    const oldTask = await Task.findById(taskId);
    if (!oldTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    // --- SECURITY CHECK START ---
    if (role !== 'ADMIN') {
      // If user is NOT Admin, check if they are trying to change restricted fields
      const isTitleChanged = title !== undefined && title !== oldTask.title;
      const isDescChanged = description !== undefined && description !== oldTask.description;

      // Check if assigneeIds array changed
      // We check if the new array is different from the old array
      const oldIds = oldTask.assigneeIds || [];
      const newIds = assigneeIds || [];

      // Simple check: are lengths different or does new list contain something old list doesn't?
      const isAssigneeChanged = assigneeIds !== undefined && (
        oldIds.length !== newIds.length ||
        !newIds.every(id => oldIds.includes(id))
      );

      if (isTitleChanged || isDescChanged || isAssigneeChanged) {
        return res.status(403).json({
          message: 'Forbidden: Team members can only update the task status.'
        });
      }
    }
    // --- SECURITY CHECK END ---

    // Update task with new array
    const updatedTask = await Task.update(taskId, {
      title,
      description,
      status,
      assigneeIds,
      dueDate: dueDate ? new Date(dueDate) : undefined // Only update if provided
    });

    // Analytics
    if (status === 'COMPLETED' && oldTask.status !== 'COMPLETED') {
      sendAnalyticsEvent({
        eventType: 'TASK_COMPLETED',
        workspaceId,
        userId,
        payload: { taskId: updatedTask.id, projectId: updatedTask.projectId }
      });
    }

    // --- NOTIFICATION LOGIC FOR NEW ASSIGNEES ---
    if (assigneeIds && Array.isArray(assigneeIds)) {
      const oldIds = oldTask.assigneeIds || [];

      // Find users who were NOT in the old list (newly assigned)
      const newAssignees = assigneeIds.filter(id => !oldIds.includes(id));

      newAssignees.forEach(assigneeId => {
        sendNotification(assigneeId, {
          type: 'TASK_ASSIGNED',
          message: `You have been assigned a task: "${updatedTask.title}"`,
          payload: { taskId: updatedTask.id, projectId: updatedTask.projectId },
        });
      });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    // 1. Check User Role
    const { role } = req.userData;
    if (role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Only Admins can delete tasks.' });
    }

    const { taskId } = req.params;
    await Task.delete(taskId);

    // Analytics
    // We need workspaceId and userId which we have from req.userData
    const { userId, workspaceId } = req.userData;

    sendAnalyticsEvent({
      eventType: 'TASK_DELETED',
      workspaceId,
      userId,
      payload: { taskId },
    });

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Gets tasks for the current user based on filter (created vs assigned).
 */
exports.getUserTasks = async (req, res) => {
  try {
    const { userId, workspaceId } = req.userData;
    const { filter } = req.query; // 'created', 'assigned', or 'workspace'

    let tasks;
    // Default to 'assigned' if filter is missing/invalid or 'undefined' string
    const safeFilter = (filter && filter !== 'undefined') ? filter : 'assigned';

    if (safeFilter === 'workspace') {
      // Fetch ALL tasks in the workspace (for Admins)
      tasks = await Task.findAllByWorkspace(workspaceId);
    } else if (safeFilter === 'created') {
      tasks = await Task.findByCreator(userId);
    } else {
      // Default case
      tasks = await Task.findByAssignee(userId);

    }

    // Safety check if tasks is undefined/null
    if (!tasks) tasks = [];

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Checks for tasks due within 24 hours and sends notifications.
 * Triggered by frontend or scheduler.
 */
exports.checkDeadlines = async (req, res) => {
  try {
    // Find tasks due TODAY
    const tasksDueSoon = await Task.findDueToday();

    let notificationCount = 0;

    // Process each task
    for (const task of tasksDueSoon) {
      if (task.assigneeIds && task.assigneeIds.length > 0) {
        // Notify all assignees
        for (const assigneeId of task.assigneeIds) {
          sendNotification(assigneeId, {
            type: 'DEADLINE_WARNING',
            message: `Deadline Warning: "${task.title}" is due TODAY!`,
            payload: { taskId: task.id, projectId: task.projectId }
          });
          notificationCount++;
        }
      }
    }

    // Only send response if 'res' is a valid Express response object
    if (res && typeof res.status === 'function') {
      res.status(200).json({
        message: 'Deadline check completed',
        tasksFound: tasksDueSoon.length,
        notificationsSent: notificationCount
      });
    } else {
      // console.log(`Deadline check run via scheduler. Tasks found: ${tasksDueSoon.length}, Notifications sent: ${notificationCount}`);
    }

  } catch (error) {
    console.error("Error checking deadlines:", error);
    if (res && typeof res.status === 'function') {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};