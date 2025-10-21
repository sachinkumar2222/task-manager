const Workspace = require('../models/workspaceModel');
const crypto = require('crypto'); // Required for creating invite tokens

/**
 * Creates a new workspace.
 */
exports.createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    const adminId = req.userData.userId;

    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required.' });
    }

    const newWorkspace = await Workspace.create(name, adminId);

    res.status(201).json({
      message: 'Workspace created successfully!',
      workspace: newWorkspace,
    });

  } catch (error) {
    console.error('Create Workspace Error:', error);
    res.status(500).json({ message: 'Internal server error while creating workspace.' });
  }
};

/**
 * Invites a new user to the workspace.
 */
exports.inviteUser = async (req, res) => {
  try {
    // Extract user email and workspace ID from the request
    const { email } = req.body;
    const { workspaceId } = req.params;
    // Extract inviter’s ID from the JWT
    const inviterId = req.userData.userId;

    if (!email) {
      return res.status(400).json({ message: 'Email is required to send an invitation.' });
    }

    // Call the model function to create the invitation in the database
    const invitation = await Workspace.createInvitation(workspaceId, inviterId, email);

    // For now: we won’t actually send an email.
    // Instead, we’ll log an “invite link” in the console for testing purposes.
    console.log('--- INVITATION CREATED ---');
    console.log(`Invite for: ${email}`);
    console.log(`Workspace ID: ${workspaceId}`);
    console.log(`Invite Token: ${invitation.token}`);
    console.log(`Accept Link (for testing): http://localhost:3000/accept-invite?token=${invitation.token}`);
    console.log('--------------------------');

    res.status(200).json({ message: 'Invitation has been sent successfully.' });

  } catch (error) {
    // If the model throws a specific error message (like "Only admins can invite"), show it
    if (
      error.message === 'Only admins can invite users.' ||
      error.message === 'User is already a member of this workspace.'
    ) {
      return res.status(403).json({ message: error.message });
    }

    console.error('Invite User Error:', error);
    res.status(500).json({ message: 'Internal server error while sending invitation.' });
  }
};
