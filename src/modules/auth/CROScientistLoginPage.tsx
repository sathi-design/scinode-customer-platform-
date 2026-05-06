"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Eye, EyeOff, Check, CheckCircle2,
  FlaskConical, Building2, HelpCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useHydration } from "@/hooks/useHydration";
import { useAppStore } from "@/store/useAppStore";
import { CROScientistLeftPanel } from "./CROScientistLeftPanel";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full h-[42px] px-3 border border-[#cbd5e1] rounded-[8px] text-[14px] text-[#111] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1F6F54] focus:ring-1 focus:ring-[#1F6F54]/20 bg-white transition-colors";

const labelCls = "text-[13px] font-semibold text-[#0f172a] mb-1.5 block";

// ─── Profile type cards shown on login ────────────────────────────────────────

type ProfileType = "researcher" | "pi" | "others";

interface ProfileTypeOption {
  value: ProfileType;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

const PROFILE_TYPE_OPTIONS: ProfileTypeOption[] = [
  {
    value: "researcher",
    label: "Scientist / Research Lab",
    sublabel: "PI, Professor, academic lab, or independent researcher",
    icon: FlaskConical,
  },
  {
    value: "pi",
    label: "CRO / CDMO",
    sublabel: "CRO, CDMO, or lab providing R&D services",
    icon: Building2,
  },
  {
    value: "others",
    label: "Others",
    sublabel: "Not listed here? We'll guide you.",
    icon: HelpCircle,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CROScientistLoginPage() {
  const router    = useRouter();
  const { login, isLoading, setUser } = useAuth();
  const hydrated  = useHydration();

  const pendingProfileType    = useAppStore((s) => s.pendingProfileType);
  const setPendingProfileType = useAppStore((s) => s.setPendingProfileType);

  // Local selection — mirrors pendingProfileType but lets user change it
  const [selectedType, setSelectedType] = useState<ProfileType | null>(
    (pendingProfileType as ProfileType | null) ?? null
  );

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPwd]  = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors]         = useState<{ email?: string; password?: string; profileType?: string; server?: string }>({});
  const [success, setSuccess]       = useState(false);

  // Sync if pendingProfileType changes (e.g. user navigates back from signup)
  useEffect(() => {
    if (pendingProfileType && !selectedType) {
      setSelectedType(pendingProfileType as ProfileType);
    }
  }, [pendingProfileType, selectedType]);

  // Redirect if already logged in as researcher / pi
  useEffect(() => {
    if (!hydrated) return;
    const u = useAppStore.getState().user;
    if (u && (u.role === "researcher" || u.role === "pi")) {
      router.replace("/dashboard");
    }
  }, [hydrated, router]);

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!selectedType) errs.profileType = "Please select your profile type";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = "Valid email address required";
    if (!password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSelectType = (type: ProfileType) => {
    setSelectedType(type);
    setPendingProfileType(type);
    setErrors((p) => ({ ...p, profileType: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setErrors({});
      await login(email, password);

      // Always stamp the role from the chosen card — prevents stale role issues
      const loggedIn = useAppStore.getState().user;
      const subtype  = selectedType ?? "researcher";
      const role     = subtype === "researcher" ? "researcher" : subtype === "pi" ? "pi" : "researcher";

      setUser({
        ...(loggedIn ?? {
          id: "",
          email,
          name: email,
          profileCompletion: 0,
          createdAt: new Date().toISOString(),
        }),
        role,
        profileSubtype: subtype,
      });

      // Clear the bridge
      setPendingProfileType(null);

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
          <CROScientistLeftPanel />
        </div>

        {/* ══ RIGHT ══ */}
        <div className="h-full flex flex-col justify-center overflow-y-auto px-5 sm:px-10 lg:px-10 py-8 lg:py-0 relative">

          {/* Success toast */}
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
            src="/images/for-researchers.svg"
            alt="Scinode for Researchers"
            height={55}
            style={{ height: 55, width: "auto", display: "block" }}
            className="mb-5 self-start"
          />

          {/* Heading */}
          <h1 className="text-[22px] lg:text-[26px] font-medium leading-[32px] text-[#111] mb-0.5">
            Welcome Back
          </h1>
          <p className="text-[16px] font-semibold text-[#1F6F54] mb-5">Log in</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">

              {/* ── Profile type selector ─────────────────────────────────── */}
              <div>
                <label className={labelCls}>
                  Profile Type <span className="text-[#c30e1a]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PROFILE_TYPE_OPTIONS.map((pt) => {
                    const selected = selectedType === pt.value;
                    const Icon = pt.icon;
                    return (
                      <button
                        key={pt.value}
                        type="button"
                        onClick={() => handleSelectType(pt.value)}
                        className={cn(
                          "relative text-left px-3 py-1.5 rounded-xl border-2 transition-all duration-150",
                          selected
                            ? "border-[#018E7E] bg-[#f0faf5] shadow-sm"
                            : "border-[#e2e8f0] bg-white hover:border-[#018E7E]/40 hover:bg-[#f8fafc]"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={cn("w-4 h-4 flex-shrink-0", selected ? "text-[#018E7E]" : "text-[#64748b]")} />
                          {selected && (
                            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#018E7E] flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <span className={cn(
                          "block text-[12px] font-semibold leading-snug",
                          selected ? "text-[#018E7E]" : "text-[#0f172a]"
                        )}>
                          {pt.label}
                        </span>
                        <span className={cn(
                          "block text-[10px] leading-snug mt-0.5",
                          selected ? "text-[#018E7E]/70" : "text-[#94a3b8]"
                        )}>
                          {pt.sublabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.profileType && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.profileType}</p>
                )}
              </div>

              {/* ── Email ─────────────────────────────────────────────────── */}
              <div>
                <label className={labelCls}>
                  Organization Email Address <span className="text-[#c30e1a]">*</span>
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

              {/* ── Password ──────────────────────────────────────────────── */}
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

              {/* ── Remember + Forgot ─────────────────────────────────────── */}
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

              {/* ── Server error ──────────────────────────────────────────── */}
              {errors.server && (
                <div className="bg-[#fff5f5] border border-red-200 rounded-[8px] px-3 py-2.5">
                  <p className="text-[12px] text-red-600">{errors.server}</p>
                </div>
              )}

              {/* ── CTA ───────────────────────────────────────────────────── */}
              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full h-[42px] bg-[#018E7E] hover:bg-[#016B5F] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-semibold rounded-[8px] flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? "Signing in…" : "Login to SCINODE"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* ── Sign up link ──────────────────────────────────────────── */}
              <p className="text-center text-[13px] font-medium text-[#111]">
                New to SCINODE?{" "}
                <Link href="/signup/cro-scientist" className="text-[#0084D1] underline underline-offset-2">
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
