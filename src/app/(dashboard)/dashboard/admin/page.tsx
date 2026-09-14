import React from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  Layers,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FolderOpen,
  Plus,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [
    totalUsers,
    totalDocuments,
    totalTemplates,
    totalCategories,
    recentUsers,
    recentDocuments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.document.count(),
    prisma.template.count(),
    prisma.category.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { documents: true } } },
    }),
    prisma.document.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        template: { select: { title: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple">Admin Center</Badge>
            <span className="text-xs text-slate-400">System Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Platform Administration
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/templates/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              New Template
            </Button>
          </Link>
          <Link href="/dashboard/admin/users">
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-1.5" />
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalUsers}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Documents
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalDocuments}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Templates
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalTemplates}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Categories
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalCategories}</h3>
          </div>
        </Card>
      </div>

      {/* Two-Column Grid: Recent Users & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Recent Registered Users
            </h3>
            <Link
              href="/dashboard/admin/users"
              className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentUsers.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{u.name}</p>
                  <p className="text-slate-500 text-[11px]">{u.email}</p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant={u.role === "ADMIN" ? "purple" : "default"} size="sm">
                    {u.role}
                  </Badge>
                  <span className="block text-[10px] text-slate-400">
                    {u._count.documents} docs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Platform Documents */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Latest Platform Documents
            </h3>
            <span className="text-xs text-slate-400">Real-time log</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800 line-clamp-1">{doc.title}</p>
                  <p className="text-slate-500 text-[11px]">
                    By {doc.user.name} • {doc.template.title}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  {formatDate(doc.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
