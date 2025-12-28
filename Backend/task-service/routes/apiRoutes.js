const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');

// Import controllers
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const commentController = require('../controllers/commentController');


// --- Project Routes ---
router.post('/projects', checkAuth, projectController.createProject);
router.get('/projects/stats', checkAuth, projectController.getWorkspaceStats); // Register Stats Route
router.get('/projects', checkAuth, projectController.getProjectsByWorkspace);
router.get('/projects/:projectId', checkAuth, projectController.getProjectById);

// --- YEH NAYE ROUTES HAIN ---
// Update a project
router.patch('/projects/:projectId', checkAuth, projectController.updateProject);
router.delete('/projects/:projectId', checkAuth, projectController.deleteProject);


// --- Task Routes ---
router.post('/tasks/check-deadlines', checkAuth, taskController.checkDeadlines); // Trigger Deadline Check
router.post('/tasks', checkAuth, taskController.createTask);
router.patch('/tasks/:taskId', checkAuth, taskController.updateTask);
router.get('/tasks/user', checkAuth, taskController.getUserTasks); // New Route for User Tasks
router.get('/projects/:projectId/tasks', checkAuth, taskController.getTasksForProject);
router.delete('/tasks/:taskId', checkAuth, taskController.deleteTask);

// --- Comment Routes ---
router.post('/tasks/:taskId/comments', checkAuth, commentController.createComment);
router.get('/tasks/:taskId/comments', checkAuth, commentController.getCommentsByTask);
router.delete('/comments/:commentId', checkAuth, commentController.deleteComment);


// --- Subtask Routes ---
const subtaskController = require('../controllers/subtaskController');
router.post('/tasks/:taskId/subtasks', checkAuth, subtaskController.createSubtask);
router.get('/tasks/:taskId/subtasks', checkAuth, subtaskController.getSubtasksByTask);
router.patch('/subtasks/:subtaskId', checkAuth, subtaskController.updateSubtask);
router.delete('/subtasks/:subtaskId', checkAuth, subtaskController.deleteSubtask);


module.exports = router;

