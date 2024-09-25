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

  getUserRole: async (userId) => {
    const query = `SELECT role FROM users WHERE id = ?`;
    const values = [userId];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          console.error("Database query error:", err);
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  // Fetch admin email for the given company
  getAdminEmail: async (userId) => {
    const query = `
      SELECT email FROM users 
      WHERE role = 'admin' 
      LIMIT 1`;
    const values = [userId];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          console.error("Database query error:", err);
          return reject(err);
        }
        resolve(result);
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

  getCompanyEmail: async (userId) => {
    const query = `
      SELECT 
        u1.email AS company_email,
        u1.id AS company_user_id,
        u1.name AS company_user_name,
        u2.id AS current_user_id,
        u2.name AS current_user_name
      FROM users u1
      JOIN users u2
        ON u1.company_id = u2.company_id
      WHERE u2.id = ?
        AND u1.role = 'company'
        AND u1.id != u2.id LIMIT 100
    `;
    const values = [userId]; // Pass userId

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

  // Get email by user ID
  getEmail: async (userId) => {
    const query = `SELECT email FROM users WHERE id = ?`;
    const values = [userId]; // Pass as array for parameterized query

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
