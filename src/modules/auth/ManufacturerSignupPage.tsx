"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, Eye, EyeOff, ChevronDown, Check,
  Mail, CheckCircle2,
} from "lucide-react";
import { ManufacturerLeftPanel } from "./ManufacturerLeftPanel";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "signup" | "verify" | "success";

interface FormState {
  fullName: string;
  email: string;
  companyName: string;
  website: string;
  phone: string;
  gstVat: string;
  password: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: "IN", name: "India",          dial: "+91",  flag: "🇮🇳" },
  { code: "US", name: "United States",  dial: "+1",   flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial: "+44",  flag: "🇬🇧" },
  { code: "DE", name: "Germany",        dial: "+49",  flag: "🇩🇪" },
  { code: "CN", name: "China",          dial: "+86",  flag: "🇨🇳" },
  { code: "JP", name: "Japan",          dial: "+81",  flag: "🇯🇵" },
  { code: "SG", name: "Singapore",      dial: "+65",  flag: "🇸🇬" },
  { code: "AE", name: "UAE",            dial: "+971", flag: "🇦🇪" },
  { code: "AU", name: "Australia",      dial: "+61",  flag: "🇦🇺" },
  { code: "CA", name: "Canada",         dial: "+1",   flag: "🇨🇦" },
  { code: "CH", name: "Switzerland",    dial: "+41",  flag: "🇨🇭" },
  { code: "FR", name: "France",         dial: "+33",  flag: "🇫🇷" },
  { code: "KR", name: "South Korea",    dial: "+82",  flag: "🇰🇷" },
  { code: "BR", name: "Brazil",         dial: "+55",  flag: "🇧🇷" },
];

// ─── Input helpers ────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-[36px] px-3 border border-[#cbd5e1] rounded-[6px] text-[13px] text-[#111] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1F6F54] focus:ring-1 focus:ring-[#1F6F54]/20 bg-white transition-colors";

const labelCls = "text-[12px] font-semibold text-[#0f172a] mb-1 block";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ManufacturerSignupPage() {
  const [step, setStep] = useState<Step>("signup");

  const [form, setForm] = useState<FormState>({
    fullName: "", email: "", companyName: "",
    website: "", phone: "", gstVat: "", password: "",
  });

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [agreed, setAgreed]             = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "agreed", string>>>({});

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setField =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.fullName.trim()) errs.fullName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    if (!form.phone.trim()) errs.phone = "Required";
    if (form.password.length < 8) errs.password = "Min 8 characters";
    if (!agreed) errs.agreed = "Please agree to continue";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setStep("verify");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
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

          {/* ── STEP: signup ── */}
          {step === "signup" && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/for-manufacturers.svg"
                alt="Scinode for Manufacturers"
                height={55}
                style={{ height: 55, width: "auto", display: "block" }}
                className="mb-5 self-start"
              />

              <h1 className="text-[22px] lg:text-[26px] font-medium leading-[32px] text-[#111] mb-0.5">
                Start the Momentum of Growth
              </h1>
              <p className="text-[16px] font-semibold text-[#1F6F54] mb-4">Sign up</p>

              <form onSubmit={handleSignupSubmit} noValidate>
                <div className="space-y-3">

                  {/* Full Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Full Name <span className="text-[#c30e1a]">*</span></label>
                      <input
                        type="text"
                        className={`${inputCls}${errors.fullName ? " !border-red-400" : ""}`}
                        placeholder="Your Organisation Name"
                        value={form.fullName}
                        onChange={setField("fullName")}
                      />
                      {errors.fullName && <p className="text-red-500 text-[11px] mt-0.5">{errors.fullName}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Email Address <span className="text-[#c30e1a]">*</span></label>
                      <input
                        type="email"
                        className={`${inputCls}${errors.email ? " !border-red-400" : ""}`}
                        placeholder="Your Organisation Email"
                        value={form.email}
                        onChange={setField("email")}
                      />
                      {errors.email && <p className="text-red-500 text-[11px] mt-0.5">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Company Name + Website */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Company Name</label>
                      <input type="text" className={inputCls} placeholder="Your Company Name"
                        value={form.companyName} onChange={setField("companyName")} />
                    </div>
                    <div>
                      <label className={labelCls}>Website</label>
                      <input type="url" className={inputCls} placeholder="https://yourcompany.com"
                        value={form.website} onChange={setField("website")} />
                    </div>
                  </div>

                  {/* Country + Phone */}
                  <div>
                    <label className={labelCls}>Country <span className="text-[#c30e1a]">*</span></label>
                    <div className="flex gap-2">
                      <div className="relative flex-shrink-0 w-[108px]">
                        <div className="flex items-center gap-1 h-[36px] px-2.5 border border-[#cbd5e1] rounded-[6px] bg-white pointer-events-none">
                          <span className="text-sm leading-none">{selectedCountry.flag}</span>
                          <span className="text-[12px] text-[#111]">{selectedCountry.dial}</span>
                          <ChevronDown className="w-3 h-3 text-[#94a3b8] ml-auto" />
                        </div>
                        <select
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          value={selectedCountry.code}
                          onChange={(e) =>
                            setSelectedCountry(COUNTRIES.find((c) => c.code === e.target.value) ?? COUNTRIES[0])
                          }
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.dial})</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <input
                          type="tel"
                          className={`${inputCls}${errors.phone ? " !border-red-400" : ""}`}
                          placeholder="Enter Your Mobile Number"
                          value={form.phone}
                          onChange={setField("phone")}
                        />
                        {errors.phone && <p className="text-red-500 text-[11px] mt-0.5">{errors.phone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* GST/VAT + Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>GST/VAT</label>
                      <input type="text" className={inputCls} placeholder="Enter GST/VAT Number"
                        value={form.gstVat} onChange={setField("gstVat")} />
                    </div>
                    <div>
                      <label className={labelCls}>Password <span className="text-[#c30e1a]">*</span></label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`${inputCls} pr-8${errors.password ? " !border-red-400" : ""}`}
                          placeholder="*********"
                          value={form.password}
                          onChange={setField("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {errors.password
                        ? <p className="text-red-500 text-[11px] mt-0.5">{errors.password}</p>
                        : <p className="text-[11px] text-[#818181] mt-0.5">Minimum 8 characters</p>
                      }
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => { setAgreed((p) => !p); setErrors((prev) => ({ ...prev, agreed: undefined })); }}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {agreed
                        ? <div className="w-4 h-4 rounded bg-[#1F6F54] flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                          </div>
                        : <div className={`w-4 h-4 rounded border-2 ${errors.agreed ? "border-red-400" : "border-[#cbd5e1]"}`} />
                      }
                    </button>
                    <p className="text-[12px] text-[#111] leading-[18px]">
                      By creating an account you agree to our{" "}
                      <a href="https://www.scimplify.com/termsofuse" target="_blank" rel="noopener noreferrer" className="text-[#0284c7] underline">Terms of Use</a>
                      {" "}and our{" "}
                      <a href="https://www.scimplify.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0284c7] underline">Privacy Policy</a>.
                    </p>
                  </div>
                  {errors.agreed && <p className="text-red-500 text-[11px] -mt-1">{errors.agreed}</p>}

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full h-[38px] bg-[#018E7E] hover:bg-[#016B5F] text-white text-[13px] font-medium rounded-[6px] flex items-center justify-center gap-2 transition-colors"
                  >
                    Create an Account <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <p className="text-center text-[13px] font-medium text-[#111]">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#0084D1] underline">Login</Link>
                  </p>
                </div>
              </form>
            </>
          )}

          {/* ── STEP: verify ── */}
          {step === "verify" && (
            <div className="flex flex-col items-center text-center max-w-[360px] mx-auto">
              <div className="w-14 h-14 rounded-full bg-[#f0faf5] border-2 border-[#bbf7d0] flex items-center justify-center mb-5">
                <Mail className="w-7 h-7 text-[#1F6F54]" />
              </div>
              <h2 className="text-[24px] font-semibold text-[#111] mb-2">Verify your email</h2>
              <p className="text-[13px] text-[#62748e] leading-relaxed mb-7">
                We sent a 6-digit code to <strong className="text-[#111]">{form.email}</strong>.
                Enter it below to verify your account.
              </p>
              <div className="flex gap-2.5 mb-6">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    maxLength={1}
                    value={otp[i]}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 text-center text-[18px] font-bold border-2 border-[#cbd5e1] rounded-[8px] focus:border-[#1F6F54] focus:ring-1 focus:ring-[#1F6F54]/20 outline-none bg-white"
                  />
                ))}
              </div>
              <button
                onClick={() => setStep("success")}
                className="w-full max-w-[260px] h-[38px] bg-[#018E7E] hover:bg-[#016B5F] text-white text-[13px] font-medium rounded-[6px] flex items-center justify-center gap-2 mx-auto transition-colors mb-3"
              >
                Verify Email <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-[12px] text-[#62748e]">
                Didn&apos;t receive it?{" "}
                <button className="text-[#0284c7] font-medium hover:underline">Resend code</button>
              </p>
            </div>
          )}

          {/* ── STEP: success ── */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center max-w-[360px] mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#f0fdf4] border-2 border-[#86efac] flex items-center justify-center mb-5">
                <CheckCircle2 className="w-8 h-8 text-[#15803d]" />
              </div>
              <h2 className="text-[24px] font-semibold text-[#111] mb-2">Email Verified!</h2>
              <p className="text-[13px] text-[#62748e] leading-relaxed mb-7">
                Your account has been successfully created.
                You can now sign in to your Scinode dashboard.
              </p>
              <Link
                href="/login"
                className="w-full max-w-[260px] h-[38px] bg-[#018E7E] hover:bg-[#016B5F] text-white text-[13px] font-medium rounded-[6px] flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                Continue to Login <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
