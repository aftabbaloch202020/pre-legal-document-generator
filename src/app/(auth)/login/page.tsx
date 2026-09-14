"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DisclaimerBanner } from "@/components/document/DisclaimerBanner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid credentials. Please try again.");
        return;
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type: "user" | "admin") => {
    if (type === "admin") {
      setEmail("admin@prelegal.com");
      setPassword("Admin@123456");
    } else {
      setEmail("user@prelegal.com");
      setPassword("User@123456");
    }
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-slate-900">
            PreLegal<span className="text-blue-600">Doc</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="text-xs text-slate-500">
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Register for free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              isLoading={loading}
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Quick Demo Fill Buttons for Evaluator / Testing */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Demo Credentials (1-Click Fill)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo("user")}
                className="p-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition text-center"
              >
                Demo User
                <span className="block text-[10px] text-slate-400">Standard Access</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("admin")}
                className="p-2 rounded-lg border border-amber-200 bg-amber-50/50 text-xs font-medium text-amber-900 hover:bg-amber-100/60 transition text-center"
              >
                Demo Admin
                <span className="block text-[10px] text-amber-700">Full Privileges</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <DisclaimerBanner variant="subtle" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
