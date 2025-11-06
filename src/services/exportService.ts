// src/services/exportService.ts

import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { type Transaction, type Category } from "../types";

// --- ✨ النسخة النهائية والمحسّنة لدالة EXPORT TO EXCEL ✨ ---
export async function exportToExcel(
  transactions: any[],
  fileName: string = "transactions"
): Promise<void> {
  if (transactions.length === 0) {
    alert("No data to export.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Transactions");

  // 1. تحديد الأعمدة ورؤوسها
  const headers = Object.keys(transactions[0]).filter(
    (key) => key !== "_fullDate"
  );
  worksheet.columns = headers.map((header) => ({
    header: header,
    key: header,
    width: header.length > 20 ? 30 : 20,
  }));

  // 2. تطبيق نمط الهيدر
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };
    cell.font = { bold: true, color: { argb: "FF000000" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // 3. إضافة البيانات وتطبيق الأنماط
  transactions.forEach((transaction) => {
    const rowData = { ...transaction };
    delete rowData._fullDate;

    const addedRow = worksheet.addRow(rowData);

    // --- تنسيق التاريخ والوقت ---
    const dateCell = addedRow.getCell(1);
    const fullDate = transaction._fullDate as Date;
    dateCell.value = {
      richText: [
        { font: { bold: true }, text: fullDate.toLocaleDateString() + " " },
        {
          font: { size: 9, color: { argb: "FF808080" } },
          text: fullDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    };

    // --- تنسيق ألوان النوع (Income/Expense) ---
    const typeHeader = headers[2];
    const typeValue = transaction[typeHeader] || "";
    const isIncome =
      typeValue.toLowerCase().includes("income") ||
      typeValue.toLowerCase().includes("دخل");

    if (isIncome) {
      // ✨ تعديل: تلوين الخلايا بشكل فردي وتخطي آخر خليتين
      addedRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // نقوم بتلوين أول 4 خلايا فقط (Date, Description, Type, Amount)
        if (colNumber <= 5) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD9EAD3" },
          }; // أخضر فاتح
        }
      });
    } else {
      const typeCell = addedRow.getCell(3);
      const amountCell = addedRow.getCell(4);
      typeCell.font = { color: { argb: "FFFF0000" } };
      amountCell.font = { color: { argb: "FFFF0000" } };
    }

    // --- تلوين خلايا الأولوية ---
    const priorityHeader = headers[5];
    const priorityValue = transaction[priorityHeader] || "";
    const priorityCell = addedRow.getCell(6);

    if (
      priorityValue.toLowerCase().includes("low") ||
      priorityValue.toLowerCase().includes("منخفضة")
    ) {
      priorityCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFC0C2" },
      }; // أحمر فاتح
    } else if (
      priorityValue.toLowerCase().includes("medium") ||
      priorityValue.toLowerCase().includes("متوسطة")
    ) {
      priorityCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF99" },
      }; // أصفر كناري (Canary Yellow) 
    } else if (
      priorityValue.toLowerCase().includes("high") ||
      priorityValue.toLowerCase().includes("عالية")
    ) {
      priorityCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4AFF95" },
      }; // أخضر فسفوري فاتح
    }

    // إضافة حدود لكل الخلايا
    addedRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // 4. كتابة الملف وحفظه
  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`);
  } catch (err) {
    console.error("Error writing excel buffer or saving file:", err);
    alert("An error occurred while creating the Excel file.");
  }
}

// --- دالة EXPORT TO PDF تبقى كما هي بدون تغيير ---
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
  // ... كل الكود الخاص بـ PDF يبقى هنا كما كان ...
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
        throw new Error(
          `Font fetch failed with status: ${response.status} ${response.statusText}`
        );
      }

      const fontBytes = await response.arrayBuffer();
      console.log(
        `Step 3: Font fetched successfully. Byte length: ${fontBytes.byteLength}`
      );

      if (fontBytes.byteLength === 0) {
        throw new Error("Fetched font file is empty.");
      }

      console.log(
        "Step 4: Embedding font into PDF document with { subset: false }."
      );
      customFont = await pdfDoc.embedFont(fontBytes, { subset: false });
      console.log("Step 5: Font embedded successfully.");
    } catch (fontError) {
      console.error("--- CRITICAL FONT ERROR ---", fontError);
      alert(
        "A critical error occurred while loading the font. PDF export cannot continue. Check the console."
      );
      return;
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

    const tableData = transactions.map((t) => ({
      Date: new Date(t.created_at).toLocaleDateString(),
      Description: t.description,
      Type: t.type,
      Amount: t.amount.toFixed(2),
      Category:
        categories.find((c) => c.id === t.category_id)?.name ||
        (t.type === "income" ? "Income" : "N/A"),
      Priority: t.priority || "N/A",
    }));

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
    console.log(
      `Step 8: PDF saved to bytes. Byte length: ${pdfBytes.byteLength}`
    );

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
    console.error(
      "--- A CATCH-ALL error occurred during PDF export ---",
      error
    );
    alert("Failed to generate PDF. Please check the console for more details.");
  }
}
