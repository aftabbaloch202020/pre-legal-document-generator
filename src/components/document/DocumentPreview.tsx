"use client";

import React, { useState } from "react";
import { Download, Edit3, Trash2, Printer, Check, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { generateDocumentPdf } from "@/lib/pdf-generator";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DocumentPreviewProps {
  documentId?: string;
  title: string;
  templateTitle: string;
  categoryName?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  userName?: string;
  editUrl?: string;
  onDelete?: () => Promise<void>;
  isSaved?: boolean;
}

export function DocumentPreview({
  documentId,
  title,
  templateTitle,
  categoryName,
  content,
  createdAt,
  updatedAt,
  userName,
  editUrl,
  onDelete,
  isSaved = true,
}: DocumentPreviewProps) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadPdf = () => {
    try {
      setIsDownloading(true);
      const pdf = generateDocumentPdf({
        title,
        templateTitle,
        documentContent: content,
        createdAt,
        documentId,
        userName,
      });

      const sanitizedFilename = title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 40);

      pdf.save(`${sanitizedFilename || "pre-legal-document"}.pdf`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete();
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert("Failed to delete document.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/documents"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
              <Badge variant="success">Generated</Badge>
              {categoryName && <Badge variant="info">{categoryName}</Badge>}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Template: <span className="font-medium text-slate-700">{templateTitle}</span>
              {createdAt && ` • Created ${formatDate(createdAt)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          {editUrl && (
            <Link href={editUrl}>
              <Button variant="outline" size="sm">
                <Edit3 className="w-4 h-4 mr-1.5" />
                Edit / Re-generate
              </Button>
            </Link>
          )}

          <Button variant="outline" size="sm" onClick={handlePrint} className="hidden sm:inline-flex">
            <Printer className="w-4 h-4 mr-1.5" />
            Print
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPdf}
            isLoading={isDownloading}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 mr-1.5 text-emerald-300" />
                Downloaded!
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-1.5" />
                Download PDF
              </>
            )}
          </Button>

          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Prominent Legal Notice */}
      <DisclaimerBanner />

      {/* A4 Paper Mockup Preview */}
      <div className="max-w-4xl mx-auto">
        <div className="document-paper rounded-lg p-8 md:p-14 border border-slate-200/90 text-slate-800 space-y-6">
          {/* Paper Header */}
          <div className="border-b border-slate-200 pb-4 flex justify-between items-center text-xs text-slate-400 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-600">Standard Pre-Legal Draft</span>
            </div>
            <div>REF #{documentId ? documentId.substring(0, 8).toUpperCase() : "DRAFT"}</div>
          </div>

          {/* Document Title on Paper */}
          <div className="text-center pt-2 pb-4 space-y-1 border-b border-slate-100">
            <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-wide uppercase">
              {title}
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Form Category: {templateTitle}
            </p>
          </div>

          {/* Document Content Display */}
          <div className="font-serif leading-relaxed text-[15px] space-y-4 whitespace-pre-line text-slate-800">
            {content}
          </div>

          {/* Paper Footer with Signature Placeholders */}
          <div className="pt-10 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-600 font-sans">
            <div className="space-y-2">
              <div className="border-b border-slate-400 w-48 pb-1 pt-6"></div>
              <p className="font-semibold text-slate-800">Authorized Signature / First Party</p>
              <p className="text-slate-400">Date: {createdAt ? formatDate(createdAt) : "____________________"}</p>
            </div>
            <div className="space-y-2">
              <div className="border-b border-slate-400 w-48 pb-1 pt-6"></div>
              <p className="font-semibold text-slate-800">Second Party / Attesting Witness</p>
              <p className="text-slate-400">Date: ____________________</p>
            </div>
          </div>

          {/* Micro Legal Footer */}
          <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 text-center font-sans">
            Pre-Legal Document Generator • For informational and preparatory purposes only • Not formal legal advice
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Document Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{title}</strong>? This action cannot be undone and will permanently remove this generated document from your account.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete Document
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
