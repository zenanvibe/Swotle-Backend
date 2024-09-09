"use strict";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../config/db.config");
const { getAllStaffs } = require("./company.controller");

const Auth = {
  createUser: async (name, email, phone, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = "active"; // or set to your desired default status
    const role = "user";

    const query =
      "INSERT INTO users (name, email, phone, password, status, role) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [name, email, phone, hashedPassword, status, role];
    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) reject(err);
        console.log(result);
        resolve({ userId: result.insertId, email, name });
      });
    });
  },

  createCompany: async (companyName, companyType, companyId) => {
    const query =
      "INSERT INTO company (company_id,company_name,company_type) VALUES (?, ?, ?)";
    const values = [companyName, companyType, companyId];
    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) reject(err);
        console.log(result);
        resolve({ companyid: result.insertId });
      });
    });
  },

  getAllCompanies: async () => {
    const query = `
SELECT 
    c.company_name,
    COUNT(u.id) AS total_users
FROM 
    company c
LEFT JOIN 
    users u ON c.id = u.company_id
GROUP BY 
    c.company_name `;
    return new Promise((resolve, reject) => {
      db.query(query, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  },

  getTotalData: async (company_id) => {
    const query = `SELECT c.company_name, COUNT(u.id) AS total_users, SUM(CASE WHEN u.report_status = 'pending' THEN 1 ELSE 0 END) AS pending_count, SUM(CASE WHEN u.report_status = 'completed' THEN 1 ELSE 0 END) AS completed_count FROM users u JOIN company c ON u.company_id = c.id WHERE c.id = ? GROUP BY c.company_name`;
    return new Promise((resolve, reject) => {
      db.query(query, [company_id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  },

  getadminTotalData: async (company_id) => {
    const query = `SELECT 
    COUNT(DISTINCT c.id) AS 'no_of_companies',
    COUNT(u.id) AS 'no_of_users'
FROM company c
LEFT JOIN users u ON c.company_id = u.company_id;

`;
    return new Promise((resolve, reject) => {
      db.query(query, [company_id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  },

  getadminTableData: async (company_id) => {
    const query = ` SELECT 
    c.company_name AS 'company_name',
    COUNT(u.id) AS 'no_of_employee'
FROM company c
LEFT JOIN users u ON c.company_id = u.company_id
WHERE c.id = 9
GROUP BY c.company_name;


`;
    return new Promise((resolve, reject) => {
      db.query(query, [company_id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  },

  getAllStaffs: async (company_id) => {
    const query = `SELECT id AS user_id, name, email, phone, role, status, gender, dob, handwritting_url, report_status 
    FROM users 
    WHERE company_id = ? AND role = 'employee'`;

    return new Promise((resolve, reject) => {
      db.query(query, [company_id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
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
