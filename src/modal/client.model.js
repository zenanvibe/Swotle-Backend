"use strict";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../config/db.config");

const User = {
  createUser: async (name, email, phone, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = 1; // or set to your desired default status
    const role = 1;
    const query1 =
      "INSERT INTO clients (name, email, phone, password, status, role) VALUES (?, ?, ?, ?, ?, ?)";
    const values1 = [name, email, phone, hashedPassword, status, role];

    return new Promise((resolve, reject) => {
      db.query(query1, values1, (err, result) => {
        // console.log(result);

        if (err) reject(err);

        resolve({ userId: result.insertId, email, name });

        const query2 = "INSERT INTO report (client_id) VALUES (?)";
        const values2 = [result.insertId];

        db.query(query2, values2, (err, result) => {
          // console.log(result);

          if (err) reject(err);
          resolve({ userId: result, email, name });
        });
      });
    });
  },

  loginUser: async (email, password) => {
    const query =
      "SELECT id,name,password,status,phone,role FROM client WHERE email = ?";
    const values = [email];

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

  //   adminLoginUser: async (email, password) => {
  //     const query =
  //       "SELECT U.user_id, U.name, U.password, U.status, U.phone, U.role, S.store_id FROM Users U JOIN Stores S ON U.user_id = S.merchant_id WHERE U.email = ?";
  //     const values = [email];

  //     return new Promise((resolve, reject) => {
  //       db.query(query, values, async (err, result) => {
  //         if (err) {
  //           reject(err);
  //         } else if (result.length === 0) {
  //           resolve(null); // User not found
  //         } else {
  //           const match = await bcrypt.compare(password, result[0].password);
  //           if (match) {
  //             resolve(result[0]); // Successful login
  //           } else {
  //             resolve(null); // Incorrect password
  //           }
  //         }
  //       });
  //     });
  //   },

  checkUserExists: (email, phone) => {
    const query = "SELECT id FROM clients WHERE email = ? OR phone = ?";
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

  generateJWT: (userId, email, name, role) => {
    const secretKey = "QhzvDESjIDdsq9m17TaXc8QHhBeJv1BKGjfeU7A9Nlo";
    const token = jwt.sign({ userId, email, name, role }, secretKey, {
      expiresIn: "7d",
    });
    return token;
  },

  getAllUsers: () => {
    const query = "SELECT user_id, name, email, status, phone FROM clients";
    return new Promise((resolve, reject) => {
      db.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  getUserInfo: (userId) => {
    const query =
      "SELECT name, email, status, phone FROM clients WHERE user_id = ?";
    return new Promise((resolve, reject) => {
      db.query(query, userId, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  updateUser: (userId, updatedData) => {
    const query = "UPDATE clients SET ? WHERE user_id = ?";
    return new Promise((resolve, reject) => {
      db.query(query, [updatedData, userId], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  deleteUser: (userId) => {
    const currentDateTime = new Date();
    const query =
      "UPDATE clients SET status='deactive', deleted_At=? WHERE user_id = ?";

    return new Promise((resolve, reject) => {
      db.query(query, [currentDateTime, userId], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },
};

module.exports = User;
