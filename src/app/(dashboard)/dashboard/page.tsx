import React from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  PlusCircle,
  FolderOpen,
  CheckCircle2,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DocumentCard } from "@/components/document/DocumentCard";
import { DisclaimerBanner } from "@/components/document/DisclaimerBanner";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  // Fetch statistics
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUserDocuments,
    monthlyUserDocuments,
    totalTemplates,
    recentDocuments,
    popularTemplates,
  ] = await Promise.all([
    prisma.document.count({ where: { userId: session.id } }),
    prisma.document.count({
      where: {
        userId: session.id,
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.template.count(),
    prisma.document.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        template: {
          include: { category: true },
        },
      },
    }),
    prisma.template.findMany({
      where: { isPopular: true },
      take: 4,
      include: { category: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {session.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your legal drafts, generate new documents, and export PDFs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/templates">
            <Button variant="primary" size="sm" className="shadow-sm">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Create Document
            </Button>
          </Link>
          <Link href="/dashboard/documents">
            <Button variant="outline" size="sm">
              <FolderOpen className="w-4 h-4 mr-1.5" />
              My Documents
            </Button>
          </Link>
        </div>
      </div>

      {/* Legal Notice */}
      <DisclaimerBanner variant="compact" />

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Documents
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {totalUserDocuments}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Created This Month
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {monthlyUserDocuments}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Available Templates
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {totalTemplates}
            </h3>
          </div>
        </Card>
      </div>

      {/* Recent Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Documents</h2>
            <p className="text-xs text-slate-500">Your most recently generated pre-legal drafts</p>
          </div>
          {recentDocuments.length > 0 && (
            <Link
              href="/dashboard/documents"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all ({totalUserDocuments})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {recentDocuments.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700">No documents yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't generated any documents. Select a template below to create your first draft.
            </p>
            <Link href="/dashboard/templates">
              <Button variant="primary" size="sm">
                Browse Templates
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recentDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                title={doc.title}
                templateTitle={doc.template.title}
                categoryName={doc.template.category.name}
                createdAt={doc.createdAt.toISOString()}
                content={doc.generatedContent}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Start Popular Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recommended Templates</h2>
            <p className="text-xs text-slate-500">Frequently used pre-legal agreements ready for instant drafting</p>
          </div>
          <Link
            href="/dashboard/templates"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            All templates
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition group"
            >
              <div>
                <Badge variant="info" size="sm" className="mb-2">
                  {tpl.category.name}
                </Badge>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                  {tpl.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {tpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/dashboard/templates/${tpl.slug}/create`}
                  className="w-full"
                >
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    Use Template
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
