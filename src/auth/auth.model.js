"use strict";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../config/db.config");

const Auth = {
  createUser: async (name, email, phone, password, company_id) => {
    console.log(name, email, phone, password);
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = "active"; // or set to your desired default status
    const role = "admin";

    const query =
      "INSERT INTO users (name, email, phone, password, status, role,company_id) VALUES (?, ?, ?, ?, ?, ?,?)";
    const values = [
      name,
      email,
      phone,
      hashedPassword,
      status,
      role,
      company_id,
    ];
    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) reject(err);
        console.log(result);
        resolve({ userId: result.insertId, email, name });
      });
    });
  },

  loginUser: async (email, password, roles) => {
    const query =
      "SELECT id,name,password,status,phone,role FROM users WHERE email = ? AND role = ?";
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
