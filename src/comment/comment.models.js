const db = require("../../config/db.config");

const CommentModel = {
  // Add a comment or reply to the database
  addComment: async (comment, userId, authorId, parentCommentId = null) => {
    const query =
      "INSERT INTO comments (comment, user_id, author_id, parent_comment_id) VALUES (?, ?, ?, ?)";
    const values = [comment, userId, authorId, parentCommentId];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) return reject(err);
        resolve({
          id: result.insertId,
          comment,
          userId,
          authorId,
          parentCommentId,
        });
      });
    });
  },

  // Get all comments (and their replies) about a specific user
  getComments: async (user_id) => {
    const query = `
      SELECT c.*, u.name AS author_name 
      FROM comments c 
      JOIN users u ON c.author_id = u.id 
      WHERE c.user_id = ?
      ORDER BY c.created_at ASC
    `;
    const values = user_id; // Pass as array for parameterized query

    // Debugging log to confirm values

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          console.error("Database query error:", err); // Log error for debugging
          return reject(err);
        }
        resolve(result); // Return the result on success
      });
    });
  },
};

module.exports = CommentModel;
