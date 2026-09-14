"use client";

import React, { useState, useEffect } from "react";
import { Users, Shield, User, CheckCircle2, AlertCircle } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (e) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      setUpdatingId(userId);
      setMessage(null);
      setError(null);

      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setMessage(data.message);
      } else {
        setError(data.error || "Failed to update role");
      }
    } catch (e) {
      setError("Network error updating role");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <DashboardHeader
        heading="User Management"
        subheading="View all registered users and configure system access roles."
      />

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Loading user accounts...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Documents</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {u.name ? u.name[0].toUpperCase() : "U"}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-xs font-mono">
                      {u.email}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={u.role === "ADMIN" ? "purple" : "default"} size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-700 font-medium">
                      {u._count?.documents || 0} docs
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={updatingId === u.id}
                        onClick={() => handleRoleToggle(u.id, u.role)}
                        className="text-xs"
                      >
                        {u.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
