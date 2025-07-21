const authModel = require("./auth.model");
const logger = require("../../logger");
const jwt = require("jsonwebtoken");
const mailAuthenticator = require("../middleware/mailAuthenticator");
const axios = require("axios");
const crypto = require("crypto");

const userController = {
  signup: async (req, res) => {
    const { name, email, phone, password, company_name, gender } = req.body;

    try {
      // Check if the user already exists
      const userExists = await authModel.checkUserExists(email, phone);
      if (userExists) {
        logger.warn(
          `User with the same email or phone already exists. ${email}, ${phone}`
        );
        return res.status(400).json({
          message: "User with the same email or phone already exists.",
        });
      }

      // Check if the company exists or create a new one
      const company_id = await authModel.findOrCreateCompany(company_name);

      // Create a new user
      const {
        userId,
        email: createdEmail,
        name: createdName,
      } = await authModel.createUser(
        name,
        email,
        phone,
        password,
        gender,
        company_id
      );

      // Generate JWT token
      const role = "user";
      const token = authModel.generateJWT(
        userId,
        createdEmail,
        createdName,
        role
      );

      logger.info(`User signed up successfully. User ID: ${userId}`);

      // Send a welcome email using axios
      const emailPayload = {
        to: email, // Send to the email the user signed up with
        subject: "Welcome to Swotle!",
        content: `Hi ${name},\n\nThank you for signing up with Swotle. We are excited to have you on board!`,
      };

      // Send the request
      // await axios.post(
      //   "http://localhost:5000/api/v2/email/send-email",
      //   emailPayload,
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );

      // Respond with success
      res.status(201).json({ userId, token, company_id });
    } catch (error) {
      console.log(error);
      logger.error(`Error signing up user: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  employeeSignup: async (req, res) => {
    const {
      name,
      email,
      phone,
      company_id,
      gender,
      username,
      dateofsubmission,
    } = req.body;
    const filePath = req.file ? req.file.path : null; // Ensure this captures the file path
    try {
      // Check if the user already exists
      const userExists = await authModel.checkUserExists(email, phone);
      if (userExists) {
        logger.warn(
          `User with the same email or phone already exists. ${email}, ${phone}`
        );
        return res.status(400).json({
          message: "User with the same email or phone already exists.",
        });
      }

      const password = phone;

      // Create a new user
      const {
        userId,
        email: createdEmail,
        name: createdName,
      } = await authModel.employeeSignup(
        name,
        email,
        phone,
        password,
        gender,
        company_id,
        username,
        filePath, // Ensure filePath is passed correctly
        dateofsubmission
      );

      // Generate JWT token
      const role = "user";
      const token = authModel.generateJWT(
        userId,
        createdEmail,
        createdName,
        role
      );

      logger.info(`User signed up successfully. User ID: ${userId}`);

      const emailPayload = {
        to: email, // Send to the email the user signed up with
        subject: "Welcome to Swotle!",
        content: `Hi ${name},\n\nThank you for signing up with Swotle. We are excited to have you on board!`,
      };

      res.status(201).json({ userId, token, company_id });
    } catch (error) {
      console.log(error);
      logger.error(`Error signing up user: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

    employeeDashboardSignup: async (req, res) => {
    const { name, email, phone, role, company_id, gender, username } = req.body;
    const file = req.file; // The uploaded file
    try {
      // Dynamically check for duplicates only if email or phone are provided
      if (email || phone) {
        const userExists = await authModel.checkDuplicates({ email, phone });
        if (userExists) {
          logger.warn(
            `User with the same email or phone already exists. Email: ${email}, Phone: ${phone}`
          );
          return res.status(400).json({
            message: "User with the same email or phone already exists.",
          });
        }
      }

      const password = phone; // Set the password as phone for simplicity

      // Save the file path to the database (if file exists)
      const filePath = file ? file.key : null; // 'file.key' holds the S3 file path
      const fullpath =
        "https://swotle-uploads.s3.us-east-1.amazonaws.com/" + filePath;
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, "0");
      var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
      var yyyy = today.getFullYear();

      const Finaltoday = `${yyyy}-${mm}-${dd}`;
      console.log("date: " + Finaltoday); // Change to ISO format

      // Create a new employee user in the database
      const {
        userId,
        email: createdEmail,
        name: createdName,
      } = await authModel.employeeDashboardSignup(
        name,
        email,
        phone,
        password, // Correctly pass password here
        role, // Correctly pass the role here (e.g., 'candidate')
        gender,
        company_id,
        fullpath, // Correctly pass the file URL here (fullpath should go into the 'file' field)
        Finaltoday // Pass the date correctly here
      );

      // Generate JWT token
      const token = authModel.generateJWT(
        userId,
        createdEmail,
        createdName,
        role
      );

      logger.info(`User signed up successfully. User ID: ${userId}`);

      // Respond with success, include userId and token
      res.status(201).json({ userId, token, company_id, filePath });
    } catch (error) {
      logger.error(`Error signing up user: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  login: async (req, res) => {
    const { email, password, role } = req.body;
    console.log('Login attempt payload:', req.body);
    try {
      // Check if the user exists
      const user = await authModel.loginUser(email, password, role);
      if (!user) {
        return res.status(401).json({
          success: false,
          status: 401,
          message: "Please Check you Email, Password and Role",
        });
      }
      // Generate JWT token
      const token = authModel.generateJWT(
        user.id,
        req.body.email,
        user.name,
        user.role
      );
      logger.info(`User logged in successfully. User ID: ${user.id}`);
      res
        .status(200)
        .json({ userId: user.id, token, role, company_id: user.company_id });
    } catch (error) {
      logger.error(`Error logging in user: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  verifyEmail: async (req, res) => {
    const { toMail, subject, message } = req.body;
    try {
      const mailer = await mailAuthenticator(toMail, subject, message);
      logger.info(`email sent : ${toMail}`);
      return res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal Server Error Controller" });
    }
  },

  sendVerificationLink: async (req, res) => {
    const { email } = req.body;

    try {
      const userExists = await authModel.checkUserVerified(email);

      if (userExists) {
        return res.status(400).json({
          message: "User already Verified",
        });
      } else {
        // Generate verification token
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
          expiresIn: "1d", // Token expires in 1 day
        });

        // Send verification link via email
        const verificationLink = `${process.env.BASE_URL}/api/v1/auth/verify/${verificationToken}`;
        const mailer = await mailAuthenticator(
          email,
          "Email Verification",
          verificationLink
        );

        logger.info(`Verification email sent to: ${email}`);

        res
          .status(200)
          .json({ message: "Verification email sent successfully" });
      }
    } catch (error) {
      logger.error(`Error sending verification email: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  verifyToken: async (req, res) => {
    const { verificationToken } = req.params;

    try {
      // Verify the token
      const decodedToken = jwt.verify(
        verificationToken,
        process.env.JWT_SECRET
      );

      // Update database to mark email as verified
      await authModel.updateEmailVerification(decodedToken.email);

      logger.info(`Email verified for: ${decodedToken.email}`);

      res.redirect(`http://Swotle.com/`);
    } catch (error) {
      logger.error(`Error verifying email: ${error.message}`);
      res.redirect(`${process.env.CLIENT_URL}/email-verification-failed`);
    }
  },

  // Forgot Password: send reset link
  forgotPassword: async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    try {
      // Check if user exists
      const userExists = await authModel.checkUserExists(email, "");
      if (!userExists) {
        return res.status(404).json({ message: "No user found with that email" });
      }
      // Generate token and expiry
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await authModel.setResetPasswordToken(email, token, expires);
      // Send email
      const resetLink = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${token}`;
      const htmlContent = `
        <p>You requested a password reset. <a href="${resetLink}">Click here to reset your password</a>.</p>
        <p>This link will expire in 1 hour.</p>
      `;
      await mailAuthenticator(
        email,
        "Password Reset Request",
        htmlContent,
        true // isHtml flag
      );
      return res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      logger.error(`Error in forgotPassword: ${error.message}`);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Reset Password: validate token, update password
  resetPassword: async (req, res) => {
    const { token, password, confirmPassword } = req.body;
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    // Password strength: min 8 chars, letters & numbers
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters and include letters and numbers" });
    }
    try {
      const user = await authModel.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      await authModel.updatePassword(user.id, password);
      await authModel.clearResetPasswordToken(user.id);
      return res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      logger.error(`Error in resetPassword: ${error.message}`);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = userController;
