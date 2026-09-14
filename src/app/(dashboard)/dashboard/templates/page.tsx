"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, FileText, ArrowRight, Sparkles, Filter } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DisclaimerBanner } from "@/components/document/DisclaimerBanner";
import { TemplateData } from "@/types";

export default function DashboardTemplatesPage() {
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
    <div className="space-y-6">
      <DashboardHeader
        heading="Document Templates"
        subheading="Select a pre-legal template to customize and generate your legal draft."
      />

      <DisclaimerBanner variant="compact" />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
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
              className="bg-white rounded-xl border border-slate-200 p-6 h-52 animate-pulse space-y-4"
            >
              <div className="h-5 bg-slate-100 rounded w-1/3"></div>
              <div className="h-6 bg-slate-100 rounded w-3/4"></div>
              <div className="h-12 bg-slate-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">No templates found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search criteria or category filter.</p>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
            Clear Filters
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

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-400">
                  <span>{tpl.fieldsSchema?.length || 0} Dynamic fields</span>
                  <span>•</span>
                  <span>PDF Export Ready</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link href={`/dashboard/templates/${tpl.slug}/create`} className="w-full">
                  <Button variant="primary" size="sm" className="w-full justify-center">
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Fill & Generate
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
