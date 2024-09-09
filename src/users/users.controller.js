const userModel = require("./users.model");
const logger = require("../../logger");
const jwt = require("jsonwebtoken");
const mailAuthenticator = require("../middleware/mailAuthenticator");

const userController = {
  getUserInfo: async (req, res) => {
    const userId = req.params.userId;
    try {
      const users = await userModel.getUserInfo(userId);
      res.status(200).json(users);
    } catch (error) {
      logger.error(error);
    }
  },
};

module.exports = userController;
