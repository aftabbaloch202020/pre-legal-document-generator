"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, FileText, ArrowRight, Check, Filter } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DisclaimerBanner } from "@/components/document/DisclaimerBanner";
import { TemplateData } from "@/types";

export default function PublicTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, searchQuery]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const res = await fetch(`/api/templates?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="info">Pre-Legal Templates</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Browse Document Templates
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Select from our curated library of standardized pre-legal agreements. Each template includes dynamic field configuration and exportable PDF generation.
        </p>
      </div>

      <DisclaimerBanner variant="compact" />

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Category Badges */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat.slug
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-6 h-56 animate-pulse space-y-4"
            >
              <div className="h-5 bg-slate-100 rounded w-1/3"></div>
              <div className="h-6 bg-slate-100 rounded w-3/4"></div>
              <div className="h-12 bg-slate-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-800">
            No templates found
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category filter.
          </p>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="info" size="sm">
                    {tpl.category?.name || "General"}
                  </Badge>
                  {tpl.isPopular && (
                    <Badge variant="warning" size="sm">
                      Popular
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                  {tpl.title}
                </h3>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                  {tpl.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
                  <span>{tpl.fieldsSchema?.length || 0} Dynamic fields</span>
                  <span>•</span>
                  <span>PDF Ready</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/login?redirect=/dashboard/templates/${tpl.slug}/create`}
                  className="w-full"
                >
                  <Button variant="primary" size="sm" className="w-full justify-center">
                    Start Generating
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
