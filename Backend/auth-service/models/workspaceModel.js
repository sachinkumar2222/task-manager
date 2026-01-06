const { prisma } = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Import Prisma namespace for error handling
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const Workspace = {
  /**
   * Creates a new workspace and assigns its creator as the ADMIN.
   */
  async create(name, adminId) {
    try {
      return await prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: { name },
        });
        await tx.workspaceMember.create({
          data: {
            workspaceId: workspace.id,
            userId: adminId,
            role: 'ADMIN',
          },
        });
        return workspace;
      });
    } catch (error) {
      console.error("Error creating workspace:", error);
      throw error;
    }
  },

  /**
   * Creates an invitation for a new user to join a workspace.
   */
  async createInvitation(workspaceId, inviterId, inviteeEmail) {
    try {
      const inviterMembership = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: inviterId, workspaceId } },
      });

      if (!inviterMembership || inviterMembership.role !== 'ADMIN') {
        throw new Error('Forbidden: Only admins can invite users.');
      }

      const existingUser = await prisma.user.findUnique({ where: { email: inviteeEmail } });
      if (existingUser) {
        const isAlreadyMember = await prisma.workspaceMember.findFirst({
          where: { userId: existingUser.id, workspaceId },
        });
        if (isAlreadyMember) {
          throw new Error('Conflict: User is already a member of this workspace.');
        }
      }

      const invitationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      return await prisma.invitation.create({
        data: {
          email: inviteeEmail,
          token: invitationToken,
          workspaceId,
          expiresAt,
        },
      });
    } catch (error) {
      console.error("Error creating invitation:", error);
      throw error;
    }
  },

  /**
   * Accepts an invitation, creates a new user, and adds them to the workspace.
   */
  async acceptInvitation(token, fullName, password) {
    try {
      return await prisma.$transaction(async (tx) => {
        const invitation = await tx.invitation.findUnique({
          where: { token },
        });

        if (!invitation || invitation.expiresAt < new Date()) {
          throw new Error('Not Found: Invalid or expired invitation token.');
        }

        const existingUser = await tx.user.findUnique({
          where: { email: invitation.email },
        });

        if (existingUser) {
          throw new Error('Conflict: An account with this email already exists.');
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const newUser = await tx.user.create({
          data: {
            fullName,
            email: invitation.email,
            passwordHash,
          },
          select: { id: true, fullName: true, email: true, createdAt: true },
        });

        await tx.workspaceMember.create({
          data: {
            workspaceId: invitation.workspaceId,
            userId: newUser.id,
            role: 'TEAM_MEMBER',
          },
        });

        await tx.invitation.delete({
          where: { id: invitation.id },
        });

        return { user: newUser };
      });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      throw error;
    }
  },

  /**
   * Finds all workspaces a specific user is a member of.
   */
  async findUserWorkspaces(userId) {
    try {
      const memberships = await prisma.workspaceMember.findMany({
        where: { userId: userId },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              createdAt: true,
            }
          }
        },
        orderBy: {
          workspace: {
            createdAt: 'asc'
          }
        }
      });
      return memberships;
    } catch (error) {
      console.error("Error finding user workspaces:", error);
      throw error;
    }
  },

  /**
   * Updates a workspace's details. (NEWLY ADDED)
   * Only allows ADMINs of the workspace.
   */
  async update(workspaceId, userId, updateData) {
    try {
      // Step 1: Verify the user is an ADMIN of this workspace.
      const membership = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
      });

      if (!membership) {
        throw new Error('Not Found: Workspace not found or user is not a member.');
      }
      if (membership.role !== 'ADMIN') {
        throw new Error('Forbidden: Only admins can update the workspace.');
      }

      // Step 2: Update the workspace.
      const updatedWorkspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: updateData, // e.g., { name: updateData.name }
      });

      return updatedWorkspace;
    } catch (error) {
      console.error("Error updating workspace:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('Not Found: Workspace not found.');
      }
      throw error;
    }
  },


  async delete(workspaceId, userId) {
    try {
      // Step 1: Verify the user is an ADMIN of this workspace.
      const membership = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
      });

      if (!membership) {
        throw new Error('Not Found: Workspace not found or user is not a member.');
      }
      if (membership.role !== 'ADMIN') {
        throw new Error('Forbidden: Only admins can delete the workspace.');
      }

      // Step 2: Delete the workspace. (onDelete: Cascade handles related records)
      await prisma.workspace.delete({
        where: { id: workspaceId },
      });

    } catch (error) {
      console.error("Error deleting workspace:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('Not Found: Workspace not found.');
      }
      throw error;
    }
  },

  /**
   * Gets the member count for a specific workspace, after verifying user membership. (NEWLY ADDED)
   * @param {string} workspaceId - The ID of the workspace.
   * @param {string} userId - The ID of the user requesting the count.
   * @returns {Promise<object>} An object containing the count, e.g., { count: 5 }.
   */
  async getMemberCount(workspaceId, userId) {
    try {
      // Step 1: Verify the user is a member of this workspace.
      const membership = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
      });

      if (!membership) {
        // If user is not a member, they are not allowed to get the count
        throw new Error('Forbidden: You are not a member of this workspace.');
      }

      // Step 2: Get the count of all members in that workspace.
      const count = await prisma.workspaceMember.count({
        where: { workspaceId: workspaceId },
      });

      return { count };
    } catch (error) {
      console.error("Error getting member count:", error);
      throw error;
    }
  },

  async getMembers(workspaceId, requestingUserId) {
    try {
      // Step 1: Verify the requesting user is a member of this workspace.
      const membership = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: requestingUserId, workspaceId } },
      });

      if (!membership) {
        throw new Error('Forbidden: You are not a member of this workspace.');
      }

      // Step 2: Fetch all members of the workspace, including user details.
      const members = await prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true, // Fetch profile image
            },
          },
        },
        orderBy: {
          role: 'asc' // Show ADMINs first
        }
      });

      // Step 3: Format the data for the frontend.
      return members.map(m => ({
        userId: m.userId,
        role: m.role,
        fullName: m.user.fullName,
        email: m.user.email,
        profileImage: m.user.profileImage, // Include in response
      }));

    } catch (error) {
      console.error("Error getting workspace members:", error);
      throw error;
    }
  },

};

module.exports = Workspace;

