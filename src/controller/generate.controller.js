"use strict";
const TraitModel = require('../modal/generate.models');



const TraitController = {
  getTraits: (req, res) => {
      const selectedTraits = req.body.selectedTraits;

      TraitModel.generateReport(selectedTraits)
          .then((results) => {
              console.log("Selected Traits:", selectedTraits);
              console.log("Number of Results:", results.length);

              const positiveTraits = [];
              const negativeTraits = [];

              results.forEach((row) => {
                  console.log("Trait:", row.trait, "Description:", row.description, "Classification:", row.trait_classification);

                  if (row.trait_classification === 1 && row.description) {
                      positiveTraits.push({ trait: row.trait, description: row.description });
                  } else if (row.trait_classification === 0 && row.description) {
                      negativeTraits.push({ trait: row.trait, description: row.description });
                  }
              });

              res.json({ positiveTraits, negativeTraits });
          })
          .catch((error) => {
              console.error('Error fetching traits:', error);
              res.status(500).json({ error: 'Error fetching traits' });
          });
  }
};
  


module.exports = TraitController;
