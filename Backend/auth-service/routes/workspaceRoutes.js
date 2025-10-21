const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const checkAuth = require('../middleware/checkAuth');

// --- Protected Routes ---
// In sabhi routes ke liye user ka logged-in hona zaroori hai.

// POST /api/workspaces -> Naya workspace banane ke liye.
router.post('/', checkAuth, workspaceController.createWorkspace);

// --- YEH NAYA ROUTE HAI ---
// POST /api/workspaces/:workspaceId/invite -> Ek naye user ko invite karne ke liye.
// Yeh route ek specific workspace ID lega aur check karega ki request karne wala user admin hai ya nahi.
router.post('/:workspaceId/invite', checkAuth, workspaceController.inviteUser);

// Future mein add karne ke liye kuch aur routes:
// router.get('/', checkAuth, workspaceController.getUserWorkspaces);

module.exports = router;

