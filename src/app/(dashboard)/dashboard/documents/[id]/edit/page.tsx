"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DynamicForm } from "@/components/dynamic-form/DynamicForm";
import { DisclaimerBanner } from "@/components/document/DisclaimerBanner";
import { DocumentData, TemplateData } from "@/types";

export default function EditDocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = params;

  const [document, setDocument] = useState<any>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocument() {
      try {
        setLoading(true);
        const res = await fetch(`/api/documents/${id}`);
        const data = await res.json();
        if (data.success && data.document) {
          setDocument(data.document);
          setDocumentTitle(data.document.title);
        } else {
          setError(data.error || "Failed to load document.");
        }
      } catch (err) {
        setError("Network error while loading document.");
      } finally {
        setLoading(false);
      }
    }
    loadDocument();
  }, [id]);

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: documentTitle,
          formData,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to update document.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Updated! Navigate to preview
      router.push(`/dashboard/documents/${id}`);
      router.refresh();
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500">Loading document details...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Unable to load document</h3>
        <p className="text-sm text-slate-600">{error || "Document not found."}</p>
        <Link href="/dashboard/documents">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Documents
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <Link
          href={`/dashboard/documents/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Return to Preview</span>
        </Link>

        <div className="flex items-center gap-2 mb-1">
          <Badge variant="warning">Edit Mode</Badge>
          <Badge variant="info">{document.template?.category?.name || "Legal Draft"}</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Edit & Re-generate: {document.title}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update the fields below. Submitting will re-compile the document clauses and generate an updated draft.
        </p>
      </div>

      <DisclaimerBanner variant="compact" />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Re-use DynamicForm with prefilled values */}
      <DynamicForm
        fields={document.template.fieldsSchema}
        initialValues={document.formData}
        documentTitle={documentTitle}
        onTitleChange={setDocumentTitle}
        onSubmit={handleSubmit}
        isLoading={submitting}
        submitButtonText="Save Changes & Re-generate"
      />
    </div>
  );
}
