const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
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
        throw new Error('Only admins can invite users.');
      }

      const existingUser = await prisma.user.findUnique({ where: { email: inviteeEmail } });
      if (existingUser) {
        const isAlreadyMember = await prisma.workspaceMember.findFirst({
          where: { userId: existingUser.id, workspaceId },
        });
        if (isAlreadyMember) {
          throw new Error('User is already a member of this workspace.');
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
          throw new Error('Invalid or expired invitation token.');
        }

        const existingUser = await tx.user.findUnique({
          where: { email: invitation.email },
        });

        if (existingUser) {
          throw new Error('An account with this email already exists.');
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
   * Finds all workspaces a specific user is a member of. (NEW FUNCTION)
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array>} A list of workspace memberships, including workspace details and user's role.
   */
  async findUserWorkspaces(userId) {
    try {
      // Find all entries in WorkspaceMember table for the given userId
      const memberships = await prisma.workspaceMember.findMany({
        where: { userId: userId },
        // Use 'include' to automatically fetch the related Workspace data
        include: {
          workspace: { // Fetch details of the workspace itself
            select: { // Select only the necessary workspace fields
              id: true,
              name: true,
              createdAt: true,
              // Optionally include member count later: _count: { select: { members: true } }
            }
          }
        },
        // Optionally order the results
        orderBy: {
            workspace: {
                createdAt: 'asc' // Show oldest workspaces first
            }
        }
      });
      // The result will be an array like:
      // [
      //   { userId: '...', workspaceId: 'ws1', role: 'ADMIN', workspace: { id: 'ws1', name: 'My First WS' } },
      //   { userId: '...', workspaceId: 'ws2', role: 'TEAM_MEMBER', workspace: { id: 'ws2', name: 'Another WS' } }
      // ]
      return memberships;
    } catch (error) {
      console.error("Error finding user workspaces:", error);
      throw error;
    }
  },

};

module.exports = Workspace;