const express = require("express");
const router = express.Router();
const CommentController = require("./comment.controller");
const authenticateJwt = require("../middleware/authenticateJWT");

// POST route to add a new comment
router.post("/add",authenticateJwt, CommentController.addComment);

// GET route to retrieve all comments
router.get("/getcomments/:userId",authenticateJwt,CommentController.getCommentsByUser)
router.get("/getcomments",authenticateJwt,CommentController.getComments);

module.exports = router;
