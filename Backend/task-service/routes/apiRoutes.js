const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');

// Import controllers
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const commentController = require('../controllers/commentController');


// Project Routes
router.post('/projects', checkAuth, projectController.createProject);
router.get('/projects', checkAuth, projectController.getProjectsByWorkspace);

// Task Routes
router.post('/tasks', checkAuth, taskController.createTask);
router.patch('/tasks/:taskId', checkAuth, taskController.updateTask);
// --- CORRECTED FUNCTION NAME BELOW ---
// Changed getTasksByProject to getTasksForProject to match the controller export
router.get('/projects/:projectId/tasks', checkAuth, taskController.getTasksForProject); 
router.delete('/tasks/:taskId', checkAuth, taskController.deleteTask); // Added delete route based on controller

// Comment Routes
router.post('/tasks/:taskId/comments', checkAuth, commentController.createComment);
router.get('/tasks/:taskId/comments', checkAuth, commentController.getCommentsByTask);


module.exports = router;

