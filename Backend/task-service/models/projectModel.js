const { prisma } = require('../config/prismaClient');

const Project = {
  /**
   * Creates a new project in the database.
   * @param {object} data - Project data { name, description?, workspaceId, creatorId }
   * @returns {Promise<object>} The newly created project object.
   */
  async create(data) {
    try {
      return prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          workspaceId: data.workspaceId,
          creatorId: data.creatorId,
        },
      });
    } catch (error) {
      console.error("Error in Project.create:", error);
      throw error; // Re-throw for controller to handle
    }
  },

  /**
   * Finds all projects within a specific workspace.
   * @param {string} workspaceId - The ID of the workspace.
   * @returns {Promise<Array>} A list of project objects.
   */
  async findByWorkspace(workspaceId) {
    try {
      return prisma.project.findMany({
        where: { workspaceId },
        include: {
          _count: {
            select: { tasks: true }
          }
        },
        orderBy: { createdAt: 'desc' }, // Show newest projects first
      });
    } catch (error) {
      console.error("Error in Project.findByWorkspace FULL ERROR:", error);
      throw error;
    }
  },

  /**
   * Finds projects in a workspace where the user has at least one task assigned.
   * @param {string} workspaceId 
   * @param {string} userId 
   */
  async findByWorkspaceAndUser(workspaceId, userId) {
    try {
      return prisma.project.findMany({
        where: {
          workspaceId,
          tasks: {
            some: {
              assigneeIds: {
                has: userId
              }
            }
          }
        },
        include: {
          _count: {
            select: { tasks: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error("Error in Project.findByWorkspaceAndUser:", error);
      throw error;
    }
  },

  /**
   * Finds a single project by its ID, ensuring it belongs to the specified workspace.
   * @param {string} projectId - The ID of the project to find.
   * @param {string} workspaceId - The ID of the workspace the project must belong to.
   * @returns {Promise<object|null>} The project object if found and belongs to the workspace, otherwise null.
   */
  async findByIdAndWorkspace(projectId, workspaceId) {
    try {
      return prisma.project.findFirst({
        where: {
          // Both conditions must be met
          id: projectId,
          workspaceId: workspaceId,
        },
      });
    } catch (error) {
      console.error("Error in Project.findByIdAndWorkspace:", error);
      throw error;
    }
  },

  /**
   * Updates an existing project. (NEW FUNCTION)
   * @param {string} projectId - The ID of the project to update.
   * @param {object} updateData - The fields to update (e.g., { name, description }).
   * @returns {Promise<object>} The updated project object.
   */
  async update(projectId, updateData) {
    try {
      return prisma.project.update({
        where: { id: projectId },
        data: updateData, // e.g., { name: 'New Name', description: 'New Desc' }
      });
    } catch (error) {
      console.error("Error in Project.update:", error);
      throw error;
    }
  },

  /**
   * Deletes a project from the database. (NEW FUNCTION)
   * Prisma's cascade delete (defined in schema) should handle related tasks/comments.
   * @param {string} projectId - The ID of the project to delete.
   * @returns {Promise<void>}
   */
  async delete(projectId) {
    try {
      // Note: If your Prisma schema has 'onDelete: Cascade' for tasks and comments
      // related to a project, they will be deleted automatically.
      // If not, you must delete them manually here first (in a transaction).
      return prisma.project.delete({
        where: { id: projectId },
      });
    } catch (error) {
      console.error("Error in Project.delete:", error);
      throw error;
    }
  },

  /**
   * Counts the number of projects in a workspace.
   * @param {string} workspaceId
   * @returns {Promise<number>}
   */
  async countByWorkspace(workspaceId) {
    try {
      return await prisma.project.count({
        where: { workspaceId },
      });
    } catch (error) {
      console.error("Error in Project.countByWorkspace:", error);
      throw error;
    }
  },
};

module.exports = Project;

