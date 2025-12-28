const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const checkAuth = require('../middleware/checkAuth');
const multer = require('multer');

// Configure Multer to store file in memory (so we can save to MongoDB)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limit to 10MB to be safe
});

// --- Routes ---

// POST /upload -> Upload a file
// Uses 'upload.single("file")' middleware to process the file
router.post('/upload', checkAuth, upload.single('file'), fileController.uploadFile);

// GET /task/:taskId -> Get list of files for a task
router.get('/task/:taskId', checkAuth, fileController.getFilesForTask);

// GET /download/:fileId -> Download/View a specific file
// Note: This might be accessed via <img> tags, so we might need token in query param in future,
// but for now we keep it protected via header.
router.get('/download/:fileId', checkAuth, fileController.downloadFile);

module.exports = router;