import jsPDF from "jspdf";

export function generatePaymentReceipt(payment: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header - Sky Blue Background
  doc.setFillColor(135, 206, 250); // Sky blue
  doc.rect(0, 0, pageWidth, 50, "F");

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

  // Receipt Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", pageWidth / 2, 65, { align: "center" });

  // Receipt Number and Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const receiptNo = payment.paymentId || payment.receiptNumber || payment.id;
  doc.text(`Payment ID: ${receiptNo}`, 20, 80);
  doc.text(`Date: ${currentDate}`, pageWidth - 20, 80, { align: "right" });

  // Horizontal Line
  doc.setDrawColor(135, 206, 250);
  doc.setLineWidth(0.5);
  doc.line(20, 85, pageWidth - 20, 85);

  // Payment Details Section
  let yPos = 100;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", 20, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Details Grid
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = typeof payment.month === 'number'
    ? monthNames[payment.month - 1]
    : payment.month;

  const details = [
    { label: "Tenant Name:", value: payment.user.name },
    { label: "Email:", value: payment.user.email },
    { label: "Property:", value: payment.unit.property.name },
    { label: "Unit Number:", value: payment.unit.unitNumber },
    { label: "Payment For:", value: `${monthName} ${payment.year}` },
    { label: "Payment Method:", value: payment.paymentMethod },
  ];

  if (payment.paymentMethod !== "Cash" && payment.referenceNumber) {
    details.push({ label: "Reference Number:", value: payment.referenceNumber });
  }

  if (payment.paymentMethod === "Cash" && payment.cashReceiver) {
    details.push({ label: "Received By:", value: payment.cashReceiver });
  }

  details.forEach((detail) => {
    doc.setFont("helvetica", "bold");
    doc.text(detail.label, 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(detail.value, 80, yPos);
    yPos += 8;
  });

  // Amount Section - Highlighted
  yPos += 10;
  doc.setFillColor(240, 248, 255); // Light blue
  doc.rect(20, yPos - 5, pageWidth - 40, 20, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Amount Paid:", 25, yPos + 5);
  doc.setTextColor(0, 128, 0); // Green
  doc.setFontSize(16);
  doc.text(`KSh ${payment.amount.toLocaleString()}`, pageWidth - 25, yPos + 5, {
    align: "right",
  });

  // Status Section
  yPos += 30;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Status:", 20, yPos);

  const statusColor = payment.isApproved ? [0, 128, 0] : [255, 165, 0];
  const statusText = payment.isApproved ? "APPROVED" : "PENDING APPROVAL";
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(statusText, 50, yPos);

  if (payment.isApproved && payment.approvedAt) {
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    yPos += 8;
    doc.text(
      `Approved on: ${new Date(payment.approvedAt).toLocaleDateString()}`,
      20,
      yPos
    );
  }

  // Notes Section
  if (payment.notes) {
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;
    const splitNotes = doc.splitTextToSize(payment.notes, pageWidth - 40);
    doc.text(splitNotes, 20, yPos);
    yPos += splitNotes.length * 6;
  }

  // Footer
  const footerY = pageHeight - 50;
  doc.setDrawColor(135, 206, 250);
  doc.setLineWidth(0.5);
  doc.line(20, footerY, pageWidth - 20, footerY);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Thank you for your payment!", pageWidth / 2, footerY + 10, {
    align: "center",
  });

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text(
    "This is a computer-generated receipt and does not require a signature.",
    pageWidth / 2,
    footerY + 18,
    { align: "center" }
  );

  doc.text(
    "For any queries, please contact us at info@elshadaiapartments.co.ke",
    pageWidth / 2,
    footerY + 24,
    { align: "center" }
  );

  // Developer credit
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Designed and Developed by Damani Nexus",
    pageWidth / 2,
    footerY + 32,
    { align: "center" }
  );
  doc.text(
    "Contact us on info@damaninexus.com or 0758815721",
    pageWidth / 2,
    footerY + 38,
    { align: "center" }
  );

  // Save the PDF
  const receiptFileName = payment.paymentId || payment.receiptNumber || payment.id;
  doc.save(`Receipt_${receiptFileName}.pdf`);
}

