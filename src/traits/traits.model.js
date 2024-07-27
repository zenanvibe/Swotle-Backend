"use strict";
const db = require("../../config/db.config");

const TraitModel = {
    getPositiveTraits: () => {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT t.id AS id, t.name AS label 
            FROM trait t
            LEFT JOIN description d ON t.id = d.trait_id
            WHERE t.classification = 1
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
    getNegativeTraits: () => {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT t.id AS id, t.name AS label 
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
    getThinkingPatterns: () => {
        return new Promise((resolve, reject) => {
            const queryPattern = "SELECT thinking_pattern_name FROM thinking_pattern;";
            const queryType = "SELECT thinking_pattern_type_name FROM thinking_pattern_type;";

            db.query(queryPattern, (errPattern, resultsPattern) => {
                if (errPattern) {
                    reject(errPattern);
                    return;
                }

                db.query(queryType, (errType, resultsType) => {
                    if (errType) {
                        reject(errType);
                        return;
                    }

                    const patternNames = resultsPattern.map((row) => row.thinking_pattern_name);
                    const typeNames = resultsType.map((row) => row.thinking_pattern_type_name);

                    resolve({ patternNames, typeNames });
                });
            });
        });
    },
};

module.exports = TraitModel;
