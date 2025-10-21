const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const Task = {
  async create(data) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        creatorId: data.creatorId,
        assigneeId: data.assigneeId,
      },
    });
  },

  async findByProject(projectId) {
    return prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  },
  
  async update(taskId, data) {
    return prisma.task.update({
      where: { id: taskId },
      data,
    });
  },
};

module.exports = Task;
