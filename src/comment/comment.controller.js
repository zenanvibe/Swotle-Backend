const CommentModel = require("./comment.models");
const mailAuthenticator = require("../middleware/mailAuthenticator");

const commentController = {
  // Add comment by admin or top management about a user
  addComment: async (req, res) => {
    const { comment, userId, authorId, parentCommentId } = req.body;

    try {
      if (!comment || !userId) {
        return res
          .status(400)
          .json({ message: "Comment and userId are required" });
      }

      // Add the comment to the database
      const newComment = await CommentModel.addComment(
        comment,
        userId,
        authorId,
        parentCommentId
      );

      // Fetch the company's email and details for the given userId, excluding the current author
      const companyEmailResult = await CommentModel.getCompanyEmail(userId);
      if (!companyEmailResult || companyEmailResult.length === 0) {
        return res.status(404).json({ message: "Company email not found" });
      }

      const companyEmail = companyEmailResult[0].company_email; // Get company email
      const companyUserName = companyEmailResult[0].company_user_name; // Get company user name
      const currentUserName = companyEmailResult[0].current_user_name;

      // Fetch the author's email for the notification
      const authorResult = await CommentModel.getEmail(authorId);
      const authorEmail = authorResult[0].email;

      // Fetch the author's role
      const authorRoleResult = await CommentModel.getUserRole(authorId);
      const authorRole = authorRoleResult[0].role;

      let emailRecipient;
      if (authorRole === "admin") {
        // If author is admin, send email to the company user
        emailRecipient = companyEmail;
      } else {
        // If author is not admin, fetch the admin's email
        const adminEmailResult = await CommentModel.getAdminEmail();
        if (adminEmailResult && adminEmailResult.length > 0) {
          emailRecipient = adminEmailResult[0].email;
        } else {
          return res.status(404).json({ message: "Admin email not found" });
        }
      }

      // Prepare and send the email notification
      const emailSubject = `New Comment for ${currentUserName} - Swotle`;
      const emailContent = `Hello ${companyUserName}, \n\nHope You are Doing good,\nA new comment has been added for your company's employee:\n\n${comment}\n\nFrom: ${authorEmail}`;

      // const emailSent = mailAuthenticator(
      //   emailRecipient,
      //   emailSubject,
      //   emailContent
      // );

      // if (!emailSent) {
      //   console.error("Error sending email notification");
      // }

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

  // comment.controller.js
  // getAdminComments: async (req, res) => {
  //   const { userId } = req.params;
  //   const userIdInt = parseInt(userId);

  //   try {
  //     const comments = await CommentModel.getAdminComments(userIdInt);
  //     if (comments.length === 0) {
  //       return res
  //         .status(404)
  //         .json({ message: "No admin comments found for this user." });
  //     }
  //     res.status(200).json(comments);
  //   } catch (error) {
  //     console.error(
  //       `Error fetching admin comments for user ${userId}: ${error.message}`
  //     );
  //     res.status(500).json({ message: "Internal Server Error" });
  //   }
  // },
  getCommentsByUser: async (req, res) => {
    const { userId } = req.params;
    const userIdInt = parseInt(userId);
    try {
      const comments = await CommentModel.getComments(userIdInt);
      if (comments.length === 0) {
        return res
          .status(404)
          .json({ message: "No comments found for this user." });
      }
      res.status(200).json(comments);
    } catch (error) {
      console.error(
        `Error fetching comments for user ${userId}: ${error.message}`
      );
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = commentController;
