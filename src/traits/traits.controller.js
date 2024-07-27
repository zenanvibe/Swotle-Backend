
"use strict";
const TraitModel = require("./traits.model");

const TraitController = {
    // Assuming this is part of your existing TraitController
    getPositiveTraits: (req, res) => {
        TraitModel.getPositiveTraits()
            .then((positiveTraits) => {
                res.json({ positiveTraits });
            })
            .catch((error) => {
                console.error("Error fetching positive traits:", error);
                res.status(500).send("Error fetching positive traits");
            });
    },
    getNegativeTraits: (req, res) => {
        TraitModel.getNegativeTraits()
            .then((negativeTraits) => {
                res.json({ negativeTraits });
            })
            .catch((error) => {
                console.error("Error fetching negative traits:", error);
                res.status(500).send("Error fetching negative traits");
            });
    },
    getThinkingPatterns: (req, res) => {
        TraitModel.getThinkingPatterns()
            .then((results) => {
                res.json(results);
            })
            .catch((error) => {
                console.error("Error fetching thinking patterns:", error);
                res.status(500).json({ error: "Error fetching thinking patterns" });
            });
    },
};

module.exports = TraitController;
