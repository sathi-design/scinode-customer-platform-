"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight, ChevronLeft, ChevronRight, Check, TrendingUp,
  Globe, Search, Filter, ZoomIn, ZoomOut, RotateCcw,
  AlertCircle, Eye, FileText, Send, Award, BarChart2,
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
  { flag: "🇩🇪", country: "Germany",   role: "PROCUREMENT MANAGER",       product: "High-Purity Solvents",         request: "Seeking 2-tonne monthly supply. ISO + COA required.", urgency: "Urgent",   urgencyColor: "#ef4444" },
  { flag: "🇮🇳", country: "India",     role: "HEAD OF STRATEGIC SOURCING", product: "Bismuth Citrate",              request: "Need 115 kg CIF by air. Please share COA and ISO cert.", urgency: "Standard", urgencyColor: "#f59e0b" },
  { flag: "🇧🇷", country: "Brazil",    role: "SUPPLY CHAIN DIRECTOR",      product: "SLES 70%",                     request: "Regular monthly container shipments. Please share availability and terms.", urgency: "Strategic", urgencyColor: "#3b82f6" },
  { flag: "🇯🇵", country: "Japan",     role: "R&D MANAGER",                product: "Methyl Benzoate (CAS: 93-58-3)", request: "MSDS + TDS needed. 1 kg sample for testing requested.", urgency: "Standard", urgencyColor: "#f59e0b" },
  { flag: "🇺🇸", country: "USA",       role: "TECHNICAL PURCHASING LEAD",  product: "Titanium Phosphate",           request: "Surface conditioning agent — quote 200 kg delivered.", urgency: "Urgent",   urgencyColor: "#ef4444" },
  { flag: "🇦🇺", country: "Australia", role: "FOUNDER & TECH LEAD",        product: "Specialty Semiconductor Chemical", request: "Looking for manufacturing partner with R&D support for electronics applications.", urgency: "Strategic", urgencyColor: "#3b82f6" },
];

const PIPELINE = [
  { label: "Projects Viewed",       value: 24, color: "#1F6F54", icon: Eye },
  { label: "Draft Proposals",       value: 6,  color: "#f59e0b", icon: FileText },
  { label: "Sent Proposals",        value: 3,  color: "#3b82f6", icon: Send },
  { label: "Under Evaluation",      value: 2,  color: "#8b5cf6", icon: Award },
  { label: "Converted to Active",   value: 1,  color: "#10b981", icon: Check },
];

const PROFILE_CATEGORIES = [
  { label: "Manufacturing Basics",  pct: 100, color: "#1F6F54" },
  { label: "Capabilities",          pct: 62,  color: "#3b82f6" },
  { label: "Certifications",        pct: 38,  color: "#f59e0b" },
  { label: "Catalogue Strength",    pct: 24,  color: "#ef4444" },
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

// ─── Semi-circle gauge ────────────────────────────────────────────────────────
function Gauge({ pct, mounted }: { pct: number; mounted: boolean }) {
  const r  = 62, cx = 80, cy = 78;
  const circumference = Math.PI * r;
  const dash = mounted ? (pct / 100) * circumference : 0;

  const gradId = "gaugeGrad";
  return (
    <svg width={160} height={95} viewBox="0 0 160 95">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1F6F54" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#e2e8f0" strokeWidth={10} strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={`url(#${gradId})`} strokeWidth={10} strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s" }}
      />
      {/* Dot */}
      {mounted && (() => {
        const angle = -180 + (pct / 100) * 180;
        const rad = (angle * Math.PI) / 180;
        const dx = cx + r * Math.cos(rad), dy = cy + r * Math.sin(rad);
        return <circle cx={dx} cy={dy} r={5} fill="#3b82f6" />;
      })()}
      {/* Label */}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={22} fontWeight={800} fill="#0f172a">{pct}%</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9} fill="#94a3b8" letterSpacing={1}>BUYER READINESS</text>
    </svg>
  );
}

// ─── Bar chart (SVG) ─────────────────────────────────────────────────────────
function BarChart({ mounted }: { mounted: boolean }) {
  const weeks = ["W1", "W2", "W3", "W4"];
  const data = [
    { label: "Viewed",  vals: [8, 12, 18, 24], color: "#1F6F54" },
    { label: "Drafted", vals: [2, 4,  5,  6],  color: "#f59e0b" },
    { label: "Sent",    vals: [0, 1,  2,  3],  color: "#3b82f6" },
  ];
  const maxVal = 24;
  const W = 380, H = 140, padL = 28, padB = 24, barW = 8, gap = 4;
  const groupW = data.length * (barW + gap) + 12;
  const colW   = (W - padL) / weeks.length;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {[0, 25, 50, 75, 100].map(v => {
        const y = H - padB - ((v / 100) * (H - padB - 8));
        return <line key={v} x1={padL} y1={y} x2={W} y2={y} stroke="#f1f5f9" strokeWidth={1} />;
      })}
      {weeks.map((w, wi) => {
        const cx = padL + wi * colW + colW / 2;
        return (
          <g key={w}>
            <text x={cx} y={H - 6} textAnchor="middle" fontSize={9} fill="#94a3b8">{w}</text>
            {data.map((d, di) => {
              const barH = mounted ? ((d.vals[wi] / maxVal) * (H - padB - 8)) : 0;
              const x = cx - (data.length * (barW + gap)) / 2 + di * (barW + gap);
              const y = H - padB - barH;
              return (
                <rect key={di} x={x} y={y} width={barW} height={barH} rx={2}
                  fill={d.color} opacity={0.85}
                  style={{ transition: `height 0.8s cubic-bezier(0.22,1,0.36,1) ${di * 80}ms, y 0.8s cubic-bezier(0.22,1,0.36,1) ${di * 80}ms` }}
                />
              );
            })}
          </g>
        );
      })}
      {/* Legend */}
      {data.map((d, i) => (
        <g key={i} transform={`translate(${padL + i * 80}, 6)`}>
          <rect width={8} height={8} rx={2} fill={d.color} />
          <text x={12} y={7} fontSize={8} fill="#64748b">{d.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Funnel view ──────────────────────────────────────────────────────────────
function FunnelView({ mounted }: { mounted: boolean }) {
  const steps = [
    { label: "Discovery",  val: 186, color: "#1F6F54" },
    { label: "Viewed",     val: 62,  color: "#3b82f6"  },
    { label: "Drafted",    val: 31,  color: "#f59e0b"  },
    { label: "Submitted",  val: 14,  color: "#8b5cf6"  },
    { label: "Evaluated",  val: 6,   color: "#ef4444"  },
    { label: "Won",        val: 1,   color: "#10b981"  },
  ];
  const max = 186;
  return (
    <div className="flex flex-col gap-2 pt-1">
      {steps.map((s, i) => {
        const w = mounted ? (s.val / max) * 100 : 0;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 w-20 text-right shrink-0">{s.label}</span>
            <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg flex items-center px-2"
                style={{
                  width: `${w}%`,
                  background: s.color,
                  transition: `width 0.9s cubic-bezier(0.22,1,0.36,1) ${i * 80}ms`,
                  minWidth: w > 0 ? 28 : 0,
                }}
              >
                <span className="text-[10px] text-white font-bold">{s.val}</span>
              </div>
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
  const [cardIdx, setCardIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted  = useMounted(400);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCardIdx(i => (i + 1) % RFQ_CARDS.length), 5000);
  }, []);

  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [resetTimer]);

  const goTo = (i: number) => { setCardIdx(i); resetTimer(); };

  const buyerSearches  = useCountUp(124, 1000, 600);
  const matchedCats    = useCountUp(8,   800,  750);
  const visibilityRank = useCountUp(42,  900,  900);
  const newRFQs        = useCountUp(6,   600,  1050);

  const rfq = RFQ_CARDS[cardIdx];

  return (
    <section className="relative overflow-hidden rounded-2xl" style={{ background: HERO_BG }}>
      <style>{`
        @keyframes mfg1-shimmer { 0%,100%{background-position:-200% center} 50%{background-position:200% center} }
        @keyframes mfg1-grid { 0%,100%{opacity:0.025} 50%{opacity:0.045} }
        @keyframes mfg1-rfqFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mfg1-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.6} }
      `}</style>

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 24h48M24 0v48' stroke='%23ffffff' stroke-width='0.4'/%3E%3C/svg%3E")`,
        backgroundSize: "48px 48px", animation: "mfg1-grid 7s ease-in-out infinite",
      }} />
      {/* Glows */}
      <div className="pointer-events-none absolute -top-20 left-1/3 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle,#1db877 0%,transparent 68%)", filter: "blur(72px)" }} />
      <div className="pointer-events-none absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle,#3b82f6 0%,transparent 70%)", filter: "blur(48px)" }} />

      <div className="relative z-10 grid grid-cols-12">

        {/* ── LEFT 70% ── */}
        <div className="col-span-12 lg:col-span-8 px-7 pt-7 pb-6 flex flex-col gap-5">

          {/* Top strip */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-400/30"
              style={{ background: "rgba(31,111,84,0.25)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "mfg1-pulse 2s ease infinite" }} />
              <span className="text-emerald-300 text-[10px] font-bold tracking-[0.12em]">MANUFACTURING VISIBILITY ACTIVE</span>
            </div>
            <span className="text-white/40 text-[11px] hidden sm:block">Profile improves buyer discoverability</span>
            <span className="ml-auto text-[10px] font-bold text-white/30 tracking-wider hidden md:block">DAY 1 ACTIVATION</span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-[26px] sm:text-[32px] md:text-[38px] font-black text-white leading-[1.1] tracking-[-0.025em] mb-3"
              style={{ fontFamily: "Poppins, sans-serif" }}>
              Let&apos;s get your plant in front of{" "}
              <span style={{
                background: "linear-gradient(90deg,#4ade80 0%,#34d399 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                130+ countries
              </span>{" "}of buyers.
            </h1>
            <p className="text-[13px] sm:text-[14px] leading-relaxed max-w-[540px]" style={{ color: "rgba(255,255,255,0.60)" }}>
              Manufacturers with completed profiles receive <strong className="text-emerald-400">38% more</strong> aligned buyer inquiries within their first 30 days.
            </p>
          </div>

          {/* Segmented progress */}
          <div className="max-w-[520px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold text-emerald-400">28% Complete</span>
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>Profile Setup In Progress</span>
            </div>
            {/* Bar */}
            <div className="flex gap-1 mb-2">
              {[
                { label: "Basics", done: true },
                { label: "Capabilities", done: false },
                { label: "Certifications", done: false },
                { label: "Catalogue", done: false },
              ].map((seg, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1">
                  <div className="h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.10)" }}>
                    <div className="h-full rounded-full" style={{
                      width: mounted ? (seg.done ? "100%" : "0%") : "0%",
                      background: seg.done ? "linear-gradient(90deg,#4ade80,#34d399)" : undefined,
                      transition: `width 0.9s cubic-bezier(0.22,1,0.36,1) ${i * 150}ms`,
                    }} />
                  </div>
                  <span className="text-[9px] font-medium" style={{ color: seg.done ? "#4ade80" : "rgba(255,255,255,0.30)" }}>
                    {seg.done ? "✓ " : ""}{seg.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.40)" }}>
              Complete capabilities to unlock better RFQ matching.
            </p>
          </div>

          {/* CTA group */}
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#002d14] text-[13px] font-bold rounded-xl hover:bg-emerald-50 hover:shadow-[0_0_18px_rgba(255,255,255,0.22)] active:scale-[0.98] transition-all duration-200 shadow-sm">
              Continue Setup — Add Capabilities <ArrowRight size={14} strokeWidth={2.5} />
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-white/25 text-[13px] font-semibold rounded-xl hover:bg-white/10 hover:border-white/45 transition-all duration-200"
              style={{ color: "rgba(255,255,255,0.85)" }}>
              Explore Buyer Demand <ArrowRight size={14} />
            </button>
            <button className="text-[11px] font-medium underline decoration-dotted"
              style={{ color: "rgba(255,255,255,0.35)" }}>
              Skip Guided Tour
            </button>
          </div>
        </div>

        {/* ── RIGHT 30% ── */}
        <div className="col-span-12 lg:col-span-4 flex overflow-hidden">
          <div className="hidden lg:block w-px self-stretch bg-white/[0.07] shrink-0" />
          <div className="flex-1 flex flex-col px-5 pt-6 pb-5 gap-3" style={{ background: "rgba(0,0,0,0.22)" }}>

            <div className="shrink-0">
              <p className="text-[9px] font-bold tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.38)" }}>LIVE BUYER DEMAND</p>
              <p className="text-white text-[13px] font-semibold leading-tight">Trending RFQs matched to your category</p>
            </div>

            {/* RFQ Card */}
            <div className="flex-1 min-h-0">
              <div key={cardIdx} className="flex flex-col gap-2" style={{ animation: "mfg1-rfqFade 0.36s ease both" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[34px] leading-none">{rfq.flag}</span>
                  <div className="min-w-0">
                    <p className="text-white text-[14px] font-bold leading-tight">{rfq.country}</p>
                    <div className="inline-flex items-center gap-1 mt-0.5">
                      <span className="w-[5px] h-[5px] rounded-full bg-emerald-400 animate-ping" style={{ position: "relative" }} />
                      <span className="text-[9px] font-bold text-emerald-300 tracking-[0.12em]">VERIFIED BUYER</span>
                    </div>
                  </div>
                  <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: `${rfq.urgencyColor}22`, color: rfq.urgencyColor, border: `1px solid ${rfq.urgencyColor}44` }}>
                    {rfq.urgency}
                  </span>
                </div>
                <p className="text-[9px] font-bold tracking-[0.14em]" style={{ color: "rgba(52,211,153,0.85)" }}>{rfq.role}</p>
                <p className="text-white text-[12px] font-semibold">{rfq.product}</p>
                <p className="text-[11.5px] leading-[1.6] italic"
                  style={{ color: "rgba(255,255,255,0.55)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  &ldquo;{rfq.request}&rdquo;
                </p>
                <button className="mt-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
                  View Similar Demand <ArrowRight size={10} />
                </button>
              </div>
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between shrink-0">
              <div className="flex gap-1.5">
                {RFQ_CARDS.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className="h-[5px] rounded-full transition-all duration-300"
                    style={{ width: i === cardIdx ? 20 : 5, background: i === cardIdx ? "#4ade80" : "rgba(255,255,255,0.22)" }} />
                ))}
              </div>
              <div className="flex gap-1">
                {[ChevronLeft, ChevronRight].map((Icon, i) => (
                  <button key={i} onClick={() => goTo((cardIdx + (i === 0 ? -1 : 1) + RFQ_CARDS.length) % RFQ_CARDS.length)}
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                    style={{ color: "rgba(255,255,255,0.45)" }}>
                    <Icon size={12} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom metrics ── */}
      <div className="relative z-10 border-t border-white/[0.07] grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.07]">
        {[
          { label: "Buyer Searches This Week", value: buyerSearches, suffix: "" },
          { label: "Matched Categories",       value: matchedCats,    suffix: "" },
          { label: "Visibility Rank",          value: visibilityRank, suffix: "%" },
          { label: "New RFQs Today",           value: newRFQs,        suffix: "" },
        ].map((m, i) => (
          <div key={i} className="px-5 py-4">
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
// SECTION 2 — 70/30 SPLIT
// ═══════════════════════════════════════════════════════════════════════════════
function OpportunitySection() {
  const [tab, setTab] = useState<"bar" | "funnel">("bar");
  const mounted = useMounted(500);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-start">

      {/* ── LEFT 70% ── */}
      <div className="lg:col-span-7 flex flex-col gap-4">

        {/* Nudge banner */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl"
          style={{ background: "linear-gradient(90deg,#e8f5f0 0%,#f0faf5 100%)", border: "1px solid #b6e4d4" }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" style={{ animation: "mfg1-pulse 2.5s ease infinite" }} />
            <p className="text-[13px] font-semibold text-emerald-900 truncate">
              <strong>124 buyer projects</strong> are currently aligned to your manufacturing category.
            </p>
          </div>
          <button className="shrink-0 flex items-center gap-1 text-[12px] font-bold text-emerald-700 hover:text-emerald-900 transition-colors">
            View Matches <ArrowRight size={11} />
          </button>
        </div>

        {/* Pipeline card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400 mb-0.5">OPPORTUNITY FLOW</p>
                <h3 className="text-[17px] font-bold text-slate-900">Opportunity Pipeline</h3>
                <p className="text-[12px] text-slate-400 mt-0.5">Track proposal activity this month</p>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                {(["bar", "funnel"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all",
                      tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                    {t === "bar" ? <BarChart2 size={12} /> : <TrendingUp size={12} />}
                    {t === "bar" ? "Bar" : "Funnel"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pipeline metrics */}
          <div className="grid grid-cols-5 divide-x divide-slate-100 border-b border-slate-100">
            {PIPELINE.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="px-3 py-3 text-center">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                    style={{ background: `${p.color}18` }}>
                    <Icon size={13} style={{ color: p.color }} />
                  </div>
                  <p className="text-[18px] font-black" style={{ color: p.color }}>{p.value}</p>
                  <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{p.label}</p>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="px-5 py-4" style={{ minHeight: 180 }}>
            {tab === "bar"    && <BarChart mounted={mounted} />}
            {tab === "funnel" && <FunnelView mounted={mounted} />}
          </div>
        </div>

        {/* Recent proposals */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">Proposal Activity</h3>
              <p className="text-[12px] text-slate-400 mt-0.5">Complete drafts before buyer windows close</p>
            </div>
            <button className="text-[12px] font-semibold text-[#1F6F54] hover:underline flex items-center gap-1">
              View All <ArrowRight size={11} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {/* Draft card */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <FileText size={15} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Draft</span>
                  <span className="text-[10px] text-red-500 flex items-center gap-1 font-semibold">
                    <AlertCircle size={9} /> Buyer review closes in 18 hrs
                  </span>
                </div>
                <p className="text-[13px] font-semibold text-slate-800 truncate">Triethyl Orthoformate Proposal</p>
              </div>
              <button className="shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg transition-colors">
                Complete Now
              </button>
            </div>
            {/* Sent card */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Send size={15} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-[10px] font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">Under Evaluation</span>
                  <span className="text-[10px] text-blue-500 font-medium">Buyer reviewing</span>
                </div>
                <p className="text-[13px] font-semibold text-slate-800 truncate">Lithium Sulfite RFQ</p>
              </div>
              <button className="shrink-0 px-3 py-1.5 border border-blue-300 text-blue-700 text-[11px] font-bold rounded-lg hover:bg-blue-50 transition-colors">
                Track Proposal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT 30% ── */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400 mb-1">CRO PROFILE SIGNAL</p>
          <h3 className="text-[16px] font-bold text-slate-900 mb-4">Profile Readiness Score</h3>

          {/* Gauge */}
          <div className="flex justify-center mb-4">
            <Gauge pct={86} mounted={mounted} />
          </div>

          {/* Progress bars */}
          <div className="flex flex-col gap-3">
            {PROFILE_CATEGORIES.map((c, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-slate-600 font-medium">{c.label}</span>
                  <span className="text-[12px] font-bold" style={{ color: c.color }}>{c.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: mounted ? `${c.pct}%` : "0%", background: c.color, transitionDelay: `${i * 120 + 400}ms` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Business loss nudge */}
          <div className="mt-5 rounded-xl p-4" style={{ background: "#0d1117", border: "1px solid rgba(245,200,66,0.20)" }}>
            <style>{`@keyframes lossGlow{0%,100%{box-shadow:0 0 0 0 rgba(245,200,66,0.0)} 50%{box-shadow:0 0 20px rgba(245,200,66,0.15)}}`}</style>
            <p className="text-[11px] font-bold tracking-[0.10em] text-slate-400 mb-2">OPPORTUNITY VALUE</p>
            <p className="text-[12px] text-slate-300 leading-snug mb-1">Incomplete profile may be costing an estimated</p>
            <p className="text-[30px] font-black text-white leading-none mb-0.5">$50,000<span className="text-[14px] font-semibold text-slate-400">/mo</span></p>
            <p className="text-[11px] text-slate-500 mb-3">in missed buyer opportunities.</p>
            <button className="w-full py-2.5 rounded-xl text-white text-[12px] font-bold transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: "linear-gradient(90deg,#1F6F54,#27915e)" }}>
              Complete Profile Now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — WORLD RFQ MAP
// ═══════════════════════════════════════════════════════════════════════════════
function WorldRFQMap() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"monthly" | "quarterly">("monthly");
  const mounted = useMounted(200);
  const maxRFQ  = Math.max(...COUNTRY_BARS.map(c => c.rfqs));

  const hoveredPin    = MAP_PINS.find(p => p.id === hovered);
  const hoveredBar    = COUNTRY_BARS.find(c => c.country === hoveredPin?.country);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <style>{`
        @keyframes pinPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.8);opacity:0.3} }
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
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
            <Search size={13} className="text-slate-400" />
            <input className="text-[12px] bg-transparent outline-none w-28 placeholder:text-slate-400"
              placeholder="Search market…" />
          </div>
          {/* Filter */}
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-[12px] text-slate-600 hover:bg-slate-50">
            <Filter size={12} /> Category
          </button>
          {/* Toggle */}
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

        {/* MAP — 75% */}
        <div className="flex-1 relative" style={{ minHeight: 360 }}>
          {/* Dark map background with grid */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(135deg, #0d1117 0%, #0f1923 50%, #0d1117 100%)",
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }} />

          {/* Continent blobs (simplified visual) */}
          <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.12 }}>
            {/* North America */}
            <div className="absolute rounded-[40%]" style={{ width:"22%", height:"35%", left:"8%", top:"22%", background:"#2d4a6e" }} />
            {/* South America */}
            <div className="absolute rounded-[40%]" style={{ width:"14%", height:"28%", left:"20%", top:"52%", background:"#2d4a6e" }} />
            {/* Europe */}
            <div className="absolute rounded-[40%]" style={{ width:"12%", height:"20%", left:"44%", top:"18%", background:"#2d4a6e" }} />
            {/* Africa */}
            <div className="absolute rounded-[40%]" style={{ width:"14%", height:"30%", left:"46%", top:"40%", background:"#2d4a6e" }} />
            {/* Asia */}
            <div className="absolute rounded-[30%]" style={{ width:"28%", height:"32%", left:"58%", top:"20%", background:"#2d4a6e" }} />
            {/* Australia */}
            <div className="absolute rounded-[40%]" style={{ width:"12%", height:"14%", left:"74%", top:"58%", background:"#2d4a6e" }} />
          </div>

          {/* Country pins */}
          {MAP_PINS.map(pin => {
            const color  = PIN_COLORS[pin.tier];
            const isHov  = hovered === pin.id;
            const isSel  = selected === pin.id;
            return (
              <div
                key={pin.id}
                className="absolute cursor-pointer"
                style={{ left: pin.left, top: pin.top, transform: "translate(-50%,-50%)", zIndex: isHov ? 20 : 10 }}
                onMouseEnter={() => setHovered(pin.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(s => s === pin.id ? null : pin.id)}
              >
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-full" style={{
                  width: 28, height: 28, top: -6, left: -6,
                  border: `2px solid ${color}`,
                  animation: "pinPulse 3s ease infinite",
                  animationDelay: `${Math.random() * 2}s`,
                }} />
                {/* Pin dot */}
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow-lg transition-transform duration-200"
                  style={{
                    background: color,
                    transform: isHov || isSel ? "scale(1.4)" : "scale(1)",
                    boxShadow: isHov ? `0 0 12px ${color}` : `0 0 6px ${color}60`,
                  }}>
                </div>

                {/* Tooltip */}
                {isHov && (
                  <div
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 rounded-xl shadow-2xl overflow-hidden"
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
                      <button className="w-full py-1.5 rounded-lg text-[10px] font-bold text-white transition-colors"
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
              <button key={i} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}>
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>

        {/* SIDEBAR — 25% */}
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
                    onMouseLeave={() => setHovered(null)}
                  >
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
                          width: mounted ? `${(c.rfqs / maxRFQ) * 100}%` : "0%",
                          background: isHov ? "#1F6F54" : "#94a3b8",
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
