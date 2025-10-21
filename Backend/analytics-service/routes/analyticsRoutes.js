const express = require('express');
const router = express.Router();

// Import the controller that contains the business logic
const analyticsController = require('../controllers/analyticsController');

// Import our two different security middlewares
const checkAuth = require('../middleware/checkAuth'); // Verifies a user's JWT
const checkInternalApiKey = require('../middleware/checkInternalApiKey'); // Verifies a server-to-server secret key

// --- Internal Route ---
// POST /api/analytics/events
// This route is used by other microservices (like task-service) to send us events.
// It is protected by a simple secret API key to ensure that only our own services can call it.
router.post('/events', checkInternalApiKey, analyticsController.logEvent);


// --- User-Facing Route ---
// GET /api/analytics/dashboard
// This route is used by the frontend to fetch statistics for the user's dashboard.
// It is protected by the user's JWT to ensure a user can only see stats for their own workspace.
router.get('/dashboard', checkAuth, analyticsController.getDashboardStats);


// Export the router to be used in server.js
module.exports = router;

