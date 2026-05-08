"use client";

/**
 * ─── Day 10 Dashboard ──────────────────────────────────────────────────────────
 * "Post-activation momentum" state — researcher & CRO personas.
 * Hero: 70/30 split with animated momentum curve, KPI strip, SCINODE Secure pill.
 *
 * Exports: Day10ResearcherDashboard · Day10CRODashboard
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileType = "researcher" | "cro";

// ─── Momentum curve data (10 points — one per day) ───────────────────────────

interface CurvePoint {
  day:    number;
  value:  number;   // normalised 0–1
  label:  string;
  detail: string;
}

const RESEARCHER_CURVE: CurvePoint[] = [
  { day: 1,  value: 0.18, label: "Profile submitted",         detail: "Visibility baseline set" },
  { day: 2,  value: 0.23, label: "First match identified",    detail: "1 opportunity found" },
  { day: 3,  value: 0.30, label: "2 opportunities reviewed",  detail: "Engagement rising" },
  { day: 4,  value: 0.38, label: "3 proposals initiated",     detail: "Active interest detected" },
  { day: 5,  value: 0.46, label: "4 active matches",          detail: "+5 high-fit this week" },
  { day: 6,  value: 0.54, label: "5th proposal submitted",    detail: "2 in active review" },
  { day: 7,  value: 0.61, label: "First positive response",   detail: "3 proposals under review" },
  { day: 8,  value: 0.68, label: "Momentum accelerating",     detail: "3 proposals in review" },
  { day: 9,  value: 0.75, label: "13 active matches",         detail: "High engagement phase" },
  { day: 10, value: 0.82, label: "+68% visibility growth",    detail: "Peak trajectory reached" },
];

const CRO_CURVE: CurvePoint[] = [
  { day: 1,  value: 0.20, label: "Capabilities listed",        detail: "Profile live to buyers" },
  { day: 2,  value: 0.26, label: "First buyer match",          detail: "1 requirement matched" },
  { day: 3,  value: 0.33, label: "3 requirements reviewed",    detail: "Buyer interest rising" },
  { day: 4,  value: 0.41, label: "4 proposals initiated",      detail: "Active evaluations" },
  { day: 5,  value: 0.50, label: "6 active matches",           detail: "+7 qualified buyers" },
  { day: 6,  value: 0.57, label: "2 evaluations started",      detail: "4 under review" },
  { day: 7,  value: 0.65, label: "7th proposal submitted",     detail: "Strong momentum" },
  { day: 8,  value: 0.72, label: "Demand accelerating",        detail: "Buyer engagement ↑" },
  { day: 9,  value: 0.79, label: "17 qualified matches",       detail: "Peak buyer interest" },
  { day: 10, value: 0.87, label: "+72% opportunity growth",    detail: "Accelerating fast" },
];

// ─── KPI card data ────────────────────────────────────────────────────────────

interface KPICard {
  label:    string;
  value:    string;
  delta:    string;
  deltaUp:  boolean | null;   // true = green ↗, false = blue ↘ (faster = good), null = neutral
  sub:      string;
}

const RESEARCHER_KPIS: KPICard[] = [
  { label: "Active Matches",      value: "14",   delta: "+5 this week",      deltaUp: true,  sub: "High-fit opportunities" },
  { label: "Proposals Submitted", value: "6",    delta: "3 under review",    deltaUp: null,  sub: "Active evaluation" },
  { label: "Industry Engagement", value: "28",   delta: "+18%",              deltaUp: true,  sub: "Interactions this week" },
  { label: "Avg. Response Time",  value: "1.8d", delta: "Faster turnaround", deltaUp: false, sub: "↘ Improving" },
];

const CRO_KPIS: KPICard[] = [
  { label: "Qualified Matches",   value: "18",   delta: "+7 this week",      deltaUp: true,  sub: "Active buyer requirements" },
  { label: "Proposals Submitted", value: "8",    delta: "4 under evaluation",deltaUp: null,  sub: "Active evaluation" },
  { label: "Industry Engagement", value: "36",   delta: "+22%",              deltaUp: true,  sub: "Interactions this week" },
  { label: "Avg. Response Time",  value: "1.2d", delta: "Faster turnaround", deltaUp: false, sub: "↘ Improving" },
];

// ─── Animated Momentum Curve (SVG) ───────────────────────────────────────────

const VB_W = 280;
const VB_H = 130;
const PAD  = { top: 14, right: 10, bottom: 28, left: 10 };
const IW   = VB_W - PAD.left - PAD.right;
const IH   = VB_H - PAD.top  - PAD.bottom;

function MomentumCurve({ data }: { data: CurvePoint[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [drawn,    setDrawn]    = useState(false);
  const pathRef = useRef<SVGPathElement>(null);

  // Map data → SVG coordinates
  const pts = useMemo(() => data.map((d, i) => ({
    ...d,
    x: PAD.left + (i / (data.length - 1)) * IW,
    y: PAD.top  + (1 - d.value) * IH,
  })), [data]);

  // Smooth cubic bezier line path
  const linePath = useMemo(() => pts.map((p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const pr  = pts[i - 1];
    const cpx = ((pr.x + p.x) / 2).toFixed(1);
    return `C ${cpx},${pr.y.toFixed(1)} ${cpx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" "), [pts]);

  const fillPath = `${linePath} L ${pts[pts.length - 1].x},${PAD.top + IH} L ${pts[0].x},${PAD.top + IH} Z`;

  // Draw-in animation using stroke-dashoffset
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray  = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    const t = setTimeout(() => {
      path.style.transition       = "stroke-dashoffset 1500ms cubic-bezier(0.4,0,0.2,1)";
      path.style.strokeDashoffset = "0";
      setTimeout(() => setDrawn(true), 1500);
    }, 250);
    return () => clearTimeout(t);
  }, []);

  // Mouse → closest data point (accounts for SVG scaling)
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect   = e.currentTarget.getBoundingClientRect();
    const scaleX = VB_W / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    let closest = 0, minDist = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - mouseX);
      if (d < minDist) { minDist = d; closest = i; }
    });
    setHoverIdx(closest);
  }, [pts]);

  const hov = hoverIdx !== null ? pts[hoverIdx] : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full overflow-visible cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="d10-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#4ade80" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0"    />
          </linearGradient>
        </defs>

        {/* Gradient fill — fades in after line is drawn */}
        <path
          d={fillPath}
          fill="url(#d10-fill)"
          style={{ opacity: drawn ? 1 : 0, transition: "opacity 600ms ease" }}
        />

        {/* Grid lines (subtle) */}
        {[0.25, 0.5, 0.75].map(v => {
          const y = PAD.top + (1 - v) * IH;
          return (
            <line key={v}
              x1={PAD.left} y1={y} x2={PAD.left + IW} y2={y}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1"
            />
          );
        })}

        {/* Main animated line */}
        <path
          ref={pathRef}
          d={linePath}
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Resting end-point dot */}
        {drawn && (
          <circle
            cx={pts[pts.length - 1].x}
            cy={pts[pts.length - 1].y}
            r="3.5" fill="#4ade80"
          />
        )}

        {/* Hover: vertical rule + dot */}
        {hov && (
          <>
            <line
              x1={hov.x} y1={PAD.top}
              x2={hov.x} y2={PAD.top + IH}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx={hov.x} cy={hov.y}
              r="4.5" fill="#4ade80"
              stroke="rgba(0,45,22,0.8)" strokeWidth="2"
            />
          </>
        )}

        {/* X-axis day labels */}
        {[0, 4, 9].map(i => (
          <text key={i}
            x={pts[i].x} y={VB_H - 4}
            textAnchor="middle"
            fontSize="8.5"
            fill="rgba(255,255,255,0.30)"
            fontWeight="600"
          >
            D{data[i].day}
          </text>
        ))}
      </svg>

      {/* Hover tooltip */}
      {hov && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left:      `${(hov.x / VB_W) * 100}%`,
            top:       `${((hov.y - 8) / VB_H) * 100}%`,
            transform: hov.x > VB_W * 0.65
              ? "translate(-110%, -100%)"
              : "translate(8px, -100%)",
          }}
        >
          <div
            className="rounded-xl px-3 py-2 shadow-2xl border border-white/15 min-w-[130px]"
            style={{ background: "rgba(15,28,20,0.95)", backdropFilter: "blur(10px)" }}
          >
            <p className="text-[9.5px] font-bold text-white/40 uppercase tracking-wider mb-1">
              Day {hov.day}
            </p>
            <p className="text-[11.5px] font-semibold text-white leading-snug">{hov.label}</p>
            <p className="text-[10.5px] text-emerald-400 mt-1 font-medium">{hov.detail}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────

function Day10HeroSection({ profileType }: { profileType: ProfileType }) {
  const [tipVisible, setTipVisible] = useState(false);
  const isResearcher = profileType === "researcher";

  // ── Persona copy ──
  const heroHeading = isResearcher
    ? "You've started building momentum on Scinode"
    : "Your capabilities are attracting qualified industry demand";

  const heroSubtext = isResearcher
    ? "You submitted 6 proposals across matched industry requirements, with multiple opportunities moving into active review this week."
    : "You engaged with 8 matched industrial requirements this week, with multiple proposal discussions progressing into active evaluation.";

  const bigMetric      = isResearcher ? "+68%" : "+72%";
  const bigMetricLabel = isResearcher ? "Qualified Industry Visibility" : "Qualified Opportunity Growth";

  const primaryCTA   = isResearcher ? "View research insights"   : "View active opportunities";
  const secondaryCTA = isResearcher ? "Submit new capability"    : "Add service capability";

  const curveTitle = isResearcher ? "Proposal Momentum"          : "Opportunity Momentum";
  const curveBadge = isResearcher ? "↑ Active Reviews Increasing" : "↑ Proposal Reviews Increasing";
  const curveData  = isResearcher ? RESEARCHER_CURVE : CRO_CURVE;
  const kpis       = isResearcher ? RESEARCHER_KPIS  : CRO_KPIS;

  return (
    <section
      className="relative overflow-hidden rounded-2xl"
      style={{ background: "linear-gradient(130deg,#00200f 0%,#001a0a 48%,#071422 100%)" }}
    >
      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none absolute -top-32 left-[38%] w-[460px] h-[460px] rounded-full opacity-[0.18]"
        style={{ background: "radial-gradient(circle,#1db877 0%,transparent 68%)", filter: "blur(80px)" }} />
      <div className="pointer-events-none absolute bottom-0 -left-10 w-80 h-80 rounded-full opacity-[0.09]"
        style={{ background: "radial-gradient(circle,#3b82f6 0%,transparent 70%)", filter: "blur(56px)" }} />
      <div className="pointer-events-none absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.10]"
        style={{ background: "radial-gradient(circle,#4ade80 0%,transparent 70%)", filter: "blur(64px)" }} />

      <div className="relative z-10 px-5 sm:px-7 pt-4">

        {/* ── Main 70 / 30 split (with vertical separator) ── */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-0 pb-4">

          {/* ── LEFT 70% ── */}
          <div className="flex-[7] min-w-0 flex flex-col gap-3 lg:pr-7">

            {/* SCINODE Secure pill */}
            <div className="relative inline-block self-start">
              <button
                type="button"
                className="relative overflow-hidden flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-emerald-200/90 border border-emerald-400/20 hover:border-emerald-400/50 hover:scale-[1.03] hover:shadow-[0_0_18px_rgba(74,222,128,0.22)] transition-all duration-200"
                style={{ background: "rgba(20,55,30,0.90)" }}
                onMouseEnter={() => setTipVisible(true)}
                onMouseLeave={() => setTipVisible(false)}
              >
                <div className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.11) 50%,transparent 70%)",
                    backgroundSize: "200% 100%",
                    animation: "d10-shimmer 3.5s ease-in-out infinite",
                  }} />
                <span className="relative z-10">🔒</span>
                <span className="relative z-10 font-bold tracking-wide">SCINODE Secure</span>
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
                  <p className="font-semibold mb-0.5">Secure Collaboration</p>
                  <p>Your data and IP remain encrypted and access-controlled at every step.</p>
                </div>
              </div>
            </div>

            {/* H1 */}
            <h1
              className="text-[21px] sm:text-[26px] md:text-[30px] font-bold text-white leading-[1.2] tracking-[-0.02em]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {heroHeading}
            </h1>

            {/* Supporting text */}
            <p className="text-[#8faabb] text-[12.5px] sm:text-[13px] leading-relaxed max-w-[500px]">
              {heroSubtext}
            </p>

            {/* Big metric */}
            <div className="flex items-end gap-3 flex-wrap">
              <span
                className="text-[42px] sm:text-[50px] font-black leading-none tracking-tight"
                style={{
                  background: "linear-gradient(140deg,#4ade80 0%,#86efac 45%,#e0f2fe 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {bigMetric}
              </span>
              <div className="pb-1.5 flex flex-col gap-0.5">
                <span className="text-[10.5px] font-bold text-emerald-300/80 uppercase tracking-[0.12em] leading-snug">
                  {bigMetricLabel}
                </span>
                <span className="text-[9.5px] text-white/30">vs. profile activation baseline</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-2.5">
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#002d16] text-[13px] font-bold rounded-lg transition-all duration-200 shadow-sm hover:shadow-lg hover:bg-[#f0fdf4] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                {primaryCTA} <ArrowRight size={13} strokeWidth={2.5} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-white/25 text-white/90 text-[13px] font-semibold rounded-lg hover:bg-white/10 hover:border-white/40 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                {secondaryCTA} <ArrowRight size={13} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* ── Vertical separator ── */}
          <div className="hidden lg:block w-px bg-white/[0.08] shrink-0 self-stretch" />

          {/* ── RIGHT 30% — integrated panel (no floating card) ── */}
          <div className="flex-[3] lg:min-w-[240px] lg:max-w-[300px] lg:pl-7 pt-4 lg:pt-0 flex flex-col justify-center gap-3">

            {/* Label + badge */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35 mb-0.5">
                  Momentum Curve
                </p>
                <p className="text-[13.5px] font-bold text-white leading-snug">
                  {curveTitle}
                </p>
                <p className="text-[10px] text-white/35 mt-0.5">
                  10-day industry engagement trajectory
                </p>
              </div>
              <span
                className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold whitespace-nowrap"
                style={{
                  background: "rgba(74,222,128,0.13)",
                  border: "1px solid rgba(74,222,128,0.25)",
                  color: "#86efac",
                }}
              >
                <TrendingUp size={9} strokeWidth={2.5} />
                {curveBadge}
              </span>
            </div>

            {/* Chart */}
            <MomentumCurve data={curveData} />

            {/* Hover hint */}
            <p className="text-[9px] text-white/25 text-center -mt-1">
              Hover to inspect daily engagement →
            </p>
          </div>
        </div>

        {/* ── Separator ── */}
        <div className="h-px bg-white/[0.07] -mx-5 sm:-mx-7" />

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 -mx-5 sm:-mx-7">
          {kpis.map((k, i) => (
            <div
              key={i}
              className={cn(
                "px-5 sm:px-6 py-3 flex flex-col gap-0.5 hover:bg-white/[0.03] transition-colors duration-200",
                i < kpis.length - 1 && "border-r border-white/[0.07]",
                i >= 2 && "border-t border-white/[0.07] sm:border-t-0",
              )}
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/35 mb-0.5">
                {k.label}
              </p>
              <div className="flex items-end gap-2 flex-wrap">
                <span
                  className="text-[24px] font-black text-white leading-none tabular-nums"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {k.value}
                </span>
                <span
                  className={cn(
                    "mb-0.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9.5px] font-bold leading-none",
                    k.deltaUp === true  && "bg-emerald-400/15 text-emerald-400 border border-emerald-400/20",
                    k.deltaUp === false && "bg-blue-400/15 text-blue-300 border border-blue-400/20",
                    k.deltaUp === null  && "bg-white/8 text-white/45 border border-white/10",
                  )}
                >
                  {k.deltaUp === true ? "↗" : k.deltaUp === false ? "↘" : "·"} {k.delta}
                </span>
              </div>
              <p className="text-[9.5px] text-white/25 leading-snug">{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes d10-shimmer {
          0%, 100% { background-position: -200% center; }
          50%       { background-position:  200% center; }
        }
      `}</style>
    </section>
  );
}

// ─── Pipeline section types ───────────────────────────────────────────────────

interface PipelineStage {
  label:      string;
  shortLabel: string;
  monthCount: number;
  weekCount:  number;
  color:      string;
}

interface ProfileMetric {
  label: string;
  value: number;
  color: string;
}

// ─── Pipeline section data ────────────────────────────────────────────────────

const CRO_STAGES: PipelineStage[] = [
  { label: "Requirements Identified", shortLabel: "Identified",  monthCount: 186, weekCount: 26, color: "#4ade80" },
  { label: "Shortlisted",             shortLabel: "Shortlisted", monthCount: 62,  weekCount: 9,  color: "#34d399" },
  { label: "Proposals Shared",        shortLabel: "Proposals",   monthCount: 31,  weekCount: 5,  color: "#22c55e" },
  { label: "Technical Evaluation",    shortLabel: "Tech. Eval.", monthCount: 14,  weekCount: 2,  color: "#16a34a" },
  { label: "Commercial Discussion",   shortLabel: "Commercial",  monthCount: 6,   weekCount: 1,  color: "#15803d" },
];

const RESEARCHER_STAGES: PipelineStage[] = [
  { label: "Opportunities Identified", shortLabel: "Identified",  monthCount: 142, weekCount: 19, color: "#4ade80" },
  { label: "Shortlisted",              shortLabel: "Shortlisted", monthCount: 48,  weekCount: 7,  color: "#34d399" },
  { label: "Proposals Submitted",      shortLabel: "Proposals",   monthCount: 24,  weekCount: 4,  color: "#22c55e" },
  { label: "Under Review",             shortLabel: "Under Review",monthCount: 11,  weekCount: 2,  color: "#16a34a" },
  { label: "Collaboration Initiated",  shortLabel: "Collab.",     monthCount: 5,   weekCount: 1,  color: "#15803d" },
];

// color = CSS background value (gradient string or solid)
const CRO_PROFILE_METRICS: ProfileMetric[] = [
  { label: "Capability Completeness",     value: 94, color: "linear-gradient(90deg,#4ade80,#86efac)" },
  { label: "Manufacturing & Scale Ready", value: 88, color: "linear-gradient(90deg,#2dd4bf,#34d399)" },
  { label: "Technical Documentation",     value: 82, color: "linear-gradient(90deg,#38bdf8,#22d3ee)" },
  { label: "Commercial Preparedness",     value: 79, color: "linear-gradient(90deg,#818cf8,#60a5fa)" },
];

const RESEARCHER_PROFILE_METRICS: ProfileMetric[] = [
  { label: "Profile Credibility",       value: 90, color: "linear-gradient(90deg,#4ade80,#86efac)" },
  { label: "Scientific Relevance",      value: 85, color: "linear-gradient(90deg,#2dd4bf,#34d399)" },
  { label: "Collaboration Readiness",   value: 78, color: "linear-gradient(90deg,#38bdf8,#22d3ee)" },
  { label: "Proposal Preparedness",     value: 72, color: "linear-gradient(90deg,#818cf8,#60a5fa)" },
];

// ─── Profile Gauge (SVG semicircle) ──────────────────────────────────────────

const GAUGE_R   = 76;
const GAUGE_CX  = 100;
const GAUGE_CY  = 92;
const GAUGE_LEN = Math.PI * GAUGE_R; // ≈ 238.8

function ProfileGauge({ value, readinessLabel }: { value: number; readinessLabel: string }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setAnimated(true); obs.disconnect(); } },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const dashoffset = GAUGE_LEN * (1 - (animated ? value / 100 : 0));
  const arcPath    = `M ${GAUGE_CX - GAUGE_R},${GAUGE_CY} A ${GAUGE_R},${GAUGE_R} 0 0,1 ${GAUGE_CX + GAUGE_R},${GAUGE_CY}`;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg viewBox="0 0 200 108" className="w-full max-w-[200px]">
        <defs>
          {/* Hero-matching 3-stop gradient: green → teal → blue */}
          <linearGradient id="pg-arc-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#4ade80" />
            <stop offset="52%"  stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          {/* Gradient for the percentage text */}
          <linearGradient id="pg-text-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#4ade80" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          {/* Soft glow filter */}
          <filter id="pg-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path
          d={arcPath}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Glow layer (slightly thicker, blurred) */}
        <path
          d={arcPath}
          fill="none"
          stroke="url(#pg-arc-grad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={GAUGE_LEN}
          strokeDashoffset={dashoffset}
          filter="url(#pg-glow)"
          style={{
            opacity:    animated ? 0.45 : 0,
            transition: "stroke-dashoffset 1100ms cubic-bezier(0.4,0,0.2,1), opacity 600ms ease",
          }}
        />

        {/* Main arc fill */}
        <path
          d={arcPath}
          fill="none"
          stroke="url(#pg-arc-grad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={GAUGE_LEN}
          strokeDashoffset={dashoffset}
          style={{ transition: "stroke-dashoffset 1100ms cubic-bezier(0.4,0,0.2,1)" }}
        />

        {/* Percentage — gradient fill via linearGradient */}
        <text
          x={GAUGE_CX} y={GAUGE_CY - 12}
          textAnchor="middle"
          fontSize="28" fontWeight="800"
          fill="url(#pg-text-grad)"
          fontFamily="Poppins,sans-serif"
        >
          {value}%
        </text>

        {/* Sub label */}
        <text
          x={GAUGE_CX} y={GAUGE_CY + 6}
          textAnchor="middle"
          fontSize="9" fontWeight="600"
          fill="#94a3b8"
        >
          {readinessLabel}
        </text>

        {/* End-cap dot at arc tip (when animated) */}
        {animated && (() => {
          // Compute tip position along arc at current percentage
          const angle  = Math.PI * (1 - value / 100);           // 0→π right-to-left
          const tipX   = GAUGE_CX + GAUGE_R * Math.cos(Math.PI - angle);
          const tipY   = GAUGE_CY - GAUGE_R * Math.sin(Math.PI - angle);
          return (
            <circle cx={tipX} cy={tipY} r="5.5" fill="#818cf8" opacity="0.85" />
          );
        })()}
      </svg>
    </div>
  );
}

// ─── Animated progress bar ────────────────────────────────────────────────────

function AnimatedProgressBar({ metric, delay }: { metric: ProfileMetric; delay: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setWidth(metric.value), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [metric.value, delay]);

  return (
    <div ref={ref} className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center gap-2">
        <span className="text-[10.5px] font-medium text-slate-500 leading-snug">{metric.label}</span>
        <span className="text-[11px] font-bold text-[#1e293b] tabular-nums shrink-0">{metric.value}%</span>
      </div>
      <div className="h-[8px] bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width:      `${width}%`,
            background: metric.color,          // supports linear-gradient strings
            transition: `width 900ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
            boxShadow:  width > 0 ? "0 1px 6px rgba(74,222,128,0.30)" : "none",
          }}
        />
      </div>
    </div>
  );
}

// ─── Conversion bar chart — mirrors Day 1 horizontal bar style exactly ────────

function ConversionBarChart({
  stages,
  period,
  hoverIdx,
  setHoverIdx,
}: {
  stages:      PipelineStage[];
  period:      "week" | "month";
  hoverIdx:    number | null;
  setHoverIdx: (i: number | null) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setLoaded(true), 120); obs.disconnect(); } },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const counts   = stages.map(s => period === "week" ? s.weekCount : s.monthCount);
  const maxCount = Math.max(...counts);

  return (
    <div ref={ref} className="w-full flex flex-col gap-2">
      {stages.map((stage, i) => {
        const count      = counts[i];
        const totalPct   = (count / maxCount) * 100;
        const isActive   = hoverIdx === i;
        const entryDelay = i * 45;

        return (
          <div
            key={i}
            className="flex items-center gap-3 cursor-pointer"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            {/* Label — matches Day 1 w-[150px] */}
            <div
              className={cn(
                "shrink-0 w-[110px] text-[11px] text-right leading-snug transition-colors duration-200",
                isActive ? "font-bold text-[#171717]" : "font-medium text-[#64748b]",
              )}
            >
              {stage.shortLabel}
            </div>

            {/* Bar track — rounded-full, same background as Day 1 */}
            <div
              className="flex-1 relative h-[18px] rounded-full overflow-hidden"
              style={{ background: "#edf2f5" }}
            >
              {/* Hatch fill — visible when inactive */}
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width:           loaded ? `${totalPct}%` : "0%",
                  opacity:         isActive ? 0 : 1,
                  transition:      `width 620ms cubic-bezier(0.25,0.46,0.45,0.94) ${entryDelay}ms, opacity 240ms ease`,
                  backgroundImage: "repeating-linear-gradient(-45deg,#b8c8d2 0px,#b8c8d2 2px,#d4dde3 2px,#d4dde3 8px)",
                }}
              />

              {/* Colour fill — visible when active */}
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width:      (loaded && isActive) ? `${totalPct}%` : "0%",
                  opacity:    isActive ? 1 : 0,
                  transition: "width 350ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 200ms ease",
                  background: "linear-gradient(90deg,#1a6b4f,#29a06a)",
                }}
              />

              {/* Glow on active */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ boxShadow: "0 0 10px rgba(31,111,84,0.28)" }}
                />
              )}
            </div>

            {/* Count */}
            <div
              className={cn(
                "shrink-0 w-8 text-right text-[12px] tabular-nums transition-colors duration-200",
                isActive ? "font-bold text-[#171717]" : "font-medium text-[#94a3b8]",
              )}
            >
              {count}
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ─── Opportunity Pipeline Section — two separate side-by-side cards ───────────

function OpportunityPipelineSection({ profileType }: { profileType: ProfileType }) {
  const [period,   setPeriod]   = useState<"week" | "month">("month");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const isResearcher   = profileType === "researcher";
  const stages         = isResearcher ? RESEARCHER_STAGES          : CRO_STAGES;
  const metrics        = isResearcher ? RESEARCHER_PROFILE_METRICS : CRO_PROFILE_METRICS;
  const gaugeValue     = isResearcher ? 81   : 86;
  const signalLabel    = isResearcher ? "RESEARCHER PROFILE SIGNAL" : "CRO PROFILE SIGNAL";
  const readinessTitle = isResearcher ? "Research Readiness"        : "Capability Readiness";
  const counts         = stages.map(s => period === "week" ? s.weekCount : s.monthCount);

  return (
    <div className="flex flex-col lg:flex-row gap-4">

      {/* ── LEFT CARD — Industrial Opportunity Pipeline ── */}
      <div className="flex-[7] min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.20em] text-slate-400 mb-1">
              01 · OPPORTUNITY FLOW
            </p>
            <h2
              className="text-[17px] sm:text-[19px] font-bold text-[#1e293b]"
              style={{ fontFamily: "Poppins,sans-serif" }}
            >
              Industrial Opportunity Pipeline
            </h2>
          </div>

          {/* Period toggle */}
          <div className="flex p-1 bg-slate-100 rounded-lg gap-0.5">
            {(["week", "month"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3.5 py-1 rounded-md text-[11px] font-semibold transition-all duration-200",
                  period === p
                    ? "bg-white text-[#1e293b] shadow-sm"
                    : "text-slate-400 hover:text-slate-600",
                )}
              >
                This {p}
              </button>
            ))}
          </div>
        </div>

        {/* Card body */}
        <div className="px-5 sm:px-6 py-5 flex flex-col gap-5">

          {/* Stage cards strip */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
            {stages.map((stage, i) => {
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
                    <p
                      className="text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wide leading-snug mb-1 truncate transition-colors duration-200"
                      style={{ color: isHov ? "#1a6b4f" : "#94a3b8" }}
                    >
                      {stage.shortLabel}
                    </p>
                    <p
                      className="text-[20px] sm:text-[22px] font-black leading-none tabular-nums transition-colors duration-200"
                      style={{
                        color:      isHov ? "#1a6b4f" : "#334155",
                        fontFamily: "Poppins,sans-serif",
                      }}
                    >
                      {counts[i]}
                    </p>
                  </div>

                  {i < stages.length - 1 && (
                    <svg width="12" height="12" viewBox="0 0 14 14" className="shrink-0 text-slate-300">
                      <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          {/* Horizontal bar chart */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">
              Proposal Conversion Flow
            </p>
            <ConversionBarChart
              stages={stages}
              period={period}
              hoverIdx={hoverIdx}
              setHoverIdx={setHoverIdx}
            />

            {/* Legend */}
            <div className="flex items-center gap-5 mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: "linear-gradient(90deg,#1a6b4f,#29a06a)" }} />
                <span className="text-[10px] text-[#68747a] font-medium">Total pipeline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundImage: "repeating-linear-gradient(-45deg,#b8c8d2 0px,#b8c8d2 2px,#d4dde3 2px,#d4dde3 8px)" }}
                />
                <span className="text-[10px] text-[#68747a] font-medium">Hover to highlight</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT CARD — Profile Signal ── */}
      <div className="flex-[3] lg:min-w-[260px] lg:max-w-[320px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
          <p className="text-[9px] font-bold uppercase tracking-[0.20em] text-slate-400 mb-0.5">
            {signalLabel}
          </p>
          <h2
            className="text-[17px] sm:text-[19px] font-bold text-[#1e293b]"
            style={{ fontFamily: "Poppins,sans-serif" }}
          >
            {readinessTitle}
          </h2>
        </div>

        {/* Card body */}
        <div className="px-5 sm:px-6 py-5 flex flex-col gap-4">

          {/* Gauge */}
          <ProfileGauge value={gaugeValue} readinessLabel="Overall Readiness" />

          {/* Progress bars */}
          <div className="flex flex-col gap-3">
            {metrics.map((m, i) => (
              <AnimatedProgressBar key={i} metric={m} delay={i * 120} />
            ))}
          </div>

          {/* Footer */}
          <p className="text-[9px] text-slate-400 leading-relaxed pt-1 border-t border-slate-100">
            Scores are updated based on profile completeness, activity history, and verified data.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Public exports ────────────────────────────────────────────────────────────

export function Day10ResearcherDashboard() {
  return (
    <div className="space-y-5 pb-12 max-w-[1200px] mx-auto px-4 sm:px-0">
      <Day10HeroSection profileType="researcher" />
      <OpportunityPipelineSection profileType="researcher" />
    </div>
  );
}

export function Day10CRODashboard() {
  return (
    <div className="space-y-5 pb-12 max-w-[1200px] mx-auto px-4 sm:px-0">
      <Day10HeroSection profileType="cro" />
      <OpportunityPipelineSection profileType="cro" />
    </div>
  );
}
