const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
          orderBy: { createdAt: 'asc' }, // Show oldest tasks first
        });
     } catch (error) {
         console.error("Error in Task.findByProject:", error);
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
};

module.exports = Task;