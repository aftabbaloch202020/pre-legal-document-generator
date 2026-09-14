import React from "react";
import { FieldDefinition } from "@/types";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface FormFieldRendererProps {
  field: FieldDefinition;
  value: any;
  error?: string;
  onChange: (val: any) => void;
}

export function FormFieldRenderer({
  field,
  value,
  error,
  onChange,
}: FormFieldRendererProps) {
  const { name, label, type, required, placeholder, helpText, options } = field;
  const inputId = `field-${name}`;

  if (type === "textarea") {
    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          id={inputId}
          rows={3}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
          )}
        />
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
        {helpText && !error && (
          <p className="mt-1 text-xs text-slate-500">{helpText}</p>
        )}
      </div>
    );
  }

  if (type === "select") {
    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id={inputId}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
          )}
        >
          <option value="">-- Select an option --</option>
          {options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
        {helpText && !error && (
          <p className="mt-1 text-xs text-slate-500">{helpText}</p>
        )}
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <div className="flex items-start gap-3 py-1">
        <input
          id={inputId}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
        />
        <div>
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-800 cursor-pointer"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {helpText && (
            <p className="text-xs text-slate-500 mt-0.5">{helpText}</p>
          )}
          {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
        </div>
      </div>
    );
  }

  // Standard input: text, email, number, date
  return (
    <Input
      id={inputId}
      type={type}
      label={label}
      required={required}
      placeholder={placeholder}
      helperText={helpText}
      error={error}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
