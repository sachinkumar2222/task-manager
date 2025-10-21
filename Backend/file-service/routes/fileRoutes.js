const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const checkAuth = require('../middleware/checkAuth');

// POST /api/files/upload-url -> File upload karne ke liye ek secure URL generate karta hai
router.post('/upload-url', checkAuth, fileController.generateUploadUrl);

// --- YEH NAYA ROUTE HAI ---
// GET /api/files/task/:taskId -> Ek specific task se judi saari files ki list deta hai
// Yeh route bhi protected hai taaki sirf logged-in user hi ise access kar sakein
router.get('/task/:taskId', checkAuth, fileController.getFilesForTask);

module.exports = router;

