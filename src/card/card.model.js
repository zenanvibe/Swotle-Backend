"use strict";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../config/db.config");

const Auth = {
  getUserCardData: async (userId) => {
    const query = `
          SELECT
            u.name AS user_name,
            c.company_name,
            COUNT(DISTINCT CASE WHEN emp.role = 'employee' AND emp.status = 'active' THEN emp.id END) AS number_of_employees,
            COUNT(DISTINCT CASE WHEN ic.role = 'candidate' AND ic.status = 'active' THEN ic.id END) AS number_of_interview_candidates
          FROM users u
          JOIN company c ON u.company_id = c.id
          LEFT JOIN users emp ON emp.company_id = u.company_id AND emp.role = 'employee' AND emp.status = 'active'
          LEFT JOIN users ic ON ic.company_id = u.company_id AND ic.role = 'candidate' AND ic.status = 'active'
          WHERE u.id = ? AND u.role = 'company'
          GROUP BY u.name, c.company_name
        `;
    console.log("Executing query with userId:", userId);
    return new Promise((resolve, reject) => {
      db.query(query, [userId], (err, result) => {
        if (err) {
          console.error("Query error:", err);
          reject(err);
        } else {
          console.log("Query result:", result);
          resolve(result);
        }
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

  getAdminMasterCard: async () => {
    const query = `SELECT 
    (SELECT COUNT(*) FROM company) AS total_companies,
    (SELECT COUNT(*) FROM users) AS total_profiles,
    (SELECT COUNT(*) FROM users WHERE report_status = 'completed') AS total_profiles_completed,
    (SELECT COUNT(*) FROM users WHERE report_status = 'pending') AS total_profiles_pending `;
    return new Promise((resolve, reject) => {
      db.query(query, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  },
};

module.exports = Auth;
