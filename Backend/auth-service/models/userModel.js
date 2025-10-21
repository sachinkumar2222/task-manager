const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const User = {

  async create(userData) {
    try {
      const newUser = await prisma.user.create({
        data: userData,
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
        },
      });
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async findByEmail(email) {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  },
};

module.exports = User;

