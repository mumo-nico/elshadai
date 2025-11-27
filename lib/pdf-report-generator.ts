import jsPDF from "jspdf";
import "jspdf-autotable";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface PDFReportOptions {
  title: string;
  dateRange?: string;
  headers: string[];
  data: any[][];
  filename: string;
}

export function generatePDFReport(options: PDFReportOptions) {
  const { title, dateRange, headers, data, filename } = options;

  const doc = new jsPDF({
    orientation: headers.length > 6 ? "landscape" : "portrait",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header - Sky Blue Background
  doc.setFillColor(135, 206, 250); // Sky blue
  doc.rect(0, 0, pageWidth, 45, "F");

  // Company Logo/Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("ELSHADAI APARTMENTS", pageWidth / 2, 15, { align: "center" });

  // Contact Details
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Location: Kasaala Market, Ikutha", pageWidth / 2, 24, { align: "center" });
  doc.text("Phone: 0727497189 or 0726722599", pageWidth / 2, 30, { align: "center" });
  doc.text("Email: info@elshadaiapartments.co.ke | nicholasmusingila@gmail.com", pageWidth / 2, 36, {
    align: "center",
  });

  // Report Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, 55, { align: "center" });

  // Date Range
  let startY = 65;
  if (dateRange) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Report Period: ${dateRange}`, pageWidth / 2, startY, {
      align: "center",
    });
    startY += 10;
  }

  // Generated Date
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated: ${new Date().toLocaleString()}`,
    pageWidth / 2,
    startY,
    { align: "center" }
  );
  startY += 10;

  // Table
  doc.autoTable({
    head: [headers],
    body: data,
    startY: startY,
    theme: "grid",
    headStyles: {
      fillColor: [68, 114, 196], // Dark blue
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [242, 242, 242],
    },
    margin: { top: startY, left: 10, right: 10 },
    didDrawPage: function (data: any) {
      // Footer
      const footerY = pageHeight - 20;
      doc.setDrawColor(135, 206, 250);
      doc.setLineWidth(0.5);
      doc.line(10, footerY, pageWidth - 10, footerY);

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "italic");
      doc.text(
        "Elshadai Rent Management System - Confidential Report",
        pageWidth / 2,
        footerY + 7,
        { align: "center" }
      );

      // Page number
      doc.text(
        `Page ${data.pageNumber}`,
        pageWidth - 20,
        footerY + 7,
        { align: "right" }
      );
    },
  });

  // Save the PDF
  doc.save(filename);
}

