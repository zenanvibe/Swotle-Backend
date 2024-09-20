const cardModel = require("./card.model");
const logger = require("../../logger");
const jwt = require("jsonwebtoken");
const mailAuthenticator = require("../middleware/mailAuthenticator");

const userController = {
  getUserCardData: async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id);
    try {
      const userCardData = await cardModel.getUserCardData(userId);
      res.status(200).json(userCardData);
    } catch (error) {
      console.error("Error fetching user card data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getadminTotalData: async (req, res) => {
    const { companyId } = req.params;
    const companyIdInt = parseInt(companyId);
    try {
      const companies = await cardModel.getadminTotalData(companyIdInt);
      res.status(200).json(companies);
    } catch (error) {
      logger.error(error);
    }
  },
  getAdminMasterCard: async (req, res) => {
    try {
      const companies = await cardModel.getAdminMasterCard();
      res.status(200).json(companies);
    } catch (error) {
      logger.error(error);
    }
  },
};

module.exports = userController;
