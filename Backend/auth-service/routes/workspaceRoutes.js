// auth-service/routes/workspaceRoutes.js
const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const checkAuth = require('../middleware/checkAuth');

// --- Protected Routes ---

// GET /api/workspaces/mine -> Logged-in user ke saare workspaces ki list fetch karega (NEW ROUTE)
router.get('/mine', checkAuth, workspaceController.getUserWorkspaces);

// POST /api/workspaces -> Naya workspace banane ke liye.
router.post('/', checkAuth, workspaceController.createWorkspace);

// POST /api/workspaces/:workspaceId/invite -> Ek naye user ko invite karne ke liye.
router.post('/:workspaceId/invite', checkAuth, workspaceController.inviteUser);


module.exports = router;