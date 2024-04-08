var doc = new jsPDF();

// Set header function
doc.setHeader = function() {
  doc.text("Header text here", 50, 20);
};

// Set footer function
doc.setFooter = function() {
  const pageCount = doc.internal.getNumberOfPages();
  doc.text(`Page ${doc.page} of ${pageCount}`, 0, doc.internal.pageSize.getHeight() - 30, { align: 'center' });
};

// Add header and footer
doc.setHeader();
doc.setFooter();

// Add some content to the PDF
doc.text("This is some content in the PDF", 50, 50);

// Save the PDF
doc.save('test.pdf');
