const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const Workspace = {
  /**
   * Creates a new workspace and assigns its creator as the ADMIN.
   * This is performed in a transaction to ensure data integrity.
   * @param {string} name - The name for the new workspace.
   * @param {string} adminId - The ID of the user creating the workspace.
   * @returns {Promise<object>} The new workspace object.
   */
  async create(name, adminId) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Step 1: Create the new workspace.
        const workspace = await tx.workspace.create({
          data: { name },
        });

        // Step 2: Make the creator user the ADMIN of this workspace.
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
   * @param {string} workspaceId - The ID of the workspace for the invitation.
   * @param {string} inviterId - The ID of the user sending the invitation.
   * @param {string} inviteeEmail - The email of the user being invited.
   * @returns {Promise<object>} The new invitation object.
   */
  async createInvitation(workspaceId, inviterId, inviteeEmail) {
    try {
      // Security Check 1: Is the inviter an ADMIN of this workspace?
      const inviterMembership = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: inviterId, workspaceId } },
      });

      if (!inviterMembership || inviterMembership.role !== 'ADMIN') {
        throw new Error('Only admins can invite users.');
      }

      // Security Check 2: Is the invited user already a member?
      const existingUser = await prisma.user.findUnique({ where: { email: inviteeEmail } });
      if (existingUser) {
        const isAlreadyMember = await prisma.workspaceMember.findFirst({
          where: { userId: existingUser.id, workspaceId }, // FIXED: was existing.id
        });
        if (isAlreadyMember) {
          throw new Error('User is already a member of this workspace.');
        }
      }

      // Step 1: Generate a unique, random token for the invitation link.
      const invitationToken = crypto.randomBytes(32).toString('hex');

      // Step 2: Set an expiration date for the invitation (e.g., 7 days).
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Step 3: Create the invitation record in the database.
      return await prisma.invitation.create({
        data: {
          email: inviteeEmail,
          token: invitationToken,
          workspaceId,
          expiresAt,
        },
      });
    } catch (error) { // FIXED: Was missing curly braces
      console.error("Error creating invitation:", error);
      throw error;
    }
  },

  /**
   * Accepts an invitation, creates a new user, and adds them to the workspace.
   * @param {string} token - The unique invitation token.
   * @param {string} fullName - The full name of the new user.
   * @param {string} password - The plain-text password for the new user.
   * @returns {Promise<object>} An object containing the new user's details.
   */
  async acceptInvitation(token, fullName, password) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Step 1: Find a valid invitation using the token.
        const invitation = await tx.invitation.findUnique({
          where: { token },
        });

        // If the token doesn't exist or has expired, throw an error.
        if (!invitation || invitation.expiresAt < new Date()) {
          throw new Error('Invalid or expired invitation token.');
        }

        // FIXED: Check if a user with this email already exists before creating a new one.
        const existingUser = await tx.user.findUnique({
          where: { email: invitation.email },
        });

        if (existingUser) {
          throw new Error('An account with this email already exists.');
        }

        // Step 2: Create the new user.
        const passwordHash = await bcrypt.hash(password, 12);
        const newUser = await tx.user.create({
          data: {
            fullName,
            email: invitation.email,
            passwordHash,
          },
          // Select only the safe fields to return.
          select: { id: true, fullName: true, email: true, createdAt: true },
        });

        // Step 3: Add the new user to the workspace as a TEAM_MEMBER.
        await tx.workspaceMember.create({
          data: {
            workspaceId: invitation.workspaceId,
            userId: newUser.id,
            role: 'TEAM_MEMBER',
          },
        });

        // Step 4: Delete the invitation so it cannot be used again.
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
};

module.exports = Workspace;

