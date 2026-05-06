"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Eye, EyeOff, CircleCheck } from "lucide-react";
import { ManufacturerLeftPanel } from "@/modules/auth/ManufacturerLeftPanel";

// ─── Password strength indicator ─────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars",  pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number",    pass: /[0-9]/.test(password) },
    { label: "Special",   pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const barColor =
    score <= 1 ? "bg-red-400"
    : score === 2 ? "bg-amber-400"
    : score === 3 ? "bg-blue-500"
    : "bg-[#1F6F54]";

  return (
    <div className="space-y-1.5 mt-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? barColor : "bg-[#e2e8f0]"}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((c) => (
          <span key={c.label} className={`text-[11px] ${c.pass ? "text-[#1F6F54]" : "text-[#94a3b8]"}`}>
            {c.pass ? "✓" : "○"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Password field ───────────────────────────────────────────────────────────

function PasswordField({
  label,
  error,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-[13px] font-semibold text-[#0f172a] mb-1.5 block">
        {label} <span className="text-[#c30e1a]">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder ?? "••••••••"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-[42px] pl-3 pr-10 border rounded-[8px] text-[14px] text-[#111] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1F6F54] focus:ring-1 focus:ring-[#1F6F54]/20 bg-white transition-colors ${error ? "border-red-400" : "border-[#cbd5e1]"}`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b] transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [errors, setErrors]       = useState<{ password?: string; confirm?: string }>({});
  const [isLoading, setLoading]   = useState(false);
  const [done, setDone]           = useState(false);

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (password.length < 8)           errs.password = "Minimum 8 characters required";
    else if (!/[A-Z]/.test(password))  errs.password = "Include at least one uppercase letter";
    else if (!/[0-9]/.test(password))  errs.password = "Include at least one number";
    else if (!/[^A-Za-z0-9]/.test(password)) errs.password = "Include at least one special character";
    if (!errs.password && password !== confirm) errs.confirm = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden bg-[#f8fafc] p-3 lg:p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">

        {/* ══ LEFT ══ */}
        <div className="hidden lg:block h-full">
          <ManufacturerLeftPanel />
        </div>

        {/* ══ RIGHT ══ */}
        <div className="h-full flex flex-col justify-center overflow-y-auto px-5 sm:px-10 lg:px-10 py-8 lg:py-0">

          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/for-manufacturers.svg"
            alt="Scinode for Manufacturers"
            height={55}
            style={{ height: 55, width: "auto", display: "block" }}
            className="mb-8 self-start"
          />

          {/* Back link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#64748b] hover:text-[#111] mb-6 transition-colors self-start"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </Link>

          {!done ? (
            <>
              <h1 className="text-[22px] lg:text-[26px] font-medium leading-[32px] text-[#111] mb-1">
                Set a new password
              </h1>
              <p className="text-[14px] text-[#64748b] mb-7 leading-relaxed">
                Must be at least 8 characters with uppercase letters, numbers, and symbols.
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-4 max-w-[420px]">
                <div>
                  <PasswordField
                    label="New Password"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })); }}
                    error={errors.password}
                  />
                  {password && <PasswordStrength password={password} />}
                </div>

                <PasswordField
                  label="Confirm New Password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(v) => { setConfirm(v); setErrors((p) => ({ ...p, confirm: undefined })); }}
                  error={errors.confirm}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[42px] bg-[#018E7E] hover:bg-[#016B5F] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-semibold rounded-[8px] flex items-center justify-center gap-2 transition-colors"
                >
                  {isLoading ? "Saving…" : "Reset Password"}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          ) : (
            /* ── Success state ── */
            <div className="max-w-[400px]">
              <div className="w-14 h-14 rounded-full bg-[#f0fdf4] border-2 border-[#86efac] flex items-center justify-center mb-6">
                <CircleCheck className="w-7 h-7 text-[#15803d]" />
              </div>

              <h1 className="text-[22px] lg:text-[26px] font-medium leading-[32px] text-[#111] mb-2">
                Password updated!
              </h1>
              <p className="text-[14px] text-[#64748b] mb-8 leading-relaxed">
                Your password has been reset successfully. Sign in with your new credentials.
              </p>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full h-[42px] bg-[#018E7E] hover:bg-[#016B5F] text-white text-[14px] font-semibold rounded-[8px] flex items-center justify-center gap-2 transition-colors"
              >
                Back to Login <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
