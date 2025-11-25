const Comment = require('../models/commentModel');
// We might want to send notifications here later

exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { taskId } = req.params;
    const { userId } = req.userData; // User who wrote the comment

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required.' });
    }

    const newComment = await Comment.create({
      content,
      taskId,
      authorId: userId,
    });

    // TODO: Send notification to task assignee if author !== assignee

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: 'Error creating comment.', error: error.message });
  }
};

exports.getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.findByTask(taskId);
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: 'Error fetching comments.', error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId, role } = req.userData;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // Authorization: Allow if user is the Author OR an Admin
    if (comment.authorId !== userId && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own comments.' });
    }

    await Comment.delete(commentId);
    res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};