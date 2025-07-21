"use strict";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../config/db.config");

const ALLOWED_ROLES = ['existing_employee', 'interview_candidate', 'company', 'user'];

const Auth = {
  createUser: async (name, email, phone, password, role = 'user') => {
    if (!ALLOWED_ROLES.includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = "active"; // or set to your desired default status
    const query =
      "INSERT INTO users (name, email, phone, password, status, role) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [name, email, phone, hashedPassword, status, role];
    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) reject(err);
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
        resolve({ companyid: result.insertId });
      });
    });
  },

  getAllCompanies: async () => {
    const query = `
SELECT 
    c.id AS company_id,
    c.company_name,
    COUNT(DISTINCT CASE WHEN u.role = 'existing_employee' THEN u.id END) AS number_of_employees,
    COUNT(DISTINCT CASE WHEN u.role = 'interview_candidate' THEN u.id END) AS number_of_candidates
FROM
    company c
LEFT JOIN
    users u ON u.company_id = c.id
GROUP BY
    c.id, c.company_name
ORDER BY
    c.company_name;
`;
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
    const query = `SELECT 
    id AS user_id, 
    name, 
    email, 
    phone, 
    role, 
    status, 
    gender, 
    dob, 
    report_url, 
    report_status 
FROM 
    users 
WHERE 
    role <> 'company';
`;

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

  getAllStaffsByCompanyId: async (company_id, roleFilter) => {
    // Base query
    let query = `SELECT 
      id AS user_id, 
      name, 
      email, 
      phone, 
      role, 
      status, 
      gender, 
      dob, 
      file as report_url, 
      report_status,
      dateofsubmission  
    FROM 
      users 
    WHERE 
      company_id = ?`;

    // Add role filter if a specific role is passed
    if (roleFilter) {
      if (roleFilter === "existing_employee" || roleFilter === "interview_candidate") {
        query += ` AND role = ?`;
      }
    } else {
      query += ` AND role != 'company'`; // Default condition to exclude 'company'
    }

    return new Promise((resolve, reject) => {
      const values = roleFilter ? [company_id, roleFilter] : [company_id];
      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  updateUser: async (userId, updates) => {
    const validFields = {
      name: "name",
      email: "email",
      phone: "phone",
      role: "role",
      status: "status",
    };
    if (updates.field === 'role' && !ALLOWED_ROLES.includes(updates.value)) {
      throw new Error(`Invalid role: ${updates.value}`);
    }
    if (!validFields[updates.field]) {
      throw new Error("Invalid field name");
    }
    const query = `
      UPDATE users 
      SET ${validFields[updates.field]} = ?
      WHERE id = ?
    `;

    return new Promise((resolve, reject) => {
      db.query(query, [updates.value, userId], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          reject(err);
        } else {
          if (result.affectedRows === 0) {
            reject(new Error("User not found"));
          } else {
            resolve(result);
          }
        }
      });
    });
  },
  //delete
  deleteUser: async (userId) => {
    const query = `
      DELETE FROM users 
      WHERE id = ?
    `;

    return new Promise((resolve, reject) => {
      db.query(query, [userId], (err, result) => {
        if (err) {
          reject(err);
        } else {
          if (result.affectedRows === 0) {
            reject(new Error("User not found"));
          } else {
            resolve(result);
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

  // Update company (only company_name)
  updateCompany: async (companyId, updates) => {
    if (!updates.company_name) throw new Error("company_name is required to update");
    const query = `UPDATE company SET company_name = ? WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.query(query, [updates.company_name, companyId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },

  // Delete company
  deleteCompany: async (companyId) => {
    const query = "DELETE FROM company WHERE id = ?";
    return new Promise((resolve, reject) => {
      db.query(query, [companyId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },
};

module.exports = Auth;
