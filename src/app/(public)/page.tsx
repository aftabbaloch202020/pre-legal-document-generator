import React from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  Zap,
  Download,
  CheckCircle,
  ArrowRight,
  Sliders,
  Scale,
  Lock,
  HelpCircle,
  ChevronRight,
  Layers,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DisclaimerBanner } from "@/components/document/DisclaimerBanner";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // ISR cache

export default async function LandingPage() {
  // Fetch popular templates directly from DB for the landing showcase
  const popularTemplates = await prisma.template.findMany({
    where: { isPopular: true },
    include: {
      category: true,
      _count: { select: { documents: true } },
    },
    take: 4,
  });

  const allTemplatesCount = await prisma.template.count();

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Academic SaaS Prototype & Document Generator</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-tight">
            Create Pre-Legal Documents{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              in Minutes
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Generate structured pre-legal documents from customizable templates quickly and efficiently.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/register">
              <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 shadow-md shadow-blue-500/20">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/templates">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                Browse Templates ({allTemplatesCount})
              </Button>
            </Link>
          </div>

          {/* Hero Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Dynamic Form Validation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Instant PDF Export</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Standardized Clauses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>No Credit Card Required</span>
            </div>
          </div>

          {/* Prominent Legal Disclaimer in Hero */}
          <div className="max-w-3xl mx-auto pt-6">
            <DisclaimerBanner variant="compact" />
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <Badge variant="info">Simple 3-Step Flow</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            How It Works
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            From template selection to a downloadable PDF in three streamlined steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative space-y-4 hover:border-blue-300 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Select Your Template
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Choose from standardized pre-legal agreements covering tenancy, non-disclosure, employment, payment agreements, and sworn declarations.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative space-y-4 hover:border-blue-300 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Fill Dynamic Form
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Our schema-driven form engine dynamically prompts you for necessary party details, dates, amounts, and specific conditions with real-time validation.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative space-y-4 hover:border-blue-300 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Preview & Download PDF
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Review your formatted draft on a realistic document paper preview, edit if needed, save to your dashboard, and export an official PDF draft.
            </p>
          </div>
        </div>
      </section>

      {/* 3. POPULAR TEMPLATES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <Badge variant="purple">Template Library</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">
              Popular Document Templates
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Start with tested, industry-standard pre-legal structures.
            </p>
          </div>
          <Link href="/templates">
            <Button variant="outline" size="sm">
              View All Templates
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="info" size="sm">
                    {tpl.category.name}
                  </Badge>
                  <span className="text-[11px] text-slate-400">Popular</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                  {tpl.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                  Ready to draft
                </span>
                <Link href={`/login?redirect=/dashboard/templates/${tpl.slug}/create`}>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    Use Template
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PLATFORM FEATURES */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-3">
            <Badge variant="info">Engineered for Efficiency</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Why Use This Platform
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Replace messy Word templates with a dynamic, repeatable SaaS document workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Dynamic Form Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Forms adapt automatically to each document type. Required fields, date pickers, numbers, and custom options are validated before generation.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Client & Server PDF Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Produces clean, multi-page PDFs with header stamps, reference tracking numbers, styled clauses, signature placeholders, and compliance disclaimers.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Secure Document Archive</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every generated document is securely linked to your account. Edit previous responses, re-generate terms, or delete anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="default">Frequently Asked Questions</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Got Questions? We Have Answers
          </h2>
          <p className="text-slate-500 text-sm">
            Everything you need to know about the Pre-Legal Document Generator.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
            <h4 className="text-base font-semibold text-slate-900">
              Are the generated documents considered formal legal advice?
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              No. Documents generated by this platform are general pre-legal templates for preparatory and informational purposes only. They do not constitute formal legal counsel. For high-stakes transactions or jurisdictional filings, always have a qualified attorney review the draft.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
            <h4 className="text-base font-semibold text-slate-900">
              Can I re-edit a document after saving it?
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Yes! All your input data is saved in your account dashboard. You can open any previous document in "My Documents", adjust dates, names, or values, and re-generate a fresh PDF instantly.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
            <h4 className="text-base font-semibold text-slate-900">
              Can the system be run via Docker?
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Yes. The application is completely containerized with a multi-stage Dockerfile and Docker Compose connecting a production Next.js service to a PostgreSQL 16 database.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Generate Your First Pre-Legal Document?
          </h2>
          <p className="text-blue-100 max-w-xl mx-auto text-base">
            Create an account in seconds and access our complete library of standardized agreements.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/register">
              <Button size="lg" variant="navy" className="bg-white text-blue-900 hover:bg-slate-100 shadow-md">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/templates">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                Explore Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
