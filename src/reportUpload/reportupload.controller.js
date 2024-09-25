"use strict";
const db = require("../../config/db.config");
const logger = require("../../logger"); // Assuming you have a logger configured

const Auth = {
  uploadReport: async (req, res) => {
    const { id } = req.body; // User ID from the request body
    const file = req.file; // The uploaded file
    console.log(file)
    try {
      if (!file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      // Construct the file URL
      const fullpath = file.location

      // Update the user's report URL and set status to completed
      const query = `UPDATE users SET report_url = ?, report_status = 'completed' WHERE id = ?`;
      const values = [fullpath, id];

      db.query(query, values, (err, result) => {
        if (err) {
          logger.error(`Error updating user report: ${err.message}`);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        logger.info(`Report uploaded successfully for User ID: ${id}`);
        res.status(200).json({
          message: "Report uploaded successfully.",
          reportUrl: fullpath,
        });
      });
    } catch (error) {
      logger.error(`Error in report upload: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = Auth;
