import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, CheckCircle2, Shield } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DisclaimerBanner } from "@/components/document/DisclaimerBanner";
import { notFound } from "next/navigation";

export default async function TemplateDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const template = await prisma.template.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!template) {
    notFound();
  }

  const fields = JSON.parse(template.fieldsSchema);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <Link
          href="/dashboard/templates"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Templates</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="info" className="mb-2">
              {template.category.name}
            </Badge>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {template.title}
            </h1>
          </div>

          <Link href={`/dashboard/templates/${template.slug}/create`}>
            <Button size="lg" variant="primary" className="shadow-sm">
              Use Template Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <p className="text-base text-slate-600 mt-3 leading-relaxed">
          {template.description}
        </p>
      </div>

      <DisclaimerBanner />

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Required Dynamic Information ({fields.length} Fields)
        </h3>
        <p className="text-xs text-slate-500">
          When you start drafting this document, our dynamic form engine will prompt you for:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {fields.map((f: any) => (
            <div
              key={f.name}
              className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">{f.label}</span>
                {f.required && <span className="text-red-500 ml-1 font-bold">*</span>}
                <span className="block text-slate-400 capitalize text-[10px]">
                  Type: {f.type} {f.section ? `• ${f.section}` : ""}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <Link href={`/dashboard/templates/${template.slug}/create`}>
            <Button variant="primary" size="md">
              Start Dynamic Form
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
