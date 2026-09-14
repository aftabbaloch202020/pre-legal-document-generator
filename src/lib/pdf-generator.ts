import jsPDF from "jspdf";
import { LEGAL_DISCLAIMER_TEXT } from "./template-engine";

export interface GeneratePdfOptions {
  title: string;
  templateTitle: string;
  documentContent: string;
  createdAt?: string;
  documentId?: string;
  userName?: string;
}

export function generateDocumentPdf({
  title,
  templateTitle,
  documentContent,
  createdAt,
  documentId,
  userName,
}: GeneratePdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const maxY = pageHeight - margin - 15; // reserve space for footer
  let cursorY = margin;

  const dateStr = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const refId = documentId ? documentId.substring(0, 8).toUpperCase() : "DRAFT";

  // Helper to check page break
  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight > maxY) {
      addPageFooter();
      doc.addPage();
      cursorY = margin + 10;
      addPageHeader();
    }
  };

  const addPageHeader = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`PRE-LEGAL DOCUMENT | REF: #${refId}`, margin, 12);
    doc.text(dateStr, pageWidth - margin, 12, { align: "right" });
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  };

  const addPageFooter = () => {
    const pageNum = doc.internal.pages.length - 1;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    const footerText =
      "General Pre-Legal Template | For informational purposes only | Not legal advice";
    doc.text(footerText, margin, pageHeight - 10);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 10, {
      align: "right",
    });
  };

  // Header for First Page
  addPageHeader();
  cursorY += 5;

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 30, 50);
  const titleLines = doc.splitTextToSize(title.toUpperCase(), contentWidth);
  doc.text(titleLines, pageWidth / 2, cursorY, { align: "center" });
  cursorY += titleLines.length * 7 + 2;

  // Subtitle / Template Category
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 100, 115);
  doc.text(`Template: ${templateTitle}`, pageWidth / 2, cursorY, {
    align: "center",
  });
  cursorY += 6;

  // Disclaimer Box
  ensureSpace(22);
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(210, 215, 225);
  doc.rect(margin, cursorY, contentWidth, 16, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 80, 20);
  doc.text("PRE-LEGAL NOTICE:", margin + 3, cursorY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  const disclaimerLines = doc.splitTextToSize(
    "This document is generated from a standardized pre-legal template for informational purposes only. It does not constitute formal legal counsel. Seek a qualified attorney for jurisdiction-specific advice.",
    contentWidth - 6
  );
  doc.text(disclaimerLines, margin + 3, cursorY + 8.5);
  cursorY += 22;

  // Main Content
  // Split content by paragraphs
  const paragraphs = documentContent.split("\n");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);

  for (const para of paragraphs) {
    const trimmed = para.trim();

    if (!trimmed) {
      cursorY += 3.5;
      continue;
    }

    // Check if it's a section header (e.g. ALL CAPS or starts with numbering like 1. or SECTION)
    const isHeader =
      /^[0-9]+\.\s+[A-Z\s]+$/.test(trimmed) ||
      /^SECTION\s+[0-9]+/i.test(trimmed) ||
      (trimmed.length < 50 &&
        trimmed === trimmed.toUpperCase() &&
        !trimmed.includes("___") &&
        !trimmed.includes("{{"));

    if (isHeader) {
      ensureSpace(14);
      cursorY += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 40, 70);
      const headerLines = doc.splitTextToSize(trimmed, contentWidth);
      doc.text(headerLines, margin, cursorY);
      cursorY += headerLines.length * 5 + 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
    } else {
      const lines = doc.splitTextToSize(trimmed, contentWidth);
      const neededHeight = lines.length * 4.8;
      ensureSpace(neededHeight);
      doc.text(lines, margin, cursorY);
      cursorY += neededHeight + 2;
    }
  }

  // Signature Block
  ensureSpace(40);
  cursorY += 6;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);

  // Signer 1
  const colWidth = (contentWidth - 20) / 2;
  const col1X = margin;
  const col2X = margin + colWidth + 20;

  doc.line(col1X, cursorY + 15, col1X + colWidth, cursorY + 15);
  doc.line(col2X, cursorY + 15, col2X + colWidth, cursorY + 15);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text("Authorized Signature / First Party", col1X, cursorY + 20);
  doc.text("Second Party / Witness Acknowledgment", col2X, cursorY + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Date: ${dateStr}`, col1X, cursorY + 25);
  doc.text(`Date: ________________________`, col2X, cursorY + 25);

  // Add final page footer
  addPageFooter();

  return doc;
}
