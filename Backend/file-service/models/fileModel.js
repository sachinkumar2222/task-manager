const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  // This field stores the actual file binary data
  data: {
    type: Buffer,
    required: true,
  },
  taskId: {
    type: String,
    required: true,
    index: true, // Index for faster queries by task
  },
  workspaceId: {
    type: String,
    required: true,
  },
  uploaderId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('File', FileSchema);