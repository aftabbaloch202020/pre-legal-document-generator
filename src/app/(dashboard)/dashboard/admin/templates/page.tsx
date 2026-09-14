"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Plus, Edit3, Trash2, Layers, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { formatDate } from "@/lib/utils";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/templates");
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/templates/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        alert(data.error || "Failed to delete template.");
      }
    } catch (e) {
      alert("Error deleting template.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <DashboardHeader
        heading="Manage Templates"
        subheading="Create, modify dynamic field schemas, and delete pre-legal document templates."
        actionText="Create New Template"
        actionHref="/dashboard/admin/templates/new"
      />

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Loading templates...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Template</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Dynamic Fields</th>
                  <th className="py-3.5 px-6">Total Generated</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{tpl.title}</div>
                      <div className="text-xs text-slate-400 font-mono">{tpl.slug}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <Badge variant="info" size="sm">
                        {tpl.category?.name || "General"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {tpl.fieldsSchema?.length || 0} fields
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-700">
                      {tpl._count?.documents || 0} docs
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/templates/${tpl.slug}/create`}
                          title="Try Template"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/admin/templates/${tpl.id}/edit`}
                          title="Edit Template Schema"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(tpl)}
                          title="Delete Template"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
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
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Template Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{" "}
            <strong className="text-slate-900">{deleteTarget?.title}</strong>? All
            associated documents generated under this template may be affected.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Delete Template
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
