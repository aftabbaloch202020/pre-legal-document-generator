"use client";

import React, { useState, useEffect } from "react";
import { User, Lock, Mail, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success && data.user) {
        setProfile(data.user);
        setName(data.user.name);
      }
    } catch (e) {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message || "Profile updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        if (data.user) setProfile(data.user);
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch (e) {
      setError("An unexpected network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <DashboardHeader
        heading="Account Settings"
        subheading="Manage your personal details and account credentials."
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

      {/* Account Info Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {profile?.name ? profile.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{profile?.name}</h2>
              <Badge variant={profile?.role === "ADMIN" ? "purple" : "default"}>
                {profile?.role === "ADMIN" ? "Admin" : "Standard User"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">{profile?.email}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Member since {profile?.createdAt ? formatDate(profile.createdAt) : "N/A"}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-center sm:text-right">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
            Generated Documents
          </span>
          <span className="text-lg font-bold text-slate-800">
            {profile?._count?.documents || 0}
          </span>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleUpdate} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Profile Details
        </h3>

        <div className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            icon={<User className="w-4 h-4" />}
          />

          <Input
            label="Email Address"
            value={profile?.email || ""}
            disabled
            helperText="Email address cannot be changed."
            icon={<Mail className="w-4 h-4" />}
          />
        </div>

        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 pt-4">
          Change Password (Optional)
        </h3>

        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="Required only if changing password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button type="submit" variant="primary" isLoading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
