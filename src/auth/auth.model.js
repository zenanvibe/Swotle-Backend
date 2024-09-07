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
        console.log(result);
        resolve({ userId: result.insertId, email, name, company_id });
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

    console.log(values)

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) reject(err);
        console.log(result);
        resolve({ userId: result, email, name, company_id });
      });
    });
  },

  loginUser: async (email, password, roles) => {
    const query = "SELECT * FROM users WHERE email = ? AND role = ?";
    const values = [email, roles];

    return new Promise((resolve, reject) => {
      db.query(query, values, async (err, result) => {
        if (err) {
          reject(err);
        } else if (result.length === 0 || result[0].deleted_at == 1) {
          resolve(null); // User not found
        } else {
          const match = await bcrypt.compare(password, result[0].password);
          if (match) {
            resolve(result[0]); // Successful login
          } else {
            resolve(null); // Incorrect password
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

  checkUserExists: (email, phone) => {
    const query = "SELECT id FROM users WHERE email = ? OR phone = ?";
    const values = [email, phone];

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
};

module.exports = Auth;
