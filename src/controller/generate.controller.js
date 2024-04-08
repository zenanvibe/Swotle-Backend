"use strict";
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const TraitModel = require('../modal/generate.models');

const generatePDFFromJSON = (jsonData, res) => {
  // Create a new PDF document
  const doc = new PDFDocument();

  // Pipe the PDF content to the response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="generated_pdf.pdf"');
  doc.pipe(res);

  // **Updated path to the image**
  const imagePath = path.join(__dirname, '../assets/logo.png');  // Uses path.join for platform-independent paths

  doc.image(imagePath, 2, 4, { width: 150 }, (error) => {
    if (error) {
      console.error('Error loading image:', error);
    }
  });
  doc.fontSize(25).text('Handwriting Report', 100, 80, { align: 'center' });

  // Add patient details
  doc.font('Helvetica').fontSize(12);
  doc.text('Today date here', 450, 140);
  doc.text(`Client Name: ${patientDetails.name}`, 50, 140);
  doc.text(`Age: ${patientDetails.age}`, 50, 160);
  doc.text(`Category: ${patientDetails.category}`, 50, 180);
  doc.moveDown();

  // Add positive traits
  doc.font('Helvetica-Bold').fontSize(14).text('Positive Traits', 50, doc.y, { underline: true, align: 'center' }).moveDown(0.5);
  jsonData.positiveTraits.forEach(trait => {
    doc.font('Helvetica').fontSize(12).text(trait.trait, { underline: true }).moveDown(0.3);
    doc.text(trait.description).moveDown();
  });

  // Add negative traits
  doc.font('Helvetica-Bold').fontSize(14).text('Negative Traits', 50, doc.y, { underline: true, align: 'center' }).moveDown(0.5);
  jsonData.negativeTraits.forEach(trait => {
    doc.font('Helvetica').fontSize(12).text(trait.trait, { underline: true }).moveDown(0.3);
    doc.text(trait.description).moveDown();
  });

  // Add page number
  let pageNumber = 1;
  doc.on('pageAdded', () => {
    pageNumber++;
    doc.text('Page ' + pageNumber, 50, 50);
  });

  // Finalize the PDF
  doc.end();

  console.log('PDF generated and sent as response');
};

const TraitController = {
  getTraitspdf: (req, res) => {
    const selectedTraits = req.body.selectedTraits;

    TraitModel.generatePDF(selectedTraits)
      .then((results) => {
        const jsonData = { positiveTraits: [], negativeTraits: [] };

        results.forEach((row) => {
          if (row.trait_classification === 1 && row.description) {
            jsonData.positiveTraits.push({ trait: row.trait, description: row.description });
          } else if (row.trait_classification === 0 && row.description) {
            jsonData.negativeTraits.push({ trait: row.trait, description: row.description });
          }
        });

        // Generate PDF and send as response
        generatePDFFromJSON(jsonData, res);
      })
      .catch((error) => {
        console.error('Error fetching traits:', error);
        res.status(500).json({ error: 'Error fetching traits' });
      });
  },
  getTraits: (req, res) => {
    const selectedTraits = req.body.selectedTraits;
    const user = req.body.user;

    TraitModel.generateReport(selectedTraits, user)
      .then((results) => {
        console.log("Selected Traits:", selectedTraits);
        console.log("Number of Results:", results.length);
        console.log(results);
        const positiveTraits = [];
        const negativeTraits = [];

        results.forEach((row) => {     
          if (row.trait_classification === 1 && row.description) {
            positiveTraits.push({ trait: row.trait, description: row.description });
          } else if (row.trait_classification === 0 && row.description) {
            negativeTraits.push({ trait: row.trait, description: row.description });
          }
        });

        // Include user details in the response
        const userDetails = {
          name: results.row.user_name,
          email: results.row.user_email,
          phone: results.row.user_phone
        };

        res.json({ userDetails, positiveTraits, negativeTraits });
      })
      .catch((error) => {
        console.error('Error fetching traits:', error);
        res.status(500).json({ error: 'Error fetching traits' });
      });
  }
};

module.exports = TraitController;
