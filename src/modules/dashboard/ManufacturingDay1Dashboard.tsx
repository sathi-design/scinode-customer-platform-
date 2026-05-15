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
  { shortLabel: "IDENTIFIED",  label: "Projects Available",  monthVal: 186, weekVal: 26 },
  { shortLabel: "SHORTLISTED", label: "Shortlisted",         monthVal: 62,  weekVal: 9  },
  { shortLabel: "PROPOSALS",   label: "Proposals Sent",      monthVal: 31,  weekVal: 5  },
  { shortLabel: "TECH. EVAL.", label: "Under Evaluation",    monthVal: 14,  weekVal: 2  },
  { shortLabel: "COMMERCIAL",  label: "Commercial Stage",    monthVal: 6,   weekVal: 1  },
];

// Profile progress bars — brand green→teal→purple palette
const PROFILE_CATEGORIES = [
  { label: "Manufacturing Basics", pct: 100, color: "linear-gradient(90deg,#B7D77A,#1ABC9C)" },
  { label: "Capabilities",         pct: 62,  color: "linear-gradient(90deg,#1ABC9C,#5B3BA8)" },
  { label: "Certifications",       pct: 38,  color: "linear-gradient(90deg,#5B3BA8,#7c5cc4)" },
  { label: "Catalogue Strength",   pct: 24,  color: "#5B3BA8"                                 },
];

const MAP_PINS = [
  { id: "IN", country: "India",     flag: "🇮🇳", left: "67%", top: "48%", rfqs: 92, products: "Aroma intermediates, APIs", growth: "+34%", tier: "critical" },
  { id: "DE", country: "Germany",   flag: "🇩🇪", left: "49%", top: "26%", rfqs: 47, products: "Solvents, Lab chemicals",   growth: "+18%", tier: "high"     },
  { id: "US", country: "USA",       flag: "🇺🇸", left: "18%", top: "37%", rfqs: 38, products: "Specialty chemicals",       growth: "+12%", tier: "high"     },
  { id: "JP", country: "Japan",     flag: "🇯🇵", left: "79%", top: "36%", rfqs: 24, products: "Fine chemicals, Pharma",    growth: "+9%",  tier: "medium"   },
  { id: "BR", country: "Brazil",    flag: "🇧🇷", left: "28%", top: "66%", rfqs: 19, products: "SLES, Surfactants",         growth: "+22%", tier: "medium"   },
  { id: "GB", country: "UK",        flag: "🇬🇧", left: "45%", top: "23%", rfqs: 16, products: "Research chemicals",       growth: "+7%",  tier: "low"      },
  { id: "CN", country: "China",     flag: "🇨🇳", left: "74%", top: "40%", rfqs: 31, products: "Industrial chemicals",     growth: "+15%", tier: "high"     },
  { id: "AU", country: "Australia", flag: "🇦🇺", left: "80%", top: "67%", rfqs: 11, products: "Semiconductor chemicals",  growth: "+28%", tier: "medium"   },
];

const PIN_COLORS: Record<string, string> = {
  critical: "#f5c842",
  high:     "#8b5cf6",
  medium:   "#3b82f6",
  low:      "#22c55e",
};

const COUNTRY_BARS = [
  { country: "India",     flag: "🇮🇳", rfqs: 92 },
  { country: "Germany",   flag: "🇩🇪", rfqs: 47 },
  { country: "China",     flag: "🇨🇳", rfqs: 31 },
  { country: "USA",       flag: "🇺🇸", rfqs: 38 },
  { country: "Japan",     flag: "🇯🇵", rfqs: 24 },
  { country: "Brazil",    flag: "🇧🇷", rfqs: 19 },
  { country: "UK",        flag: "🇬🇧", rfqs: 16 },
  { country: "Australia", flag: "🇦🇺", rfqs: 11 },
];

// ─── Brand-gradient gauge — larger semicircle (green → teal → purple) ────────
function Gauge({ pct, mounted }: { pct: number; mounted: boolean }) {
  const r  = 82, cx = 105, cy = 100;
  const circumference = Math.PI * r;
  const dash = mounted ? (pct / 100) * circumference : 0;

  return (
    <svg width="100%" viewBox="0 0 210 118" style={{ maxWidth: 260 }}>
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
    <div className="flex flex-col gap-2.5">
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
            <div className="flex-1 relative h-[18px] rounded-full overflow-hidden" style={{ background: "#edf2f5" }}>
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
        <div className="col-span-12 lg:col-span-8 px-6 pt-5 pb-5 sm:px-8 sm:pt-6 sm:pb-6 flex flex-col justify-between gap-4">

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
              className="text-[22px] sm:text-[26px] md:text-[30px] font-black text-white leading-[1.15] tracking-[-0.02em] mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Let&apos;s get your plant in front of{" "}
              <span style={{
                background: "linear-gradient(90deg,#4ade80 0%,#34d399 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>130+ countries</span>{" "}of buyers.
            </h1>
            <p className="text-[13px] leading-relaxed max-w-[520px]" style={{ color: "rgba(255,255,255,0.60)" }}>
              Manufacturers with completed profiles receive <strong className="text-emerald-400">38% more</strong> aligned buyer inquiries within their first 30 days.
            </p>
          </div>

          {/* Progress bar — Day 0 single-bar style */}
          <div className="flex flex-col gap-1.5 max-w-[520px]">
            <div className="w-full h-[8px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.13)" }}>
              <div className="h-full rounded-full" style={{
                width:      progressMounted ? "28%" : "0%",
                transition: "width 1.2s cubic-bezier(0.22,1,0.36,1) 0.4s",
                background: "linear-gradient(90deg,#4ade80 0%,#34d399 100%)",
                boxShadow:  "0 0 12px rgba(74,222,128,0.50)",
              }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold" style={{ color: "#4ade80" }}>28% Complete</span>
              <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>Profile Setup In Progress</span>
            </div>
            <p className="text-[11.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>
              Complete capabilities to unlock better RFQ matching.
            </p>
          </div>

          {/* CTA buttons — no Skip Guided Tour */}
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#002d14] text-[13px] font-bold rounded-lg hover:bg-emerald-50 hover:shadow-[0_0_16px_rgba(255,255,255,0.22)] active:scale-[0.98] transition-all duration-200 shadow-sm">
              Continue Setup — Add Capabilities <ArrowRight size={14} strokeWidth={2.5} />
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-white/30 text-[13px] font-semibold rounded-lg hover:bg-white/10 hover:border-white/50 transition-all duration-200"
              style={{ color: "rgba(255,255,255,0.90)" }}>
              Explore Buyer Demand <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ══ RIGHT PANEL — 30%: Buyer Carousel (Day 0 layout) ══ */}
        <div className="col-span-12 lg:col-span-4 flex overflow-hidden">
          <div className="hidden lg:block w-px self-stretch bg-white/[0.07] shrink-0" />
          <div
            className="flex-1 flex flex-col px-5 pt-6 pb-5 sm:px-6 justify-between gap-4"
            style={{ background: "rgba(0,0,0,0.22)" }}
          >
            {/* Heading */}
            <h3
              className="text-white text-[15px] font-bold leading-snug shrink-0"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Trending RFQs Matched to Your Category
            </h3>

            {/* Active card — fade on key change, exactly Day 0 structure */}
            {(() => {
              return (
                <div
                  key={cardIdx}
                  className="flex flex-col gap-2.5 flex-1"
                  style={{ animation: "mfg1-cardFade 0.38s ease both" }}
                >
                  {/* Flag */}
                  <span className="text-[44px] leading-none">{rfq.flag}</span>

                  {/* Country */}
                  <p className="text-white text-[17px] font-bold leading-snug">{rfq.country}</p>

                  {/* SCINODE VERIFIED badge */}
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-emerald-400/25 w-fit"
                    style={{ background: "rgba(52,211,153,0.08)" }}
                  >
                    <span className="relative flex h-[6px] w-[6px] shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-emerald-400" />
                    </span>
                    <span className="text-[10px] font-bold text-emerald-300 tracking-[0.14em]">SCINODE VERIFIED</span>
                  </div>

                  {/* Role */}
                  <p className="text-[10px] font-bold tracking-[0.15em]" style={{ color: "rgba(52,211,153,0.80)" }}>
                    {rfq.role}
                  </p>

                  {/* Product heading */}
                  <p className="text-white text-[13px] font-semibold">{rfq.product}</p>

                  {/* Request as quote — fills remaining space */}
                  <p
                    className="text-[13px] leading-[1.7] italic flex-1"
                    style={{ color: "rgba(255,255,255,0.60)", wordBreak: "break-word", overflow: "hidden" }}
                  >
                    &ldquo;{rfq.request}&rdquo;
                  </p>

                  {/* Timestamp */}
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>Updated just now</p>
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
          <div key={i} className="px-5 py-3">
            <p className="text-[10px] font-semibold tracking-[0.10em] mb-1" style={{ color: "rgba(255,255,255,0.40)" }}>
              {m.label.toUpperCase()}
            </p>
            <p className="text-[26px] font-black text-white leading-none">
              {m.value}{m.suffix}
              {i === 2 && <span className="text-[14px] text-white/50 font-semibold ml-1">Top</span>}
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
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-stretch">

      {/* ── LEFT 70% — single combined card ── */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">

        {/* Card header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.20em] text-slate-400 mb-1">OPPORTUNITY FLOW</p>
            <h2 className="text-[17px] sm:text-[19px] font-bold text-[#1e293b]" style={{ fontFamily: "Poppins,sans-serif" }}>
              Opportunity Pipeline
            </h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Track proposal activity this month</p>
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
        <div className="mx-5 mt-4 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl"
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
        <div className="px-5 sm:px-6 pt-4 pb-4">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
            {PIPELINE_STAGES.map((stage, i) => {
              const count = period === "week" ? stage.weekVal : stage.monthVal;
              const isHov = hoverIdx === i;
              return (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-1 min-w-0">
                  <div
                    className="flex-1 min-w-0 p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all duration-200 select-none"
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
                    <p className="text-[20px] sm:text-[22px] font-black leading-none tabular-nums transition-colors duration-200"
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
        <div className="px-5 sm:px-6 pb-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">PROPOSAL CONVERSION FLOW</p>
          <FunnelView mounted={mounted} />
        </div>

        {/* ── Recent Proposals — separated by border ── */}
        <div className="border-t border-slate-100 px-5 sm:px-6 py-5 flex-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] font-bold text-[#1e293b]">Recent Proposals</p>
              <p className="text-[9.5px] text-slate-400 leading-snug">Most recent proposals submitted to active requirements</p>
            </div>
            <button className="shrink-0 flex items-center gap-1 text-[10.5px] font-semibold text-[#1F6F54] hover:opacity-75 transition-opacity">
              View all proposals <ArrowRight size={10} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Proposal 1 — Draft (incomplete, needs action) */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-2.5 flex flex-col gap-1 hover:border-amber-300 hover:shadow-sm transition-all duration-200">
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
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 flex flex-col gap-1 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
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
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">

        <p className="text-[9px] font-bold tracking-[0.20em] text-slate-400 uppercase mb-1">MANUFACTURING PROFILE SIGNAL</p>
        <h3 className="text-[17px] font-bold text-[#1e293b] mb-5" style={{ fontFamily: "Poppins,sans-serif" }}>
          Profile Performance
        </h3>

        {/* Gauge */}
        <div className="flex justify-center mb-6">
          <Gauge pct={86} mounted={mounted} />
        </div>

        {/* Progress bars — larger text, more spacing */}
        <div className="flex flex-col gap-4 flex-1">
          {PROFILE_CATEGORIES.map((c, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] text-slate-600 font-medium">{c.label}</span>
                <span className="text-[13px] font-bold text-[#1e293b]">{c.pct}%</span>
              </div>
              <div className="w-full h-[8px] bg-slate-100 rounded-full overflow-hidden">
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
        <div className="mt-6 rounded-xl p-4" style={{ background: "#0d1117", border: "1px solid rgba(245,200,66,0.20)" }}>
          <p className="text-[10px] font-bold tracking-[0.10em] text-slate-400 mb-2">OPPORTUNITY VALUE</p>
          <p className="text-[12px] text-slate-300 leading-snug mb-1">Incomplete profile may be costing an estimated</p>
          <p className="text-[38px] font-black text-white leading-none mb-0.5">
            $50,000<span className="text-[16px] font-semibold text-slate-400">/mo</span>
          </p>
          <p className="text-[11px] text-slate-500 mb-3">in missed buyer opportunities.</p>
          <button
            className="w-full py-2.5 rounded-xl text-white text-[12px] font-bold transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: "linear-gradient(90deg,#1F6F54,#27915e)" }}
          >
            Complete Profile Now →
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — WORLD RFQ MAP (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════
function WorldRFQMap() {
  const [hovered,   setHovered]   = useState<string | null>(null);
  const [selected,  setSelected]  = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"monthly" | "quarterly">("monthly");
  const mounted  = useMounted(200);
  const maxRFQ   = Math.max(...COUNTRY_BARS.map(c => c.rfqs));

  const hoveredPin = MAP_PINS.find(p => p.id === hovered);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <style>{`
        @keyframes pinPulse    { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.8);opacity:0.3} }
        @keyframes tooltipFade { from{opacity:0;transform:translateY(4px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>

      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400 mb-0.5">GLOBAL INTELLIGENCE</p>
          <h3 className="text-[18px] font-bold text-slate-900">Global RFQ Intelligence</h3>
          <p className="text-[12px] text-slate-400 mt-0.5">Track where verified buyer demand is emerging.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
            <Search size={13} className="text-slate-400" />
            <input className="text-[12px] bg-transparent outline-none w-28 placeholder:text-slate-400"
              placeholder="Search market…" />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-[12px] text-slate-600 hover:bg-slate-50">
            <Filter size={12} /> Category
          </button>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {(["monthly", "quarterly"] as const).map(t => (
              <button key={t} onClick={() => setTimeframe(t)}
                className={cn("px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-all",
                  timeframe === t ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700")}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="flex">
        {/* MAP */}
        <div className="flex-1 relative" style={{ minHeight: 360 }}>
          <div className="absolute inset-0" style={{
            background: "linear-gradient(135deg, #0d1117 0%, #0f1923 50%, #0d1117 100%)",
            backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }} />

          {/* Continent blobs */}
          <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.12 }}>
            <div className="absolute rounded-[40%]" style={{ width:"22%", height:"35%", left:"8%",  top:"22%", background:"#2d4a6e" }} />
            <div className="absolute rounded-[40%]" style={{ width:"14%", height:"28%", left:"20%", top:"52%", background:"#2d4a6e" }} />
            <div className="absolute rounded-[40%]" style={{ width:"12%", height:"20%", left:"44%", top:"18%", background:"#2d4a6e" }} />
            <div className="absolute rounded-[40%]" style={{ width:"14%", height:"30%", left:"46%", top:"40%", background:"#2d4a6e" }} />
            <div className="absolute rounded-[30%]" style={{ width:"28%", height:"32%", left:"58%", top:"20%", background:"#2d4a6e" }} />
            <div className="absolute rounded-[40%]" style={{ width:"12%", height:"14%", left:"74%", top:"58%", background:"#2d4a6e" }} />
          </div>

          {/* Country pins */}
          {MAP_PINS.map(pin => {
            const color = PIN_COLORS[pin.tier];
            const isHov = hovered === pin.id;
            const isSel = selected === pin.id;
            return (
              <div
                key={pin.id}
                className="absolute cursor-pointer"
                style={{ left: pin.left, top: pin.top, transform: "translate(-50%,-50%)", zIndex: isHov ? 20 : 10 }}
                onMouseEnter={() => setHovered(pin.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(s => s === pin.id ? null : pin.id)}
              >
                <div className="absolute rounded-full" style={{
                  width: 28, height: 28, top: -6, left: -6,
                  border: `2px solid ${color}`,
                  animation: "pinPulse 3s ease infinite",
                }} />
                <div className="w-4 h-4 rounded-full transition-transform duration-200"
                  style={{
                    background:  color,
                    transform:   isHov || isSel ? "scale(1.4)" : "scale(1)",
                    boxShadow:   isHov ? `0 0 12px ${color}` : `0 0 6px ${color}60`,
                  }} />
                {isHov && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 rounded-xl shadow-2xl overflow-hidden"
                    style={{ animation: "tooltipFade 0.18s ease both", zIndex: 30 }}>
                    <div className="bg-[#1e293b] text-white p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{pin.flag}</span>
                        <div>
                          <p className="text-[13px] font-bold leading-tight">{pin.country}</p>
                          <p className="text-[10px] text-slate-400">{pin.rfqs} active RFQs</p>
                        </div>
                        <span className="ml-auto text-[10px] font-bold text-emerald-400">{pin.growth}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-2 leading-snug">{pin.products}</p>
                      <button className="w-full py-1.5 rounded-lg text-[10px] font-bold text-white"
                        style={{ background: "#1F6F54" }}>
                        View Requests →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex gap-3 flex-wrap">
            {Object.entries({ "Critical hotspot": "critical", "High volume": "high", "Medium": "medium", "Low": "low" }).map(([label, tier]) => (
              <div key={tier} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIN_COLORS[tier] }} />
                <span className="text-[9px] text-white/50">{label}</span>
              </div>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-1">
            {[ZoomIn, ZoomOut, RotateCcw].map((Icon, i) => (
              <button key={i}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}>
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-64 shrink-0 border-l border-slate-100 bg-slate-50/50">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400 mb-3">TOP RFQ MARKETS</p>
            <div className="flex flex-col gap-2.5">
              {COUNTRY_BARS.sort((a, b) => b.rfqs - a.rfqs).map((c, i) => {
                const isHov = hovered === MAP_PINS.find(p => p.country === c.country)?.id;
                return (
                  <div key={i}
                    className={cn("cursor-pointer rounded-lg px-3 py-2 transition-all", isHov ? "bg-white shadow-sm" : "hover:bg-white/70")}
                    onMouseEnter={() => setHovered(MAP_PINS.find(p => p.country === c.country)?.id ?? null)}
                    onMouseLeave={() => setHovered(null)}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px]">{c.flag}</span>
                        <span className="text-[12px] font-semibold text-slate-700">{c.country}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">{c.rfqs}</span>
                    </div>
                    <div className="w-full h-[5px] bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width:           mounted ? `${(c.rfqs / maxRFQ) * 100}%` : "0%",
                          background:      isHov ? "#1F6F54" : "#94a3b8",
                          transitionDelay: `${i * 60}ms`,
                        }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="px-4 pb-4 mt-2">
            <button className="w-full py-2 rounded-xl border border-[#1F6F54] text-[#1F6F54] text-[12px] font-semibold hover:bg-[#1F6F54] hover:text-white transition-all">
              <Globe size={12} className="inline mr-1" /> Explore All Markets
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
    <div className="space-y-5 pb-12 max-w-[1200px] mx-auto px-4 sm:px-0">
      <HeroSection />
      <OpportunitySection />
      <WorldRFQMap />
    </div>
  );
}
