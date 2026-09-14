import React from "react";
import Link from "next/link";
import { Shield, BookOpen, Cpu, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DisclaimerBanner } from "@/components/document/DisclaimerBanner";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <Badge variant="purple">Academic SaaS Project</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          About Pre-Legal Document Generator
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-base">
          An educational, production-ready SaaS web application showcasing modern full-stack development, dynamic schema architecture, and containerized deployment.
        </p>
      </div>

      <DisclaimerBanner />

      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 text-slate-700 leading-relaxed text-sm">
        <h2 className="text-xl font-bold text-slate-900">Project Mission & Objectives</h2>
        <p>
          The Pre-Legal Document Generator was developed as an academic software engineering capstone project. Its objective is to build a robust SaaS application allowing individuals, freelancers, and small teams to rapidly generate structured pre-legal agreements without recurring legal overhead.
        </p>
        <p>
          By leveraging declarative JSON schemas, the system separates legal template wording from user-specific variables, guaranteeing consistent formatting, input sanitization, and PDF output.
        </p>

        <h2 className="text-xl font-bold text-slate-900 pt-4">Legal Disclaimer & Permitted Use</h2>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg text-amber-900 space-y-2">
          <p className="font-semibold">Notice of Educational and Pre-Legal Scope:</p>
          <p className="text-xs">
            This platform does NOT provide legal advice and does not establish an attorney-client relationship. All templates and documents generated are general drafts for preliminary documentation, informational purposes, and negotiation reference. For formal filings, judicial proceedings, or critical commercial agreements, consult an attorney licensed in your relevant jurisdiction.
          </p>
        </div>

        <h2 className="text-xl font-bold text-slate-900 pt-4">Technical Stack & Architecture</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <li className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Framework:</strong> Next.js 14 App Router</span>
          </li>
          <li className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Database:</strong> PostgreSQL / SQLite & Prisma ORM</span>
          </li>
          <li className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Authentication:</strong> JWT & Bcrypt Hashing</span>
          </li>
          <li className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Containerization:</strong> Docker & Docker Compose</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
