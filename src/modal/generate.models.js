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
            SELECT t.id AS id, t.name AS label 
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
      const queryPattern = "SELECT name FROM thinking_pattern;";
      const queryType = "SELECT name FROM thinking_pattern_type;";

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

          const patternNames = resultsPattern.map((row) => row.name);
          const typeNames = resultsType.map((row) => row.name);

          resolve({ patternNames, typeNames });
        });
      });
    });
  },
  postTraitAnalysis: (reportId, selectedTraits) => {
    return new Promise((resolve, reject) => {
      // First, insert the selected traits
      const insertValues = selectedTraits.map((traitId) => [reportId, traitId]);
      const insertSql =
        "INSERT INTO trait_analysis (report_id, trait_id) VALUES ?";

      db.query(insertSql, [insertValues], (insertErr, insertResults) => {
        if (insertErr) {
          console.error("Error inserting Trait Analysis:", insertErr);
          reject(insertErr);
          return;
        }

        // If insertion is successful, then fetch trait details
        const selectTraitsSql = `
                SELECT t.name AS trait, d.description, t.classification AS trait_classification
                FROM trait t
                LEFT JOIN description d ON t.id = d.trait_id
                WHERE t.id IN (?)
            `;

        db.query(
          selectTraitsSql,
          [selectedTraits],
          (selectErr, selectResults) => {
            if (selectErr) {
              console.error(
                "Error selecting Trait Analysis details:",
                selectErr
              );
              reject(selectErr);
              return;
            }

            // Fetch analysis report data
            const selectReportSql = `
            SELECT thinking_pattern, energy_lev, emotional_lev, goal_lev
            FROM analysis_report
            WHERE report_id = ?
          `;
            db.query(
              selectReportSql,
              [reportId],
              (reportErr, reportResults) => {
                if (reportErr) {
                  console.error(
                    "Error selecting Analysis Report details:",
                    reportErr
                  );
                  reject(reportErr);
                  return;
                }

                // Check if reportResults is empty or not
                if (reportResults.length === 0) {
                  reject("No analysis report found for the provided reportId.");
                  return;
                }

                // Get the values from the reportResults
                const {
                  thinking_pattern,
                  energy_lev,
                  emotional_lev,
                  goal_lev,
                } = reportResults[0];

                // Initialize an array to hold all the results
                const allResults = [];

                // Fetch descriptions for thinking patterns
                const select_tp_DescriptionSql = `
              SELECT thinking_pattern_name, description
              FROM thinking_pattern
              WHERE thinking_pattern_name = ?
            `;
                db.query(
                  select_tp_DescriptionSql,
                  [thinking_pattern],
                  (descriptionErr, descriptionResults) => {
                    if (descriptionErr) {
                      console.error(
                        "Error selecting descriptions:",
                        descriptionErr
                      );
                      reject(descriptionErr);
                      return;
                    }

                    // Check if descriptionResults is empty
                    if (descriptionResults.length === 0) {
                      reject(
                        "No descriptions found for the provided thinking pattern."
                      );
                      return;
                    }

                    allResults.push({
                      thinkingPatternDescription: descriptionResults[0],
                    });

                    const select_tpt_DescriptionSql = `
                  SELECT thinking_pattern_type_name, ?? AS value
                  FROM thinking_pattern_type
                  WHERE thinking_pattern_type_name = ? 
                  UNION ALL
                  SELECT thinking_pattern_type_name, ?? AS value
                  FROM thinking_pattern_type
                  WHERE thinking_pattern_type_name = ? 
                  UNION ALL
                  SELECT thinking_pattern_type_name, ?? AS value
                  FROM thinking_pattern_type
                  WHERE thinking_pattern_type_name = ? 
                `;

                    const select_tpt_DescriptionValues = [
                      energy_lev,
                      "Energy",
                      emotional_lev,
                      "Emotional",
                      goal_lev,
                      "Goals",
                    ];

                    db.query(
                      select_tpt_DescriptionSql,
                      select_tpt_DescriptionValues,
                      (descriptiontptErr, descriptiontptResults) => {
                        if (descriptiontptErr) {
                          console.error(
                            "Error selecting thinking pattern type descriptions:",
                            descriptiontptErr
                          );
                          reject(descriptiontptErr);
                          return;
                        }

                        // Check if descriptiontptResults is empty
                        if (descriptiontptResults.length === 0) {
                          reject(
                            "No descriptions found for the provided thinking pattern types."
                          );
                          return;
                        }

                        // Corrected loop condition
                        for (let i = 0; i < descriptiontptResults.length; i++) {
                          let discriptionData = descriptiontptResults[i];
                          // console.log(discriptionData);
                          allResults.push({
                            thinkingPatternTypeDescriptions: discriptionData,
                          });
                        }
                        // console.log(allResults);
                        // console.log(selectResults);
                        resolve({
                          traitResults: selectResults,
                          reportData: allResults,
                        });
                      }
                    );
                  }
                );
              }
            );
            // Resolve with both trait details and analysis report data
          }
        );
      });
    });
  },

  // postTraitAnalysis: (reportId) => {
  //   return new Promise((resolve, reject) => {
  //     // Fetch analysis report data

  //   });
  // },

  postTAnalysisReport: (
    report_id,
    thinking_pattern,
    energy,
    emotional,
    goal
  ) => {
    return new Promise((resolve, reject) => {
      const query =
        "INSERT INTO analysis_report (report_id, thinking_pattern, energy_lev, emotional_lev, goal_lev) VALUES (?, ?, ?, ?, ?)";
      db.query(
        query,
        [report_id, thinking_pattern, energy, emotional, goal],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });
  },
};

module.exports = TraitModel;
