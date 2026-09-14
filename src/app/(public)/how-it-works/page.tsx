import React from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, ShieldAlert, Sliders, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DisclaimerBanner } from "@/components/document/DisclaimerBanner";

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="info">Process Guide</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          How PreLegalDoc Works
        </h1>
        <p className="text-slate-600 leading-relaxed text-base">
          Our schema-based template system makes creating structured pre-legal documents fast, reliable, and repeatable.
        </p>
      </div>

      <DisclaimerBanner />

      {/* Step Breakdown */}
      <div className="space-y-12">
        {/* Step 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-2 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 font-extrabold text-2xl flex items-center justify-center">
              01
            </div>
          </div>
          <div className="md:col-span-10 space-y-2">
            <h3 className="text-xl font-bold text-slate-900">
              Browse & Select a Document Template
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore our structured catalog across real estate, business, human resources, debt repayment, and personal declarations. Each template is pre-engineered with standard clauses, covenants, and signature blocks.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-2 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold text-2xl flex items-center justify-center">
              02
            </div>
          </div>
          <div className="md:col-span-10 space-y-2">
            <h3 className="text-xl font-bold text-slate-900">
              Complete the Dynamic Form
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              No need to format or type complex legal jargon. Our dynamic form engine adapts to the chosen template, presenting intuitive inputs with validation for party names, property addresses, payment schedules, and dates.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-2 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 font-extrabold text-2xl flex items-center justify-center">
              03
            </div>
          </div>
          <div className="md:col-span-10 space-y-2">
            <h3 className="text-xl font-bold text-slate-900">
              Preview, Download PDF & Archive
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Preview your compiled agreement on our realistic document paper mockup. Download an official PDF with standard reference headers and signature lines. All documents remain securely saved in your personal dashboard for later review or re-editing.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-8">
        <Link href="/templates">
          <Button size="lg" variant="primary">
            Explore All Available Templates
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
