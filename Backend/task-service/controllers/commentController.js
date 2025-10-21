const Comment = require('../models/commentModel');

exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { taskId } = req.params;
    const { userId } = req.userData;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required.' });
    }

    const newComment = await Comment.create({
      content,
      taskId,
      authorId: userId,
    });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment.', error: error.message });
  }
};

exports.getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.findByTask(taskId);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments.', error: error.message });
  }
};
