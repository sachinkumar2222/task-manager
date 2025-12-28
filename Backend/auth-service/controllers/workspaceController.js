const Workspace = require("../models/workspaceModel");
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
    const { email } = req.body;
    const { workspaceId } = req.params;
    const inviterId = req.userData.userId;

    if (!email) {
      return res.status(400).json({ message: 'Email is required to send an invitation.' });
    }

    const invitation = await Workspace.createInvitation(workspaceId, inviterId, email);

    // For Testing/Dev only - log the token? 
    // Ideally this goes to an email service.
    // For now we do NOT log it to console to keep it clean, user specified removal.
    // console.log(`[DEV] Invite Token: ${invitation.token}`);

    res.status(200).json({ message: 'Invitation has been sent successfully.' });

  } catch (error) {
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

/**
 * Fetches all workspaces the logged-in user is a member of.
 */
exports.getUserWorkspaces = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const workspaces = await Workspace.findUserWorkspaces(userId);
    res.status(200).json(workspaces);
  } catch (error) {
    console.error('Get User Workspaces Error:', error);
    res.status(500).json({ message: 'Internal server error while fetching workspaces.' });
  }
};

/**
 * Updates a specific workspace's details (e.g., name).
 * Only allows ADMINs of that workspace.
 */
exports.updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name } = req.body; // Data to update
    const userId = req.userData.userId; // User performing the action

    if (!name) {
      return res.status(400).json({ message: 'New workspace name is required.' });
    }

    // Call the model function to update the workspace
    // The model function MUST verify if the userId is an ADMIN for this workspaceId
    const updatedWorkspace = await Workspace.update(workspaceId, userId, { name });

    res.status(200).json({
      message: 'Workspace updated successfully!',
      workspace: updatedWorkspace
    });

  } catch (error) {
    // Handle specific errors like 'Forbidden' or 'Not Found' from the model
    if (error.message === 'Forbidden: Only admins can update the workspace.' || error.message === 'Workspace not found.') {
      return res.status(403).json({ message: error.message });
    }
    console.error('Update Workspace Error:', error);
    res.status(500).json({ message: 'Internal server error while updating workspace.' });
  }
};

/**
 * Deletes a specific workspace.
 * Only allows ADMINs of that workspace.
 */
exports.deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.userData.userId; // User performing the action

    // Call the model function to delete the workspace
    // The model function MUST verify if the userId is an ADMIN for this workspaceId
    await Workspace.delete(workspaceId, userId);

    // Send a success response with no content
    res.status(204).send();

  } catch (error) {
    // Handle specific errors like 'Forbidden' or 'Not Found' from the model
    if (error.message === 'Forbidden: Only admins can delete the workspace.' || error.message === 'Workspace not found.') {
      return res.status(403).json({ message: error.message });
    }
    console.error('Delete Workspace Error:', error);
    res.status(500).json({ message: 'Internal server error while deleting workspace.' });
  }
};

/**
 * Fetches the member count for a specific workspace. (NEW FUNCTION)
 * Ensures the requesting user is a member of that workspace.
 */
exports.getMemberCount = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.userData.userId; // User performing the action

    // Call the model function. It will check for membership and return count.
    const result = await Workspace.getMemberCount(workspaceId, userId);

    res.status(200).json(result); // Should return { count: 5 }

  } catch (error) {
    // Handle specific errors like 'Forbidden'
    if (error.message === 'Forbidden: You are not a member of this workspace.') {
      return res.status(403).json({ message: error.message });
    }
    console.error('Get Member Count Error:', error);
    res.status(500).json({ message: 'Internal server error while fetching member count.' });
  }
};

exports.getWorkspaceMembers = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.userData.userId; // User performing the action

    // Call the model function
    const members = await Workspace.getMembers(workspaceId, userId);

    res.status(200).json(members);

  } catch (error) {
    // Handle specific errors
    if (error.message.startsWith('Forbidden')) {
      return res.status(403).json({ message: error.message });
    }
    console.error('Get Workspace Members Error:', error);
    res.status(500).json({ message: 'Internal server error while fetching members.' });
  }
};

