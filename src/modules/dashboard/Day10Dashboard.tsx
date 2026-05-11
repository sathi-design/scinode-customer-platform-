"use client";

/**
 * ─── Day 10 Dashboard ──────────────────────────────────────────────────────────
 * "Post-activation momentum" state — researcher & CRO personas.
 * Hero: 70/30 split with animated momentum curve, KPI strip, SCINODE Secure pill.
 *
 * Exports: Day10ResearcherDashboard · Day10CRODashboard
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ArrowRight, TrendingUp, Settings2, FileText, Tag, ShieldCheck, UserCheck, FlaskConical, BookOpen, Microscope, Users, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

// CRO brand palette: accent-green #B7D77A → accent-teal #1ABC9C → CRO-blue #2F66D0
const CRO_PROFILE_METRICS: ProfileMetric[] = [
  { label: "Capability Completeness",     value: 94, color: "linear-gradient(90deg,#B7D77A,#1ABC9C)" },
  { label: "Manufacturing & Scale Ready", value: 88, color: "linear-gradient(90deg,#1ABC9C,#2F66D0)" },
  { label: "Technical Documentation",     value: 82, color: "linear-gradient(90deg,#2F66D0,#4880e0)" },
  { label: "Commercial Preparedness",     value: 79, color: "#2F66D0" },
];

// Researcher brand palette: accent-green #B7D77A → accent-teal #1ABC9C → scientist-purple #5B3BA8
const RESEARCHER_PROFILE_METRICS: ProfileMetric[] = [
  { label: "Profile Credibility",       value: 90, color: "linear-gradient(90deg,#B7D77A,#1ABC9C)" },
  { label: "Scientific Relevance",      value: 85, color: "linear-gradient(90deg,#1ABC9C,#5B3BA8)" },
  { label: "Collaboration Readiness",   value: 78, color: "linear-gradient(90deg,#5B3BA8,#7c5cc4)" },
  { label: "Proposal Preparedness",     value: 72, color: "#5B3BA8" },
];

// ─── Profile Gauge (SVG semicircle) ──────────────────────────────────────────

const GAUGE_R   = 76;
const GAUGE_CX  = 100;
const GAUGE_CY  = 92;
const GAUGE_LEN = Math.PI * GAUGE_R; // ≈ 238.8

function ProfileGauge({ value, readinessLabel, profileType }: { value: number; readinessLabel: string; profileType: ProfileType }) {
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

  const isCRO      = profileType === "cro";
  // CRO:        accent-green → accent-teal → CRO-blue
  // Researcher: accent-green → accent-teal → scientist-purple
  const arcEnd     = isCRO ? "#2F66D0" : "#5B3BA8";
  const tipColor   = arcEnd;

  const dashoffset = GAUGE_LEN * (1 - (animated ? value / 100 : 0));
  const arcPath    = `M ${GAUGE_CX - GAUGE_R},${GAUGE_CY} A ${GAUGE_R},${GAUGE_R} 0 0,1 ${GAUGE_CX + GAUGE_R},${GAUGE_CY}`;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg viewBox="0 0 200 108" className="w-full max-w-[200px]">
        <defs>
          {/* Brand arc gradient: accent-green → teal → persona primary */}
          <linearGradient id="pg-arc-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#B7D77A" />
            <stop offset="45%"  stopColor="#1ABC9C" />
            <stop offset="100%" stopColor={arcEnd}  />
          </linearGradient>
          {/* Text gradient: teal → persona primary */}
          <linearGradient id="pg-text-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#1ABC9C" />
            <stop offset="100%" stopColor={arcEnd}  />
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
            <circle cx={tipX} cy={tipY} r="5.5" fill={tipColor} opacity="0.85" />
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
            boxShadow:  width > 0 ? "0 1px 6px rgba(45,209,124,0.28)" : "none",
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


// ─── Recent proposals mock data ───────────────────────────────────────────────

interface RecentProposal {
  id:          string;
  type:        string;
  typeColor:   string;
  title:       string;
  cas:         string;
  date:        string;
  compound:    string;
  industry:    string;
  status:      string;
  statusColor: string;
}

const CRO_RECENT_PROPOSALS: RecentProposal[] = [
  {
    id: "PRJ-2026-0603", type: "CMO", typeColor: "#0E6F5C",
    title: "Manufacturing of a Vitamin D3 Intermediate for Nutraceutical Applications",
    cas: "67-97-0", date: "16 Apr 2026",
    compound: "Vitamin D3 Intermediate VD-07", industry: "Nutraceuticals",
    status: "PO Issued", statusColor: "#1a6b4f",
  },
  {
    id: "PRJ-2026-0054", type: "RFQ", typeColor: "#2F66D0",
    title: "Custom bromine derivative for flame retardant application",
    cas: "79-94-7", date: "16 Apr 2026",
    compound: "Tetrabromobisphenol A (TBBPA)", industry: "Elemental Derivatives",
    status: "Under Review", statusColor: "#d97706",
  },
];

const RESEARCHER_RECENT_PROPOSALS: RecentProposal[] = [
  {
    id: "PRJ-2026-0481", type: "Research", typeColor: "#5B3BA8",
    title: "Synthesis and characterisation of novel peptide-based drug delivery scaffolds",
    cas: "N/A", date: "12 Apr 2026",
    compound: "PEG-Peptide Conjugate PPC-03", industry: "Pharmaceuticals",
    status: "Under Review", statusColor: "#d97706",
  },
  {
    id: "PRJ-2026-0392", type: "Collab", typeColor: "#0E6F5C",
    title: "Green solvent extraction process for plant-derived bioactives",
    cas: "84-74-2", date: "8 Apr 2026",
    compound: "Dibutyl Phthalate Alternative DBP-X", industry: "Food & Nutrition",
    status: "Shortlisted", statusColor: "#2F66D0",
  },
];

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
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.20em] text-slate-400 mb-1">
              OPPORTUNITY FLOW
            </p>
            <h2
              className="text-[17px] sm:text-[19px] font-bold text-[#1e293b]"
              style={{ fontFamily: "Poppins,sans-serif" }}
            >
              Industrial Opportunity Pipeline
            </h2>
          </div>

          {/* Legend + period toggle — right side */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Legend chips (moved here from chart footer) */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "linear-gradient(90deg,#1a6b4f,#29a06a)" }} />
                <span className="text-[9.5px] text-slate-400 font-medium">Total pipeline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundImage: "repeating-linear-gradient(-45deg,#b8c8d2 0px,#b8c8d2 2px,#d4dde3 2px,#d4dde3 8px)" }} />
                <span className="text-[9.5px] text-slate-400 font-medium">Hover to explore</span>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-4 bg-slate-200" />

            {/* Period toggle */}
            <div className="flex p-1 bg-slate-100 rounded-lg gap-0.5">
              {(["week", "month"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-3 py-1 rounded-md text-[11px] font-semibold transition-all duration-200",
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
          </div>

          {/* ── Recent Proposals sub-section ── */}
          {(() => {
            const proposals    = isResearcher ? RESEARCHER_RECENT_PROPOSALS : CRO_RECENT_PROPOSALS;
            const primaryColor = isResearcher ? "#5B3BA8" : "#2F66D0";
            const subheading   = isResearcher
              ? "Latest proposals you have submitted for review"
              : "Most recent proposals submitted to active requirements";

            return (
              <div className="flex flex-col gap-2.5 pt-1 border-t border-slate-100">

                {/* Sub-section header */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold text-[#1e293b]">Recent Proposals</p>
                    <p className="text-[9.5px] text-slate-400 leading-snug">{subheading}</p>
                  </div>
                  <button
                    className="shrink-0 flex items-center gap-1 text-[10.5px] font-semibold whitespace-nowrap hover:opacity-75 transition-opacity"
                    style={{ color: primaryColor }}
                  >
                    View all proposals <ArrowRight size={10} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Compact proposal cards */}
                {proposals.map((pr, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 bg-white p-2.5 flex flex-col gap-1 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                  >
                    {/* Row 1: tags + status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] border border-slate-200 rounded-full px-1.5 py-[2px] text-slate-400 font-medium leading-none">
                          Proposal
                        </span>
                        <span
                          className="text-[8px] rounded-full px-1.5 py-[2px] text-white font-bold leading-none"
                          style={{ background: pr.typeColor }}
                        >
                          {pr.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[8.5px] font-semibold flex items-center gap-1 leading-none"
                          style={{ color: pr.statusColor }}
                        >
                          <span className="w-1 h-1 rounded-full inline-block shrink-0" style={{ background: pr.statusColor }} />
                          {pr.status}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: title */}
                    <p className="text-[10.5px] font-semibold text-[#1e293b] leading-snug truncate">
                      {pr.title}
                    </p>

                    {/* Row 3: meta + track CTA */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[8.5px] text-slate-400 truncate">
                        {pr.id} · {pr.compound} · {pr.industry}
                      </p>
                      <button
                        className="shrink-0 flex items-center gap-0.5 text-[9px] font-semibold hover:opacity-75 transition-opacity"
                        style={{ color: primaryColor }}
                      >
                        Track <ArrowRight size={8} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
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
          <ProfileGauge value={gaugeValue} readinessLabel="Overall Readiness" profileType={profileType} />

          {/* Progress bars */}
          <div className="flex flex-col gap-3">
            {metrics.map((m, i) => (
              <AnimatedProgressBar key={i} metric={m} delay={i * 120} />
            ))}
          </div>

          {/* Contextual insight chip */}
          {(() => {
            const weak = metrics.filter(m => m.value < 85);
            const primaryColor = isResearcher ? "#5B3BA8" : "#2F66D0";
            const primaryBg    = isResearcher ? "#F1EDFF" : "#EAF1FF";
            const primaryBorder = isResearcher ? "rgba(91,59,168,0.20)" : "rgba(47,102,208,0.20)";
            return (
              <>
                {/* Insight */}
                <div
                  className="flex items-start gap-2 p-3 rounded-xl text-[10.5px] leading-relaxed border"
                  style={{ background: primaryBg, borderColor: primaryBorder, color: primaryColor }}
                >
                  <span className="shrink-0 mt-0.5">
                    {weak.length > 0 ? "⚡" : "✅"}
                  </span>
                  <span>
                    {weak.length > 0
                      ? `${weak.length} area${weak.length > 1 ? "s" : ""} below 85% — strengthening ${weak.length > 1 ? "them" : "it"} will improve your match ranking and visibility to ${isResearcher ? "industry partners" : "qualified buyers"}.`
                      : "Your profile is highly complete. You're in a strong position for top-tier matches."}
                  </span>
                </div>

                {/* CTA button */}
                <button
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold border transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{
                    color:       primaryColor,
                    borderColor: primaryBorder,
                    background:  primaryBg,
                  }}
                >
                  {isResearcher ? "Strengthen researcher profile" : "Complete capability profile"}
                  <ArrowRight size={12} strokeWidth={2.5} />
                </button>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Trending Opportunities — data ───────────────────────────────────────────

interface OpportunityCard {
  type:       "open" | "exclusive";
  matchPct:   number;
  matchLabel: "HIGH MATCH" | "STRONG FIT" | "EMERGING";
  industry:   string;
  funder:     string;
  title:      string;
  description:string;
  budget:     string;
  daysLeft:   number;
  hoursLeft:  number;
  imgSeed:    string;
}

const CRO_OPPORTUNITIES: OpportunityCard[] = [
  { type:"exclusive", matchPct:94, matchLabel:"HIGH MATCH",   industry:"Pharmaceuticals",      funder:"Horizon Europe",      title:"Pharmaceutical API manufacturing for novel oncology compound",   description:"cGMP partner needed for Phase II API scale-up from 50g to 5kg batch size.",      budget:"€2.4M", daysLeft:12, hoursLeft:6,  imgSeed:"/supplier-images/supplier-1.png"  },
  { type:"open",      matchPct:87, matchLabel:"STRONG FIT",   industry:"Battery & Energy",     funder:"DOE · ARPA-E",        title:"Specialty chemical scale-up for battery electrolyte production", description:"Electrolyte additive at pilot scale; strict purity and handling requirements.", budget:"$680K", daysLeft:21, hoursLeft:14, imgSeed:"/supplier-images/supplier-2.png"  },
  { type:"open",      matchPct:72, matchLabel:"EMERGING",     industry:"Agrochemicals",        funder:"Bill & Melinda Gates", title:"Green chemistry process for agricultural actives",               description:"Novel green synthesis routes for next-gen pesticide intermediates.",          budget:"$1.1M", daysLeft:34, hoursLeft:9,  imgSeed:"/supplier-images/supplier-3.png"  },
  { type:"exclusive", matchPct:91, matchLabel:"HIGH MATCH",   industry:"Biotech & Life Sci.",  funder:"NIH",                 title:"cGMP manufacturing of biologic drug substance",                  description:"Biologics manufacturing partner for Phase I clinical supply.",                 budget:"$3.2M", daysLeft:8,  hoursLeft:11, imgSeed:"/supplier-images/supplier-4.png"  },
  { type:"open",      matchPct:83, matchLabel:"STRONG FIT",   industry:"Material Science",     funder:"DARPA",               title:"Custom synthesis of advanced materials for semiconductors",       description:"High-purity specialty materials for next-gen chip manufacturing programs.",    budget:"$890K", daysLeft:15, hoursLeft:3,  imgSeed:"/supplier-images/supplier-5.png"  },
];

const RESEARCHER_OPPORTUNITIES: OpportunityCard[] = [
  { type:"exclusive", matchPct:94, matchLabel:"HIGH MATCH",   industry:"Green Chemistry",      funder:"Horizon Europe",      title:"Sustainable catalysts for green hydrogen production",             description:"Novel heterogeneous catalysts for water splitting under mild conditions.",      budget:"€2.4M", daysLeft:12, hoursLeft:6,  imgSeed:"/supplier-images/supplier-6.png"  },
  { type:"open",      matchPct:87, matchLabel:"STRONG FIT",   industry:"Chemical Engineering", funder:"NSF · CHE",           title:"Selective C–H activation in flow chemistry systems",              description:"Microreactor-based continuous flow process for C–H functionalisation.",        budget:"$680K", daysLeft:21, hoursLeft:14, imgSeed:"/supplier-images/supplier-7.png"  },
  { type:"open",      matchPct:72, matchLabel:"EMERGING",     industry:"Materials Science",    funder:"Wellcome Leap",       title:"Bio-inspired materials for next-gen energy storage",              description:"Biopolymer-derived electrode materials for solid-state batteries.",            budget:"$1.1M", daysLeft:34, hoursLeft:9,  imgSeed:"/supplier-images/supplier-8.png"  },
  { type:"exclusive", matchPct:91, matchLabel:"HIGH MATCH",   industry:"Pharmaceuticals",      funder:"NIH",                 title:"Synthesis of peptide-based cancer therapeutics",                 description:"Novel peptide conjugates targeting HER2-positive breast cancer cells.",        budget:"$2.1M", daysLeft:9,  hoursLeft:5,  imgSeed:"/supplier-images/supplier-9.png"  },
  { type:"open",      matchPct:88, matchLabel:"STRONG FIT",   industry:"Comp. Chemistry",      funder:"DARPA",               title:"Machine learning–guided retrosynthesis optimisation",             description:"AI-driven synthetic route planning for complex natural products.",             budget:"$750K", daysLeft:18, hoursLeft:2,  imgSeed:"/supplier-images/supplier-10.png" },
];

// ─── Opportunity project card ─────────────────────────────────────────────────

// Match pill config: dot colour + light pill tint
const MATCH_PILL: Record<OpportunityCard["matchLabel"], { dot: string; bg: string; border: string; label: string }> = {
  "HIGH MATCH": { dot: "#1a6b4f", bg: "rgba(26,107,79,0.10)",  border: "rgba(26,107,79,0.22)",  label: "Well Matched"  },
  "STRONG FIT": { dot: "#2F66D0", bg: "rgba(47,102,208,0.10)", border: "rgba(47,102,208,0.22)", label: "Strong Fit"    },
  "EMERGING":   { dot: "#5B3BA8", bg: "rgba(91,59,168,0.10)",  border: "rgba(91,59,168,0.22)",  label: "Emerging"      },
};

function OpportunityProjectCard({
  card,
  primaryColor,
}: {
  card:         OpportunityCard;
  primaryColor: string;
}) {
  const [hovered, setHovered] = useState(false);
  const mp        = MATCH_PILL[card.matchLabel];
  const showTimer = card.daysLeft <= 21;

  return (
    <div
      className="flex flex-col flex-1 min-w-0 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white cursor-pointer select-none transition-shadow duration-200 hover:shadow-md"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image section ──────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: 150 }}>
        <img
          src={card.imgSeed}
          alt={card.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? "scale(1.04)" : "scale(1)" }}
        />

        {/* Subtle scrim — just enough for text legibility */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.08) 60%, transparent 100%)" }}
        />

        {/* ── Bottom strip: type pill + match % ── */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-6 flex items-end justify-between gap-2">
          {/* Type pill */}
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] font-semibold leading-none backdrop-blur-sm"
            style={card.type === "exclusive"
              ? { background: "rgba(245,158,11,0.25)", border: "1px solid rgba(245,158,11,0.50)", color: "#fde68a" }
              : { background: "rgba(0,0,0,0.45)",      border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.92)" }
            }
          >
            <span className="text-[10px]">{card.type === "exclusive" ? "★" : "★"}</span>
            {card.type === "exclusive" ? "Exclusive" : "Open Project"}
          </span>

          {/* Match % */}
          <div className="flex items-baseline gap-0.5">
            <span
              className="font-black text-white leading-none tabular-nums"
              style={{ fontSize: 24, fontFamily: "Poppins,sans-serif", textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
            >
              {card.matchPct}%
            </span>
            <span className="text-white/65 text-[9px] font-medium mb-0.5">Match</span>
          </div>
        </div>
      </div>

      {/* ── White content section ──────────────────────────────── */}
      <div className="flex flex-col flex-1 px-3.5 pt-3 pb-3 gap-2">

        {/* Pills row: match quality + industry + timer */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Match quality pill (dot + label) */}
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold leading-none"
            style={{ background: mp.bg, border: `1px solid ${mp.border}`, color: mp.dot }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: mp.dot }} />
            {mp.label}
          </span>

          {/* Industry pill */}
          <span className="px-2.5 py-1 rounded-full text-[9.5px] font-medium leading-none bg-slate-100 text-slate-500">
            {card.industry}
          </span>

          {/* Timer pill — shown when ≤21 days */}
          {showTimer && (
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[9.5px] font-semibold leading-none"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", color: "#dc2626" }}
            >
              ⏱ {card.daysLeft}d {card.hoursLeft}h left
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[13px] font-bold text-[#1e293b] leading-snug line-clamp-2 flex-1">
          {card.title}
        </h3>

        {/* Description */}
        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
          {card.description}
        </p>

        {/* Footer: funder + arrow */}
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[10px] text-slate-400 font-medium truncate">{card.funder}</span>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
            style={{
              background: "#0E6F5C",
              opacity:    hovered ? 1 : 0,
              transform:  hovered ? "scale(1) translateY(0px)" : "scale(0.8) translateY(4px)",
              boxShadow:  hovered ? "0 0 14px rgba(14,111,92,0.45)" : "none",
              pointerEvents: hovered ? "auto" : "none",
            }}
          >
            <ArrowRight size={13} strokeWidth={2.5} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Urgency countdown card (right panel) ────────────────────────────────────

function UrgencyCountdownCard({ profileType }: { profileType: ProfileType }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const isResearcher = profileType === "researcher";

  // Countdown math
  const BASE    = 2 * 86400 + 11 * 3600 + 48 * 60;
  const TOTAL   = 5 * 86400; // 5-day total response window
  const rem     = Math.max(BASE - tick, 0);
  const pctUsed = Math.min(100, Math.round(((TOTAL - rem) / TOTAL) * 100));
  const days    = Math.floor(rem / 86400);
  const hours   = Math.floor((rem % 86400) / 3600);
  const minutes = Math.floor((rem % 3600) / 60);
  const seconds = rem % 60;

  // Progress bar colour: green → amber → red as deadline approaches
  const barColor = pctUsed > 80 ? "#ef4444" : pctUsed > 60 ? "#f59e0b" : "#4ade80";

  // Persona content
  const urgencyLabel = isResearcher ? "🔥 PROJECT NEEDING QUICK REVIEW" : "⏳ FAST-TRACK OPPORTUNITY";
  const projectTitle = isResearcher
    ? "Advanced electrolyte additives for solid-state batteries"
    : "Pilot-scale peptide manufacturing support";
  const subtitle = isResearcher
    ? "Proposal response due in 2 days · Priority industry requirement"
    : "Customer awaiting technical response · Commercial review in progress";
  const ctaLabel    = isResearcher ? "Review opportunity" : "Send proposal";
  const priorityTag = isResearcher ? "Priority Review"  : "Fast-track";
  const industryTag = isResearcher ? "Energy Storage"   : "Pharmaceuticals";
  const budgetTag   = isResearcher ? "$680K"            : "€2.4M";
  const requirements = isResearcher
    ? [
        "Solid-state electrolyte synthesis expertise",
        "Battery testing laboratory access required",
        "Prior grant or industry R&D experience",
      ]
    : [
        "cGMP-certified manufacturing facility",
        "50g → 5kg batch scale-up capability",
        "Phase II timeline compliance required",
      ];

  return (
    <div
      className="h-full rounded-2xl flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#001c0e 0%,#001408 55%,#080f1e 100%)", minHeight: 380 }}
    >
      {/* Ambient glow — top right */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.13]"
        style={{ background: "radial-gradient(circle,#4ade80 0%,transparent 70%)", filter: "blur(52px)" }} />

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex flex-col gap-4 p-5 flex-1 justify-between">

        {/* Pulsing live dot + label */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80", animation: "d10-pulse 1.8s ease-in-out infinite" }}
          />
          <p className="text-[8px] font-black uppercase tracking-[0.15em] text-emerald-300/80 leading-none">
            {urgencyLabel}
          </p>
        </div>

        {/* Title + subtitle */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[15px] font-bold text-white leading-snug" style={{ fontFamily: "Poppins,sans-serif" }}>
            {projectTitle}
          </h3>
          <p className="text-[10px] text-white/45 leading-relaxed">{subtitle}</p>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* Countdown — DD / HH / MM in 3 equal boxes */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {[
              { val: days,    lbl: "DAYS" },
              { val: hours,   lbl: "HRS"  },
              { val: minutes, lbl: "MINS" },
            ].map(({ val, lbl }) => (
              <div
                key={lbl}
                className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <span className="text-[26px] font-black text-white leading-none tabular-nums"
                  style={{ fontFamily: "Poppins,sans-serif" }}>
                  {String(val).padStart(2, "0")}
                </span>
                <span className="text-[7px] font-bold text-white/30 tracking-widest">{lbl}</span>
              </div>
            ))}
          </div>
          {/* Ticking seconds — compact inline row */}
          <div className="flex items-center justify-end gap-1.5 pr-0.5">
            <span className="text-[9px] text-white/25 font-medium">+</span>
            <span className="text-[20px] font-black text-red-400 tabular-nums leading-none"
              style={{ fontFamily: "Poppins,sans-serif" }}>
              {String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[7px] font-bold text-red-400/50 tracking-widest">SEC</span>
          </div>
        </div>

        {/* Deadline progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-white/35 font-medium">Deadline window</span>
            <span className="text-[9px] font-bold tabular-nums" style={{ color: barColor }}>{pctUsed}% used</span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${pctUsed}%`, background: barColor, boxShadow: `0 0 8px ${barColor}66` }}
            />
          </div>
          <p className="text-[8px] text-white/22 leading-snug">
            Response window closes automatically if no action is taken
          </p>
        </div>

        {/* Context chips */}
        <div className="flex flex-wrap gap-1.5">
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-semibold"
            style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.20)", color: "#4ade80" }}
          >
            ⚡ {priorityTag}
          </span>
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-medium"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.50)" }}
          >
            {industryTag}
          </span>
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-medium"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.50)" }}
          >
            📋 {budgetTag}
          </span>
        </div>

        {/* Key requirements */}
        <div
          className="flex flex-col gap-2 rounded-xl p-3.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-0.5">
            Key Requirements
          </p>
          {requirements.map((req, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className="mt-0.5 w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center"
                style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.25)" }}
              >
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                  <path d="M1 3.5L2.8 5.2L6 1.5" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <p className="text-[10px] text-white/55 leading-snug">{req}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────── */}
      <div className="px-5 pb-5">
        <button className="w-full py-3 bg-white text-[#002d16] text-[12.5px] font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#f0fdf4] active:scale-[0.98] transition-all duration-200 shadow-sm">
          {ctaLabel}
          <ArrowRight size={13} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ─── Trending Opportunities Section ───────────────────────────────────────────

function TrendingOpportunitiesSection({ profileType }: { profileType: ProfileType }) {
  const [carouselStart, setCarouselStart] = useState(0);
  const isResearcher   = profileType === "researcher";
  const opportunities  = isResearcher ? RESEARCHER_OPPORTUNITIES : CRO_OPPORTUNITIES;
  const primaryColor   = isResearcher ? "#5B3BA8" : "#2F66D0";
  const VISIBLE        = 3;
  const canPrev        = carouselStart > 0;
  const canNext        = carouselStart + VISIBLE < opportunities.length;
  const visible        = opportunities.slice(carouselStart, carouselStart + VISIBLE);

  return (
    <div className="flex flex-col lg:flex-row gap-4">

      {/* ── LEFT 70% — project cards ── */}
      <div className="flex-[7] min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              TRENDING OPPORTUNITIES
            </p>
            <h2
              className="text-[17px] sm:text-[19px] font-bold text-[#1e293b]"
              style={{ fontFamily: "Poppins,sans-serif" }}
            >
              High-demand projects requiring attention
            </h2>
          </div>
          <button
            className="flex items-center gap-1 text-[11px] font-semibold hover:opacity-75 transition-opacity shrink-0"
            style={{ color: primaryColor }}
          >
            See all <ArrowRight size={11} strokeWidth={2.5} />
          </button>
        </div>

        {/* Exclusive banner — thin strip */}
        <div
          className="mx-5 sm:mx-6 mt-4 px-4 py-2 rounded-xl flex items-center justify-between gap-3"
          style={{
            background: "linear-gradient(90deg,rgba(26,107,79,0.07) 0%,rgba(47,102,208,0.05) 100%)",
            border:     "1px solid rgba(26,107,79,0.13)",
          }}
        >
          <p className="text-[10px] text-[#1a6b4f] font-medium leading-snug">
            ⚡ <span className="font-semibold">Exclusive</span> — Industry opportunities matched to your expertise and shared for priority review.
          </p>
          <button className="shrink-0 flex items-center gap-1 text-[9.5px] font-semibold text-[#1a6b4f] hover:opacity-75 whitespace-nowrap transition-opacity">
            View projects <ArrowRight size={9} strokeWidth={2.5} />
          </button>
        </div>

        {/* Cards carousel */}
        <div className="px-5 sm:px-6 pt-4 pb-5 relative">
          {/* Cards row */}
          <div className="flex gap-3">
            {visible.map((card, i) => (
              <OpportunityProjectCard
                key={carouselStart + i}
                card={card}
                primaryColor={primaryColor}
              />
            ))}
          </div>

          {/* Chevron — prev */}
          {canPrev && (
            <button
              onClick={() => setCarouselStart(s => Math.max(s - 1, 0))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors z-10"
            >
              <svg width="13" height="13" viewBox="0 0 13 13">
                <path d="M8 2L3 6.5L8 11" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>
          )}
          {/* Chevron — next */}
          {canNext && (
            <button
              onClick={() => setCarouselStart(s => Math.min(s + 1, opportunities.length - VISIBLE))}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors z-10"
            >
              <svg width="13" height="13" viewBox="0 0 13 13">
                <path d="M5 2L10 6.5L5 11" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>
          )}

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {Array.from({ length: opportunities.length - VISIBLE + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselStart(i)}
                className="rounded-full transition-all duration-250"
                style={{
                  width:      carouselStart === i ? 18 : 6,
                  height:     6,
                  background: carouselStart === i ? primaryColor : "#cbd5e1",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT 30% — urgency card ── */}
      <div className="flex-[3] lg:min-w-[240px] lg:max-w-[300px]">
        <UrgencyCountdownCard profileType={profileType} />
      </div>

      {/* Keyframes scoped to this section */}
      <style>{`
        @keyframes d10-pulse {
          0%, 100% { opacity: 1;   transform: scale(1);    }
          50%       { opacity: 0.4; transform: scale(0.82); }
        }
      `}</style>
    </div>
  );
}

// ─── Demand Discovery Section ─────────────────────────────────────────────────

interface SignalProduct {
  id:          string;
  name:        string;
  spark:       number[];   // 8 normalised data points for sparkline
  trendPct:    number;
  enquiries:   number;
  rfqs?:       number;
  shortlisted?:number;
  discussions: number;
  conversion:  number;
  badge:       string;
  badgeColor:  string;
  ctaLabel:    string;
}

const CRO_SIGNAL_PRODUCTS: SignalProduct[] = [
  { id:"ls-cro",  name:"Lithium Sulfite",         spark:[8,12,10,18,22,19,28,32], trendPct:21, enquiries:32, rfqs:6,  discussions:2, conversion:19, badge:"High Buyer Interest", badgeColor:"#1a6b4f", ctaLabel:"Manage Enquiries"    },
  { id:"vd3-cro", name:"Vitamin D3 Intermediate", spark:[5,8,9,12,14,17,19,21],  trendPct:9,  enquiries:21, rfqs:3,  discussions:1, conversion:14, badge:"Active Discovery",    badgeColor:"#2F66D0", ctaLabel:"Review Buyer Signals" },
  { id:"ksm-cro", name:"KSM-47 Intermediate",     spark:[3,4,6,5,8,9,11,13],     trendPct:7,  enquiries:13, rfqs:1,  discussions:0, conversion:8,  badge:"Emerging",           badgeColor:"#5B3BA8", ctaLabel:"View Signals"         },
];

const RESEARCHER_SIGNAL_PRODUCTS: SignalProduct[] = [
  { id:"ls-res",  name:"Lithium Sulfite",     spark:[6,10,9,15,18,22,25,28], trendPct:18, enquiries:28, shortlisted:4, discussions:1, conversion:14, badge:"Growing Interest", badgeColor:"#1a6b4f", ctaLabel:"Open Pipeline"        },
  { id:"cat-res", name:"Catalyst Scaffold",   spark:[4,7,8,11,13,15,17,19], trendPct:11, enquiries:19, shortlisted:2, discussions:2, conversion:11, badge:"Emerging Demand",  badgeColor:"#2F66D0", ctaLabel:"Review Match Quality" },
  { id:"pep-res", name:"Peptide Intermediate",spark:[2,3,4,5,6,7,8,9],      trendPct:5,  enquiries:9,  shortlisted:1, discussions:0, conversion:6,  badge:"Early Signal",     badgeColor:"#5B3BA8", ctaLabel:"View Enquiries"       },
];

// Mini sparkline ---------------------------------------------------------------
function Sparkline({ points, color, uid }: { points: number[]; color: string; uid: string }) {
  const W = 72, H = 28;
  const min = Math.min(...points), max = Math.max(...points);
  const range = (max - min) || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * W);
  const ys = points.map(p => H - 4 - ((p - min) / range) * (H - 8));
  const pathD = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const areaD = `${pathD} L${W},${H} L0,${H} Z`;
  const gid   = `sg-${uid}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gid})`}/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="2.5" fill={color}/>
    </svg>
  );
}

// Signal product card ----------------------------------------------------------
function SignalProductCard({
  product, isCRO, primaryColor,
}: { product: SignalProduct; isCRO: boolean; primaryColor: string }) {
  const bbg    = product.badgeColor + "18";
  const bbr    = product.badgeColor + "33";

  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">

      {/* Name + sparkline */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[12.5px] font-bold text-[#1e293b] leading-snug">{product.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] font-semibold" style={{ color: product.badgeColor }}>↗ +{product.trendPct}%</span>
            <span className="text-[9px] text-slate-400">this week</span>
          </div>
        </div>
        <Sparkline points={product.spark} color={product.badgeColor} uid={product.id}/>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100"/>

      {/* Stats row */}
      <div className="flex items-stretch gap-0">
        {/* Enquiries */}
        <div className="flex flex-col gap-0.5 flex-1">
          <span className="text-[19px] font-black text-[#1e293b] leading-none">{product.enquiries}</span>
          <span className="text-[8.5px] text-slate-400">{isCRO ? "enquiries" : "enquiries"}</span>
        </div>
        {/* RFQs (CRO) / Shortlisted (Researcher) */}
        {isCRO && product.rfqs !== undefined && (
          <>
            <div className="w-px bg-slate-100 mx-3 self-stretch"/>
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="text-[19px] font-black text-[#1e293b] leading-none">{product.rfqs}</span>
              <span className="text-[8.5px] text-slate-400">RFQs</span>
            </div>
          </>
        )}
        {!isCRO && product.shortlisted !== undefined && (
          <>
            <div className="w-px bg-slate-100 mx-3 self-stretch"/>
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="text-[19px] font-black text-[#1e293b] leading-none">{product.shortlisted}</span>
              <span className="text-[8.5px] text-slate-400">shortlisted</span>
            </div>
          </>
        )}
        {/* Conversion */}
        <div className="w-px bg-slate-100 mx-3 self-stretch"/>
        <div className="flex flex-col gap-0.5 flex-1 items-end">
          <span className="text-[19px] font-black leading-none" style={{ color: primaryColor }}>{product.conversion}%</span>
          <span className="text-[8.5px] text-slate-400">conversion</span>
        </div>
      </div>

      {/* Badge + CTA */}
      <div className="flex items-center justify-between mt-auto">
        <span
          className="px-2.5 py-1 rounded-full text-[9.5px] font-semibold leading-none"
          style={{ background: bbg, border: `1px solid ${bbr}`, color: product.badgeColor }}
        >
          {product.badge}
        </span>
        <button className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: primaryColor }}>
          {product.ctaLabel} <ArrowRight size={10} strokeWidth={2.5}/>
        </button>
      </div>
    </div>
  );
}

// Full section -----------------------------------------------------------------
function DemandDiscoverySection({ profileType }: { profileType: ProfileType }) {
  const [carouselStart, setCarouselStart] = useState(0);
  const isCRO        = profileType === "cro";
  const primaryColor = isCRO ? "#2F66D0" : "#5B3BA8";
  const products     = isCRO ? CRO_SIGNAL_PRODUCTS : RESEARCHER_SIGNAL_PRODUCTS;
  const VISIBLE      = 2;
  const canPrev      = carouselStart > 0;
  const canNext      = carouselStart + VISIBLE < products.length;
  const visible      = products.slice(carouselStart, carouselStart + VISIBLE);

  // Section text
  const sectionLabel   = isCRO ? "CATALOGUE PERFORMANCE INTELLIGENCE" : "PRODUCT PERFORMANCE INTELLIGENCE";
  const sectionTitle   = isCRO
    ? "Your Product Catalogue Is Converting Into Buyer Demand"
    : "Your Research Assets Are Driving Collaboration Discovery";
  const sectionSubtext = isCRO
    ? "Track procurement discovery activity and identify which products are driving buyer engagement."
    : "Track which products are attracting attention and converting into active scientific opportunities.";

  // Right panel
  const rightHeading = isCRO ? "Top Buyer Interest"    : "Top Performing Asset";
  const totalEvents  = isCRO ? 48                      : 32;
  const eventsLabel  = isCRO ? "product discovery events this week" : "discovery events this week";
  const rightStats   = isCRO
    ? [{ val:"132", lbl:"impressions" }, { val:"32", lbl:"enquiries" }, { val:"6", lbl:"RFQs" }]
    : [{ val:"92",  lbl:"profile views" }, { val:"28", lbl:"enquiries" }, { val:"4", lbl:"shortlist adds" }];
  const rightInsight = isCRO
    ? "Ranked #3 in active pharma sourcing searches this week"
    : "Ranking in the top 8% of discovery searches across your field";
  const rightCTA     = isCRO ? "Expand Catalogue" : "Boost Visibility";

  return (
    <div className="flex flex-col lg:flex-row gap-4">

      {/* ── LEFT 65% — signal cards ── */}
      <div className="flex-[65] min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{sectionLabel}</p>
            <h2 className="text-[17px] sm:text-[19px] font-bold text-[#1e293b]" style={{ fontFamily: "Poppins,sans-serif" }}>
              {sectionTitle}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-lg">{sectionSubtext}</p>
          </div>
          <button className="flex items-center gap-1 text-[11px] font-semibold shrink-0 hover:opacity-75 transition-opacity" style={{ color: primaryColor }}>
            View all <ArrowRight size={11} strokeWidth={2.5}/>
          </button>
        </div>

        {/* Cards + carousel */}
        <div className="px-5 sm:px-6 pt-4 pb-5 relative">
          <div className="flex gap-4">
            {visible.map((product, i) => (
              <SignalProductCard
                key={carouselStart + i}
                product={product}
                isCRO={isCRO}
                primaryColor={primaryColor}
              />
            ))}
          </div>

          {/* Chevron — prev */}
          {canPrev && (
            <button
              onClick={() => setCarouselStart(s => Math.max(s - 1, 0))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors z-10"
            >
              <svg width="13" height="13" viewBox="0 0 13 13">
                <path d="M8 2L3 6.5L8 11" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>
          )}
          {/* Chevron — next */}
          {canNext && (
            <button
              onClick={() => setCarouselStart(s => Math.min(s + 1, products.length - VISIBLE))}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors z-10"
            >
              <svg width="13" height="13" viewBox="0 0 13 13">
                <path d="M5 2L10 6.5L5 11" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>
          )}

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {Array.from({ length: products.length - VISIBLE + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselStart(i)}
                className="rounded-full transition-all duration-250"
                style={{ width: carouselStart === i ? 18 : 6, height: 6, background: carouselStart === i ? primaryColor : "#cbd5e1" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT 35% — insight panel ── */}
      <div className="flex-[35] lg:min-w-[240px] lg:max-w-[320px]">
        <div
          className="h-full rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden border"
          style={{
            background: `linear-gradient(140deg,${primaryColor}14 0%,${primaryColor}06 100%)`,
            borderColor: `${primaryColor}22`,
          }}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -top-14 -right-14 w-44 h-44 rounded-full opacity-[0.18]"
            style={{ background: `radial-gradient(circle,${primaryColor} 0%,transparent 70%)`, filter: "blur(38px)" }}/>

          {/* Heading + product */}
          <div>
            <p className="text-[8.5px] font-black uppercase tracking-widest mb-1" style={{ color: primaryColor + "aa" }}>
              {rightHeading}
            </p>
            <p className="text-[16px] font-bold text-[#1e293b]" style={{ fontFamily: "Poppins,sans-serif" }}>
              Lithium Sulfite
            </p>
          </div>

          {/* Total events badge */}
          <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl" style={{ background: `${primaryColor}12`, border: `1px solid ${primaryColor}22` }}>
            <span className="text-[26px] font-black leading-none" style={{ color: primaryColor, fontFamily: "Poppins,sans-serif" }}>
              {totalEvents}
            </span>
            <span className="text-[10px] text-slate-500 leading-snug">{eventsLabel}</span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            {rightStats.map(({ val, lbl }) => (
              <div key={lbl} className="flex flex-col items-center gap-0.5 py-2.5 rounded-xl bg-white/70 border border-white/90">
                <span className="text-[16px] font-black text-[#1e293b] leading-none">{val}</span>
                <span className="text-[8px] text-slate-400 text-center leading-snug">{lbl}</span>
              </div>
            ))}
          </div>

          {/* Insight */}
          <div className="flex items-start gap-2 p-3 rounded-xl flex-1" style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.85)" }}>
            <span className="text-[15px] shrink-0 mt-0.5">💡</span>
            <p className="text-[10.5px] text-[#1e293b] font-medium leading-relaxed">{rightInsight}</p>
          </div>

          {/* CTA */}
          <button
            className="w-full py-2.5 text-[12px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] hover:opacity-90"
            style={{ background: primaryColor, color: "white", boxShadow: `0 2px 14px ${primaryColor}40` }}
          >
            {rightCTA} <ArrowRight size={12} strokeWidth={2.5}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Day 10 Optimise Section ──────────────────────────────────────────────────

type ImpactLevel = "high" | "recommended" | "optimization";

interface OptimizeCard {
  title:       string;
  benefit:     string;
  Icon:        LucideIcon;
  iconBg:      string;
  iconColor:   string;
  impactLabel: string;
  impactLevel: ImpactLevel;
  ctaLabel:    string;
}

const IMPACT_STYLES: Record<ImpactLevel, { bg: string; text: string; dot: string; priority: string }> = {
  high:         { bg: "rgba(26,107,79,0.10)",  text: "#1a6b4f", dot: "#1a6b4f", priority: "High Impact"    },
  recommended:  { bg: "rgba(217,119,6,0.10)",  text: "#b45309", dot: "#d97706", priority: "Recommended"    },
  optimization: { bg: "rgba(47,102,208,0.10)", text: "#2F66D0", dot: "#2F66D0", priority: "Optimisation"   },
};

const CRO_OPTIMIZE_CARDS: OptimizeCard[] = [
  {
    title:       "Refine Service Positioning",
    benefit:     "Improve how buyers discover your technical capabilities across active searches.",
    Icon:        Settings2,
    iconBg:      "#f0faf5",
    iconColor:   "#1a6b4f",
    impactLabel: "+12% visibility",
    impactLevel: "high",
    ctaLabel:    "Optimise",
  },
  {
    title:       "Add Commercial Product Specs",
    benefit:     "Detailed specifications improve enquiry quality and reduce back-and-forth.",
    Icon:        FileText,
    iconBg:      "#eff6ff",
    iconColor:   "#2F66D0",
    impactLabel: "Better-fit buyers",
    impactLevel: "recommended",
    ctaLabel:    "Add Specs",
  },
  {
    title:       "Strengthen Capability Keywords",
    benefit:     "Improve matching accuracy across buyer requirement searches.",
    Icon:        Tag,
    iconBg:      "#f3f0ff",
    iconColor:   "#5B3BA8",
    impactLabel: "+18% match precision",
    impactLevel: "high",
    ctaLabel:    "Refine",
  },
  {
    title:       "Update Compliance Certifications",
    benefit:     "Required for regulated procurement opportunities in pharma and biotech.",
    Icon:        ShieldCheck,
    iconBg:      "#fffbeb",
    iconColor:   "#d97706",
    impactLabel: "Access regulated demand",
    impactLevel: "recommended",
    ctaLabel:    "Update",
  },
  {
    title:       "Complete Buyer-Facing Profile",
    benefit:     "A stronger company profile increases trust signals and shortlist rate.",
    Icon:        UserCheck,
    iconBg:      "#f0fdf4",
    iconColor:   "#16a34a",
    impactLabel: "Higher shortlist rate",
    impactLevel: "optimization",
    ctaLabel:    "Complete",
  },
];

const RESEARCHER_OPTIMIZE_CARDS: OptimizeCard[] = [
  {
    title:       "Add Experimental Validation Data",
    benefit:     "Increase proposal credibility for active industry opportunities.",
    Icon:        FlaskConical,
    iconBg:      "#f0faf5",
    iconColor:   "#1a6b4f",
    impactLabel: "+14% proposal strength",
    impactLevel: "high",
    ctaLabel:    "Add",
  },
  {
    title:       "Update Publication Record",
    benefit:     "Recent publications improve expertise relevance in discovery searches.",
    Icon:        BookOpen,
    iconBg:      "#eff6ff",
    iconColor:   "#2F66D0",
    impactLabel: "Unlock hidden matches",
    impactLevel: "recommended",
    ctaLabel:    "Update",
  },
  {
    title:       "Refine Research Keywords",
    benefit:     "Improve alignment with scientific problem statements from industry partners.",
    Icon:        Microscope,
    iconBg:      "#f3f0ff",
    iconColor:   "#5B3BA8",
    impactLabel: "+18% match accuracy",
    impactLevel: "high",
    ctaLabel:    "Refine",
  },
  {
    title:       "Add Collaboration Outcomes",
    benefit:     "Past project results strengthen trust and improve shortlist potential.",
    Icon:        Users,
    iconBg:      "#fffbeb",
    iconColor:   "#d97706",
    impactLabel: "Higher shortlist potential",
    impactLevel: "recommended",
    ctaLabel:    "Add",
  },
  {
    title:       "Complete Research Identity",
    benefit:     "Strengthen scientific visibility across global industry discovery programs.",
    Icon:        Globe,
    iconBg:      "#f0fdf4",
    iconColor:   "#16a34a",
    impactLabel: "Expanded discovery reach",
    impactLevel: "optimization",
    ctaLabel:    "Complete",
  },
];

function Day10OptimizeSection({ profileType }: { profileType: ProfileType }) {
  const isCRO  = profileType === "cro";
  const cards  = isCRO ? CRO_OPTIMIZE_CARDS : RESEARCHER_OPTIMIZE_CARDS;
  const title  = isCRO
    ? "Optimise Your Match Performance"
    : "Increase Research Match Quality";
  const subtext = isCRO
    ? "Small improvements can increase buyer visibility and improve project conversion."
    : "Fine-tune your profile to improve proposal success and collaboration fit.";

  return (
    <section className="flex flex-col gap-3.5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[16px] font-bold text-[#171717]" style={{ fontFamily: "Poppins, sans-serif" }}>
            {title}
          </h2>
          <p className="text-[12px] text-[#68747a] mt-0.5">{subtext}</p>
        </div>
        {/* Profile optimisation % */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">Profile optimisation</span>
          <div className="flex items-center gap-1.5">
            <div className="w-24 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-[#1a6b4f]" style={{ width: "72%" }}/>
            </div>
            <span className="text-[11px] font-bold text-[#1a6b4f]">72%</span>
          </div>
        </div>
      </div>

      {/* Cards strip */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex gap-3 lg:grid lg:grid-cols-5 min-w-max lg:min-w-0">
          {cards.map((c) => {
            const imp = IMPACT_STYLES[c.impactLevel];
            const Icon = c.Icon;
            return (
              <div
                key={c.title}
                className="bg-white rounded-xl border border-[#e8edf2] shadow-sm hover:shadow-md hover:border-[#1f6f54]/30 hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-2.5 p-4 w-[210px] lg:w-auto relative"
              >
                {/* Top row: icon + impact badge */}
                <div className="flex items-start justify-between gap-1">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: c.iconBg }}
                  >
                    <Icon style={{ color: c.iconColor, width: 18, height: 18 }}/>
                  </div>
                  {/* Impact badge */}
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-bold leading-none shrink-0"
                    style={{ background: imp.bg, color: imp.text }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: imp.dot }}/>
                    {c.impactLabel}
                  </span>
                </div>

                {/* Text */}
                <div className="flex flex-col gap-1 flex-1">
                  <p className="text-[13px] font-bold text-[#171717] leading-snug">{c.title}</p>
                  <p className="text-[11px] text-[#68747a] leading-relaxed">{c.benefit}</p>
                </div>

                {/* CTA */}
                <button className="mt-auto flex items-center gap-1 text-[11.5px] font-semibold hover:gap-2 transition-all duration-150 w-fit" style={{ color: imp.text }}>
                  {c.ctaLabel} <ArrowRight size={11} strokeWidth={2.5}/>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Public exports ────────────────────────────────────────────────────────────

export function Day10ResearcherDashboard() {
  return (
    <div className="space-y-5 pb-12 max-w-[1200px] mx-auto px-4 sm:px-0">
      <Day10HeroSection profileType="researcher" />
      <OpportunityPipelineSection profileType="researcher" />
      <TrendingOpportunitiesSection profileType="researcher" />
      <DemandDiscoverySection profileType="researcher" />
      <Day10OptimizeSection profileType="researcher" />
    </div>
  );
}

export function Day10CRODashboard() {
  return (
    <div className="space-y-5 pb-12 max-w-[1200px] mx-auto px-4 sm:px-0">
      <Day10HeroSection profileType="cro" />
      <OpportunityPipelineSection profileType="cro" />
      <TrendingOpportunitiesSection profileType="cro" />
      <DemandDiscoverySection profileType="cro" />
      <Day10OptimizeSection profileType="cro" />
    </div>
  );
}
