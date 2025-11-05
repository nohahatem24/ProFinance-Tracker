import { type Transaction, type Category } from "../types";
import * as XLSX from "xlsx";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

function formatDataForExport(
  transactions: Transaction[],
  categories: Category[]
) {
  return transactions.map((t) => ({
    Date: new Date(t.created_at).toLocaleDateString(),
    Description: t.description,
    Type: t.type,
    Amount: t.amount.toFixed(2),
    Category:
      categories.find((c) => c.id === t.category_id)?.name ||
      (t.type === "income" ? "Income" : "N/A"),
    Priority: t.priority || "N/A",
  }));
}

export function exportToExcel(
  transactions: Transaction[],
  categories: Category[],
  fileName: string = "transactions"
): void {
  if (transactions.length === 0) {
    alert("No data to export.");
    return;
  }
  const formattedData = formatDataForExport(transactions, categories);
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 10 },
    { wch: 10 },
    { wch: 15 },
    { wch: 10 },
  ];
  XLSX.writeFile(
    workbook,
    `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`
  );
}

export async function exportToPDF(reportData: {
  transactions: Transaction[];
  categories: Category[];
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  currency: string;
  dateRange: { start: string; end: string };
  categoryChartImage: string;
  priorityChartImage: string;
  fileName?: string;
}): Promise<void> {
  console.log("--- Starting PDF Export ---");

  try {
    const {
      transactions,
      categories,
      totalIncome,
      totalExpenses,
      balance,
      currency,
      dateRange,
      categoryChartImage,
      priorityChartImage,
      fileName = "ProFinance_Report",
    } = reportData;

    if (transactions.length === 0) {
      alert("No data to export.");
      return;
    }

    console.log("Step 1: Creating PDF document and registering fontkit.");
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    let customFont;
    try {
      const fontUrl = "/NotoSansArabic-Regular.ttf";
      console.log(`Step 2: Fetching font from URL: ${fontUrl}`);
      
      const response = await fetch(fontUrl);
      console.log(`Font fetch response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`Font fetch failed with status: ${response.status} ${response.statusText}`);
      }

      const fontBytes = await response.arrayBuffer();
      console.log(`Step 3: Font fetched successfully. Byte length: ${fontBytes.byteLength}`);
      
      if (fontBytes.byteLength === 0) {
        throw new Error("Fetched font file is empty.");
      }

      console.log("Step 4: Embedding font into PDF document with { subset: false }.");
      customFont = await pdfDoc.embedFont(fontBytes, { subset: false });
      console.log("Step 5: Font embedded successfully.");

    } catch (fontError) {
      console.error("--- CRITICAL FONT ERROR ---", fontError);
      alert("A critical error occurred while loading the font. PDF export cannot continue. Check the console.");
      return; // **إيقاف التنفيذ تمامًا إذا فشل تحميل الخط**
    }

    console.log("Step 6: Starting to draw content on the PDF page.");
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    let y = height - 40;
    const margin = 40;

    page.drawText("Financial Report", {
      x: margin,
      y,
      font: customFont,
      size: 24,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 25;
    page.drawText(`Date Range: ${dateRange.start} to ${dateRange.end}`, {
      x: margin,
      y,
      font: customFont,
      size: 12,
      color: rgb(0.4, 0.4, 0.4),
    });
    y -= 40;

    const summaryData = [
      ["Total Income:", `${totalIncome.toFixed(2)} ${currency}`],
      ["Total Expenses:", `${totalExpenses.toFixed(2)} ${currency}`],
      ["Final Balance:", `${balance.toFixed(2)} ${currency}`],
    ];

    summaryData.forEach(([label, value], index) => {
      page.drawText(label, {
        x: margin,
        y: y - index * 18,
        font: customFont,
        size: 11,
        color: rgb(0, 0, 0),
      });
      page.drawText(value, {
        x: margin + 120,
        y: y - index * 18,
        font: customFont,
        size: 11,
        color: index === 2 ? rgb(0, 0.5, 0) : rgb(0, 0, 0),
      });
    });
    y -= summaryData.length * 18 + 30;

    if (categoryChartImage && priorityChartImage) {
      const embedImage = async (
        base64: string,
        x: number,
        yPos: number,
        w: number,
        h: number
      ) => {
        if (base64.startsWith("data:image/png;base64,")) {
          const pngImage = await pdfDoc.embedPng(base64);
          page.drawImage(pngImage, { x, y: yPos, width: w, height: h });
        }
      };
      const chartWidth = (width - margin * 3) / 2;
      const chartHeight = 120;
      if (y < margin + chartHeight) {
        page = pdfDoc.addPage();
        y = page.getSize().height - margin;
      }
      y -= chartHeight + 10;
      page.drawText("Charts Summary", {
        x: margin,
        y: y + chartHeight + 15,
        font: customFont,
        size: 16,
      });
      await embedImage(categoryChartImage, margin, y, chartWidth, chartHeight);
      await embedImage(
        priorityChartImage,
        margin * 2 + chartWidth,
        y,
        chartWidth,
        chartHeight
      );
      y -= 30;
    }

    if (y < margin + 40) {
      page = pdfDoc.addPage();
      y = page.getSize().height - margin;
    }
    page.drawText("Transaction History", {
      x: margin,
      y,
      font: customFont,
      size: 16,
      color: rgb(0, 0, 0),
    });
    y -= 25;

    const tableData = formatDataForExport(transactions, categories);
    const tableHeader = [
      "Date",
      "Description",
      "Type",
      "Amount",
      "Category",
      "Priority",
    ];
    const colWidths = [70, 160, 50, 60, 80, 60];
    const headerColor = rgb(0.1, 0.5, 0.4);
    const lineHeight = 18;

    let currentX = margin;
    tableHeader.forEach((header, index) => {
      page.drawRectangle({
        x: currentX,
        y: y - lineHeight,
        width: colWidths[index],
        height: lineHeight,
        color: headerColor,
      });
      page.drawText(header, {
        x: currentX + 5,
        y: y - lineHeight + 5,
        font: customFont,
        size: 10,
        color: rgb(1, 1, 1),
      });
      currentX += colWidths[index];
    });
    y -= lineHeight;

    tableData.forEach((row) => {
      if (y < margin + 20) {
        page = pdfDoc.addPage();
        y = page.getSize().height - margin;
      }
      currentX = margin;
      const rowColor = rgb(0.95, 0.95, 0.95);
      Object.values(row).forEach((cell, colIndex) => {
        page.drawRectangle({
          x: currentX,
          y: y - lineHeight,
          width: colWidths[colIndex],
          height: lineHeight,
          color: rowColor,
        });
        page.drawText(String(cell), {
          x: currentX + 5,
          y: y - lineHeight + 5,
          font: customFont,
          size: 9,
          color: rgb(0, 0, 0),
        });
        currentX += colWidths[colIndex];
      });
      y -= lineHeight;
    });

    console.log("Step 7: Content drawn. Saving PDF document.");
    const pdfBytes = await pdfDoc.save();
    console.log(`Step 8: PDF saved to bytes. Byte length: ${pdfBytes.byteLength}`);

    const blob = new Blob([pdfBytes as unknown as BlobPart], {
      type: "application/pdf",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}_${new Date().toISOString().split("T")[0]}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);
    console.log("--- PDF Export Finished Successfully ---");

  } catch (error) {
    console.error("--- A CATCH-ALL error occurred during PDF export ---", error);
    alert("Failed to generate PDF. Please check the console for more details.");
  }
}
