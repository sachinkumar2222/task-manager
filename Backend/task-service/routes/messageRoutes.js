const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const checkAuth = require('../middleware/checkAuth');

// All routes here start with /api (mounted in server.js)
// We want /projects/:projectId/messages

router.post('/projects/:projectId/messages', checkAuth, messageController.createMessage);
router.get('/projects/:projectId/messages', checkAuth, messageController.getProjectMessages);
router.delete('/projects/:projectId/messages/:messageId', checkAuth, messageController.deleteMessage);

module.exports = router;
