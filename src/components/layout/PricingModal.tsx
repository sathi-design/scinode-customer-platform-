"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check, Crown, Zap, Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Theme ────────────────────────────────────────────────────────────────────
const GOLD = "linear-gradient(90deg, #b8860b 0%, #f5c842 40%, #ffd700 60%, #c8960c 100%)";

// ─── Data ─────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id:          "trial",
    badge:       "CURRENT PLAN",
    badgeBg:     "rgba(255,255,255,0.08)",
    badgeColor:  "rgba(255,255,255,0.55)",
    name:        "Explore Trial",
    icon:        Zap,
    iconBg:      "rgba(255,255,255,0.08)",
    iconColor:   "#f5c842",
    monthly:     null as number | null,
    annual:      null as number | null,
    priceLabel:  "Free",
    priceSub:    "15-day trial",
    bestFor:     "Exploring platform capabilities",
    cta:         "Current Plan",
    ctaDisabled: true,
    highlighted: false,
    features: [
      "All standard & exclusive projects visible",
      "Up to 2 proposal submissions",
      "Proposal tracking for submitted proposals",
      "1 Market Pulse report submission",
      "Basic Market Pulse access",
    ],
  },
  {
    id:          "growth",
    badge:       "MOST POPULAR",
    badgeBg:     "rgba(245,200,66,0.15)",
    badgeColor:  "#f5c842",
    name:        "Growth Access",
    icon:        Crown,
    iconBg:      "rgba(245,200,66,0.12)",
    iconColor:   "#f5c842",
    monthly:     5999 as number | null,
    annual:      4999 as number | null,
    priceLabel:  null,
    priceSub:    "per month",
    bestFor:     "Growing manufacturers",
    cta:         "Upgrade to Growth",
    ctaDisabled: false,
    highlighted: true,
    features: [
      "All projects — full detail pages",
      "Up to 3 proposals / month",
      "Full proposal tracking",
      "3 Market Pulse reports / year",
      "Full Market Pulse access",
    ],
  },
  {
    id:          "scale",
    badge:       "ENTERPRISE",
    badgeBg:     "rgba(255,255,255,0.06)",
    badgeColor:  "rgba(255,255,255,0.50)",
    name:        "Scale Partner",
    icon:        Building2,
    iconBg:      "rgba(255,255,255,0.08)",
    iconColor:   "#a78bfa",
    monthly:     null as number | null,
    annual:      null as number | null,
    priceLabel:  "Custom",
    priceSub:    "pricing",
    bestFor:     "High-volume manufacturers & enterprise",
    cta:         "Contact Sales",
    ctaDisabled: false,
    highlighted: false,
    features: [
      "Unlimited project & detail access",
      "Unlimited proposals",
      "Unlimited Market Pulse reports",
      "Priority buyer matching",
      "Dedicated account manager",
    ],
  },
] as const;

const COMPARISON = [
  { label: "Project Access",            trial: "Standard + Exclusive", growth: "All projects",     scale: "All projects"     },
  { label: "Detail Pages",              trial: "50% accessible",       growth: "Full access",       scale: "Full access"      },
  { label: "Proposal Submission",        trial: "Up to 2",              growth: "3 / month",         scale: "Unlimited"        },
  { label: "Proposal Tracking",          trial: "Submitted only",       growth: "Full tracking",     scale: "Full tracking"    },
  { label: "Market Pulse",               trial: "Basic",                growth: "Full (annual)",     scale: "Full unlimited"   },
  { label: "Priority Buyer Matching",    trial: false,                  growth: false,               scale: true               },
  { label: "Dedicated Account Manager",  trial: false,                  growth: false,               scale: true               },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function CellValue({ value }: { value: string | boolean }) {
  if (value === true)  return <Check size={13} strokeWidth={2.5} style={{ color: "#f5c842" }} className="mx-auto" />;
  if (value === false) return <span className="block text-center" style={{ color: "rgba(255,255,255,0.18)" }}>—</span>;
  return <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>{value}</span>;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface PricingModalProps {
  onClose:   () => void;
  daysLeft?: number;
}

export function PricingModal({ onClose, daysLeft }: PricingModalProps) {
  const [annual,  setAnnual]  = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9997] flex items-center justify-center p-3"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full flex flex-col"
        style={{
          maxWidth: 1100,
          maxHeight: "94vh",
          background: "#0d0d0d",
          borderRadius: 24,
          border: "1px solid rgba(245,200,66,0.20)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 40px_100px rgba(0,0,0,0.60), 0 0 60px rgba(245,200,66,0.06)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ══ HEADER — single thin row ══ */}
        <div
          className="relative flex-shrink-0 flex items-center gap-4 px-5 py-0"
          style={{
            height: 58,
            background: "#111111",
            borderBottom: "1px solid rgba(245,200,66,0.14)",
          }}
        >
          {/* Gold ambient */}
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(245,200,66,0.07) 0%, transparent 70%)" }} />

          {/* LEFT — trial pill */}
          <div className="flex-shrink-0 relative z-10">
            {daysLeft !== undefined && daysLeft > 0 ? (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(245,200,66,0.09)", border: "1px solid rgba(245,200,66,0.28)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="text-[11px] font-semibold whitespace-nowrap"
                  style={{ background: GOLD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {daysLeft} days remaining in trial
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(245,200,66,0.09)", border: "1px solid rgba(245,200,66,0.28)" }}>
                <Crown size={11} style={{ color: "#f5c842" }} />
                <span className="text-[11px] font-bold tracking-wide"
                  style={{ background: GOLD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  PREMIUM
                </span>
              </div>
            )}
          </div>

          {/* CENTER — heading + subtext */}
          <div className="flex-1 min-w-0 relative z-10 text-center">
            <h2 className="text-white text-[17px] font-bold leading-tight truncate">
              Unlock Premium Manufacturing Access
            </h2>
            <p className="text-[11px] leading-none mt-0.5 truncate"
              style={{ color: "rgba(255,255,255,0.38)" }}>
              Choose the plan that matches your growth stage.
            </p>
          </div>

          {/* RIGHT — toggle + close */}
          <div className="flex-shrink-0 relative z-10 flex items-center gap-2.5">
            {/* Monthly / Annual toggle */}
            <div
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <span className={cn("text-[11px] font-medium transition-colors whitespace-nowrap select-none",
                !annual ? "text-white" : "text-white/30")}>
                Monthly
              </span>

              {/* Track — overflow-hidden clips the thumb */}
              <button
                onClick={() => setAnnual(a => !a)}
                className="relative shrink-0 rounded-full overflow-hidden transition-all duration-200"
                style={{
                  width: 36,
                  height: 20,
                  background: annual ? "#f5c842" : "rgba(255,255,255,0.18)",
                }}
              >
                <span
                  className="absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform duration-200"
                  style={{ transform: annual ? "translateX(19px)" : "translateX(3px)" }}
                />
              </button>

              <span className={cn("text-[11px] font-medium transition-colors whitespace-nowrap select-none",
                annual ? "text-white" : "text-white/30")}>
                Annual
              </span>

              {annual && (
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: GOLD, color: "#1a1200" }}
                >
                  SAVE 20%
                </span>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.40)" }}
            >
              <X size={13} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ══ SCROLLABLE BODY ══ */}
        <div className="flex-1 min-h-0 overflow-y-auto
          [&::-webkit-scrollbar]:w-[4px]
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-white/10
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb:hover]:bg-white/20">

        {/* ══ CARDS ══ */}
        <div className="grid grid-cols-3 gap-3 px-5 pt-4 pb-3">
          {PLANS.map((plan) => {
            const price = annual ? plan.annual : plan.monthly;
            const Icon  = plan.icon;
            return (
              <div
                key={plan.id}
                className="relative rounded-2xl flex flex-col transition-all duration-200"
                style={{
                  background:  plan.highlighted ? "rgba(245,200,66,0.05)" : "rgba(255,255,255,0.03)",
                  border:      plan.highlighted
                    ? "1.5px solid rgba(245,200,66,0.45)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow:   plan.highlighted ? "0 0 24px rgba(245,200,66,0.10)" : "none",
                  padding:     "16px",
                }}
              >
                {/* Badge */}
                <span
                  className="inline-flex text-[9px] font-bold tracking-[0.13em] px-2 py-0.5 rounded-full mb-2.5 w-fit"
                  style={{ background: plan.badgeBg, color: plan.badgeColor }}
                >
                  {plan.badge}
                </span>

                {/* Icon + Name */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: plan.iconBg }}>
                    <Icon size={14} style={{ color: plan.iconColor }} />
                  </div>
                  <p className="text-white text-[14px] font-bold">{plan.name}</p>
                </div>

                {/* Price */}
                <div className="mb-0.5 flex items-end gap-1">
                  {price !== null ? (
                    <>
                      <span className="text-[11px] font-bold mb-1" style={{ color: "rgba(255,255,255,0.50)" }}>₹</span>
                      <span className="text-[28px] font-black text-white leading-none">{price.toLocaleString("en-IN")}</span>
                      <span className="text-[11px] mb-1" style={{ color: "rgba(255,255,255,0.40)" }}>/{plan.priceSub}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[28px] font-black text-white leading-none">{plan.priceLabel}</span>
                      <span className="text-[11px] mb-1" style={{ color: "rgba(255,255,255,0.40)" }}>{plan.priceSub}</span>
                    </>
                  )}
                </div>

                <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>{plan.bestFor}</p>

                {/* CTA */}
                <button
                  disabled={plan.ctaDisabled}
                  className="w-full py-2 rounded-xl text-[12px] font-semibold transition-all duration-150 mb-3 flex items-center justify-center gap-1"
                  style={
                    plan.ctaDisabled
                      ? { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.28)", cursor: "not-allowed" }
                      : plan.highlighted
                        ? { background: GOLD, color: "#1a1200", boxShadow: "0 0 12px rgba(245,200,66,0.30)" }
                        : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.80)", border: "1px solid rgba(255,255,255,0.12)" }
                  }
                >
                  {plan.cta}
                  {!plan.ctaDisabled && <ChevronRight size={12} strokeWidth={2.5} />}
                </button>

                <div className="h-px mb-3" style={{ background: "rgba(255,255,255,0.06)" }} />

                {/* Features */}
                <ul className="space-y-1.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={10} strokeWidth={3} className="shrink-0 mt-0.5"
                        style={{ color: plan.highlighted ? "#f5c842" : "rgba(255,255,255,0.35)" }} />
                      <span className="text-[11.5px] leading-snug" style={{ color: "rgba(255,255,255,0.60)" }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* ══ COMPARISON TABLE ══ */}
        <div className="flex-shrink-0 px-5 pb-3">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Table head */}
            <div className="grid grid-cols-4" style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-4 py-2 text-[10px] font-bold tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.35)" }}>FEATURE</div>
              {["Explore Trial", "Growth Access", "Scale Partner"].map((h, i) => (
                <div key={i} className="px-3 py-2 text-[10px] font-bold tracking-[0.10em] text-center"
                  style={{ color: i === 1 ? "#f5c842" : "rgba(255,255,255,0.35)" }}>
                  {h}
                </div>
              ))}
            </div>
            {/* Rows */}
            {COMPARISON.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4"
                style={{
                  borderBottom: i < COMPARISON.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                }}
              >
                <div className="px-4 py-2 text-[11.5px] font-medium" style={{ color: "rgba(255,255,255,0.60)" }}>{row.label}</div>
                {(["trial", "growth", "scale"] as const).map((key) => (
                  <div key={key} className="px-3 py-2 flex items-center justify-center">
                    <CellValue value={row[key]} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        </div>{/* end scrollable body */}

        {/* ══ FOOTER ══ */}
        <div
          className="flex-shrink-0 px-6 py-3 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.30)" }}
        >
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
            All plans include onboarding support. Cancel anytime.
          </p>
          <button
            onClick={onClose}
            className="text-[12px] font-medium transition-colors px-3 py-1.5 rounded-lg"
            style={{ color: "rgba(255,255,255,0.40)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.80)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.40)")}
          >
            Maybe later
          </button>
        </div>

      </div>
    </div>,
    document.body,
  );
}
