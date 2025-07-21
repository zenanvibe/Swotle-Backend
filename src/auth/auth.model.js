"use strict";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../config/db.config");

const ALLOWED_ROLES = ['existing_employee', 'interview_candidate', 'company', 'user'];

const Auth = {
  createUser: async (name, email, phone, password, gender, company_id, role = 'company') => {
    if (!ALLOWED_ROLES.includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = "active"; // or set to your desired default status
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
    dateofbirth,
    role = 'existing_employee'
  ) => {
    if (!ALLOWED_ROLES.includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = "active"; // or set to your desired default status
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

  checkDuplicates: (params) => {
    const conditions = [];
    const values = [];

    if (params.email) {
        conditions.push("email = ?");
        values.push(params.email);
    }

    if (params.phone) {
        conditions.push("phone = ?");
        values.push(params.phone);
    }

    if (conditions.length === 0) {
        // No fields to check, so no duplicates.
        return Promise.resolve(false);
    }

    const query = `SELECT id FROM users WHERE ${conditions.join(" OR ")}`;

    return new Promise((resolve, reject) => {
        db.query(query, values, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result.length > 0); // true if duplicate found
        });
    });
  },

  employeeDashboardSignup: (
    name,
    email,
    phone,
    password,
    role,
    gender,
    company_id,
    fullpath, // Save the file path
    Finaltoday
  ) => {
    // Set default role if not provided or empty
    const userRole = role ? role.trim() : null;
    if (!ALLOWED_ROLES.includes(userRole)) {
      throw new Error(`Invalid role: ${userRole}`);
    }

    const fields = ["name", "password", "role", "gender", "company_id", "file", "dateofsubmission"];
    const values = [name, password, userRole, gender, company_id, fullpath, Finaltoday];

    // Insert email if provided, else NULL
    if (typeof email !== 'undefined') {
      fields.splice(1, 0, "email");
      values.splice(1, 0, email ? email : null);
    }
    // Insert phone if provided, else NULL
    if (typeof phone !== 'undefined') {
      const phoneIndex = email ? 2 : 1;
      fields.splice(phoneIndex, 0, "phone");
      values.splice(phoneIndex, 0, phone ? phone : null);
    }

    const query = `INSERT INTO users (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`;

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ userId: result.insertId, email, name, role: userRole });
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
