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

        const query = "INSERT INTO company (company_id,company_name,company_type) VALUES (?, ?, ?)";
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

    getAllStaffs : async () => {
        
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
        const query = "SELECT id FROM users WHERE email_verification = 1 and email = ?";
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
