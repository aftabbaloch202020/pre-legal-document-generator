"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { FieldDefinition } from "@/types";

export default function EditTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = params;

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [contentTemplate, setContentTemplate] = useState("");
  const [fields, setFields] = useState<FieldDefinition[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [tplRes, catRes] = await Promise.all([
          fetch(`/api/admin/templates/${id}`),
          fetch("/api/templates"),
        ]);

        const tplData = await tplRes.json();
        const catData = await catRes.json();

        if (catData.success && catData.categories) {
          setCategories(catData.categories);
        }

        if (tplData.success && tplData.template) {
          const t = tplData.template;
          setTitle(t.title);
          setSlug(t.slug);
          setDescription(t.description);
          setCategoryId(t.categoryId);
          setIsPopular(t.isPopular);
          setContentTemplate(t.contentTemplate);
          setFields(t.fieldsSchema || []);
        } else {
          setError(tplData.error || "Failed to load template.");
        }
      } catch (err) {
        setError("Network error loading template.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleAddField = () => {
    const newFieldName = `field_${fields.length + 1}`;
    setFields((prev) => [
      ...prev,
      {
        name: newFieldName,
        label: `Field ${prev.length + 1}`,
        type: "text",
        required: true,
        placeholder: "Enter value",
        section: "General",
      },
    ]);
  };

  const handleRemoveField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldUpdate = (index: number, key: keyof FieldDefinition, value: any) => {
    setFields((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !slug || !description || !categoryId || !contentTemplate) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          categoryId,
          isPopular,
          fieldsSchema: fields,
          contentTemplate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/admin/templates");
        router.refresh();
      } else {
        setError(data.error || "Failed to update template.");
      }
    } catch (err) {
      setError("Error updating template.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading template data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <DashboardHeader
        heading="Edit Template Schema"
        subheading="Update the template fields, category classification, and document body."
      />

      <Link
        href="/dashboard/admin/templates"
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Templates
      </Link>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            1. Template Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Template Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Input
              label="URL Slug (Unique)"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isPopular"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPopular" className="text-sm font-medium text-slate-700">
                Featured on Popular Showcase
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dynamic Fields */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              2. Dynamic Field Schema ({fields.length} Fields)
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddField}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Field
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((f, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
              >
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Variable Key ({`{{${f.name}}}`})
                  </label>
                  <input
                    type="text"
                    value={f.name}
                    onChange={(e) => handleFieldUpdate(idx, "name", e.target.value)}
                    className="w-full text-xs font-mono rounded border border-slate-300 p-1.5 bg-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Field Label
                  </label>
                  <input
                    type="text"
                    value={f.label}
                    onChange={(e) => handleFieldUpdate(idx, "label", e.target.value)}
                    className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Type
                  </label>
                  <select
                    value={f.type}
                    onChange={(e) => handleFieldUpdate(idx, "type", e.target.value)}
                    className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Section
                  </label>
                  <input
                    type="text"
                    value={f.section || "General"}
                    onChange={(e) => handleFieldUpdate(idx, "section", e.target.value)}
                    className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                  />
                </div>

                <div className="md:col-span-1 flex items-center justify-center pt-3">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) => handleFieldUpdate(idx, "required", e.target.checked)}
                    className="h-4 w-4"
                    title="Required field"
                  />
                </div>

                <div className="md:col-span-1 flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => handleRemoveField(idx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Template Textarea */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              3. Document Content Template
            </h3>
            <p className="text-xs text-slate-500">
              Ensure all field keys correspond to curly bracket placeholders.
            </p>
          </div>

          <textarea
            rows={12}
            required
            value={contentTemplate}
            onChange={(e) => setContentTemplate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-4 font-mono text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/admin/templates">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" isLoading={saving}>
            Update Template
          </Button>
        </div>
      </form>
    </div>
  );
}
