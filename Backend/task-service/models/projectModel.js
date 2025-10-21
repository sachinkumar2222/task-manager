const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const Project = {
  async create(data) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        workspaceId: data.workspaceId,
        creatorId: data.creatorId,
      },
    });
  },

  async findByWorkspace(workspaceId) {
    return prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  },
};

module.exports = Project;
