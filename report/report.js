const PDFDocument = require('pdfkit');
const fs = require('fs');

// Sample patient details
const patientDetails = {
    name: "Anto Joel",
    age: 21,
    category: "Student",
};

// JSON data containing traits
const traitsData = {
    "positiveTraits": [
        {
            "trait": "Independent thinking",
            "description": "You are an independent individual who depends on yourself to form your opinions. You think and act according to your own beliefs and are your own authority. Your own ideas carry more weight with you than the views of others or the tenets of the group. You love independence and are a strong defender of free thought and expression. Your independence and freedom mean more to you than others may realize, and you do not take kindly to people who try to tell you how to do things. You act according to your conclusions and without considering the notions of others."
        },
        {
            "trait": "Broadmindedness",
            "description": "You are tolerant of other people’s opinions and beliefs. You're more easy-going in style, apt to ignore slight departures from accepted social norms or conventional behavior. You compromise more easily because of your ability to envisage the advantages of different viewpoints. With a broader outlook on life, you appreciate the good points in the ideas of other people. Able to handle progressive concepts without feeling threatened, you consider them willingly, either accepting them or rejecting them according to their usefulness. Always willing to look at something in a new way, you encourage others to express their views. Even when you think that you are right, you are willing to listen to the opinions of others and adopt their suggestions if they seem valid to you."
        }
    ],
    "negativeTraits": [
        {
            "trait": "Pessimism",
            "description": "You have an inclination to look on the dark side of things and tend to expect the worst outcome in most situations. Your state of mind is negative, and you are in low spirits much of the time. With an attitude of \"can't do\" rather than \"can do,\" pessimism is never far away. You are susceptible to gloomy people and thoughts, and you are more likely to create negative pictures in your mind. Usually, you anticipate what you do not want to happen instead of success.\r\nLacking mental energy, you are easily dejected and melancholic. Pessimism prevents you from developing a flexible attitude, and you are apt to overestimate obstacles to such an extent that you find it difficult to follow a line of action. With a constant expectation of being let down, you constantly need to guard against discouragement."
        }
    ]
};

// Create a new PDF document
const doc = new PDFDocument();

// Register font for footer text
doc.registerFont('Helvetica', 'Helvetica.ttf');

// Pipe the PDF output to a file
const stream = fs.createWriteStream('patient_report.pdf');
doc.pipe(stream);

// Function to add header and footer to each page


doc.image('../assets/Suresh-Handwriting-1.png', 2, 4, {
    width: 150
})

doc.fontSize(25).text('Handwriting Report', 100, 80, {
    align: 'center'
});
// Add patient details
doc.font('Helvetica').fontSize(12);
doc.text('today date here', 450, 140)
doc.text(`Client Name: ${patientDetails.name}`, 50, 140);
doc.text(`Age: ${patientDetails.age}`, 50, 160);
doc.text(`Category: ${patientDetails.category}`, 50, 180);

doc.moveDown();

doc.font('Helvetica-Bold').fontSize(16).text('', 100, 250, { align: 'center' });

// Add positive traits
doc.font('Helvetica-Bold').fontSize(14).text('Positive Traits', 50, doc.y, { underline: true, align: 'center' }).moveDown(0.5);
traitsData.positiveTraits.forEach(trait => {
    doc.font('Helvetica').fontSize(12).text(trait.trait, { underline: true }).moveDown(0.3);
    doc.text(trait.description).moveDown();
});

// Add negative traits
doc.font('Helvetica-Bold').fontSize(14).text('Negative Traits', 50, doc.y, { underline: true, align: 'center' }).moveDown(0.5);
traitsData.negativeTraits.forEach(trait => {
    doc.font('Helvetica').fontSize(12).text(trait.trait, { underline: true }).moveDown(0.3);
    doc.text(trait.description).moveDown();
});

let bottom = doc.page.margins.bottom;
doc.page.margins.bottom = 0;
doc.text('Page 1', 0.5 * (doc.page.width - 100), doc.page.height - 50,
    {
        width: 100,
        align: 'center',
        lineBreak: false,
    })

// Reset text writer position

doc.text('', 50, 50)
doc.page.margins.bottom = bottom;

let pageNumber = 1;

doc.on('pageAdded', () => {
    pageNumber++
    let bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    doc.text(
        'Pág. ' + pageNumber,
        0.5 * (doc.page.width - 100),
        doc.page.height - 50,
        {
            width: 100,
            align: 'center',
            lineBreak: false,
        })

    // Reset text writer position
    doc.text('', 50, 50);
    doc.page.margins.bottom = bottom;
})

// Finalize PDF
doc.end();

console.log('PDF generated successfully.');
