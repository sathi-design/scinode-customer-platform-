"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight,
  Globe, Search, Filter, ZoomIn, ZoomOut, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Shared gradient ──────────────────────────────────────────────────────────
const HERO_BG = "linear-gradient(125deg, #003A1B 0%, #001C08 55%, #000d04 100%)";

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, duration, delay]);
  return val;
}

// ─── Progress mount hook ──────────────────────────────────────────────────────
function useMounted(delay = 300) {
  const [m, setM] = useState(false);
  useEffect(() => { const t = setTimeout(() => setM(true), delay); return () => clearTimeout(t); }, [delay]);
  return m;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const RFQ_CARDS = [
  { flag: "🇩🇪", country: "Germany",   role: "PROCUREMENT MANAGER",       product: "High-Purity Solvents",              request: "Seeking 2-tonne monthly supply. ISO + COA required.",                                                     urgency: "Urgent",    urgencyColor: "#ef4444" },
  { flag: "🇮🇳", country: "India",     role: "HEAD OF STRATEGIC SOURCING", product: "Bismuth Citrate",                   request: "Need 115 kg CIF by air. Please share COA and ISO cert.",                                                  urgency: "Standard",  urgencyColor: "#f59e0b" },
  { flag: "🇧🇷", country: "Brazil",    role: "SUPPLY CHAIN DIRECTOR",      product: "SLES 70%",                          request: "Regular monthly container shipments. Please share availability and terms.",                               urgency: "Strategic", urgencyColor: "#3b82f6" },
  { flag: "🇯🇵", country: "Japan",     role: "R&D MANAGER",                product: "Methyl Benzoate (CAS: 93-58-3)",    request: "MSDS + TDS needed. 1 kg sample for testing requested.",                                                   urgency: "Standard",  urgencyColor: "#f59e0b" },
  { flag: "🇺🇸", country: "USA",       role: "TECHNICAL PURCHASING LEAD",  product: "Titanium Phosphate",                request: "Surface conditioning agent — quote 200 kg delivered.",                                                    urgency: "Urgent",    urgencyColor: "#ef4444" },
  { flag: "🇦🇺", country: "Australia", role: "FOUNDER & TECH LEAD",        product: "Specialty Semiconductor Chemical",  request: "Looking for manufacturing partner with R&D support for electronics applications.",                        urgency: "Strategic", urgencyColor: "#3b82f6" },
];

// Unified pipeline data — used for both stat cards and funnel bars
const PIPELINE_STAGES = [
  { shortLabel: "MATCHED",    label: "Projects Matched",  monthVal: 186, weekVal: 26 },
  { shortLabel: "SAVED",      label: "Saved",             monthVal: 62,  weekVal: 9  },
  { shortLabel: "SENT",       label: "Proposals Sent",    monthVal: 31,  weekVal: 5  },
  { shortLabel: "EVALUATING", label: "Under Evaluation",  monthVal: 14,  weekVal: 2  },
  { shortLabel: "ACTIVATED",  label: "Commercial Stage",  monthVal: 6,   weekVal: 1  },
];

// Profile progress bars — brand green→teal→purple palette
const PROFILE_CATEGORIES = [
  { label: "Manufacturing Basics", pct: 100, color: "linear-gradient(90deg,#B7D77A,#1ABC9C)" },
  { label: "Capabilities",         pct: 62,  color: "linear-gradient(90deg,#1ABC9C,#5B3BA8)" },
  { label: "Certifications",       pct: 38,  color: "linear-gradient(90deg,#5B3BA8,#7c5cc4)" },
  { label: "Catalogue Strength",   pct: 24,  color: "#5B3BA8"                                 },
];

const MAP_PINS = [
  { id: "IN", country: "India",     flag: "🇮🇳", left: "67%", top: "48%", rfqs: 92, samples: 38, newBuyers: 14, products: "Aroma intermediates, APIs", growth: "+34%", tier: "top"      },
  { id: "DE", country: "Germany",   flag: "🇩🇪", left: "49%", top: "26%", rfqs: 47, samples: 19, newBuyers: 7,  products: "Solvents, Lab chemicals",   growth: "+18%", tier: "high"     },
  { id: "US", country: "USA",       flag: "🇺🇸", left: "18%", top: "37%", rfqs: 38, samples: 22, newBuyers: 9,  products: "Specialty chemicals",       growth: "+12%", tier: "high"     },
  { id: "JP", country: "Japan",     flag: "🇯🇵", left: "79%", top: "36%", rfqs: 24, samples: 11, newBuyers: 4,  products: "Fine chemicals, Pharma",    growth: "+9%",  tier: "emerging" },
  { id: "BR", country: "Brazil",    flag: "🇧🇷", left: "28%", top: "66%", rfqs: 19, samples: 8,  newBuyers: 5,  products: "SLES, Surfactants",         growth: "+22%", tier: "emerging" },
  { id: "GB", country: "UK",        flag: "🇬🇧", left: "45%", top: "23%", rfqs: 16, samples: 6,  newBuyers: 3,  products: "Research chemicals",        growth: "+7%",  tier: "active"   },
  { id: "CN", country: "China",     flag: "🇨🇳", left: "74%", top: "40%", rfqs: 31, samples: 14, newBuyers: 6,  products: "Industrial chemicals",      growth: "+15%", tier: "high"     },
  { id: "AU", country: "Australia", flag: "🇦🇺", left: "80%", top: "67%", rfqs: 11, samples: 9,  newBuyers: 4,  products: "Semiconductor chemicals",   growth: "+28%", tier: "emerging" },
];

// Tier config — positive, opportunity-framed labels
const TIER_CONFIG: Record<string, { label: string; color: string }> = {
  top:      { label: "Top Market",  color: "#f59e0b" },   // amber
  high:     { label: "High Demand", color: "#8b5cf6" },   // violet
  emerging: { label: "Emerging",    color: "#3b82f6" },   // blue
  active:   { label: "Active",      color: "#22c55e" },   // green
};

// Sidebar data derived from MAP_PINS — no separate array needed

// ─── Brand-gradient gauge — larger semicircle (green → teal → purple) ────────
function Gauge({ pct, mounted }: { pct: number; mounted: boolean }) {
  const r  = 68, cx = 105, cy = 100;
  const circumference = Math.PI * r;
  const dash = mounted ? (pct / 100) * circumference : 0;

  return (
    <svg width="100%" viewBox="0 0 210 118" style={{ maxWidth: 200 }}>
      <defs>
        <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#B7D77A" />
          <stop offset="45%"  stopColor="#1ABC9C" />
          <stop offset="100%" stopColor="#5B3BA8" />
        </linearGradient>
        <linearGradient id="gaugeTextGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1ABC9C" />
          <stop offset="100%" stopColor="#5B3BA8" />
        </linearGradient>
      </defs>
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#e2e8f0" strokeWidth={14} strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="url(#gaugeGrad)" strokeWidth={14} strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s" }}
      />
      {/* Tip dot */}
      {mounted && (() => {
        const angle = -180 + (pct / 100) * 180;
        const rad   = (angle * Math.PI) / 180;
        const dx    = cx + r * Math.cos(rad);
        const dy    = cy + r * Math.sin(rad);
        return <circle cx={dx} cy={dy} r={6} fill="#5B3BA8" />;
      })()}
      {/* Labels */}
      <text x={cx} y={cy - 8}  textAnchor="middle" fontSize={30} fontWeight={800} fill="url(#gaugeTextGrad)">{pct}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="#94a3b8" letterSpacing={1}>BUYER READINESS</text>
    </svg>
  );
}

// ─── Funnel — diagonal hatch default, green→blue gradient on hover ─────────────
function FunnelView({ mounted }: { mounted: boolean }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null);
  const max = 186;

  // Per-row hover gradient: steps from green → blue across the funnel
  const hoverGradients = [
    "linear-gradient(90deg,#1a6b4f,#29a06a)",
    "linear-gradient(90deg,#1a6b4f,#2F66D0)",
    "linear-gradient(90deg,#1ABC9C,#2F66D0)",
    "linear-gradient(90deg,#2F66D0,#4f46e5)",
    "linear-gradient(90deg,#4f46e5,#5B3BA8)",
  ];

  return (
    <div className="flex flex-col gap-1.5">
      {PIPELINE_STAGES.map((s, i) => {
        const w     = mounted ? (s.monthVal / max) * 100 : 0;
        const isHov = hovIdx === i;
        return (
          <div
            key={i}
            className="flex items-center gap-3 cursor-pointer"
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
          >
            {/* Label */}
            <div className={cn(
              "shrink-0 w-[110px] text-[11px] text-right leading-snug transition-colors duration-200",
              isHov ? "font-bold text-[#171717]" : "font-medium text-[#64748b]",
            )}>
              {s.shortLabel}
            </div>

            {/* Bar track */}
            <div className="flex-1 relative h-[14px] rounded-full overflow-hidden" style={{ background: "#edf2f5" }}>
              {/* Hatch fill — shown when not hovered */}
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width:           w > 0 ? `${w}%` : "0%",
                  opacity:         isHov ? 0 : 1,
                  transition:      `width 620ms cubic-bezier(0.25,0.46,0.45,0.94) ${i * 80}ms, opacity 240ms ease`,
                  backgroundImage: "repeating-linear-gradient(-45deg,#b8c8d2 0px,#b8c8d2 2px,#d4dde3 2px,#d4dde3 8px)",
                }}
              />
              {/* Colour fill — shown on hover */}
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width:      (isHov && mounted) ? `${w}%` : "0%",
                  opacity:    isHov ? 1 : 0,
                  transition: "width 350ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 200ms ease",
                  background: hoverGradients[i],
                }}
              />
              {isHov && (
                <div className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ boxShadow: "0 0 10px rgba(31,111,84,0.28)" }} />
              )}
            </div>

            {/* Count */}
            <div className={cn(
              "shrink-0 w-8 text-right text-[12px] tabular-nums transition-colors duration-200",
              isHov ? "font-bold text-[#171717]" : "font-medium text-[#94a3b8]",
            )}>
              {s.monthVal}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — HERO
// ═══════════════════════════════════════════════════════════════════════════════
function HeroSection() {
  const [tipVisible,      setTipVisible]      = useState(false);
  const [progressMounted, setProgressMounted] = useState(false);
  const [cardIdx,         setCardIdx]         = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCardIdx(i => (i + 1) % RFQ_CARDS.length), 5000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  useEffect(() => {
    const t = setTimeout(() => setProgressMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  const goTo = (i: number) => { setCardIdx(i); resetTimer(); };

  const buyerSearches  = useCountUp(124, 1000, 600);
  const matchedCats    = useCountUp(8,   800,  750);
  const visibilityRank = useCountUp(42,  900,  900);
  const newRFQs        = useCountUp(6,   600,  1050);

  const rfq = RFQ_CARDS[cardIdx];

  return (
    <section className="relative overflow-hidden rounded-2xl" style={{ background: HERO_BG }}>
      <style>{`
        @keyframes mfg1-badgeShimmer {
          0%, 100% { background-position: -200% center; }
          50%       { background-position:  200% center; }
        }
        @keyframes mfg1-grid {
          0%, 100% { opacity: 0.025; }
          50%       { opacity: 0.045; }
        }
        @keyframes mfg1-cardFade {
          from { opacity: 0; transform: translateY(7px); }
          to   { opacity: 1; transform: translateY(0px); }
        }
        @keyframes mfg1-pulse {
          0%,100% { transform:scale(1);opacity:1 }
          50%     { transform:scale(1.4);opacity:0.6 }
        }
      `}</style>

      {/* ── Ambient glows (Day 0 layout) ── */}
      <div className="pointer-events-none absolute -top-28 left-[28%] w-[420px] h-[420px] rounded-full opacity-[0.18]"
        style={{ background: "radial-gradient(circle,#1db877 0%,transparent 68%)", filter: "blur(72px)" }} />
      <div className="pointer-events-none absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-[0.09]"
        style={{ background: "radial-gradient(circle,#3b82f6 0%,transparent 70%)", filter: "blur(48px)" }} />
      <div className="pointer-events-none absolute top-0 right-0 w-72 h-full rounded-r-2xl opacity-[0.22]"
        style={{ background: "radial-gradient(ellipse at top right,#0a3d1e 0%,transparent 70%)" }} />

      {/* ── Grid texture (Day 0 — with dot at intersections) ── */}
      <div className="pointer-events-none absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 24h48M24 0v48' stroke='%23ffffff' stroke-width='0.4'/%3E%3Ccircle cx='24' cy='24' r='1' fill='%23ffffff'/%3E%3C/svg%3E")`,
        backgroundSize: "48px 48px",
        animation: "mfg1-grid 7s ease-in-out infinite",
      }} />

      <div className="relative z-10 grid grid-cols-12">

        {/* ══ LEFT PANEL — 70% ══ */}
        <div className="col-span-12 lg:col-span-8 px-6 pt-4 pb-4 sm:px-8 sm:pt-5 sm:pb-5 flex flex-col justify-between gap-3">

          {/* SCINODE SECURE badge — exact Day 0 style */}
          <div className="relative inline-block self-start">
            <button
              type="button"
              className="relative overflow-hidden flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-emerald-200/90 border border-emerald-400/20 hover:border-emerald-400/50 hover:scale-[1.03] hover:shadow-[0_0_18px_rgba(74,222,128,0.22)] transition-all duration-200"
              style={{ background: "rgba(20,55,30,0.90)" }}
              onMouseEnter={() => setTipVisible(true)}
              onMouseLeave={() => setTipVisible(false)}
            >
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.11) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
                animation: "mfg1-badgeShimmer 3.5s ease-in-out infinite",
              }} />
              <span className="relative z-10">🔒</span>
              <span className="relative z-10 font-bold tracking-wide">SCINODE SECURE</span>
            </button>
            {/* Tooltip */}
            <div
              className="absolute left-0 top-full mt-2 z-20 w-[268px] pointer-events-none"
              style={{
                opacity:   tipVisible ? 1 : 0,
                transform: tipVisible ? "translateY(0)" : "translateY(-4px)",
                transition: "opacity 200ms ease, transform 200ms ease",
              }}
            >
              <div className="bg-[#1e293b] text-white text-[11px] leading-relaxed rounded-[10px] px-3.5 py-2.5 shadow-2xl border border-white/10">
                <div className="absolute bottom-full left-5 border-[5px] border-transparent border-b-[#1e293b]" />
                <p className="font-semibold mb-0.5">SCINODE SECURE</p>
                <p>Your data and IP remain encrypted and access-controlled at every step.</p>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div>
            <h1
              className="text-[20px] sm:text-[23px] md:text-[26px] font-black text-white leading-[1.15] tracking-[-0.02em] mb-1.5"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Let&apos;s get your plant in front of{" "}
              <span style={{
                background: "linear-gradient(90deg,#4ade80 0%,#34d399 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>130+ countries</span>{" "}of buyers.
            </h1>
            <p className="text-[12px] leading-relaxed max-w-[520px]" style={{ color: "rgba(255,255,255,0.60)" }}>
              Manufacturers with completed profiles receive <strong className="text-emerald-400">38% more</strong> aligned buyer inquiries within their first 30 days.
            </p>
          </div>

          {/* Progress bar — Day 0 single-bar style */}
          <div className="flex flex-col gap-1 max-w-[520px]">
            <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.13)" }}>
              <div className="h-full rounded-full" style={{
                width:      progressMounted ? "28%" : "0%",
                transition: "width 1.2s cubic-bezier(0.22,1,0.36,1) 0.4s",
                background: "linear-gradient(90deg,#4ade80 0%,#34d399 100%)",
                boxShadow:  "0 0 10px rgba(74,222,128,0.50)",
              }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold" style={{ color: "#4ade80" }}>28% Complete · Profile Setup In Progress</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#002d14] text-[12px] font-bold rounded-lg hover:bg-emerald-50 hover:shadow-[0_0_16px_rgba(255,255,255,0.22)] active:scale-[0.98] transition-all duration-200 shadow-sm">
              Continue Setup — Add Capabilities <ArrowRight size={13} strokeWidth={2.5} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-white/30 text-[12px] font-semibold rounded-lg hover:bg-white/10 hover:border-white/50 transition-all duration-200"
              style={{ color: "rgba(255,255,255,0.90)" }}>
              Explore Buyer Demand <ArrowRight size={13} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ══ RIGHT PANEL — 30%: Buyer Carousel (Day 0 layout) ══ */}
        <div className="col-span-12 lg:col-span-4 flex overflow-hidden">
          <div className="hidden lg:block w-px self-stretch bg-white/[0.07] shrink-0" />
          <div
            className="flex-1 flex flex-col px-5 pt-4 pb-4 sm:px-6 justify-between gap-3"
            style={{ background: "rgba(0,0,0,0.22)" }}
          >
            {/* Heading */}
            <h3
              className="text-white text-[13px] font-bold leading-snug shrink-0"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Trending RFQs Matched to Your Category
            </h3>

            {/* Active card */}
            {(() => {
              return (
                <div
                  key={cardIdx}
                  className="flex flex-col gap-1.5 flex-1"
                  style={{ animation: "mfg1-cardFade 0.38s ease both" }}
                >
                  {/* Flag */}
                  <span className="text-[34px] leading-none">{rfq.flag}</span>

                  {/* Country */}
                  <p className="text-white text-[15px] font-bold leading-snug">{rfq.country}</p>

                  {/* SCINODE VERIFIED badge */}
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-[4px] rounded-full border border-emerald-400/25 w-fit"
                    style={{ background: "rgba(52,211,153,0.08)" }}
                  >
                    <span className="relative flex h-[5px] w-[5px] shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-[5px] w-[5px] bg-emerald-400" />
                    </span>
                    <span className="text-[9px] font-bold text-emerald-300 tracking-[0.12em]">SCINODE VERIFIED</span>
                  </div>

                  {/* Role */}
                  <p className="text-[9px] font-bold tracking-[0.14em]" style={{ color: "rgba(52,211,153,0.80)" }}>
                    {rfq.role}
                  </p>

                  {/* Product heading */}
                  <p className="text-white text-[12px] font-semibold">{rfq.product}</p>

                  {/* Request as quote */}
                  <p
                    className="text-[12px] leading-[1.6] italic flex-1"
                    style={{ color: "rgba(255,255,255,0.60)", wordBreak: "break-word", overflow: "hidden" }}
                  >
                    &ldquo;{rfq.request}&rdquo;
                  </p>

                  {/* Timestamp */}
                  <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>Updated just now</p>
                </div>
              );
            })()}

            {/* Pagination dots only (no arrow buttons — Day 0 style) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {RFQ_CARDS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`RFQ ${i + 1}`}
                  className="h-[5px] rounded-full transition-all duration-300"
                  style={{
                    width:      i === cardIdx ? 20 : 5,
                    background: i === cardIdx ? "#4ade80" : "rgba(255,255,255,0.22)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom metrics strip ── */}
      <div className="relative z-10 border-t border-white/[0.07] grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.07]">
        {[
          { label: "Buyer Searches This Week", value: buyerSearches,  suffix: ""  },
          { label: "Matched Categories",        value: matchedCats,    suffix: ""  },
          { label: "Visibility Rank",           value: visibilityRank, suffix: "%" },
          { label: "New RFQs Today",            value: newRFQs,        suffix: ""  },
        ].map((m, i) => (
          <div key={i} className="px-4 py-2.5">
            <p className="text-[9px] font-semibold tracking-[0.10em] mb-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>
              {m.label.toUpperCase()}
            </p>
            <p className="text-[22px] font-black text-white leading-none">
              {m.value}{m.suffix}
              {i === 2 && <span className="text-[12px] text-white/50 font-semibold ml-1">Top</span>}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — OPPORTUNITY + PROFILE READINESS
// ═══════════════════════════════════════════════════════════════════════════════
function OpportunitySection() {
  const [period,   setPeriod]   = useState<"week" | "month">("month");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const mounted = useMounted(500);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch">

      {/* ── LEFT 70% — single combined card ── */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">

        {/* Card header */}
        <div className="px-4 pt-3 pb-3 border-b border-slate-100 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.20em] text-slate-400 mb-0.5">OPPORTUNITY FLOW</p>
            <h2 className="text-[15px] sm:text-[17px] font-bold text-[#1e293b]" style={{ fontFamily: "Poppins,sans-serif" }}>
              Opportunity Pipeline
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Track proposal activity this month</p>
          </div>

          {/* Legend + period toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: "linear-gradient(90deg,#1a6b4f,#2F66D0)" }} />
                <span className="text-[9.5px] text-slate-400 font-medium">Total pipeline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundImage: "repeating-linear-gradient(-45deg,#b8c8d2 0px,#b8c8d2 2px,#d4dde3 2px,#d4dde3 8px)" }} />
                <span className="text-[9.5px] text-slate-400 font-medium">Hover to explore</span>
              </div>
            </div>
            <div className="hidden sm:block w-px h-4 bg-slate-200" />
            <div className="flex p-1 bg-slate-100 rounded-lg gap-0.5">
              {(["week", "month"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={cn(
                    "px-3 py-1 rounded-md text-[11px] font-semibold transition-all duration-200",
                    period === p ? "bg-white text-[#1e293b] shadow-sm" : "text-slate-400 hover:text-slate-600",
                  )}>
                  This {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nudge banner — inside card, above stat cards */}
        <div className="mx-4 mt-2 flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl"
          style={{ background: "linear-gradient(90deg,#e8f5f0 0%,#f0faf5 100%)", border: "1px solid #b6e4d4" }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
              style={{ animation: "mfg1-pulse 2.5s ease infinite" }} />
            <p className="text-[13px] font-semibold text-emerald-900 truncate">
              <strong>124 buyer projects</strong> are currently aligned to your manufacturing category.
            </p>
          </div>
          <button className="shrink-0 flex items-center gap-1 text-[12px] font-bold text-emerald-700 hover:text-emerald-900 transition-colors">
            View Matches <ArrowRight size={11} />
          </button>
        </div>

        {/* Stage stat cards — Day10 style with arrows */}
        <div className="px-4 pt-2 pb-2">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
            {PIPELINE_STAGES.map((stage, i) => {
              const count = period === "week" ? stage.weekVal : stage.monthVal;
              const isHov = hoverIdx === i;
              return (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-1 min-w-0">
                  <div
                    className="flex-1 min-w-0 p-1.5 sm:p-2 rounded-xl border cursor-pointer transition-all duration-200 select-none"
                    style={{
                      background:  isHov ? "rgba(26,107,79,0.06)" : "#f8fafc",
                      borderColor: isHov ? "#1a6b4f" : "#e2e8f0",
                      boxShadow:   isHov ? "0 0 0 1px rgba(26,107,79,0.18)" : "none",
                    }}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                  >
                    <p className="text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wide leading-snug mb-1 truncate transition-colors duration-200"
                      style={{ color: isHov ? "#1a6b4f" : "#94a3b8" }}>
                      {stage.shortLabel}
                    </p>
                    <p className="text-[17px] sm:text-[19px] font-black leading-none tabular-nums transition-colors duration-200"
                      style={{ color: isHov ? "#1a6b4f" : "#334155", fontFamily: "Poppins,sans-serif" }}>
                      {count}
                    </p>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <svg width="12" height="12" viewBox="0 0 14 14" className="shrink-0 text-slate-300">
                      <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Proposal Conversion Flow (funnel bars) */}
        <div className="px-4 pb-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">PROPOSAL CONVERSION FLOW</p>
          <FunnelView mounted={mounted} />
        </div>

        {/* ── Recent Proposals — separated by border ── */}
        <div className="border-t border-slate-100 px-4 py-3 flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[11px] font-bold text-[#1e293b]">Recent Proposals</p>
              <p className="text-[9.5px] text-slate-400 leading-snug">Most recent proposals submitted to active requirements</p>
            </div>
            <button className="shrink-0 flex items-center gap-1 text-[10.5px] font-semibold text-[#1F6F54] hover:opacity-75 transition-opacity">
              View all proposals <ArrowRight size={10} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Proposal 1 — Draft (incomplete, needs action) */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-2 flex flex-col gap-1 hover:border-amber-300 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[8px] border border-amber-300 rounded-full px-1.5 py-[2px] text-amber-700 font-medium leading-none">Draft</span>
                  <span className="text-[8px] rounded-full px-1.5 py-[2px] text-white font-bold leading-none" style={{ background: "#0E6F5C" }}>CMO</span>
                </div>
                <span className="text-[8.5px] font-semibold flex items-center gap-1 leading-none text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0 bg-amber-400 animate-pulse" />
                  Incomplete · Buyer window closes in 18 hrs
                </span>
              </div>
              <p className="text-[10.5px] font-semibold text-[#1e293b] leading-snug truncate">
                Manufacturing of a Vitamin D3 Intermediate for Nutraceutical Applications
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[8.5px] text-slate-400 truncate">PRJ-2026-0603 · Vitamin D3 Intermediate VD-07 · Nutraceuticals</p>
                <button className="shrink-0 px-2 py-[3px] rounded-md text-[9px] font-bold text-white transition-colors"
                  style={{ background: "#d97706" }}>
                  Complete Now →
                </button>
              </div>
            </div>

            {/* Proposal 2 — Evaluation ended */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2 flex flex-col gap-1 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[8px] border border-slate-200 rounded-full px-1.5 py-[2px] text-slate-400 font-medium leading-none">Proposal</span>
                  <span className="text-[8px] rounded-full px-1.5 py-[2px] text-white font-bold leading-none" style={{ background: "#2F66D0" }}>RFQ</span>
                </div>
                <span className="text-[8.5px] font-semibold flex items-center gap-1 leading-none text-slate-400">
                  <span className="w-1 h-1 rounded-full inline-block shrink-0 bg-slate-400" />
                  Evaluation Ended
                </span>
              </div>
              <p className="text-[10.5px] font-semibold text-slate-400 leading-snug truncate">
                Custom bromine derivative for flame retardant application
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[8.5px] text-slate-400 truncate">PRJ-2026-0054 · Tetrabromobisphenol A (TBBPA) · Elemental Derivatives</p>
                <button className="shrink-0 text-[9px] font-semibold text-slate-400 hover:text-slate-600 transition-colors">View →</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT 30% — Profile Readiness (same height, stretched) ── */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col">

        <p className="text-[9px] font-bold tracking-[0.20em] text-slate-400 uppercase mb-0.5">MANUFACTURING PROFILE SIGNAL</p>
        <h3 className="text-[15px] font-bold text-[#1e293b] mb-2" style={{ fontFamily: "Poppins,sans-serif" }}>
          Profile Performance
        </h3>

        {/* Gauge */}
        <div className="flex justify-center mb-3">
          <Gauge pct={86} mounted={mounted} />
        </div>

        {/* Progress bars */}
        <div className="flex flex-col gap-2 flex-1">
          {PROFILE_CATEGORIES.map((c, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-600 font-medium">{c.label}</span>
                <span className="text-[11px] font-bold text-[#1e293b]">{c.pct}%</span>
              </div>
              <div className="w-full h-[6px] bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width:           mounted ? `${c.pct}%` : "0%",
                    background:      c.color,
                    transitionDelay: `${i * 120 + 400}ms`,
                    boxShadow:       mounted ? "0 1px 6px rgba(45,209,124,0.28)" : "none",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Opportunity nudge */}
        <div className="mt-3 rounded-xl p-3" style={{ background: "#0d1117", border: "1px solid rgba(245,200,66,0.20)" }}>
          <p className="text-[9px] font-bold tracking-[0.10em] text-slate-400 mb-1">OPPORTUNITY VALUE</p>
          <p className="text-[11px] text-slate-300 leading-snug">Incomplete profile may be costing an estimated</p>
          <p className="text-[28px] font-black text-white leading-none mb-0.5">
            $50,000<span className="text-[13px] font-semibold text-slate-400">/mo</span>
          </p>
          <p className="text-[10px] text-slate-500 mb-2">in missed buyer opportunities.</p>
          <button
            className="w-full py-2 rounded-xl text-white text-[11px] font-bold transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: "linear-gradient(90deg,#1F6F54,#27915e)" }}
          >
            Complete Profile Now →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Location pin SVG ─────────────────────────────────────────────────────────
function LocationPin({ color, active = false }: { color: string; active?: boolean }) {
  return (
    <svg
      width={active ? 20 : 16} height={active ? 27 : 22}
      viewBox="0 0 16 22" fill="none"
      style={{
        filter:     `drop-shadow(0 3px 6px ${color}70)`,
        transition: "width 200ms ease, height 200ms ease",
      }}
    >
      <path
        d="M8 0.5C4.41 0.5 1.5 3.41 1.5 7c0 5.46 6.5 14.5 6.5 14.5S14.5 12.46 14.5 7C14.5 3.41 11.59 0.5 8 0.5z"
        fill={color}
        stroke="rgba(255,255,255,0.50)"
        strokeWidth="0.8"
      />
      <circle cx="8" cy="7" r="2.6" fill="white" opacity="0.92" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — GLOBAL BUYER ACTIVITY MAP
// ═══════════════════════════════════════════════════════════════════════════════
function WorldRFQMap() {
  const [hovered,   setHovered]   = useState<string | null>(null);
  const [selected,  setSelected]  = useState<string | null>(null);
  const [signal,    setSignal]    = useState<"rfqs" | "samples" | "newBuyers">("rfqs");
  const [timeframe, setTimeframe] = useState<"monthly" | "quarterly">("monthly");
  const mounted = useMounted(200);

  // Derive signal value for sidebar bars
  const getVal = (pin: typeof MAP_PINS[0]) =>
    signal === "rfqs" ? pin.rfqs : signal === "samples" ? pin.samples : pin.newBuyers;
  const sortedPins = [...MAP_PINS].sort((a, b) => getVal(b) - getVal(a));
  const maxVal     = Math.max(...MAP_PINS.map(getVal));

  const hoveredPin = hovered ? MAP_PINS.find(p => p.id === hovered) : null;

  const SIGNAL_LABELS = {
    rfqs:      { label: "RFQs",           desc: "Formal purchase requests" },
    samples:   { label: "Sample Requests", desc: "Pre-qualification demand" },
    newBuyers: { label: "New Buyers",      desc: "First-time inquiries this month" },
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <style>{`
        @keyframes rfqPinGlow {
          0%,100% { opacity: 0.30; transform: scale(0.80); }
          50%      { opacity: 0.65; transform: scale(1.25); }
        }
        @keyframes tooltipFade {
          from { opacity:0; transform:translateY(5px) scale(0.96); }
          to   { opacity:1; transform:translateY(0)   scale(1);    }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-3 pb-3 border-b border-slate-100 flex items-start justify-between flex-wrap gap-2">
        <div>
          <p className="text-[9px] font-bold tracking-[0.12em] text-slate-400 mb-0.5">GLOBAL INTELLIGENCE</p>
          <h3 className="text-[16px] font-bold text-slate-900 leading-snug">Global Buyer Activity</h3>
          <p className="text-[11px] text-slate-400">Live buyer signals across markets — updated daily.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Signal type tabs */}
          <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
            {(["rfqs", "samples", "newBuyers"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSignal(s)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all whitespace-nowrap",
                  signal === s ? "bg-white shadow-sm text-[#1e293b]" : "text-slate-500 hover:text-slate-700",
                )}
              >
                {SIGNAL_LABELS[s].label}
              </button>
            ))}
          </div>
          <div className="hidden sm:block w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
            <Search size={11} className="text-slate-400" />
            <input className="text-[10px] bg-transparent outline-none w-20 placeholder:text-slate-400"
              placeholder="Search market…" />
          </div>
          <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
            {(["monthly", "quarterly"] as const).map(t => (
              <button key={t} onClick={() => setTimeframe(t)}
                className={cn("px-2 py-1 rounded-md text-[10px] font-semibold capitalize transition-all",
                  timeframe === t ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700")}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Map + Sidebar ───────────────────────────────────────────────────── */}
      <div className="flex">

        {/* MAP */}
        <div className="flex-1 relative" style={{ minHeight: 270 }}>

          {/* Light ocean background */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(160deg, #eef2f8 0%, #e8edf5 60%, #eaf0f7 100%)",
          }} />

          {/* Subtle grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          {/* Real world map SVG — gray land on light ocean */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/world-map.svg"
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{
              opacity:         0.55,
              filter:          "brightness(0.68) saturate(0)",
              objectPosition:  "center 40%",
            }}
          />

          {/* RFQ Pins */}
          {MAP_PINS.map((pin, idx) => {
            const cfg    = TIER_CONFIG[pin.tier];
            const color  = cfg.color;
            const isHov  = hovered  === pin.id;
            const isSel  = selected === pin.id;
            const active = isHov || isSel;

            return (
              <div
                key={pin.id}
                className="absolute cursor-pointer"
                style={{
                  left:      pin.left,
                  top:       pin.top,
                  transform: "translate(-50%,-100%)",
                  zIndex:    active ? 30 : 10,
                }}
                onMouseEnter={() => setHovered(pin.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(s => s === pin.id ? null : pin.id)}
              >
                {/* Soft radial glow — slow, staggered per pin */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width:          36, height: 36,
                    top:            "40%", left: "50%",
                    transform:      "translate(-50%,-50%)",
                    background:     `radial-gradient(circle,${color}45 0%,transparent 70%)`,
                    animation:      `rfqPinGlow ${3.8 + idx * 0.35}s ease-in-out infinite`,
                    animationDelay: `${idx * 0.22}s`,
                  }}
                />

                <LocationPin color={color} active={active} />

                {/* Hover tooltip */}
                {isHov && (
                  <div
                    className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-48 rounded-xl overflow-hidden"
                    style={{
                      animation: "tooltipFade 0.18s ease both",
                      zIndex: 40,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
                    }}
                  >
                    <div className="bg-white border border-slate-200 p-2.5">
                      {/* Country header */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-base">{pin.flag}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-[#1e293b] leading-tight">{pin.country}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className="text-[8px] font-bold px-1.5 py-[2px] rounded-full"
                              style={{ background: `${color}18`, color }}
                            >
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 shrink-0">{pin.growth}</span>
                      </div>
                      {/* Signal breakdown */}
                      <div className="grid grid-cols-3 gap-1 mb-2 p-1.5 rounded-lg" style={{ background: "#f8fafc" }}>
                        {([
                          { key: "rfqs",      val: pin.rfqs,      label: "RFQs"    },
                          { key: "samples",   val: pin.samples,   label: "Samples" },
                          { key: "newBuyers", val: pin.newBuyers, label: "New"     },
                        ] as const).map(item => (
                          <div key={item.key} className="text-center">
                            <p className={cn(
                              "text-[13px] font-black leading-none",
                              signal === item.key ? "text-[#1F6F54]" : "text-[#334155]",
                            )}>
                              {item.val}
                            </p>
                            <p className="text-[8px] text-slate-400 mt-0.5">{item.label}</p>
                          </div>
                        ))}
                      </div>
                      {/* Products */}
                      <p className="text-[9px] text-slate-500 leading-snug">{pin.products}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Legend — highlights hovered tier */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 flex-wrap px-2 py-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(4px)", border: "1px solid rgba(0,0,0,0.06)" }}>
            {Object.entries(TIER_CONFIG).map(([tier, cfg]) => {
              const isActiveTier = hoveredPin?.tier === tier;
              return (
                <div key={tier} className="flex items-center gap-1 transition-opacity duration-200"
                  style={{ opacity: hoveredPin && !isActiveTier ? 0.38 : 1 }}>
                  <svg width="9" height="12" viewBox="0 0 16 22" fill="none">
                    <path d="M8 0.5C4.41 0.5 1.5 3.41 1.5 7c0 5.46 6.5 14.5 6.5 14.5S14.5 12.46 14.5 7C14.5 3.41 11.59 0.5 8 0.5z"
                      fill={cfg.color} />
                  </svg>
                  <span className="text-[8.5px] font-medium"
                    style={{ color: isActiveTier ? cfg.color : "#64748b" }}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Zoom controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {[ZoomIn, ZoomOut, RotateCcw].map((Icon, i) => (
              <button key={i}
                className="w-6 h-6 rounded-md flex items-center justify-center transition-colors border"
                style={{ background: "rgba(255,255,255,0.85)", color: "#64748b", borderColor: "rgba(0,0,0,0.08)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.85)")}>
                <Icon size={11} />
              </button>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-52 shrink-0 border-l border-slate-100 bg-slate-50/40 flex flex-col">
          <div className="px-3 pt-3 pb-2 flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold tracking-[0.12em] text-slate-400">TOP MARKETS</p>
              <p className="text-[9px] text-slate-400">{SIGNAL_LABELS[signal].label}</p>
            </div>
            <div className="flex flex-col gap-1">
              {sortedPins.map((pin, i) => {
                const isHov  = hovered === pin.id;
                const cfg    = TIER_CONFIG[pin.tier];
                const val    = getVal(pin);
                return (
                  <div
                    key={pin.id}
                    className="cursor-pointer rounded-lg px-2 py-1.5 transition-all duration-200"
                    style={{
                      background:  isHov ? "#fff"      : "transparent",
                      borderLeft:  isHov ? `3px solid ${cfg.color}` : "3px solid transparent",
                      boxShadow:   isHov ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
                    }}
                    onMouseEnter={() => setHovered(pin.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[12px]">{pin.flag}</span>
                        <span className="text-[11px] font-semibold text-slate-700">{pin.country}</span>
                        {i === 0 && (
                          <span className="text-[7px] font-bold px-1 py-[1px] rounded-full"
                            style={{ background: `${cfg.color}18`, color: cfg.color }}>
                            #1
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: isHov ? cfg.color : "#64748b" }}>{val}</span>
                    </div>
                    <div className="w-full h-[4px] bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width:           mounted ? `${(val / maxVal) * 100}%` : "0%",
                          background:      isHov ? cfg.color : "#cbd5e1",
                          transitionDelay: `${i * 50}ms`,
                        }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="px-3 pb-3 border-t border-slate-100 pt-2">
            <p className="text-[9px] text-slate-400 mb-1.5">{SIGNAL_LABELS[signal].desc}</p>
            <button className="w-full py-1.5 rounded-xl border border-[#1F6F54] text-[#1F6F54] text-[11px] font-semibold hover:bg-[#1F6F54] hover:text-white transition-all">
              <Globe size={11} className="inline mr-1" /> Explore All Markets
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export function ManufacturingDay1Dashboard() {
  return (
    <div className="space-y-4 pb-12 max-w-[1200px] mx-auto px-4 sm:px-0">
      <HeroSection />
      <OpportunitySection />
      <WorldRFQMap />
    </div>
  );
}
