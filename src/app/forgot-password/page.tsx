"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Mail } from "lucide-react";
import { ManufacturerLeftPanel } from "@/modules/auth/ManufacturerLeftPanel";

const inputCls =
  "w-full h-[42px] px-3 border border-[#cbd5e1] rounded-[8px] text-[14px] text-[#111] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1F6F54] focus:ring-1 focus:ring-[#1F6F54]/20 bg-white transition-colors";

const labelCls = "text-[13px] font-semibold text-[#0f172a] mb-1.5 block";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [error, setError]       = useState("");
  const [isLoading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    // Simulate API call
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
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

          {!submitted ? (
            /* ── Enter email ── */
            <>
              <h1 className="text-[22px] lg:text-[26px] font-medium leading-[32px] text-[#111] mb-1">
                Forgot your password?
              </h1>
              <p className="text-[14px] text-[#64748b] mb-7 leading-relaxed">
                Enter your work email and we&apos;ll send you a secure reset link.
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-4 max-w-[420px]">
                <div>
                  <label className={labelCls}>
                    Work Email Address <span className="text-[#c30e1a]">*</span>
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    className={`${inputCls}${error ? " !border-red-400" : ""}`}
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  />
                  {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[42px] bg-[#018E7E] hover:bg-[#016B5F] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-semibold rounded-[8px] flex items-center justify-center gap-2 transition-colors"
                >
                  {isLoading ? "Sending…" : "Send Reset Link"}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          ) : (
            /* ── Sent confirmation ── */
            <div className="max-w-[400px]">
              <div className="w-14 h-14 rounded-full bg-[#f0faf5] border-2 border-[#bbf7d0] flex items-center justify-center mb-6">
                <Mail className="w-7 h-7 text-[#1F6F54]" />
              </div>

              <h1 className="text-[22px] lg:text-[26px] font-medium leading-[32px] text-[#111] mb-2">
                Check your inbox
              </h1>
              <p className="text-[14px] text-[#64748b] mb-1 leading-relaxed">
                We&apos;ve sent a password reset link to
              </p>
              <p className="text-[14px] font-semibold text-[#111] mb-6">{email}</p>

              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] p-4 mb-7 space-y-1.5">
                <p className="text-[12px] font-semibold text-[#64748b]">Didn&apos;t receive it?</p>
                <ul className="text-[12px] text-[#94a3b8] space-y-1">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you entered the correct email</li>
                  <li>• The link expires in 30 minutes</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="w-full h-[42px] bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] text-[#111] text-[14px] font-medium rounded-[8px] flex items-center justify-center gap-2 transition-colors"
              >
                Try a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
