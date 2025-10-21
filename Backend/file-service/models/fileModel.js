const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const File = {
  /**
   * Ek task se judi saari files ki list fetch karta hai.
   * @param {string} taskId - Jis task ki files dhundni hain uski ID.
   * @returns {Promise<Array>} Files ki ek array.
   */
  async findByTaskId(taskId) {
    return prisma.file.findMany({
      where: { taskId },
      // Sirf zaroori fields hi select karein
      select: {
        id: true,
        fileKey: true,
        fileName: true,
        fileType: true,
        createdAt: true,
        uploaderId: true,
      }
    });
  }
};

module.exports = File;
