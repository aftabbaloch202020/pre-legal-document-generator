"use client";

import React from "react";
import Link from "next/link";
import { FileText, Calendar, Download, Edit3, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { generateDocumentPdf } from "@/lib/pdf-generator";

interface DocumentCardProps {
  id: string;
  title: string;
  templateTitle: string;
  categoryName?: string;
  createdAt: string;
  content: string;
  onDelete?: (id: string) => void;
}

export function DocumentCard({
  id,
  title,
  templateTitle,
  categoryName,
  createdAt,
  content,
  onDelete,
}: DocumentCardProps) {
  const handleQuickDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const pdf = generateDocumentPdf({
        title,
        templateTitle,
        documentContent: content,
        createdAt,
        documentId: id,
      });
      const sanitized = title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .substring(0, 30);
      pdf.save(`${sanitized || "document"}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">
                {templateTitle}
              </span>
              <h3 className="text-base font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition">
                {title}
              </h3>
            </div>
          </div>
          {categoryName && (
            <Badge variant="info" size="sm">
              {categoryName}
            </Badge>
          )}
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 mt-2 font-serif bg-slate-50 p-2 rounded border border-slate-100">
          {content.substring(0, 150)}...
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(createdAt)}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleQuickDownload}
            title="Quick Download PDF"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
          >
            <Download className="w-4 h-4" />
          </button>
          <Link
            href={`/dashboard/documents/${id}/edit`}
            title="Edit Document"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
          >
            <Edit3 className="w-4 h-4" />
          </Link>
          <Link
            href={`/dashboard/documents/${id}`}
            title="View Full Document"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              title="Delete"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
