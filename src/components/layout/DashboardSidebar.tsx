"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  User,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Shield,
  PlusCircle,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionUser } from "@/types";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
      window.location.href = "/login";
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Document Templates",
      href: "/dashboard/templates",
      icon: FileText,
      exact: false,
    },
    {
      label: "My Documents",
      href: "/dashboard/documents",
      icon: FolderOpen,
      exact: false,
    },
    {
      label: "Account Settings",
      href: "/dashboard/profile",
      icon: User,
      exact: true,
    },
  ];

  const adminNavItems = [
    {
      label: "Admin Overview",
      href: "/dashboard/admin",
      icon: ShieldAlert,
      exact: true,
    },
    {
      label: "Manage Templates",
      href: "/dashboard/admin/templates",
      icon: FileText,
      exact: false,
    },
    {
      label: "Manage Users",
      href: "/dashboard/admin/users",
      icon: User,
      exact: false,
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              PreLegal<span className="text-blue-400">Doc</span>
            </h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              SaaS Generator
            </span>
          </div>
        </Link>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action */}
      <div className="p-4">
        <Link
          href="/dashboard/templates"
          onClick={() => setIsMobileOpen(false)}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Document</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Navigation (Conditional) */}
        {user?.role === "ADMIN" && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Center</span>
            </div>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                      isActive
                        ? "bg-amber-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate">
                {user?.name || "Loading..."}
              </p>
              <span className="text-[10px] text-slate-400 font-mono block truncate">
                {user?.role === "ADMIN" ? "Administrator" : "Standard User"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Trigger Header */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-slate-900 text-white px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-sm">PreLegalDoc</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-800 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-full z-10">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
