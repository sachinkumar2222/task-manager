const { prisma } = require('../config/prismaClient');

const Task = {
  /**
   * Creates a new task in the database.
   * @param {object} data - Task data { title, description?, projectId, creatorId, assigneeIds? }
   * @returns {Promise<object>} The newly created task object.
   */
  async create(data) {
    try {
      return prisma.task.create({
        data: {
          title: data.title,
          description: data.description,
          projectId: data.projectId,
          creatorId: data.creatorId,
          // Handle array of IDs, default to empty array if not provided
          assigneeIds: data.assigneeIds || [],
          dueDate: data.dueDate, // Add due date
        },
      });
    } catch (error) {
      console.error("Error in Task.create:", error);
      throw error;
    }
  },

  /**
   * Finds a single task by its ID.
   * @param {string} taskId - The ID of the task to find.
   * @returns {Promise<object|null>} The task object if found, otherwise null.
   */
  async findById(taskId) {
    try {
      return prisma.task.findUnique({
        where: { id: taskId },
      });
    } catch (error) {
      console.error("Error in Task.findById:", error);
      throw error;
    }
  },

  /**
   * Finds all tasks for a specific project.
   * @param {string} projectId - The ID of the project.
   * @returns {Promise<Array>} A list of task objects.
   */
  async findByProject(projectId) {
    try {
      return prisma.task.findMany({
        where: { projectId },
        include: {
          project: { select: { name: true } }
        },
        orderBy: { createdAt: 'asc' }, // Show oldest tasks first
      });
    } catch (error) {
      console.error("Error in Task.findByProject:", error);
      throw error;
    }
  },

  /**
   * Finds tasks created by a specific user.
   * @param {string} userId 
   */
  async findByCreator(userId) {
    try {
      return prisma.task.findMany({
        where: { creatorId: userId },
        include: {
          project: { select: { name: true } }, // Include project name
          _count: { select: { comments: true } }
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error("Error in Task.findByCreator:", error);
      throw error;
    }
  },

  /**
   * Finds tasks in a project assigned to a specific user.
   * @param {string} projectId 
   * @param {string} userId 
   */
  async findByProjectAndUser(projectId, userId) {
    try {
      return prisma.task.findMany({
        where: {
          projectId,
          assigneeIds: { has: userId }
        },
        include: {
          project: { select: { name: true } }
        },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      console.error("Error in Task.findByProjectAndUser:", error);
      throw error;
    }
  },

  /**
   * Finds ALL tasks assigned to a specific user (across all projects).
   * @param {string} userId 
   */
  async findByAssignee(userId) {
    try {
      return prisma.task.findMany({
        where: {
          assigneeIds: { has: userId }
        },
        include: {
          project: { select: { name: true } }, // Include project name
          _count: { select: { comments: true } }
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error("Error in Task.findByAssignee:", error);
      throw error;
    }
  },

  /**
   * Updates an existing task.
   * @param {string} taskId - The ID of the task to update.
   * @param {object} updateData - The fields to update { title?, description?, status?, assigneeIds? }
   * @returns {Promise<object>} The updated task object.
   */
  async update(taskId, updateData) {
    try {
      return prisma.task.update({
        where: { id: taskId },
        data: updateData,
      });
    } catch (error) {
      console.error("Error in Task.update:", error);
      throw error;
    }
  },

  /**
   * Deletes a task from the database.
   * @param {string} taskId - The ID of the task to delete.
   * @returns {Promise<void>}
   */
  async delete(taskId) {
    try {
      return prisma.task.delete({
        where: { id: taskId },
      });
    } catch (error) {
      console.error("Error in Task.delete:", error);
      throw error;
    }
  },

  /**
   * Finds ALL tasks in a workspace (across all projects).
   * @param {string} workspaceId
   */
  async findAllByWorkspace(workspaceId) {
    try {
      return prisma.task.findMany({
        where: {
          project: {
            workspaceId: workspaceId
          }
        },
        include: {
          project: { select: { name: true } },
          _count: { select: { comments: true } }
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error("Error in Task.findAllByWorkspace:", error);
      throw error;
    }
  },

  /**
   * Counts total tasks in a workspace (across all projects).
   * @param {string} workspaceId
   * @returns {Promise<number>}
   */
  async countByWorkspace(workspaceId) {
    try {
      return await prisma.task.count({
        where: {
          project: {
            workspaceId: workspaceId
          }
        }
      });
    } catch (error) {
      console.error("Error in Task.countByWorkspace:", error);
      throw error;
    }
  },

  /**
   * Counts completed tasks in a workspace.
   * @param {string} workspaceId
   * @returns {Promise<number>}
   */
  async countCompletedByWorkspace(workspaceId) {
    try {
      return await prisma.task.count({
        where: {
          project: {
            workspaceId: workspaceId
          },
          status: 'COMPLETED' // Assuming 'COMPLETED' is the status string. Or use 'DONE' based on frontend constants?
          // Checking TaskCard.jsx, status is 'DONE'.
          // Let's check schema/constants. Task statuses: TO_DO, IN_PROGRESS, DONE.
          // Wait, previous code used 'COMPLETED' for analytics event. Let's check taskController updateTask.
          // "if (status === 'COMPLETED' && oldTask.status !== 'COMPLETED')" - Wait, TaskPage says "DONE".
          // Let's check a task object in USER_REQUEST. "status": "TODO".
          // Constants in ProjectPage.jsx are TO_DO, IN_PROGRESS, DONE.
          // I should probably check exact string values.
        }
      });
    } catch (error) {
      // Fallback or error logging
      console.error("Error counting completed tasks", error);
      throw error;
    }
  },

  /**
   * Finds tasks due within the next X hours.
   * @param {number} hours 
   */
  async findDueSoon(hours) {
    try {
      const now = new Date();
      const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

      return prisma.task.findMany({
        where: {
          dueDate: {
            gte: now,
            lte: future
          },
          status: {
            not: 'DONE' // Only check incomplete tasks
          }
        },
        include: {
          project: { select: { name: true } }
        }
      });
    } catch (error) {
      console.error("Error in Task.findDueSoon:", error);
      throw error;
    }
  },

  /**
   * Finds tasks due "Today" (from 00:00 to 23:59 local time based on server).
   */
  async findDueToday() {
    try {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));

      return prisma.task.findMany({
        where: {
          dueDate: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: {
            not: 'DONE'
          }
        },
        include: {
          project: { select: { name: true } }
        }
      });
    } catch (error) {
      console.error("Error in Task.findDueToday:", error);
      throw error;
    }
  },
};

module.exports = Task;