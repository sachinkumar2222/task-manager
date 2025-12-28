const { prisma } = require('../config/prismaClient');

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

  async findById(id) {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error("Error finding user by id:", error);
      throw error;
    }
  },

  async update(userId, updateData) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
          createdAt: true,
        },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },
};

module.exports = User;

