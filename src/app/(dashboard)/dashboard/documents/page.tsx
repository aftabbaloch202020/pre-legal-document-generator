"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  FileText,
  PlusCircle,
  Download,
  Edit3,
  Trash2,
  ExternalLink,
  Calendar,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DisclaimerBanner } from "@/components/document/DisclaimerBanner";
import { formatDate } from "@/lib/utils";
import { generateDocumentPdf } from "@/lib/pdf-generator";
import { DocumentData } from "@/types";

export default function MyDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Deletion modal state
  const [deleteDoc, setDeleteDoc] = useState<DocumentData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [searchQuery, selectedCategory, sortBy]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (selectedCategory && selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      params.append("sort", sortBy);

      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Fetch docs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = (doc: DocumentData) => {
    try {
      const pdf = generateDocumentPdf({
        title: doc.title,
        templateTitle: doc.template?.title || "Legal Document",
        documentContent: doc.generatedContent,
        createdAt: doc.createdAt,
        documentId: doc.id,
      });
      const filename = doc.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .substring(0, 30);
      pdf.save(`${filename || "document"}.pdf`);
    } catch (e) {
      alert("Failed to download PDF.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteDoc) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/documents/${deleteDoc.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== deleteDoc.id));
        setDeleteDoc(null);
      } else {
        alert(data.error || "Failed to delete document.");
      }
    } catch (e) {
      alert("Error deleting document.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="My Documents"
        subheading="Manage, preview, re-generate, and download all your previously generated pre-legal agreements."
        actionText="New Document"
        actionHref="/dashboard/templates"
      />

      <DisclaimerBanner variant="compact" />

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search by title or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="real-estate">Real Estate & Leases</option>
              <option value="business">Corporate & Business</option>
              <option value="employment">Employment & HR</option>
              <option value="personal-legal">Personal Declarations</option>
              <option value="finance">Finance & Debt</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No documents found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== "all"
              ? "No documents matched your search filter."
              : "You haven't generated any pre-legal documents yet."}
          </p>
          <Link href="/dashboard/templates">
            <Button variant="primary" size="sm">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Generate Your First Document
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Document Title</th>
                  <th className="py-3.5 px-6">Template & Category</th>
                  <th className="py-3.5 px-6">Created Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      <Link
                        href={`/dashboard/documents/${doc.id}`}
                        className="hover:text-blue-600 transition flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="line-clamp-1">{doc.title}</span>
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <div className="text-xs font-medium text-slate-800">
                        {doc.template?.title}
                      </div>
                      {doc.template?.category && (
                        <span className="text-[11px] text-slate-400">
                          {doc.template.category.name}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(doc.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="success" size="sm">
                        Generated
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/documents/${doc.id}`}
                          title="View Preview"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDownloadPdf(doc)}
                          title="Download PDF"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/dashboard/documents/${doc.id}/edit`}
                          title="Edit / Re-generate"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteDoc(doc)}
                          title="Delete Document"
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteDoc)}
        onClose={() => setDeleteDoc(null)}
        title="Delete Document"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete{" "}
            <strong className="text-slate-900">{deleteDoc?.title}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDoc(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
