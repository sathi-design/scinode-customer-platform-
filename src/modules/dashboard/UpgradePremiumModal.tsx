"use client";

import React, { useState, useEffect } from "react";
import {
  X, Check, Lock, Zap, ArrowRight, Crown, Rocket,
  Building2, ChevronRight, Phone, Mail, ReceiptText,
  TrendingUp, Clock3, Globe2, Sparkles, MessageCircle,
  FileText, Users, BarChart3, ShieldCheck, Star,
  CheckCircle2, CalendarCheck, Headphones, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type ModalView = "plans" | "momentum" | "form" | "success" | "intent";

interface Feature {
  label:     string;
  starter:   "check" | "lock" | string;
  premium:   "check" | string;
  highlight?: boolean;
}

// ─── Feature comparison matrix ────────────────────────────────────────────────
const FEATURES: Feature[] = [
  { label: "Profile Activation",         starter: "check",          premium: "check"                          },
  { label: "Proposal Submissions",       starter: "Up to 2",        premium: "Unlimited",       highlight: true },
  { label: "Open Projects",              starter: "Full access",    premium: "Full access"                    },
  { label: "Exclusive Projects",         starter: "lock",           premium: "Full access",     highlight: true },
  { label: "Market Pulse",               starter: "5 snapshots",    premium: "Unlimited + advanced", highlight: true },
  { label: "In-Depth MI Reports",        starter: "1 report",       premium: "Up to 10 / year", highlight: true },
  { label: "Digital Marketing Insights", starter: "lock",           premium: "check",           highlight: true },
  { label: "Research Vault",             starter: "lock",           premium: "Up to 20 compounds", highlight: true },
  { label: "Research Module Access",     starter: "lock",           premium: "check",           highlight: true },
  { label: "QA/QC as a Service",         starter: "lock",           premium: "check",           highlight: true },
  { label: "Compliance as a Service",    starter: "lock",           premium: "check",           highlight: true },
  { label: "Customer Support",           starter: "Standard email", premium: "Priority — WhatsApp, email & 1-on-1", highlight: true },
];

const STARTER_BULLETS = [
  "Profile visible to verified buyers",
  "Submit up to 2 proposals",
  "All Open Projects — full detail pages",
  "5 Market Pulse quick snapshots",
  "1 in-depth MI report request",
  "Standard email support",
];

const ACCELERATOR_BULLETS = [
  "Unlimited proposal submissions",
  "Open + Exclusive project access",
  "Unlimited Market Pulse Quick Snapshots",
  "Up to 10 in-depth Product MI reports / year",
  "Lead Generation for catalogue products",
  "Research Vault — up to 20 compounds",
  "Research Module — Receive R&D project opportunities + expertise",
];

const ACCELERATOR_FOOTER_BULLETS = [
  "QA/QC as a Service",
  "Compliance as a Service",
  "Priority support — WhatsApp, email & 1-on-1",
];

const OUTCOMES = [
  { icon: TrendingUp, value: "3×",    label: "leads"              },
  { icon: Globe2,     value: "10×",   label: "deeper Product MI"  },
  { icon: Clock3,     value: "24 hr", label: "priority support"   },
];

const GOALS = [
  "Submit more proposals to buyers",
  "Access Exclusive Projects",
  "Market Intelligence & research",
  "Digital Marketing & lead insights",
  "QA/QC or Compliance support",
  "Full platform — all of the above",
];

// ─── Feature value renderers ──────────────────────────────────────────────────
function StarterValue({ val }: { val: string }) {
  if (val === "lock") return (
    <span className="flex items-center justify-center gap-1 text-[#6b7280]">
      <Lock size={10} /><span className="text-[11px]">Locked</span>
    </span>
  );
  if (val === "check") return <Check size={13} className="text-white/65 mx-auto" strokeWidth={2.5} />;
  return <span className="text-[11px] text-[#a1a1aa] text-center leading-tight">{val}</span>;
}

function PremiumValue({ val, highlight }: { val: string; highlight?: boolean }) {
  if (val === "check") return <Check size={13} className="text-[#f5c842] mx-auto" strokeWidth={2.5} />;
  return (
    <span className={cn("text-[11px] text-center leading-tight", highlight ? "font-semibold text-white" : "text-white/65")}>
      {val}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Momentum / Intent confirmation
// ═══════════════════════════════════════════════════════════════════════════════
const UNLOCK_ITEMS = [
  {
    icon: Layers,
    color: "#f5c842",
    bg: "rgba(245,200,66,0.10)",
    border: "rgba(201,162,39,0.25)",
    title: "Unlimited Proposals",
    desc: "Respond to every buyer opportunity — no caps, no missed deals.",
  },
  {
    icon: Star,
    color: "#f5c842",
    bg: "rgba(245,200,66,0.10)",
    border: "rgba(201,162,39,0.25)",
    title: "Exclusive Projects",
    desc: "High-value, curated buyer projects visible only to Accelerator members.",
  },
  {
    icon: BarChart3,
    color: "#2ACB83",
    bg: "rgba(42,203,131,0.10)",
    border: "rgba(42,203,131,0.25)",
    title: "Market Intelligence",
    desc: "In-depth MI reports, Research Vault, and Digital Marketing Insights.",
  },
  {
    icon: Headphones,
    color: "#2ACB83",
    bg: "rgba(42,203,131,0.10)",
    border: "rgba(42,203,131,0.25)",
    title: "Dedicated Success Support",
    desc: "Priority access via WhatsApp, email, and 1-on-1 onboarding calls.",
  },
];

function MomentumScreen({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">

      {/* Header bar */}
      <div className="flex items-center gap-3 px-6 py-3.5 border-b border-[#181818] flex-shrink-0">
        <button onClick={onBack}
          className="w-7 h-7 rounded-full flex items-center justify-center border border-[#2e2e2e] text-white/45 hover:text-white hover:border-[#3a3a3a] transition-colors">
          <ChevronRight size={14} className="rotate-180" />
        </button>
        {/* Step indicator */}
        <div className="flex items-center gap-1.5 flex-1">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn("h-[3px] rounded-full transition-all", s === 1 ? "flex-[2]" : "flex-1")}
              style={{ background: s === 1 ? "linear-gradient(90deg,#f5c842,#c9a227)" : "rgba(255,255,255,0.10)" }} />
          ))}
        </div>
        <span className="text-[11px] text-white/30 font-medium">Step 1 of 2</span>
      </div>

      {/* Body */}
      <div className="flex-1 px-8 py-7 flex flex-col gap-6">

        {/* Hero text */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full w-fit text-[10.5px] font-bold"
            style={{ background: "rgba(245,200,66,0.08)", border: "1px solid rgba(245,200,66,0.25)", color: "#f5c842" }}>
            <Zap size={10} /> Priority Partner
          </div>
          <h2 className="text-[22px] font-black text-white leading-tight tracking-[-0.02em]">
            You're one step away<br />from full platform access.
          </h2>
          <p className="text-[13px] text-white/50 leading-[19px] max-w-[500px]">
            Our team will reach out within <span className="font-semibold text-white">24 hours</span> to understand your
            exact needs, structure a plan that fits, and get your account upgraded — same day.
          </p>
        </div>

        {/* What unlocks */}
        <div>
          <p className="text-[10.5px] font-bold text-white/30 uppercase tracking-widest mb-3">What you're unlocking</p>
          <div className="grid grid-cols-2 gap-3">
            {UNLOCK_ITEMS.map(({ icon: Icon, color, bg, border, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3.5 rounded-[12px]"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
                  style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <div>
                  <p className="text-[12.5px] font-bold text-white leading-tight mb-0.5">{title}</p>
                  <p className="text-[11.5px] text-white/45 leading-[16px]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process callout */}
        <div className="flex items-center gap-4 px-4 py-3.5 rounded-[12px] bg-[#0a0a0a] border border-[#1e1e1e]">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            {[
              { icon: FileText, label: "Fill 5 quick fields" },
              { icon: Phone,    label: "Team calls you in 24 hrs" },
              { icon: Zap,      label: "Account upgraded same day" },
            ].map(({ icon: Icon, label }, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-1.5">
                  <Icon size={12} className="text-[#f5c842]" />
                  <span className="text-[11.5px] text-white/55">{label}</span>
                </div>
                {i < 2 && <ChevronRight size={11} className="text-white/20" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-[14px] font-bold text-[#020202] transition-all hover:brightness-110 active:scale-[0.99]"
            style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)", boxShadow: "0 0 24px rgba(245,200,66,0.40)" }}
          >
            <Zap size={15} /> Continue — Fill in your details
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
          <p className="text-[11px] text-white/30 text-center">
            No payment now. No commitment. Our team contacts you first.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Short contact form
// ═══════════════════════════════════════════════════════════════════════════════
function ContactForm({
  onSubmit,
  onBack,
}: {
  onSubmit: (email: string) => void;
  onBack:   () => void;
}) {
  const [form, setForm] = useState({ company: "", name: "", email: "", whatsapp: "", goal: "" });
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const canSubmit = form.company && form.name && form.email && form.whatsapp && form.goal;

  const inputCls =
    "w-full bg-[#161616] border border-[#272727] rounded-[10px] px-3.5 py-2.5 " +
    "text-[13px] text-white placeholder:text-[#484848] " +
    "focus:outline-none focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/12 transition-colors";

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3.5 border-b border-[#181818] flex-shrink-0">
        <button onClick={onBack}
          className="w-7 h-7 rounded-full flex items-center justify-center border border-[#2e2e2e] text-white/45 hover:text-white hover:border-[#3a3a3a] transition-colors">
          <ChevronRight size={14} className="rotate-180" />
        </button>
        <div className="flex items-center gap-1.5 flex-1">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn("h-[3px] rounded-full transition-all", s <= 2 ? "flex-[2]" : "flex-1")}
              style={{ background: s <= 2 ? "linear-gradient(90deg,#f5c842,#c9a227)" : "rgba(255,255,255,0.10)" }} />
          ))}
        </div>
        <span className="text-[11px] text-white/30 font-medium">Step 2 of 2</span>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">

        <div>
          <h3 className="text-[17px] font-bold text-white leading-tight mb-1">Tell us about yourself</h3>
          <p className="text-[12.5px] text-white/45 leading-[18px]">
            5 quick fields — our team handles everything else on the call.
          </p>
        </div>

        {/* Company + Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wide mb-1.5">
              Company Name <span className="text-[#f5c842]">*</span>
            </label>
            <input type="text" placeholder="Acme Chemicals Ltd."
              value={form.company} onChange={e => set("company", e.target.value)}
              className={inputCls} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wide mb-1.5">
              Your Name <span className="text-[#f5c842]">*</span>
            </label>
            <input type="text" placeholder="Rahul Sharma"
              value={form.name} onChange={e => set("name", e.target.value)}
              className={inputCls} />
          </div>
        </div>

        {/* Email + WhatsApp */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wide mb-1.5">
              Work Email <span className="text-[#f5c842]">*</span>
            </label>
            <div className="relative">
              <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484848]" />
              <input type="email" placeholder="rahul@acmechem.com"
                value={form.email} onChange={e => set("email", e.target.value)}
                className={cn(inputCls, "pl-8")} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wide mb-1.5">
              WhatsApp Number <span className="text-[#f5c842]">*</span>
            </label>
            <div className="relative">
              {/* WhatsApp icon — inline SVG */}
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484848]" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <input type="tel" placeholder="+91 98765 43210"
                value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)}
                className={cn(inputCls, "pl-8")} />
            </div>
          </div>
        </div>

        {/* Primary goal */}
        <div>
          <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wide mb-1.5">
            What's your primary goal? <span className="text-[#f5c842]">*</span>
          </label>
          <div className="relative">
            <select value={form.goal} onChange={e => set("goal", e.target.value)}
              className={cn(inputCls, "appearance-none cursor-pointer", !form.goal && "text-[#484848]")}>
              <option value="" disabled>Select what matters most to you</option>
              {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <ChevronRight size={13} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[#484848] pointer-events-none" />
          </div>
          <p className="text-[11px] text-white/30 mt-1.5">
            This helps our team prepare a relevant conversation — not a generic pitch.
          </p>
        </div>

        {/* Trust row */}
        <div className="flex items-center gap-4 flex-wrap">
          {[
            { icon: ShieldCheck, text: "No payment required now" },
            { icon: Clock3,      text: "Team calls within 24 hrs" },
            { icon: Users,       text: "Dedicated account manager" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon size={11} className="text-[#2ACB83]" />
              <span className="text-[11px] text-white/40">{text}</span>
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={() => canSubmit && onSubmit(form.email)}
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-[14px] font-bold text-[#020202] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-35 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)", boxShadow: canSubmit ? "0 0 24px rgba(245,200,66,0.40)" : "none" }}
        >
          <Zap size={15} /> Send Request
          <ArrowRight size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Success / What happens next
// ═══════════════════════════════════════════════════════════════════════════════
const NEXT_STEPS = [
  {
    icon: FileText,
    color: "#f5c842",
    bg: "rgba(245,200,66,0.10)",
    border: "rgba(201,162,39,0.25)",
    when: "Within 24 hours",
    title: "Our team reviews your request",
    desc: "We look at your goals, product portfolio, and best fit opportunities.",
  },
  {
    icon: Phone,
    color: "#f5c842",
    bg: "rgba(245,200,66,0.10)",
    border: "rgba(201,162,39,0.25)",
    when: "Same day as review",
    title: "Personalised pricing call",
    desc: "Your account manager reaches out on WhatsApp or email to align on a plan.",
  },
  {
    icon: Zap,
    color: "#2ACB83",
    bg: "rgba(42,203,131,0.10)",
    border: "rgba(42,203,131,0.25)",
    when: "After the call",
    title: "Account upgraded instantly",
    desc: "Once confirmed, your Accelerator access is live — all features, same day.",
  },
  {
    icon: CalendarCheck,
    color: "#2ACB83",
    bg: "rgba(42,203,131,0.10)",
    border: "rgba(42,203,131,0.25)",
    when: "First week",
    title: "Onboarding & success setup",
    desc: "Dedicated onboarding session to maximise platform value from day one.",
  },
];

function SuccessScreen({ email, onClose }: { email: string; onClose: () => void }) {
  return (
    <div className="flex flex-col overflow-y-auto max-h-full">

      {/* Gold top accent bar */}
      <div className="h-[3px] w-full flex-shrink-0"
        style={{ background: "linear-gradient(90deg,#f5c842,#c9a227,#f5c842)" }} />

      <div className="flex-1 px-8 py-7 flex flex-col gap-6">

        {/* Success hero */}
        <div className="flex flex-col items-center text-center gap-4 py-2">
          {/* Animated checkmark */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#f5c842,#c9a227)", boxShadow: "0 0 40px rgba(245,200,66,0.35), 0 0 80px rgba(245,200,66,0.12)" }}>
              <CheckCircle2 size={30} className="text-[#020202]" strokeWidth={2.5} />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ background: "rgba(245,200,66,0.4)" }} />
          </div>

          <div>
            <h2 className="text-[20px] font-black text-white leading-tight mb-1.5">
              Request received! 🎉
            </h2>
            <p className="text-[13px] text-white/50 leading-[19px] max-w-[380px]">
              We'll reach out to{" "}
              <span className="font-semibold text-white">{email}</span>
              {" "}within <span className="font-bold text-[#f5c842]">24 hours</span> to
              get you set up on Priority Partner.
            </p>
          </div>
        </div>

        {/* What happens next */}
        <div>
          <p className="text-[10.5px] font-bold text-white/30 uppercase tracking-widest mb-3 text-center">
            What happens next
          </p>
          <div className="flex flex-col gap-2.5 relative">
            {/* Vertical connector line */}
            <div className="absolute left-[19px] top-8 bottom-8 w-[1px] bg-[#1e1e1e]" />

            {NEXT_STEPS.map(({ icon: Icon, color, bg, border, when, title, desc }, i) => (
              <div key={title} className="flex items-start gap-3.5">
                {/* Step icon */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative z-10"
                  style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon size={15} style={{ color }} />
                </div>
                {/* Content */}
                <div className="flex-1 pt-0.5 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: i < 2 ? "#c9a227" : "#2ACB83" }}>
                    {when}
                  </p>
                  <p className="text-[13px] font-semibold text-white leading-tight mb-0.5">{title}</p>
                  <p className="text-[11.5px] text-white/45 leading-[16px]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action while waiting */}
        <div className="rounded-[14px] p-4 flex items-start gap-3"
          style={{ background: "rgba(42,203,131,0.06)", border: "1px solid rgba(42,203,131,0.18)" }}>
          <Sparkles size={15} className="text-[#2ACB83] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[12.5px] font-semibold text-white mb-0.5">
              While you wait — complete your profile
            </p>
            <p className="text-[11.5px] text-white/45 leading-[16px]">
              A complete profile helps our team match you to the right opportunities faster.
              Manufacturers with full profiles get 2× more enquiries.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2.5">
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-[13px] font-bold text-white transition-all hover:brightness-110"
            style={{ background: "linear-gradient(90deg,#1F6F54,#2ACB83)", boxShadow: "0 0 18px rgba(42,203,131,0.25)" }}
          >
            <FileText size={13} /> Complete My Profile
          </button>
          <button onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-[12.5px] font-medium text-white/45 border border-[#222] hover:text-white hover:border-[#333] transition-colors">
            <MessageCircle size={12} /> Close — I'll wait for the team's call
          </button>
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTENT CONFIRMATION — instant thank-you (no form)
// ═══════════════════════════════════════════════════════════════════════════════
function IntentScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center px-10 py-12 gap-6">
      {/* Icon */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#f5c842,#c9a227)", boxShadow: "0 0 40px rgba(245,200,66,0.35), 0 0 80px rgba(245,200,66,0.12)" }}>
          <CheckCircle2 size={30} className="text-[#020202]" strokeWidth={2.5} />
        </div>
        <div className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: "rgba(245,200,66,0.4)" }} />
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2 max-w-[360px]">
        <h2 className="text-[20px] font-black text-white leading-tight">
          Thank you for your interest!
        </h2>
        <p className="text-[13.5px] text-white/55 leading-[20px]">
          Thank you for submitting your intent to upgrade. Our team will get in touch with you soon.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onClose}
        className="w-full max-w-[280px] py-3 rounded-[12px] text-[13px] font-bold text-[#020202] transition-all hover:brightness-110 active:scale-[0.99]"
        style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)" }}>
        Got it
      </button>
      <p className="text-[11px] text-white/25">No payment required. No commitment.</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN MODAL
// ═══════════════════════════════════════════════════════════════════════════════
export function UpgradePremiumModal({
  open,
  onClose,
}: {
  open:    boolean;
  onClose: () => void;
}) {
  const [view,  setView]  = useState<ModalView>("plans");
  const [email, setEmail] = useState("");

  useEffect(() => { if (open) { setView("plans"); setEmail(""); } }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && view === "plans") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose, view]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setView("success");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn("fixed inset-0 z-[60] transition-all duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
        style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" }}
        onClick={() => view === "plans" && onClose()}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(
            "relative w-full flex flex-col rounded-[22px] overflow-hidden transition-all duration-300",
            // Plans view: wide modal. Inner views: narrower, centred
            view === "plans" ? "max-w-[900px]" : "max-w-[560px]",
            "max-h-[92vh]",
            // pointer-events-none when closed so the invisible panel never blocks page clicks
            open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-[0.96] translate-y-3 pointer-events-none",
          )}
          style={{
            background: "#0e0e0e",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.80), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* ── Non-plans views: show close X ── */}
          {view !== "plans" && view !== "success" && (
            <button
              onClick={() => setView("plans")}
              className="absolute top-3.5 right-4 z-20 w-7 h-7 rounded-full flex items-center justify-center border border-[#2a2a2a] text-white/35 hover:text-white hover:border-[#3a3a3a] transition-colors"
            >
              <X size={13} />
            </button>
          )}

          {view === "intent" && (
            <IntentScreen onClose={onClose} />
          )}

          {view === "momentum" && (
            <MomentumScreen
              onContinue={() => setView("form")}
              onBack={() => setView("plans")}
            />
          )}

          {view === "form" && (
            <ContactForm
              onSubmit={handleSubmit}
              onBack={() => setView("momentum")}
            />
          )}

          {view === "success" && (
            <SuccessScreen email={email} onClose={onClose} />
          )}

          {view === "plans" && (
            <div className="flex-1 overflow-y-auto flex flex-col">

              {/* ══ COMPACT HEADER ══ */}
              <div className="flex-shrink-0 flex items-center justify-between gap-6 px-6 py-3.5 border-b border-[#181818]">
                <div>
                  <h2 className="text-[16px] font-bold text-white leading-tight tracking-[-0.01em]">
                    Expand Beyond Your Existing Buyer Network
                  </h2>
                  <p className="text-[11.5px] text-white/40 leading-tight">
                    Global opportunities · Market intelligence · Priority access
                  </p>
                </div>
                <button onClick={onClose}
                  className="w-7 h-7 rounded-full flex items-center justify-center border border-[#2a2a2a] text-white/40 hover:text-white hover:border-[#3a3a3a] transition-colors flex-shrink-0">
                  <X size={14} />
                </button>
              </div>

              {/* ══ PLAN CARDS ══ */}
              <div className="px-5 pt-4 pb-3 grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Access Partner */}
                <div className="rounded-[16px] border border-[#2a2a2a] bg-[#141414] p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-[9px] bg-[#222] border border-[#333] flex items-center justify-center shrink-0">
                        <Rocket size={15} className="text-[#9ca3af]" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-white leading-tight">Access Partner</p>
                        <p className="text-[11px] text-white/55">Free forever · No expiry</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-wide bg-[#252525] text-[#9ca3af] border border-[#333]">
                      CURRENT PLAN
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[30px] font-black text-white leading-none tracking-tight">Free</span>
                      <span className="text-[11px] text-white/40">always</span>
                    </div>
                    <span className="text-[11px] text-white/40 leading-tight">Start generating demand beyond your network.</span>
                  </div>
                  <button disabled className="w-full py-2 rounded-[10px] text-[12.5px] font-semibold text-[#b0b0b0] bg-[#1e1e1e] border border-[#333] cursor-not-allowed">
                    Current Plan
                  </button>
                  <div className="flex flex-col gap-2">
                    {STARTER_BULLETS.map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#222] border border-[#333] flex items-center justify-center shrink-0">
                          <Check size={8} className="text-white/65" strokeWidth={2.5} />
                        </div>
                        <span className="text-[12px] text-white/70 leading-tight">{f}</span>
                      </div>
                    ))}
                    {["Exclusive Projects", "Research Vault", "QA/QC & Compliance"].map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <Crown size={11} className="shrink-0" style={{ color: "#c9a227" }} />
                        <span className="text-[12px] text-white/35 leading-tight">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Partner */}
                <div
                  className="rounded-[16px] p-5 flex flex-col gap-4 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, #111 0%, #0e0e0e 100%)",
                    border: "1px solid rgba(201,162,39,0.35)",
                    boxShadow: "0 0 0 1px rgba(201,162,39,0.10), 0 0 60px rgba(201,162,39,0.07) inset",
                  }}
                >
                  <div className="pointer-events-none absolute top-0 right-0 w-48 h-48 opacity-[0.09]"
                    style={{ background: "radial-gradient(circle at top right, #f5c842 0%, transparent 65%)" }} />

                  {/* Badge + name */}
                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                        style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(201,162,39,0.30)" }}>
                        <Zap size={15} style={{ color: "#f5c842" }} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-white leading-tight">Priority Partner</p>
                        <p className="text-[11px] text-white/50">Full Access to Manufacturing Intelligence</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold text-[#020202]"
                      style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)" }}>
                      <Crown size={8} /> RECOMMENDED
                    </span>
                  </div>

                  {/* Custom pricing */}
                  <div className="flex flex-col gap-0.5 relative">
                    <span className="text-[24px] font-black text-white leading-none tracking-tight">Custom Pricing</span>
                    <span className="text-[11px] text-white/40 leading-tight">
                      For manufacturers seeking deeper market access, consistent high-value demand, and end-to-end business enablement.
                    </span>
                  </div>

                  {/* Outcome stats */}
                  <div className="grid grid-cols-3 gap-2 relative">
                    {OUTCOMES.map(({ icon: Icon, value, label }) => (
                      <div key={label} className="flex flex-col items-center gap-0.5 py-2 rounded-[8px]"
                        style={{ background: "rgba(245,200,66,0.05)", border: "1px solid rgba(201,162,39,0.14)" }}>
                        <Icon size={11} style={{ color: "#f5c842" }} />
                        <span className="text-[13px] font-black text-white leading-none">{value}</span>
                        <span className="text-[9.5px] text-white/40 leading-tight text-center">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* PRIMARY CTA — Upgrade to Premium */}
                  <div className="flex gap-2 relative">
                    <button
                      onClick={() => setView("intent")}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[13px] font-bold text-[#020202] transition-all hover:brightness-110 active:scale-[0.98]"
                      style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)", boxShadow: "0 0 18px rgba(245,200,66,0.38)" }}
                    >
                      <Zap size={13} /> Upgrade to Premium
                    </button>
                    <button
                      onClick={() => setView("form")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[12px] font-medium text-white/50 border border-[#2a2a2a] hover:text-white hover:border-[#3a3a3a] transition-colors">
                      <Building2 size={11} /> Talk to Sales
                    </button>
                  </div>

                  {/* Feature bullets */}
                  <div className="flex flex-col gap-2 relative">
                    {ACCELERATOR_BULLETS.map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(201,162,39,0.25)" }}>
                          <Check size={8} style={{ color: "#f5c842" }} strokeWidth={2.5} />
                        </div>
                        <span className="text-[12px] text-white/65 leading-tight">{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer bullets — italic, no tick, visually separated */}
                  <div className="flex flex-col gap-1.5 pt-2 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    {ACCELERATOR_FOOTER_BULLETS.map(f => (
                      <span key={f} className="text-[11.5px] italic leading-snug pl-0.5"
                        style={{ color: "rgba(255,255,255,0.38)" }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ══ CUSTOMER SUCCESS SNAPSHOT ══ */}
              <div className="mx-5 mb-3">
                <div className="rounded-[14px] px-5 py-4 flex flex-col gap-3"
                  style={{ background: "linear-gradient(135deg, #141008 0%, #100d04 100%)", border: "1px solid rgba(201,162,39,0.20)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px]">🌟</span>
                    <span className="text-[11px] font-bold text-[#c9a227] uppercase tracking-widest">What Our Partners Say</span>
                  </div>
                  <div className="relative pl-4">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
                      style={{ background: "linear-gradient(180deg,#f5c842,#c9a227)" }} />
                    <p className="text-[12.5px] text-white/70 leading-[19px] italic">
                      "Our collaboration with Scinode has unlocked new opportunities for operational
                      efficiency and business growth. Their strategic support has enhanced productivity,
                      optimized costs, and expanded our market reach."
                    </p>
                  </div>
                  <p className="text-[11px] text-white/40 font-medium">
                    — CEO, Specialty Chemicals Manufacturer, Panoli
                  </p>
                </div>
              </div>

              {/* ══ CALL US ══ */}
              <div className="mx-5 mb-4">
                <div className="rounded-[14px] px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: "rgba(42,203,131,0.10)", border: "1px solid rgba(42,203,131,0.20)" }}>
                    <MessageCircle size={18} className="text-[#2ACB83]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-white mb-0.5">Not sure where to start? Call us.</p>
                    <p className="text-[11.5px] text-white/50 leading-[17px]">
                      Every manufacturer has different growth priorities. Speak with the Scinode team to understand
                      how the platform aligns with your products, capacity utilization goals, market expansion strategy, and R&D ambitions.
                    </p>
                  </div>
                  <button onClick={() => setView("form")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-[12.5px] font-semibold text-white whitespace-nowrap shrink-0 hover:brightness-110 transition-all"
                    style={{ background: "linear-gradient(90deg,#1F6F54,#2ACB83)" }}>
                    <Phone size={12} /> Book a Call
                  </button>
                </div>
              </div>

              {/* ══ COMPARISON TABLE ══ */}
              <div className="mx-5 mb-2 rounded-[14px] border border-[#1c1c1c] overflow-hidden">
                <div className="grid grid-cols-3 bg-[#111] border-b border-[#1c1c1c]">
                  <div className="px-4 py-2"><span className="text-[10px] font-bold text-[#4b5563] uppercase tracking-wider">Feature</span></div>
                  <div className="px-4 py-2 text-center border-l border-[#1c1c1c]"><span className="text-[10px] font-bold text-[#4b5563] uppercase tracking-wider">Starter</span></div>
                  <div className="px-4 py-2 text-center border-l border-[#1c1c1c]"><span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#c9a227" }}>Accelerator</span></div>
                </div>
                {FEATURES.map((f, i) => (
                  <div key={f.label}
                    className={cn("grid grid-cols-3 border-b border-[#141414] last:border-b-0", i % 2 === 0 ? "bg-[#0e0e0e]" : "bg-[#0a0a0a]")}>
                    <div className="px-4 py-2"><span className="text-[11.5px] text-white/50">{f.label}</span></div>
                    <div className="px-4 py-2 flex items-center justify-center border-l border-[#141414]"><StarterValue val={f.starter} /></div>
                    <div className="px-4 py-2 flex items-center justify-center border-l border-[#c9a227]/10"><PremiumValue val={f.premium} highlight={f.highlight} /></div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-6 py-3.5 flex items-center justify-between border-t border-[#141414] mt-2">
                <p className="text-[11px] text-white/25">No commitment needed. Cancel anytime after setup.</p>
                <button onClick={onClose} className="text-[12px] font-medium text-white/35 hover:text-white/60 transition-colors">
                  Maybe later
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
