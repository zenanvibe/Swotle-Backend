"use strict";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../config/db.config");

const Auth = {

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
};

module.exports = Auth;
