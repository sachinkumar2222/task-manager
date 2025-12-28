const File = require('../models/fileModel');

/**
 * Uploads a file to MongoDB.
 * Expects a file in req.file (processed by Multer).
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { taskId } = req.body;
    const { userId, workspaceId } = req.userData;

    if (!taskId || !workspaceId) {
      return res.status(400).json({ message: 'Task ID and Workspace ID are required' });
    }

    // Create new File document
    const newFile = new File({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer, // Multer provides the buffer here
      taskId,
      workspaceId,
      uploaderId: userId,
    });

    await newFile.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: newFile._id,
        filename: newFile.filename,
        size: newFile.size,
        createdAt: newFile.createdAt
      }
    });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: 'Internal server error during upload' });
  }
};

/**
 * Gets a list of files for a specific task.
 * Returns metadata only (not the file content) to keep it light.
 */
exports.getFilesForTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Select everything EXCEPT the heavy 'data' field
    const files = await File.find({ taskId }).select('-data');

    res.status(200).json(files);
  } catch (error) {
    console.error("Get Files Error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Downloads (streams) a specific file by ID.
 */
exports.downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set headers to prompt download/display
    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);

    // Send the buffer
    res.send(file.data);

  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};