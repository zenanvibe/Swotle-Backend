const userModel = require("../modal/user.modal");

const userController = {
  signup: async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
      // Check if the user already exists
      const userExists = await userModel.checkUserExists(email, phone);
      if (userExists) {
        console.log(
          `User with the same email or phone already exists.${email},${phone}`
        );
        return res.status(400).json({
          message: "User with the same email or phone already exists.",
        });
      }

      // Create a new user
      const {
        userId,
        email: createdEmail,
        name: createdName,
      } = await userModel.createUser(name, email, phone, password);

      // Generate JWT token

      const token = userModel.generateJWT(userId, createdEmail, createdName);

      console.log(`User signed up successfully. User ID: ${userId}`);
      //   res.status(201).json({ userId, token });
      res.status(201).json({ userId });
    } catch (error) {
      console.log(`Error signing up user: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      // Check if the user exists
      const user = await userModel.loginUser(email, password);
      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid email or password or User not available" });
      }

      // Generate JWT token
      const token = userModel.generateJWT(
        user.id,
        user.email,
        user.name,
        user.role
      );
      console.log(`User logged in successfully. User ID: ${user.id}`);
      res.status(200).json({ userId: user.id, token });
    } catch (error) {
      console.log(`Error logging in user: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  adminLogin: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Check if the user exists
      const user = await userModel.adminLoginUser(email, password);
      if (!user) {
        console.log(
          `Invalid email or password during login attempt email:${email}.`
        );
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Generate JWT token
      const token = userModel.generateJWT(
        user.id,
        user.email,
        user.name,
        user.role,
        user.store_id
      );

      console.log(`User logged in successfully. User ID: ${user.id}`);
      res.status(200).json({
        userId: user.id,
        store_id: user.store_id,
        token,
      });
    } catch (error) {
      console.log(`Error logging in user: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await userModel.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      console.log(`Error getting all users: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateUser: async (req, res) => {
    const userId = req.params.userId; // Assuming you have the user ID in the request parameters
    const updatedData = req.body; // Assuming the updated data is sent in the request body
    try {
      const userExists = await userModel.checkUserExists(
        updatedData.email,
        updatedData.phone
      );
      if (userExists) {
        console.log(
          `User with the same email or phone already exists.${email},${phone}`
        );
        return res.status(400).json({
          message: "User with the same email or phone already exists.",
        });
      }

      await userModel.updateUser(userId, updatedData);
      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      console.log(`Error updating user: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getUserInfo: async (req, res) => {
    const userId = req.params.userId;
    try {
      const userinfo = await userModel.getUserInfo(userId);
      res.status(200).json(userinfo);
    } catch (error) {
      console.log(`Error viewing user: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  deleteUser: async (req, res) => {
    const userId = req.params.userId;
    try {
      const userinfo = await userModel.deleteUser(userId);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.log(`Error viewing user: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = userController;
