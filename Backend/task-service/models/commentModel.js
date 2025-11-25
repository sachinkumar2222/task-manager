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
  
  async findById(commentId) {
    return prisma.comment.findUnique({
      where: { id: commentId }
    });
  },

  async delete(commentId) {
    return prisma.comment.delete({
      where: { id: commentId }
    });
  }
};

module.exports = Comment;
