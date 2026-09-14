"use client";

import React, { useState } from "react";
import { FieldDefinition } from "@/types";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { validateFormData } from "@/lib/template-engine";
import { Sparkles, FileText, CheckCircle2 } from "lucide-react";

interface DynamicFormProps {
  fields: FieldDefinition[];
  initialValues?: Record<string, any>;
  documentTitle: string;
  onTitleChange: (title: string) => void;
  onSubmit: (formData: Record<string, any>) => Promise<void> | void;
  isLoading?: boolean;
  submitButtonText?: string;
}

export function DynamicForm({
  fields,
  initialValues = {},
  documentTitle,
  onTitleChange,
  onSubmit,
  isLoading = false,
  submitButtonText = "Generate Pre-Legal Document",
}: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = { ...initialValues };
    for (const field of fields) {
      if (defaults[field.name] === undefined && field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      }
    }
    return defaults;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [titleError, setTitleError] = useState<string>("");

  // Group fields by section
  const sectionsMap = fields.reduce<Record<string, FieldDefinition[]>>(
    (acc, field) => {
      const section = field.section || "General Information";
      if (!acc[section]) acc[section] = [];
      acc[section].push(field);
      return acc;
    },
    {}
  );

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error on change
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentTitle.trim()) {
      setTitleError("Please provide a name/title for your document.");
      return;
    }
    setTitleError("");

    // Validate using template engine
    const result = validateFormData(fields, formData);
    if (!result.isValid) {
      setErrors(result.errors);
      // Scroll to top or first error
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErrors({});
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Document Title Header Block */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-blue-600 font-semibold text-sm">
          <FileText className="w-4 h-4" />
          <span>Document Identification</span>
        </div>
        <Input
          label="Document Title"
          required
          placeholder="e.g., Lease Agreement - 742 Evergreen Unit 4"
          value={documentTitle}
          onChange={(e) => {
            onTitleChange(e.target.value);
            if (titleError) setTitleError("");
          }}
          error={titleError}
          helperText="Give this document a recognizable name in your dashboard."
        />
      </div>

      {/* Render Field Sections */}
      {Object.entries(sectionsMap).map(([sectionName, sectionFields], sIdx) => (
        <div
          key={sectionName}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm transition-all"
        >
          <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center">
                {sIdx + 1}
              </span>
              <h3 className="text-base font-semibold text-slate-800">
                {sectionName}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {sectionFields.length} {sectionFields.length === 1 ? "field" : "fields"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sectionFields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === "textarea" || (field.section && field.name.includes("Address"))
                    ? "md:col-span-2"
                    : "col-span-1"
                }
              >
                <FormFieldRenderer
                  field={field}
                  value={formData[field.name]}
                  error={errors[field.name]}
                  onChange={(val) => handleFieldChange(field.name, val)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Form Bottom Actions */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Inputs are validated and compiled into formatted legal terms</span>
        </div>

        <Button
          type="submit"
          size="lg"
          variant="primary"
          isLoading={isLoading}
          className="w-full sm:w-auto px-8"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}
