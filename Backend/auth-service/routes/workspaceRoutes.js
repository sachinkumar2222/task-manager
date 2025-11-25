const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const checkAuth = require('../middleware/checkAuth');

// --- Protected Routes ---

// GET /api/workspaces/mine -> Fetch all workspaces for the logged-in user
router.get('/mine', checkAuth, workspaceController.getUserWorkspaces);

// POST /api/workspaces -> Create a new workspace
router.post('/', checkAuth, workspaceController.createWorkspace);

// POST /api/workspaces/:workspaceId/invite -> Invite a user to a specific workspace
router.post('/:workspaceId/invite', checkAuth, workspaceController.inviteUser);

// PATCH /api/workspaces/:workspaceId -> Update a specific workspace
router.patch('/:workspaceId', checkAuth, workspaceController.updateWorkspace); 

// DELETE /api/workspaces/:workspaceId -> Delete a specific workspace
router.delete('/:workspaceId', checkAuth, workspaceController.deleteWorkspace);

// GET /api/workspaces/:workspaceId/members/count -> Get the member count
router.get('/:workspaceId/members/count', checkAuth, workspaceController.getMemberCount);

// --- YEH NAYA ROUTE HAI (For Task Assignment) ---
// GET /api/workspaces/:workspaceId/members -> Get list of all members (id, name, email)
router.get('/:workspaceId/members', checkAuth, workspaceController.getWorkspaceMembers);


module.exports = router;