"use strict";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../config/db.config");

const Auth = {
  getUserInfo: async (userId) => {
    const query = `SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.role,
    u.status,
    u.gender,
    u.dob,
    u.handwritting_url,
    u.report_status,
    c.company_name 
FROM 
    users u
JOIN 
    company c ON u.company_id = c.id 
WHERE 
    u.id = ?;
`;
    return new Promise((resolve, reject) => {
      db.query(query, userId, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  },
};

module.exports = Auth;
