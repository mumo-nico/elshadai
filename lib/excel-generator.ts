import * as XLSX from "xlsx-js-style";

interface ExcelOptions {
  title: string;
  dateRange?: string;
  headers: string[];
  data: any[][];
  filename: string;
}

export function generateExcelReport(options: ExcelOptions) {
  const { title, dateRange, headers, data, filename } = options;

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Prepare the data array
  const wsData: any[][] = [];

  // Add header section with styling
  wsData.push([title]); // Row 1: Title
  wsData.push(["ELSHADAI APARTMENTS"]); // Row 2: Company name
  wsData.push(["Location: Kasaala Market, Ikutha"]); // Row 3: Location
  wsData.push(["Phone: 0727497189 or 0726722599"]); // Row 4: Phone
  wsData.push(["Email: info@elshadaiapartments.co.ke | nicholasmusingila@gmail.com"]); // Row 5: Email
  wsData.push([]); // Row 6: Empty row

  if (dateRange) {
    wsData.push([`Report Period: ${dateRange}`]); // Row 7: Date range
    wsData.push([]); // Row 8: Empty row
  }

  wsData.push([`Generated: ${new Date().toLocaleString()}`]); // Generated date
  wsData.push([]); // Empty row

  // Add column headers
  wsData.push(headers);

  // Add data rows
  data.forEach((row) => {
    wsData.push(row);
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const colWidths = headers.map(() => ({ wch: 20 }));
  ws["!cols"] = colWidths;

  // Style the header section
  const headerRowIndex = dateRange ? 10 : 9; // Adjust based on whether date range is present

  // Title styling (Row 1)
  if (ws["A1"]) {
    ws["A1"].s = {
      font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "87CEEB" } }, // Sky blue
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Company name styling (Row 2)
  if (ws["A2"]) {
    ws["A2"].s = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "87CEEB" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Location styling (Row 3)
  if (ws["A3"]) {
    ws["A3"].s = {
      font: { sz: 10, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "87CEEB" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Phone styling (Row 4)
  if (ws["A4"]) {
    ws["A4"].s = {
      font: { sz: 10, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "87CEEB" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Email styling (Row 5)
  if (ws["A5"]) {
    ws["A5"].s = {
      font: { sz: 10, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "87CEEB" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Merge cells for header section
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }, // Company
    { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } }, // Location
    { s: { r: 3, c: 0 }, e: { r: 3, c: headers.length - 1 } }, // Phone
    { s: { r: 4, c: 0 }, e: { r: 4, c: headers.length - 1 } }, // Email
  ];

  // Style column headers
  headers.forEach((_, colIndex) => {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIndex });
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } }, // Dark blue
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    }
  });

  // Style data rows with alternating colors
  data.forEach((row, rowIndex) => {
    const actualRowIndex = headerRowIndex + 1 + rowIndex;
    const isEvenRow = rowIndex % 2 === 0;

    row.forEach((_, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({
        r: actualRowIndex,
        c: colIndex,
      });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          fill: { fgColor: { rgb: isEvenRow ? "FFFFFF" : "F2F2F2" } },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } },
          },
          alignment: { vertical: "center" },
        };
      }
    });
  });

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, filename);
}

