const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const logger = require("../../logger.js");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// Make the mailAuthenticator return a Promise
function mailAuthenticator(toMail, subject, content, isHtml = false) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: toMail,
    subject: subject,
    ...(isHtml ? { html: content } : { text: content }),
  };

  // Return a Promise
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.warn("Error sending email: ", error);
        reject(error); // reject the promise if there's an error
      } else {
        logger.info("Email sent: ", info);
        resolve(info.response); // resolve the promise when email is sent
      }
    });
  });
}

module.exports = mailAuthenticator;
