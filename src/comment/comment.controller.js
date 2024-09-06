const CommentModel = require("./comment.models");

const commentController = {
  // Add comment by admin or top management about a user
  addComment: async (req, res) => {
    const { comment, userId, authorId, parentCommentId } = req.body;
    // const authorId = req.user.id; // Assuming you get the authenticated user's ID from the JWT

    try {
      if (!comment || !userId) {
        return res
          .status(400)
          .json({ message: "Comment and userId are required" });
      }

      const newComment = await CommentModel.addComment(
        comment,
        userId,
        authorId,
        parentCommentId
      );
      res.status(201).json(newComment);
    } catch (error) {
      console.error(`Error adding comment: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Get comments about a specific user, including replies
  getComments: async (req, res) => {
    const { userId } = req.query; // Get the userId of the user being commented on

    try {
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const comments = await CommentModel.getComments(userId);
      res.status(200).json(comments);
    } catch (error) {
      console.error(`Error fetching comments: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = commentController;
