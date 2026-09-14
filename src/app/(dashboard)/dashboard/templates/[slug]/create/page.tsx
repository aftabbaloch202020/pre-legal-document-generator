"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, FileText, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DynamicForm } from "@/components/dynamic-form/DynamicForm";
import { DisclaimerBanner } from "@/components/document/DisclaimerBanner";
import { TemplateData } from "@/types";

export default function CreateDocumentPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const { slug } = params;

  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplate() {
      try {
        setLoading(true);
        const res = await fetch(`/api/templates/${slug}`);
        const data = await res.json();
        if (data.success && data.template) {
          setTemplate(data.template);
          setDocumentTitle(`${data.template.title} - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`);
        } else {
          setError(data.error || "Template not found.");
        }
      } catch (err) {
        setError("Failed to load template data.");
      } finally {
        setLoading(false);
      }
    }
    loadTemplate();
  }, [slug]);

  const handleSubmit = async (formData: Record<string, any>) => {
    if (!template) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          title: documentTitle,
          formData,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to generate document.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Successfully generated document! Navigate to preview
      router.push(`/dashboard/documents/${data.document.id}`);
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500">Loading dynamic template schema...</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Unable to load template</h3>
        <p className="text-sm text-slate-600">{error || "Template could not be found."}</p>
        <Link href="/dashboard/templates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Templates
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back and Title Header */}
      <div>
        <Link
          href="/dashboard/templates"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Templates</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="info">{template.category?.name || "Legal Form"}</Badge>
              <span className="text-xs text-slate-400">
                {template.fieldsSchema.length} Input Fields
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {template.title}
            </h1>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          {template.description}
        </p>
      </div>

      <DisclaimerBanner variant="compact" />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Dynamic Form Component */}
      <DynamicForm
        fields={template.fieldsSchema}
        documentTitle={documentTitle}
        onTitleChange={setDocumentTitle}
        onSubmit={handleSubmit}
        isLoading={submitting}
        submitButtonText="Generate Pre-Legal Document"
      />
    </div>
  );
}
