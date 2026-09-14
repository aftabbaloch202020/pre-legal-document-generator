import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DisclaimerBanner } from "@/components/document/DisclaimerBanner";
import { HelpCircle, ArrowRight } from "lucide-react";

export default function FaqPage() {
  const faqs = [
    {
      q: "What does 'Pre-Legal' mean in this context?",
      a: "Pre-legal documents are preliminary drafts, agreements, or notices prepared using standard industry clauses before review or formal execution. They help parties align on essential terms (such as rent, confidentiality, responsibilities, or debt amounts) without starting from scratch.",
    },
    {
      q: "Can I use these documents as legally binding agreements?",
      a: "While many standard agreements may be enforceable if signed voluntarily by competent parties, legal enforceability depends on jurisdiction-specific laws, mandatory statutory disclosures, and proper witnessing or notarization. These templates are provided for informational and pre-drafting purposes, and you should always seek advice from a licensed attorney for binding legal counsel.",
    },
    {
      q: "How does the dynamic form work?",
      a: "Each template contains a structured JSON schema defining necessary fields—such as text, currency numbers, dates, dropdowns, and textareas. When you select a template, the form engine renders only the pertinent fields, validates your entries, and seamlessly substitutes your values into the legal wording.",
    },
    {
      q: "Can I edit a document after generating it?",
      a: "Yes. All your generated documents are stored in your personal account under 'My Documents'. You can review the preview, click 'Edit / Re-generate', update any values, and download an updated PDF at any time.",
    },
    {
      q: "How does the PDF export work?",
      a: "Our PDF engine compiles your finalized pre-legal document into an A4 document with reference tracking numbers, formatted sections, signature lines, page counters, and required pre-legal disclaimers.",
    },
    {
      q: "How do I deploy with Docker?",
      a: "The repository includes a multi-stage Dockerfile and docker-compose.yml. Simply run `docker compose up --build` to launch the Next.js web application along with a PostgreSQL 16 database.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <Badge variant="info">FAQ</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-base">
          Find answers to common questions about document drafting, legal validity, and platform features.
        </p>
      </div>

      <DisclaimerBanner />

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 p-6 space-y-2 shadow-sm"
          >
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs flex items-center justify-center font-mono">
                {idx + 1}
              </span>
              {faq.q}
            </h3>
            <p className="text-sm text-slate-600 pl-8 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-slate-100 rounded-2xl p-8 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Still have questions?</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Sign up today to test all features or check out our full catalog of templates.
        </p>
        <Link href="/register">
          <Button variant="primary" size="md">
            Get Started Now
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
