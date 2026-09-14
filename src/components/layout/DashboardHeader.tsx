import React from "react";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DashboardHeaderProps {
  heading: string;
  subheading?: string;
  actionText?: string;
  actionHref?: string;
}

export function DashboardHeader({
  heading,
  subheading,
  actionText,
  actionHref,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {heading}
        </h1>
        {subheading && (
          <p className="text-sm text-slate-500 mt-1">{subheading}</p>
        )}
      </div>

      {actionText && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            {actionText}
          </Button>
        </Link>
      )}
    </div>
  );
}
