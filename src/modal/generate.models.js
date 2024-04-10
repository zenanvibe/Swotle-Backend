"use strict";
const db = require("../../config/db.config");

const TraitModel = {
  generateReport: (selectedTraits) => {
    return new Promise((resolve, reject) => {
      // Constructing the WHERE clause dynamically based on selectedTraits
      let whereClause = "";
      if (selectedTraits && selectedTraits.length > 0) {
        whereClause = `WHERE t.id IN (${selectedTraits
          .map((trait) => db.escape(trait))
          .join(",")})`;
      }

      const query = `SELECT t.name AS trait, d.description, t.classification AS trait_classification FROM trait t LEFT JOIN description d ON t.id = d.trait_id ${whereClause}`;
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
      let whereClause = "";
      if (selectedTraits && selectedTraits.length > 0) {
        whereClause = `WHERE t.id IN (${selectedTraits
          .map((trait) => db.escape(trait))
          .join(",")})`;
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
  },
  getPositiveTraits: () => {
    return new Promise((resolve, reject) => {
      const query = `
            SELECT t.name AS trait, t.classification AS trait_classification
            FROM trait t
            LEFT JOIN description d ON t.id = d.trait_id
            WHERE t.classification = 1
        `;
      //     const query = `
      //     SELECT t.name AS trait, d.description, t.classification AS trait_classification
      //     FROM trait t
      //     LEFT JOIN description d ON t.id = d.trait_id
      //     WHERE t.classification = 1
      // `;

      db.query(query, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },
  getNegativeTraits: () => {
    return new Promise((resolve, reject) => {
      const query = `
            SELECT t.name AS trait, t.classification AS trait_classification
            FROM trait t
            LEFT JOIN description d ON t.id = d.trait_id
            WHERE t.classification = 0
        `;
      //     const query = `
      //     SELECT t.name AS trait, d.description, t.classification AS trait_classification
      //     FROM trait t
      //     LEFT JOIN description d ON t.id = d.trait_id
      //     WHERE t.classification = 0
      // `;

      db.query(query, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },
};

module.exports = TraitModel;
