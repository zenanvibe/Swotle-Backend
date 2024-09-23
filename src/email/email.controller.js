const mailAuthenticator = require("../middleware/mailAuthenticator");

const sendEmail = async (req, res) => {
  const { to, subject, content } = req.body;

  if (!to || !subject || !content) {
    return res.status(400).json({
      message: "Missing required fields: to, subject, and content",
    });
  }

  try {
    // Use await to handle the asynchronous mail sending
    const result = await mailAuthenticator(to, subject, content);

    return res.status(200).json({
      message: "Email sent successfully",
      response: result, // return email response info
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send email",
      error: error.message,
    });
  }
};

module.exports = {
  sendEmail,
};
