const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const Comment = {
  async create(data) {
    return prisma.comment.create({
      data: {
        content: data.content,
        taskId: data.taskId,
        authorId: data.authorId,
      },
    });
  },

  async findByTask(taskId) {
    return prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
  },
};

module.exports = Comment;
