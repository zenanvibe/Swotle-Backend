"use strict";
const db = require("../../config/db.config");

const TraitModel = {
    generateReport: (selectedTraits, userId) => {
        return new Promise((resolve, reject) => {
            // Constructing the WHERE clause dynamically based on selectedTraits
            let whereClause = '';
            if (selectedTraits && selectedTraits.length > 0) {
                whereClause = `WHERE t.id IN (${selectedTraits.map(trait => db.escape(trait)).join(',')})`;
            }

            const query = `SELECT t.name AS trait, d.description, t.classification AS trait_classification, u.name AS user_name, u.email AS user_email, u.phone AS user_phone FROM trait t LEFT JOIN description d ON t.id = d.trait_id LEFT JOIN users u ON d.user_category_id = u.id ${whereClause} AND u.id = ${db.escape(userId)}`;
            console.log(query);
            db.query(query, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },
    generatePDF: (selectedTraits) => {
        return new Promise((resolve, reject) => {
            // Constructing the WHERE clause dynamically based on selectedTraits
            let whereClause = '';
            if (selectedTraits && selectedTraits.length > 0) {
                whereClause = `WHERE t.id IN (${selectedTraits.map(trait => db.escape(trait)).join(',')})`;
            }

            const query = `
                SELECT t.name AS trait, d.description, t.classification AS trait_classification
                FROM trait t
                LEFT JOIN description d ON t.id = d.trait_id
                ${whereClause}
            `;

            db.query(query, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
};


module.exports = TraitModel;
