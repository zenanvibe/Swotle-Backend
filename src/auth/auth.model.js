"use strict";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../config/db.config");
const { employeeSignup } = require("./auth.controller");

const Auth = {
  createUser: async (name, email, phone, password, gender, company_id) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = "active"; // or set to your desired default status
    const role = "company";

    const query =
      "INSERT INTO users (name, email, phone, password, status, role, company_id,gender) VALUES (?, ?, ?, ?, ?, ?, ?,?)";
    const values = [
      name,
      email,
      phone,
      hashedPassword,
      status,
      role,
      company_id,
      gender,
    ];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) reject(err);
        resolve({ userId: result, email, name, company_id });
      });
    });
  },

  // Function to check if a user already exists by email or phone
    checkUserExists: (email, phone) => {
    const query = "SELECT id FROM users WHERE email = ? OR phone = ?";
    const values = [email, phone];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          return reject(err);
        }
        // If result length is greater than 0, a user exists
        resolve(result.length > 0);
      });
    });
  },

  employeeSignup: async (
    name,
    email,
    phone,
    password,
    gender,
    company_id,
    dateofbirth
  ) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = "active"; // or set to your desired default status
    const role = "employee";

    const query =
      "INSERT INTO users (name, email, phone, password, status, role, company_id,gender,dob) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)";
    const values = [
      name,
      email,
      phone,
      hashedPassword,
      status,
      role,
      company_id,
      gender,
      dateofbirth,
    ];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) reject(err);
        resolve({ userId: result, email, name, company_id });
      });
    });
  },

  loginUser: async (email, password, role) => {
    const query = "SELECT * FROM users WHERE email = ? AND role = ?";
    const values = [email, role];

    return new Promise((resolve, reject) => {
      db.query(query, values, async (err, result) => {
        if (err) {
          console.log('DB error:', err);
          reject(err);
        } else if (result.length === 0) {
          console.log('No user found for:', values); // <--- LOG
          resolve(null);
        } else if (result[0].deleted_at == 1) {
          console.log('User marked as deleted:', result[0].email); // <--- LOG
          resolve(null);
        } else {
          console.log('User found:', result[0].email, 'Checking password...');
          const match = await bcrypt.compare(password, result[0].password);
          console.log('Password match:', match); // <--- LOG
          if (match) {
            resolve(result[0]);
          } else {
            resolve(null);
          }
        }
      });
    });
},


  findOrCreateCompany: async (company_name) => {
    return new Promise((resolve, reject) => {
      // Check if the company already exists
      const checkCompanyQuery = "SELECT id FROM company WHERE company_name = ?";
      db.query(checkCompanyQuery, [company_name], (err, result) => {
        if (err) {
          return reject(err);
        }

        if (result.length > 0) {
          // Company exists, return the company ID
          return resolve(result[0].id);
        } else {
          // Company doesn't exist, create a new one
          const newCompanyId = `AD${Math.floor(
            100000 + Math.random() * 900000
          )}`;
          const insertCompanyQuery =
            "INSERT INTO company (company_id, company_name) VALUES (?, ?)";
          db.query(
            insertCompanyQuery,
            [newCompanyId, company_name],
            (err, result) => {
              if (err) {
                return reject(err);
              }
              resolve(result.insertId); // Return the new company ID
            }
          );
        }
      });
    });
  },

  employeeSignup: (
    name,
    email,
    phone,
    password,
    gender,
    company_id,
    username,
    filePath,
    dateofsubmission
  ) => {
    const query = `INSERT INTO users (name, email, phone, password, gender, company_id,  username, file, dateofsubmission) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      name,
      email,
      phone,
      password,
      gender,
      company_id,
      username,
      filePath,
      dateofsubmission,
    ];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ userId: result.insertId, email, name });
        }
      });
    });
  },

  employeeDashboardSignup: (
    name,
    email,
    phone,
    role,
    password,
    gender,
    company_id,
    fullpath, // Save the file path
    Finaltoday
  ) => {
    console.log(Finaltoday);
    const query = `INSERT INTO users (name, email, phone, password, role, gender, company_id, file, dateofsubmission) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      name, // Correct name
      email, // Correct email
      phone,
      role, // Correct role (candidate, etc.) // Correct phone
      password, // Password (should be passed in the correct position)
      gender, // Correct gender (male, etc.)
      company_id, // Correct company_id
      fullpath, // This is the file path (URL), pass it in the file field
      Finaltoday, // This is the date of submission
    ];
    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        console.log(err);
        if (err) {
          reject(err);
        } else {
          resolve({ userId: result.insertId, email, name });
        }
      });
    });
  },

  checkUserVerified: (email) => {
    const query =
      "SELECT id FROM users WHERE email_verification = 1 and email = ?";
    const values = [email];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result && result.length > 0);
        }
      });
    });
  },

  generateJWT: (userId, email, name, role) => {
    const secretKey = process.env.JWT_SECRET;
    const token = jwt.sign({ userId, email, name, role }, secretKey, {
      expiresIn: "7d",
    });
    return token;
  },

  updateEmailVerification: (email) => {
    const query = "UPDATE users SET email_verification = 1 WHERE email =?";
    const values = [email];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  // Set password reset token and expiry for a user
  setResetPasswordToken: (email, token, expires) => {
    const query = "UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?";
    const values = [token, expires, email];
    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },

  // Get user by reset token (and check expiry)
  getUserByResetToken: (token) => {
    const query = "SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()";
    const values = [token];
    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) reject(err);
        else resolve(result.length > 0 ? result[0] : null);
      });
    });
  },

  // Clear reset token after use
  clearResetPasswordToken: (userId) => {
    const query = "UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?";
    const values = [userId];
    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },

  // Update password for user (by id)
  updatePassword: async (userId, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = "UPDATE users SET password = ? WHERE id = ?";
    const values = [hashedPassword, userId];
    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },
};

module.exports = Auth;
