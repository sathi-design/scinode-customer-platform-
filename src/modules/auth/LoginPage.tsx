"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Check, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useHydration } from "@/hooks/useHydration";
import { useAppStore } from "@/store/useAppStore";
import { ManufacturerLeftPanel } from "./ManufacturerLeftPanel";

const inputCls =
  "w-full h-[42px] px-3 border border-[#cbd5e1] rounded-[8px] text-[14px] text-[#111] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1F6F54] focus:ring-1 focus:ring-[#1F6F54]/20 bg-white transition-colors";

const labelCls = "text-[13px] font-semibold text-[#0f172a] mb-1.5 block";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, setUser } = useAuth();
  const hydrated = useHydration();

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPwd]  = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors]         = useState<{ email?: string; password?: string; server?: string }>({});
  const [success, setSuccess]       = useState(false);

  // On mount: clear any stale non-manufacturing session so the user must log in fresh
  useEffect(() => {
    if (!hydrated) return;
    const u = useAppStore.getState().user;
    if (u && u.role !== "manufacturing") {
      // Stale session from a different role — clear it so they log in properly
      useAppStore.getState().logout();
    } else if (u?.role === "manufacturing") {
      router.replace("/dashboard");
    }
  }, [hydrated, router]);

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = "Valid email address required";
    if (!password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setErrors({});
      await login(email, password);
      // This is the Manufacturer portal — force role to manufacturing
      // so any email always lands on the correct dashboard
      const loggedIn = useAppStore.getState().user;
      if (loggedIn && loggedIn.role !== "manufacturing") {
        setUser({ ...loggedIn, role: "manufacturing" });
      }
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch {
      setErrors({ server: "Invalid email or password. Please try again." });
    }
  };

  return (
    <div className="min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden bg-[#f8fafc] p-3 lg:p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">

        {/* ══ LEFT ══ */}
        <div className="hidden lg:block h-full">
          <ManufacturerLeftPanel />
        </div>

        {/* ══ RIGHT ══ */}
        <div className="h-full flex flex-col justify-center overflow-y-auto px-5 sm:px-10 lg:px-10 py-8 lg:py-0 relative">

          {/* ── Success toast ── */}
          {success && (
            <div className="absolute top-6 left-0 right-0 mx-10 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-[10px] px-4 py-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-[#15803d] flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-[#15803d]">Successfully logged in!</p>
                  <p className="text-[12px] text-[#166534]">Taking you to your dashboard…</p>
                </div>
              </div>
            </div>
          )}

          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/for-manufacturers.svg"
            alt="Scinode for Manufacturers"
            height={55}
            style={{ height: 55, width: "auto", display: "block" }}
            className="mb-6 self-start"
          />

          {/* Heading */}
          <h1 className="text-[22px] lg:text-[26px] font-medium leading-[32px] text-[#111] mb-0.5">
            Welcome Back
          </h1>
          <p className="text-[16px] font-semibold text-[#1F6F54] mb-6">Log in</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">

              {/* Work Email */}
              <div>
                <label className={labelCls}>
                  Work Email Address <span className="text-[#c30e1a]">*</span>
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  className={`${inputCls}${errors.email ? " !border-red-400" : ""}`}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                />
                {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className={labelCls}>
                  Password <span className="text-[#c30e1a]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={`${inputCls} pr-10${errors.password ? " !border-red-400" : ""}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-[11px] mt-1">{errors.password}</p>}
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setRememberMe((v) => !v)}
                  className="flex items-center gap-2 group"
                >
                  {rememberMe
                    ? <div className="w-4 h-4 rounded bg-[#1F6F54] flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      </div>
                    : <div className="w-4 h-4 rounded border-2 border-[#cbd5e1] flex-shrink-0 group-hover:border-[#1F6F54] transition-colors" />
                  }
                  <span className="text-[13px] text-[#64748b]">Remember me</span>
                </button>

                <Link
                  href="/forgot-password"
                  className="text-[13px] text-[#0284c7] hover:text-[#0369a1] underline underline-offset-2 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Server error */}
              {errors.server && (
                <div className="bg-[#fff5f5] border border-red-200 rounded-[8px] px-3 py-2.5">
                  <p className="text-[12px] text-red-600">{errors.server}</p>
                </div>
              )}

              {/* CTA */}
              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full h-[42px] bg-[#018E7E] hover:bg-[#016B5F] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-semibold rounded-[8px] flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? "Signing in…" : "Login to SCINODE"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Sign up link */}
              <p className="text-center text-[13px] font-medium text-[#111]">
                New to SCINODE?{" "}
                <Link href="/signup/manufacturer" className="text-[#0084D1] underline underline-offset-2">
                  Sign Up
                </Link>
              </p>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
