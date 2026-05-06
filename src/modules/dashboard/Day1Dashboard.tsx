"use client";

/**
 * ─── Day 1 Dashboard ───────────────────────────────────────────────────────────
 * Hero section + Collapsible Profile Completion Panel for Researcher & CRO profiles.
 * This is the "profile submitted / under review" state dashboard.
 *
 * Exports:
 *   Day1ResearcherDashboard
 *   Day1CRODashboard
 */

// ─── Re-use Day 0 sections (identical content in Day 1) ───────────────────────
import {
  ActivationBanner  as ResearcherActivationBanner,
  OpenProjects      as ResearcherOpenProjects,
  QuickWins         as ResearcherQuickWins,
  Testimonials      as ResearcherTestimonials,
  TalkToExpert      as ResearcherTalkToExpert,
} from "@/modules/dashboard/ResearcherDashboard";

import {
  ActivationBanner  as CROActivationBanner,
  OpenProjects      as CROOpenProjects,
  QuickWins         as CROQuickWins,
  Testimonials      as CROTestimonials,
  TalkToExpert      as CROTalkToExpert,
} from "@/modules/dashboard/CRODashboard";

import {
  useState, useEffect, useMemo, useRef,
} from "react";
import {
  ArrowRight, Check, X,
  FileText, Award, ShieldCheck, Wrench,
  Building2, Package, Microscope, Shield, Zap,
  Filter, TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Primitive types ───────────────────────────────────────────────────────────

type ProfileType   = "researcher" | "cro";
type ProfileStatus = "incomplete" | "submitted" | "verified";

interface Mission {
  id: string;
  title: string;
  subtitle: string;
  contribution: number;
  Icon: LucideIcon;
  badge: string;
  badgeEmoji: string;
  iconBg: string;
  iconColor: string;
  earnedLabel: string;
  completionMessage: string;
  confettiText: string;
}

// ─── Researcher missions ───────────────────────────────────────────────────────

const RESEARCHER_MISSIONS: Mission[] = [
  {
    id: "profile",
    title: "Profile",
    subtitle: "Add your academic, institutional, and research identity",
    contribution: 30,
    Icon: FileText,
    badge: "Explorer",
    badgeEmoji: "🗺️",
    iconBg: "#eff6ff",
    iconColor: "#2563eb",
    earnedLabel: "Earned",
    completionMessage: "You're now visible in initial matching",
    confettiText: "Your research identity is now set",
  },
  {
    id: "capability",
    title: "Research & Expertise",
    subtitle: "Define your domains, techniques, and areas of specialization",
    contribution: 30,
    Icon: Wrench,
    badge: "Visible Researcher",
    badgeEmoji: "🔬",
    iconBg: "#fffbeb",
    iconColor: "#d97706",
    earnedLabel: "Earned",
    completionMessage: "Your expertise will now be mapped to relevant opportunities",
    confettiText: "Your expertise is now discoverable for relevant opportunities",
  },
  {
    id: "track",
    title: "Track Record",
    subtitle: "Add publications, patents, and prior work",
    contribution: 20,
    Icon: Award,
    badge: "Industry Ready",
    badgeEmoji: "🏭",
    iconBg: "#f3f0ff",
    iconColor: "#7c3aed",
    earnedLabel: "Earned",
    completionMessage: "Your past work now strengthens your credibility",
    confettiText: "Your track record is now part of your profile",
  },
  {
    id: "terms",
    title: "Terms & Documentation",
    subtitle: "Complete required agreements and get secured collaboration",
    contribution: 20,
    Icon: ShieldCheck,
    badge: "Verified Partner",
    badgeEmoji: "✅",
    iconBg: "#dff3ee",
    iconColor: "#1f6f54",
    earnedLabel: "Verified",
    completionMessage: "You're now eligible for high-trust research collaborations",
    confettiText: "Your profile is now compliant and secured via Scinode",
  },
];

// ─── CRO missions (all 8 tabs) ─────────────────────────────────────────────────

const CRO_MISSIONS: Mission[] = [
  {
    id: "company",
    title: "Company Profile",
    subtitle: "Define your organisation, team size, and core research focus areas",
    contribution: 20,
    Icon: Building2,
    badge: "Listed Lab",
    badgeEmoji: "🧪",
    iconBg: "#eff6ff",
    iconColor: "#2563eb",
    earnedLabel: "Earned",
    completionMessage: "Your organisation is now visible to buyers and collaborators.",
    confettiText: "Your company profile is live",
  },
  {
    id: "products",
    title: "Products",
    subtitle: "List your ready-to-sell products to attract qualified product inquiries",
    contribution: 10,
    Icon: Package,
    badge: "Product Lister",
    badgeEmoji: "📦",
    iconBg: "#fffbeb",
    iconColor: "#d97706",
    earnedLabel: "Earned",
    completionMessage: "Your products are now discoverable to buyers actively searching.",
    confettiText: "Your products are now listed",
  },
  {
    id: "certifications",
    title: "License & Certifications",
    subtitle: "Showcase your regulatory compliance, GMP status, and quality certifications",
    contribution: 15,
    Icon: Award,
    badge: "Certified Lab",
    badgeEmoji: "🏅",
    iconBg: "#f3f0ff",
    iconColor: "#7c3aed",
    earnedLabel: "Earned",
    completionMessage: "Your compliance credentials are now visible to regulated buyers.",
    confettiText: "Your certifications are now verified",
  },
  {
    id: "services",
    title: "Services & Capabilities",
    subtitle: "Detail your technical services, synthesis expertise, and execution capabilities",
    contribution: 20,
    Icon: Wrench,
    badge: "Capable Partner",
    badgeEmoji: "🔬",
    iconBg: "#f0faf5",
    iconColor: "#1f6f54",
    earnedLabel: "Earned",
    completionMessage: "Your capabilities are now aligned for relevant project matches.",
    confettiText: "Your services are now discoverable",
  },
  {
    id: "equipment",
    title: "Equipment",
    subtitle: "List key instruments and equipment to signal your technical readiness to buyers",
    contribution: 10,
    Icon: Microscope,
    badge: "Equipped Lab",
    badgeEmoji: "⚗️",
    iconBg: "#eff6ff",
    iconColor: "#2563eb",
    earnedLabel: "Earned",
    completionMessage: "Your equipment inventory signals technical depth to buyers.",
    confettiText: "Your equipment is now listed",
  },
  {
    id: "facility",
    title: "Facility & EHS",
    subtitle: "Detail your facility size, safety standards, and environmental compliance",
    contribution: 10,
    Icon: Shield,
    badge: "EHS Compliant",
    badgeEmoji: "🛡️",
    iconBg: "#fffbeb",
    iconColor: "#d97706",
    earnedLabel: "Earned",
    completionMessage: "Your facility and safety standards are now visible to compliance-conscious buyers.",
    confettiText: "Your facility details are now on record",
  },
  {
    id: "utility",
    title: "Utility",
    subtitle: "Describe available utilities to confirm your operational readiness for complex projects",
    contribution: 5,
    Icon: Zap,
    badge: "Ready Lab",
    badgeEmoji: "⚡",
    iconBg: "#f3f0ff",
    iconColor: "#7c3aed",
    earnedLabel: "Earned",
    completionMessage: "Your utility details confirm your operational readiness.",
    confettiText: "Your utility profile is complete",
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    subtitle: "Complete agreements to enable trusted, verified collaboration requests",
    contribution: 10,
    Icon: ShieldCheck,
    badge: "Verified CRO",
    badgeEmoji: "✅",
    iconBg: "#dff3ee",
    iconColor: "#1f6f54",
    earnedLabel: "Secured",
    completionMessage: "Your profile is now ready for trusted collaboration with verified partners.",
    confettiText: "Your profile is now compliant and secured via Scinode",
  },
];

// ─── Day 1 milestones — same labels for both profiles (per spec) ──────────────

const DAY1_MILESTONES = [
  { name: "Explorer",           threshold: 0   },
  { name: "Visible Researcher", threshold: 30  },
  { name: "Industry Ready",     threshold: 60  },
  { name: "Verified Partner",   threshold: 100 },
] as const;

// ─── Live industry intelligence data ──────────────────────────────────────────

interface IndustryDatum {
  name:        string;
  total:       number;
  newThisWeek: number;
  growth:      number;          // % vs last week
  demand:      "High" | "Rising" | "Steady";
  insight:     string;
  sparkline:   number[];        // 7 normalised points 0–1 (upward trend)
}

const INDUSTRIES: IndustryDatum[] = [
  { name: "Pharmaceutical",        total: 230, newThisWeek: 5, growth: 12, demand: "High",   insight: "Demand rising for process optimisation and formulation collaborations",    sparkline: [0.40,0.50,0.48,0.55,0.62,0.70,0.78] },
  { name: "Agrochemicals",         total: 185, newThisWeek: 8, growth:  9, demand: "High",   insight: "Crop protection and biostimulant R&D opportunities trending upward",       sparkline: [0.45,0.52,0.60,0.58,0.65,0.75,0.85] },
  { name: "Industrial Chemicals",  total: 142, newThisWeek: 6, growth:  7, demand: "High",   insight: "Scale-up and green chemistry projects actively seeking partners",           sparkline: [0.50,0.55,0.58,0.62,0.65,0.70,0.76] },
  { name: "Food & Nutrition",      total: 121, newThisWeek: 4, growth:  6, demand: "Rising", insight: "Clean label formulation and functional ingredients in high demand",         sparkline: [0.48,0.52,0.55,0.58,0.62,0.67,0.72] },
  { name: "Flavors & Fragrances",  total:  94, newThisWeek: 4, growth:  5, demand: "Rising", insight: "Natural extraction and encapsulation expertise sought globally",            sparkline: [0.40,0.45,0.48,0.52,0.55,0.60,0.65] },
  { name: "Beauty & Personal Care",total:  76, newThisWeek: 3, growth:  4, demand: "Rising", insight: "Sustainable formulation and green chemistry projects growing fast",         sparkline: [0.42,0.46,0.50,0.52,0.55,0.60,0.64] },
  { name: "Dyes & Pigments",       total:  67, newThisWeek: 2, growth:  3, demand: "Steady", insight: "Specialty colorant and textile dye R&D collaborations active",             sparkline: [0.38,0.42,0.45,0.48,0.52,0.55,0.58] },
  { name: "Oleochemicals",         total:  53, newThisWeek: 2, growth:  4, demand: "Steady", insight: "Bio-based feedstock processing and fatty acid R&D trending",               sparkline: [0.35,0.40,0.42,0.45,0.48,0.52,0.55] },
  { name: "Flame Retardants",      total:  41, newThisWeek: 1, growth:  2, demand: "Steady", insight: "Halogen-free formulation development gaining industry traction",            sparkline: [0.30,0.35,0.38,0.40,0.42,0.44,0.46] },
  { name: "Metallurgy Chemicals",  total:  38, newThisWeek: 2, growth:  2, demand: "Steady", insight: "Surface treatment and corrosion-resistant coating projects listed",         sparkline: [0.32,0.36,0.38,0.40,0.42,0.45,0.46] },
  { name: "Elemental Derivatives", total:  29, newThisWeek: 1, growth:  1, demand: "Steady", insight: "High-purity synthesis and rare earth derivative projects emerging",         sparkline: [0.28,0.32,0.34,0.36,0.38,0.40,0.42] },
];

const IND_MAX = 230;

const DEMAND_CFG: Record<"High"|"Rising"|"Steady", { bg: string; color: string; border: string; dot: string }> = {
  High:   { bg: "#dcfce7", color: "#15803d", border: "#86efac", dot: "#22c55e" },
  Rising: { bg: "#fef9c3", color: "#a16207", border: "#fde68a", dot: "#f59e0b" },
  Steady: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
};

const DEMAND_CONFIDENCE: Record<"High"|"Rising"|"Steady", number> = {
  High: 92, Rising: 74, Steady: 55,
};

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ProfileStatus, {
  label: string; bg: string; border: string; color: string; dot: string;
  message: string; stripBg: string; stripBorder: string; stripText: string;
}> = {
  incomplete: {
    label:       "Incomplete",
    bg:          "#f1f5f9",  border:      "#cbd5e1",
    color:       "#64748b",  dot:         "#94a3b8",
    message:     "Complete remaining sections to unlock verification",
    stripBg:     "#f8fafc",  stripBorder: "#e2e8f0",
    stripText:   "Complete remaining sections to unlock verification",
  },
  submitted: {
    label:       "Under Review",
    bg:          "#fffbeb",  border:      "#fcd34d",
    color:       "#b45309",  dot:         "#f59e0b",
    message:     "Our team is reviewing your profile",
    stripBg:     "#fffdf5",  stripBorder: "#fde68a",
    stripText:   "Your profile is currently being verified",
  },
  verified: {
    label:       "Verified",
    bg:          "#dff3ee",  border:      "#86efac",
    color:       "#166534",  dot:         "#22c55e",
    message:     "You can now access matched opportunities",
    stripBg:     "#f0fdf4",  stripBorder: "#86efac",
    stripText:   "Matched opportunities are now unlocked",
  },
};

// ─── Helper: dynamic subtext ───────────────────────────────────────────────────

function getProfileSubtext(progress: number, status: ProfileStatus): string {
  if (status === "verified")  return "Your profile is verified and active";
  if (status === "submitted") return "Your profile is under verification";
  if (progress === 0)         return "Your profile is getting started";
  if (progress <= 25)         return "Your profile is getting started";
  if (progress <= 50)         return "Your profile is taking shape";
  if (progress <= 80)         return "You're becoming visible to relevant opportunities";
  return "You're almost ready for matching";
}

// ─── Confetti particles ────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#4ade80","#1f6f54","#2563eb","#d97706","#7c3aed","#f59e0b","#ec4899","#34d399"];
const CONFETTI_PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  color:   CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size:    [4, 7, 5, 6][i % 4],
  delay:   i * 38,
  animIdx: i % 8,
}));

function Confetti() {
  return (
    <>
      {CONFETTI_PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute pointer-events-none rounded-sm"
          style={{
            left: "50%", top: "45%",
            width: p.size, height: p.size,
            marginLeft: -p.size / 2, marginTop: -p.size / 2,
            background: p.color,
            animation: `d1cf${p.animIdx} 1.3s cubic-bezier(0.1,0.8,0.2,1) ${p.delay}ms forwards`,
          }}
        />
      ))}
    </>
  );
}

// ─── Progress ring — large (110 px for compact card) ──────────────────────────

function ProgressRingLg({ value }: { value: number }) {
  const size   = 110;
  const stroke = 9;
  const r      = (size - stroke) / 2;
  const c      = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="d1-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1f6f54" />
            <stop offset="100%" stopColor="#4ed589" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="#e8f0ec" strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke="url(#d1-ring-grad)" strokeWidth={stroke}
          strokeLinecap="round" fill="none"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[20px] font-bold text-[#171717] leading-none">{value}%</span>
        <span className="mt-0.5 text-[10px] font-semibold text-[#68747a] tracking-wide">Profile Strength</span>
      </div>
    </div>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProfileStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 whitespace-nowrap"
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ─── Milestone timeline ────────────────────────────────────────────────────────
// Nodes and connectors are direct flex children so the 4 nodes sit symmetrically
// at equal distances from both card edges, with equal-length connectors between.

function MilestoneTimeline({ progress }: { progress: number }) {
  return (
    <div className="flex items-start w-full">
      {DAY1_MILESTONES.map((ms, i) => {
        const reached  = progress >= ms.threshold;
        const isActive = i < DAY1_MILESTONES.length - 1
          ? progress >= ms.threshold && progress < DAY1_MILESTONES[i + 1].threshold
          : progress >= ms.threshold;
        const isDone = reached && !isActive;

        return (
          // React.Fragment gives each milestone node + its trailing connector
          // a shared key while keeping both as direct flex children.
          <div key={ms.name} className="contents">
            {/* ── Node + label (shrink-0 — fixed width, always its natural size) ── */}
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                style={
                  isDone
                    ? { background: "#1f6f54", borderColor: "#1f6f54" }
                    : isActive
                      ? { background: "white", borderColor: "#f59e0b", boxShadow: "0 0 0 2px rgba(245,158,11,0.18)" }
                      : { background: "white", borderColor: "#cbd5e1" }
                }
              >
                {isDone ? (
                  <Check className="w-2 h-2 text-white" strokeWidth={3} />
                ) : isActive ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>
              {/* Label — each word on its own line so it's narrow and centers cleanly */}
              <div className={cn(
                "text-[7.5px] font-semibold text-center leading-tight mt-0.5",
                isDone   ? "text-[#1f6f54]" :
                isActive ? "text-amber-600" :
                           "text-slate-400",
              )}>
                {ms.name.split(" ").map((w, wi) => (
                  <span key={wi} className="block">{w}</span>
                ))}
              </div>
            </div>

            {/* ── Connector (flex-1 — equal width between all pairs of nodes) ── */}
            {i < DAY1_MILESTONES.length - 1 && (
              <div
                className="flex-1 h-px mt-2 mx-1.5 transition-colors duration-300"
                style={{ background: progress > ms.threshold ? "#1f6f54" : "#e2e8f0" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 px-5 py-3 bg-[#1f6f54] text-white text-sm font-medium rounded-2xl shadow-2xl">
        <span className="text-lg">🎉</span>
        {message}
      </div>
    </div>
  );
}

// ─── Drawer mission row (accordion) ───────────────────────────────────────────

function DrawerMissionRow({
  mission, done, open, onToggle, onComplete,
}: {
  mission: Mission;
  done: boolean;
  open: boolean;
  onToggle: () => void;
  onComplete: () => void;
}) {
  const Icon = mission.Icon;
  return (
    <div className={cn(
      "rounded-xl border transition-all duration-200",
      done
        ? "border-[#1f6f54]/25 bg-[#f0faf5]/60"
        : open
          ? "border-[#1f6f54]/20 bg-[#f8fafc]"
          : "border-transparent hover:bg-[#f8fafc]",
    )}>
      {/* Row header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-2.5 py-2.5 text-left"
      >
        {/* Icon */}
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200"
          style={done
            ? { background: "#1f6f54", color: "#ffffff" }
            : { background: mission.iconBg, color: mission.iconColor }
          }
        >
          {done
            ? <Check className="h-4 w-4" strokeWidth={2.5} />
            : <Icon className="h-3.5 w-3.5" />
          }
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#171717]">{mission.title}</p>
          {done ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0 inline-flex items-center rounded-full bg-[#dff3ee] px-1.5 py-0.5 text-[9px] font-bold text-[#1f6f54] border border-[#1f6f54]/20">
                {mission.earnedLabel}
              </span>
              <p className="truncate text-[11px] font-medium text-[#2563eb]">
                {mission.completionMessage}
              </p>
            </div>
          ) : (
            <p className="truncate text-[11px] text-[#68747a]">{mission.subtitle}</p>
          )}
        </div>

        {/* Contribution chip */}
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold transition-all duration-300",
            done ? "text-white" : "bg-[#dff3ee] text-[#1f6f54]",
          )}
          style={done ? {
            background: "linear-gradient(135deg,#1f6f54,#2d9e70)",
            boxShadow: "0 0 0 2px rgba(31,111,84,0.15)",
          } : undefined}
        >
          {done ? `+${mission.contribution}% Added` : `+${mission.contribution}%`}
        </span>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="border-t border-slate-100 px-3 py-2.5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {done ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg,#1f6f54,#2d9e70)" }}
                  >
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-[12px] font-bold text-[#1f6f54]">{mission.earnedLabel}</p>
                </div>
                <div
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-[#1f6f54]"
                  style={{ background: "#dff3ee", boxShadow: "0 0 0 2px rgba(31,111,84,0.12)" }}
                >
                  {mission.badgeEmoji} {mission.badge}
                </div>
              </div>
              <p className="text-[12px] font-medium leading-snug text-[#2563eb]">
                {mission.completionMessage}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] text-[#68747a]">
                Unlocks{" "}
                <span className="font-semibold text-[#1f6f54]">
                  {mission.badgeEmoji} {mission.badge}
                </span>{" "}
                badge
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onComplete(); }}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors w-fit"
              >
                Complete section <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Profile details drawer ────────────────────────────────────────────────────

function ProfileDetailsDrawer({
  open, onClose,
  missions, completed, expanded, onToggle, onComplete,
  progress, status, celebrating,
}: {
  open: boolean;
  onClose: () => void;
  missions: Mission[];
  completed: Record<string, boolean>;
  expanded: string | null;
  onToggle: (id: string) => void;
  onComplete: (m: Mission) => void;
  progress: number;
  status: ProfileStatus;
  celebrating: Mission | null;
}) {
  const cfg = STATUS_CONFIG[status];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-all duration-300"
        style={{
          background:      open ? "rgba(0,0,0,0.38)" : "transparent",
          backdropFilter:  open ? "blur(4px)"         : "none",
          pointerEvents:   open ? "auto"              : "none",
        }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white shadow-2xl"
        style={{
          width: "min(460px, 100vw)",
          transform:  open ? "translateX(0)"     : "translateX(100%)",
          transition: "transform 320ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold text-[#171717]">Profile Completion Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track progress across all profile sections</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Status strip */}
        <div
          className="px-5 py-2.5 flex flex-wrap items-center gap-2.5 shrink-0 border-b border-slate-100"
          style={{ background: cfg.bg }}
        >
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
            style={{ background: "white", borderColor: cfg.border, color: cfg.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
            {cfg.label}
          </span>
          <p className="text-[11px] text-slate-600 flex-1">{cfg.message}</p>
          <div className="ml-auto shrink-0">
            <span className="text-[13px] font-bold" style={{ color: cfg.color }}>{progress}%</span>
            <span className="text-[11px] text-slate-400 ml-1">complete</span>
          </div>
        </div>

        {/* Celebration overlay — inside drawer */}
        {celebrating && (
          <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(10,22,15,0.88)", backdropFilter: "blur(6px)" }}
          >
            <Confetti />
            <div className="relative z-10 text-center px-6 flex flex-col items-center gap-2">
              <span className="text-4xl">🎉</span>
              <p className="text-white font-bold text-[17px] leading-snug mt-1">
                {celebrating.confettiText}
              </p>
              <p className="text-[#9fcfba] text-[13px] leading-snug">
                +{celebrating.contribution}% profile strength added
              </p>
              <div
                className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold text-[#4ade80] border border-[#4ade80]/35"
                style={{ background: "rgba(74,222,128,0.15)" }}
              >
                {celebrating.badgeEmoji} {celebrating.badge} badge earned
              </div>
            </div>
          </div>
        )}

        {/* Mission list — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 d1-drawer-scroll">
          <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
            Profile Breakdown
          </p>
          {missions.map((m) => (
            <DrawerMissionRow
              key={m.id}
              mission={m}
              done={!!completed[m.id]}
              open={expanded === m.id}
              onToggle={() => onToggle(m.id)}
              onComplete={() => onComplete(m)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Compact profile card (right panel) ───────────────────────────────────────
// Stretches to match the left hero panel height via h-full + internal flex.

function CompactProfileCard({
  progress, status, onOpenDrawer,
}: {
  progress: number;
  status: ProfileStatus;
  onOpenDrawer: () => void;
}) {
  const cfg = STATUS_CONFIG[status];

  const activeLevel = useMemo(() => {
    let lv: (typeof DAY1_MILESTONES)[number] = DAY1_MILESTONES[0];
    for (const m of DAY1_MILESTONES) {
      if (progress >= m.threshold) lv = m;
    }
    return lv;
  }, [progress]);

  const isComplete = progress === 100;

  return (
    <div className="bg-white rounded-xl border border-[#cfd8dc] shadow-md flex flex-col w-full lg:w-[350px] h-full overflow-hidden">

      {/* ── 1. Top status strip (40 px, full-width tinted banner) ── */}
      <div
        className="flex items-center justify-between gap-3 px-4 shrink-0 border-b"
        style={{ height: 40, background: cfg.stripBg, borderColor: cfg.stripBorder }}
      >
        {/* Left: dot + label */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.dot }} />
          <span className="text-[11px] font-bold" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
        {/* Right: support text */}
        <p className="text-[9.5px] text-[#68747a] text-right leading-tight max-w-[55%]">
          {cfg.stripText}
        </p>
      </div>

      {/* ── 2. Ring (left) + title/subtext/badge (right) ─────────────────────────
              flex-1 so this section absorbs any extra height when the left hero
              panel is taller; items-center keeps content vertically centred.    */}
      <div className="flex-1 flex items-center gap-4 px-4 py-4 min-h-[140px] border-b border-slate-100">
        {/* Progress ring — fixed size, always on the left */}
        <div className="shrink-0">
          <ProgressRingLg value={progress} />
        </div>

        {/* Text block — fills remaining space on the right */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <p className="text-[13.5px] font-bold text-[#171717] leading-snug">
            Profile Completion
          </p>
          <p className="text-[11px] text-[#68747a] leading-snug">
            {getProfileSubtext(progress, status)}
          </p>
          {/* Level badge */}
          <div className="inline-flex items-center gap-1 self-start rounded-full bg-[#dff3ee] px-2.5 py-0.5 text-[10px] font-bold text-[#1f6f54] border border-[#1f6f54]/15">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ed589] shrink-0" />
            {activeLevel.name}
            <span className="opacity-60">• Active</span>
          </div>
        </div>
      </div>

      {/* ── 3. Milestone timeline — or 100% success state ── */}
      <div className="px-4 py-3.5 shrink-0">
        {isComplete ? (
          <div className="text-center flex flex-col gap-1.5">
            <p className="text-[13px] font-bold text-[#1f6f54]">🎉 Congratulations</p>
            <p className="text-[11px] font-medium text-[#171717] leading-snug">
              You&apos;ve completed your profile. It is now under verification.
            </p>
            <p className="text-[10px] text-[#68747a] leading-snug">
              You&apos;ll be notified once approved and matched opportunities unlock.
            </p>
          </div>
        ) : (
          <MilestoneTimeline progress={progress} />
        )}
      </div>

      {/* ── 4. See all details CTA ── */}
      <div className="px-4 py-3 border-t border-slate-100 flex justify-center shrink-0">
        <button
          onClick={onOpenDrawer}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors group"
        >
          <span className="underline underline-offset-2 group-hover:no-underline">
            See all details
          </span>
          <ArrowRight size={10} />
        </button>
      </div>
    </div>
  );
}

// ─── Hero left panel ───────────────────────────────────────────────────────────

function HeroLeftPanel({ profileType }: { profileType: ProfileType }) {
  const [tipVisible, setTipVisible] = useState(false);

  const isResearcher  = profileType === "researcher";
  const primaryCTA    = isResearcher ? "Complete Your Research Profile"  : "Complete Your Technical Profile";
  const secondaryCTA  = isResearcher ? "Explore Opportunities"           : "View Matched Projects";
  const heroSubtext   = isResearcher
    ? "You\u2019re a few steps away from shaping global innovation and driving your next breakthrough."
    : "You\u2019re a few steps away from tapping into global demand and securing high-impact collaborations.";

  return (
    <section
      className="relative overflow-hidden rounded-xl border border-white/[0.08] flex-1 h-full"
      style={{ background: "linear-gradient(125deg,#002d16 0%,#001a0a 50%,#081625 100%)" }}
    >
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute -top-24 left-[30%] w-96 h-96 rounded-full opacity-25"
        style={{ background: "radial-gradient(circle,#1db877 0%,transparent 70%)", filter: "blur(64px)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle,#3b82f6 0%,transparent 70%)", filter: "blur(48px)" }}
      />

      <div className="relative z-10 px-6 pt-5 pb-6 sm:px-8 sm:pt-6 flex flex-col gap-4 h-full">

        {/* ── SCINODE Secure pill ── */}
        <div className="relative inline-block self-start">
          <button
            type="button"
            className="relative overflow-hidden flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-emerald-200/90 border border-emerald-400/20 hover:border-emerald-400/50 hover:scale-[1.03] hover:shadow-[0_0_18px_rgba(74,222,128,0.22)] transition-all duration-200"
            style={{ background: "rgba(20,55,30,0.90)" }}
            onMouseEnter={() => setTipVisible(true)}
            onMouseLeave={() => setTipVisible(false)}
          >
            {/* Shimmer sweep */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.11) 50%,transparent 70%)",
                backgroundSize: "200% 100%",
                animation: "d1-badgeShimmer 3.5s ease-in-out infinite",
              }}
            />
            <span className="relative z-10">🔒</span>
            <span className="relative z-10 font-bold tracking-wide">SCINODE Secure</span>
          </button>

          {/* Tooltip */}
          <div
            className="absolute left-0 top-full mt-2 z-20 w-[268px] pointer-events-none"
            style={{
              opacity:   tipVisible ? 1 : 0,
              transform: tipVisible ? "translateY(0px)" : "translateY(-4px)",
              transition: "opacity 200ms ease, transform 200ms ease",
            }}
          >
            <div className="bg-[#1e293b] text-white text-[11px] leading-relaxed rounded-[10px] px-3.5 py-2.5 shadow-2xl border border-white/10">
              <div className="absolute bottom-full left-5 border-[5px] border-transparent border-b-[#1e293b]" />
              <p className="font-semibold mb-0.5">Sign out</p>
              <p>Ensure your data and IP remain encrypted and access-controlled at every step.</p>
            </div>
          </div>
        </div>

        {/* ── H1 ── */}
        <h1
          className="text-[22px] sm:text-[27px] md:text-[31px] font-bold text-white leading-[1.2] tracking-[-0.02em]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Unlock Global R&amp;D Opportunities and
          <br className="hidden md:block" />
          {" "}Fuel Your Next Innovation
        </h1>

        {/* ── Subtext ── */}
        <p className="text-[#8faabb] text-[13px] sm:text-sm leading-relaxed max-w-[500px]">
          {heroSubtext}
        </p>

        {/* ── CTAs ── */}
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1f6f54] hover:bg-[#185c45] active:bg-[#144d3a] text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70">
            {primaryCTA} <ArrowRight size={15} strokeWidth={2.5} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-white/25 text-white/90 text-sm font-semibold rounded-lg hover:bg-white/10 hover:border-white/40 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
            {secondaryCTA} <ArrowRight size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, idx }: { data: number[]; idx: number }) {
  const W = 72, H = 28;
  // Map normalised 0–1 values to canvas coords (2px vertical padding)
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - 2 - v * (H - 4),
  }));
  // Smooth cubic bezier path
  const linePath = pts.map((p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const pr = pts[i - 1];
    const cpx = ((pr.x + p.x) / 2).toFixed(1);
    return `C ${cpx},${pr.y.toFixed(1)} ${cpx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");
  const fillPath = `${linePath} L ${W},${H} L 0,${H} Z`;
  const gid = `spk-g-${idx}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1f6f54" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1f6f54" stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gid})`} />
      <path d={linePath} fill="none" stroke="#1f6f54" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
      {/* Last-point dot */}
      <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y}
              r="2.5" fill="#1f6f54" />
    </svg>
  );
}

// ─── Live industry data section ────────────────────────────────────────────────

function LiveIndustryDataSection({ status }: { status: ProfileStatus }) {
  const [selected, setSelected] = useState(0);
  const [hovered,  setHovered]  = useState<number | null>(null);
  const [loaded,   setLoaded]   = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Trigger bar entry animation on scroll into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setLoaded(true); obs.disconnect(); } },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const activeIdx = hovered ?? selected;
  const active    = INDUSTRIES[activeIdx];
  const dcfg      = DEMAND_CFG[active.demand];
  const confidence = DEMAND_CONFIDENCE[active.demand];

  // Dynamic copy based on status
  const subtext =
    status === "verified"
      ? "Your profile is active. Explore and apply to opportunities aligned with your expertise."
      : status === "submitted"
      ? "Real-time project demand is rising across high-value R&D sectors. Explore active opportunities while verification is in progress."
      : "Complete your profile to activate access to high-value opportunities across active R&D sectors.";

  const ctaLabel =
    status === "verified"  ? "Explore projects"
    : status === "submitted" ? "Awaiting verification"
    : "Complete your profile";

  const ctaDisabled = status === "submitted";

  return (
    <section
      ref={sectionRef}
      className="group relative overflow-hidden rounded-2xl border-2 border-[#0e6f5c] bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      {/* ── Gradient blobs — same visual language as Day 0 "400+" card ── */}
      <div className="pointer-events-none absolute -bottom-10 -left-12 w-[280px] h-[300px] opacity-[0.13]"
        style={{ background: "radial-gradient(ellipse at 40% 60%,#2DD17C 0%,#1FB39D 30%,#0F90C6 65%,#0172E7 100%)", filter: "blur(44px)", borderRadius: "50%" }} />
      <div className="pointer-events-none absolute -top-10 -right-10 w-[260px] h-[280px] opacity-[0.10]"
        style={{ background: "linear-gradient(180deg,#0E6F5C 0%,#1ABC9C 100%)", filter: "blur(48px)", borderRadius: "50%" }} />

      <div className="relative z-10 p-4 sm:p-5 flex flex-col gap-3.5">

        {/* ── Top live capsule ── */}
        <div className="self-start flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1f6f54]/25 bg-[#f0faf5]">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
          </span>
          <span className="text-[11px] font-bold tracking-[0.12em] text-[#1f6f54] uppercase">Live Industry Data</span>
          <div className="flex items-center gap-[3px] ml-0.5">
            {[0,1,2].map(i => (
              <span key={i} className="w-1 h-1 rounded-full bg-[#1f6f54]/35"
                style={{ animation: `d1-stream 1.6s ease-in-out ${i * 0.28}s infinite` }} />
            ))}
          </div>
        </div>

        {/* ── Section header ── */}
        <div className="flex flex-col gap-1">
          <h2 className="text-lg sm:text-xl font-bold text-[#171717] leading-snug"
            style={{ fontFamily: "Poppins, sans-serif" }}>
            🔥 Trending open opportunities you might be missing
          </h2>
          <p className="text-[12.5px] text-[#68747a] leading-relaxed max-w-[680px]">{subtext}</p>
        </div>

        {/* ── Intelligence banner strip ── */}
        <div className="flex flex-col sm:flex-row rounded-xl border border-[#e2e8f0] overflow-hidden"
          style={{ background: "linear-gradient(135deg,#f8fafc 0%,#f0fdf7 100%)" }}>

          {/* Left: market signals */}
          <div className="flex-1 px-4 py-3 flex flex-col gap-0 border-b sm:border-b-0 sm:border-r border-[#e2e8f0]">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#94a3b8] mb-1">Active Market Signals</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-black text-[#171717] leading-none">46+</span>
              <span className="text-[12px] font-bold text-[#1f6f54]">Active R&amp;D Opportunities</span>
            </div>
            <p className="text-[11px] text-[#68747a] mt-0.5">Across 11 high-demand industries</p>
          </div>

          {/* Center: weekly pulse */}
          <div className="flex-1 px-4 py-3 flex flex-col gap-0 border-b sm:border-b-0 sm:border-r border-[#e2e8f0]">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#94a3b8] mb-1">This Week</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-black text-[#171717] leading-none">10</span>
              <span className="text-[12px] font-bold text-[#1f6f54]">New Projects Added</span>
              <span className="relative flex h-1.5 w-1.5 shrink-0 mb-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              </span>
            </div>
            <p className="text-[11px] text-[#68747a] mt-0.5">Updated in real-time</p>
          </div>

          {/* Right: CTA */}
          <div className="flex-1 px-4 py-3 flex flex-col justify-center gap-1">
            <button
              className={cn(
                "text-[12.5px] font-bold text-left flex items-center gap-1 transition-colors",
                ctaDisabled
                  ? "text-[#94a3b8] cursor-not-allowed"
                  : "text-[#2563eb] hover:text-[#1d4ed8]",
              )}
            >
              {ctaLabel} {!ctaDisabled && <ArrowRight size={11} />}
            </button>
            <p className="text-[10.5px] text-[#94a3b8] leading-snug">
              Verification required to apply for projects
            </p>
          </div>
        </div>

        {/* ── Main visualisation card ── */}
        <div className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden">

          {/* Graph header */}
          <div className="flex items-start px-4 py-3 border-b border-[#f1f5f9]">
            <div>
              <h3 className="text-[14px] font-bold text-[#171717]" style={{ fontFamily: "Poppins, sans-serif" }}>
                Opportunities by industry
              </h3>
              <p className="text-[11px] text-[#94a3b8] mt-0.5">
                Hover any bar to see weekly growth and unlock insights →
              </p>
            </div>
          </div>

          {/* 70 / 30 split */}
          <div className="flex flex-col lg:flex-row">

            {/* ── LEFT: Bar chart ── */}
            <div className="flex-[7] px-4 py-3 border-b lg:border-b-0 lg:border-r border-[#f1f5f9]">
              <div className="flex flex-col gap-[5px]">
                {INDUSTRIES.map((ind, i) => {
                  const isActive  = i === activeIdx;
                  const totalPct  = (ind.total / IND_MAX) * 100;
                  const newFrac   = ind.newThisWeek / ind.total; // portion of bar that's "new"
                  const entryDelay = i * 45;                     // stagger ms

                  return (
                    <div
                      key={ind.name}
                      className="flex items-center gap-3 cursor-pointer"
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setSelected(i)}
                    >
                      {/* Label */}
                      <div className={cn(
                        "shrink-0 w-[150px] text-[11px] text-right leading-snug transition-colors duration-200",
                        isActive ? "font-bold text-[#171717]" : "font-medium text-[#64748b]",
                      )}>
                        {ind.name}
                      </div>

                      {/* Bar track */}
                      <div className="flex-1 relative h-[18px] rounded-full overflow-hidden"
                        style={{ background: "#edf2f5" }}>

                        {/* Hatch fill — visible when inactive, animates in on load */}
                        <div
                          className="absolute left-0 top-0 h-full rounded-full"
                          style={{
                            width: loaded ? `${totalPct}%` : "0%",
                            opacity: isActive ? 0 : 1,
                            transition: `width 620ms cubic-bezier(0.25,0.46,0.45,0.94) ${entryDelay}ms, opacity 240ms ease`,
                            backgroundImage: "repeating-linear-gradient(-45deg,#b8c8d2 0px,#b8c8d2 2px,#d4dde3 2px,#d4dde3 8px)",
                          }}
                        />

                        {/* Colour fill — visible when active, animates left-to-right */}
                        <div
                          className="absolute left-0 top-0 h-full rounded-full flex overflow-hidden"
                          style={{
                            width: (loaded && isActive) ? `${totalPct}%` : "0%",
                            opacity: isActive ? 1 : 0,
                            transition: "width 350ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 200ms ease",
                          }}
                        >
                          {/* Green — existing projects */}
                          <div className="h-full"
                            style={{ flex: `${1 - newFrac} 1 0`, background: "linear-gradient(90deg,#1a6b4f,#29a06a)" }} />
                          {/* Blue — newly added */}
                          <div className="h-full"
                            style={{ flex: `${newFrac} 1 0`, background: "#2563eb" }} />
                        </div>

                        {/* Glow on active */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-full pointer-events-none"
                            style={{ boxShadow: "0 0 10px rgba(31,111,84,0.28)" }} />
                        )}
                      </div>

                      {/* Count */}
                      <div className={cn(
                        "shrink-0 w-8 text-right text-[12px] tabular-nums transition-colors duration-200",
                        isActive ? "font-bold text-[#171717]" : "font-medium text-[#94a3b8]",
                      )}>
                        {ind.total}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-5 mt-2.5 pt-2.5 border-t border-[#f1f5f9]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm"
                    style={{ background: "linear-gradient(90deg,#1a6b4f,#29a06a)" }} />
                  <span className="text-[10px] text-[#68747a] font-medium">Total available projects</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#2563eb]" />
                  <span className="text-[10px] text-[#68747a] font-medium">Newly added this week</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Detail panel ── */}
            <div className="flex-[3] px-4 py-3.5 flex flex-col gap-2.5">

              {/* Active selection label */}
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#22c55e]">
                  Active Selection
                </span>
              </div>

              {/* Fade-swap when industry changes */}
              <div key={activeIdx} className="flex flex-col gap-3 animate-in fade-in duration-200">

                {/* Industry name + growth badge */}
                <div className="flex items-start gap-2.5 flex-wrap">
                  <span className="text-[20px] font-black text-[#171717] leading-tight"
                    style={{ fontFamily: "Poppins, sans-serif" }}>
                    {active.name}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#dcfce7] text-[#15803d] mt-0.5">
                    <TrendingUp size={10} />↗ +{active.growth}%
                  </span>
                </div>

                {/* Main metrics */}
                <div className="flex items-end gap-5">
                  <div>
                    <p className="text-[28px] font-black text-[#171717] leading-none tabular-nums">
                      {active.total}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#94a3b8] mt-1">
                      Total Projects
                    </p>
                  </div>
                  <div>
                    <p className="text-[28px] font-black text-[#22c55e] leading-none tabular-nums">
                      +{active.newThisWeek}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#94a3b8] mt-1">
                      Added This Week
                    </p>
                  </div>
                </div>

                {/* Growth trend + demand badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-[#68747a]">
                    ↑ +{active.growth}% vs last week
                  </span>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                    style={{ background: dcfg.bg, color: dcfg.color, borderColor: dcfg.border }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dcfg.dot }} />
                    {active.demand} Demand
                  </span>
                </div>

                {/* Sparkline */}
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#94a3b8]">
                    7-Day Trend
                  </p>
                  <Sparkline data={active.sparkline} idx={activeIdx} />
                </div>

                {/* Live insight box */}
                <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#22c55e]">Live Signal</span>
                  </div>
                  <p className="text-[11.5px] text-[#374151] leading-snug">{active.insight}</p>
                </div>

                {/* Demand confidence bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#94a3b8]">
                      Demand Confidence
                    </p>
                    <p className="text-[10px] font-bold text-[#1f6f54]">{confidence}%</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#f1f5f9] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${confidence}%`,
                        background: "linear-gradient(90deg,#1f6f54,#4ed589)",
                      }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <button
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12.5px] font-bold transition-all duration-200 w-full border",
                    status === "verified"
                      ? "bg-[#1f6f54] text-white border-transparent hover:bg-[#185c45] shadow-sm hover:shadow-md"
                      : status === "submitted"
                      ? "bg-[#f8fafc] text-[#94a3b8] border-[#e2e8f0] cursor-not-allowed"
                      : "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe] hover:bg-[#dbeafe]",
                  )}
                >
                  {ctaLabel}
                  {!ctaDisabled && <ArrowRight size={12} />}
                </button>

              </div>{/* /fade-swap */}
            </div>{/* /right panel */}
          </div>{/* /70-30 split */}
        </div>{/* /visualization card */}
      </div>{/* /content */}
    </section>
  );
}

// ─── Main inner container ──────────────────────────────────────────────────────

function Day1DashboardInner({ profileType }: { profileType: ProfileType }) {
  const missions = profileType === "researcher" ? RESEARCHER_MISSIONS : CRO_MISSIONS;

  const [completed,   setCompleted]   = useState<Record<string, boolean>>({});
  const [expanded,    setExpanded]    = useState<string | null>(null);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [celebrating, setCelebrating] = useState<Mission | null>(null);
  const [toast,       setToast]       = useState<string | null>(null);

  const progress = useMemo(
    () => missions.reduce((sum, m) => sum + (completed[m.id] ? m.contribution : 0), 0),
    [completed, missions],
  );

  const status: ProfileStatus = progress >= 100 ? "submitted" : "incomplete";

  // Auto-dismiss celebration overlay
  useEffect(() => {
    if (!celebrating) return;
    const t = setTimeout(() => setCelebrating(null), 2800);
    return () => clearTimeout(t);
  }, [celebrating]);

  const handleComplete = (m: Mission) => {
    if (completed[m.id]) return;
    setCompleted((prev) => ({ ...prev, [m.id]: true }));
    setExpanded(null);
    setCelebrating(m);
    setToast(`${m.badgeEmoji} ${m.badge} badge earned!`);
  };

  const handleToggle = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-5 pb-12 max-w-[1200px] mx-auto px-4 sm:px-0">

      {/* ── Global keyframes for Day 1 ── */}
      <style>{`
        @keyframes d1-badgeShimmer {
          0%, 100% { background-position: -200% center; }
          50%       { background-position:  200% center; }
        }
        @keyframes d1-stream {
          0%, 100% { opacity: 0.25; transform: scale(0.8); }
          50%       { opacity: 1;    transform: scale(1.2); }
        }
        @keyframes d1cf0 { to { transform: translate(-80px,-90px)  rotate(200deg)  scale(0.2); opacity: 0; } }
        @keyframes d1cf1 { to { transform: translate( 90px,-80px)  rotate(-150deg) scale(0.2); opacity: 0; } }
        @keyframes d1cf2 { to { transform: translate(-100px,40px)  rotate(180deg)  scale(0.2); opacity: 0; } }
        @keyframes d1cf3 { to { transform: translate( 85px, 70px)  rotate(-120deg) scale(0.2); opacity: 0; } }
        @keyframes d1cf4 { to { transform: translate(-50px,-110px) rotate(240deg)  scale(0.2); opacity: 0; } }
        @keyframes d1cf5 { to { transform: translate(110px,-50px)  rotate(-200deg) scale(0.2); opacity: 0; } }
        @keyframes d1cf6 { to { transform: translate( 60px, 100px) rotate(300deg)  scale(0.2); opacity: 0; } }
        @keyframes d1cf7 { to { transform: translate(-110px,60px)  rotate(-270deg) scale(0.2); opacity: 0; } }
        .d1-drawer-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .d1-drawer-scroll:hover { scrollbar-color: #e2e8f0 transparent; }
        .d1-drawer-scroll::-webkit-scrollbar { width: 3px; }
        .d1-drawer-scroll::-webkit-scrollbar-track { background: transparent; }
        .d1-drawer-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 9999px; }
        .d1-drawer-scroll:hover::-webkit-scrollbar-thumb { background: #e2e8f0; }
      `}</style>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* ── Hero row: left dark panel + right compact card ── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:items-stretch">
        <div className="flex-1 min-w-0 flex flex-col">
          <HeroLeftPanel profileType={profileType} />
        </div>
        <div className="lg:shrink-0 flex flex-col lg:w-[350px]">
          <CompactProfileCard
            progress={progress}
            status={status}
            onOpenDrawer={() => setDrawerOpen(true)}
          />
        </div>
      </div>

      {/* ── Live industry intelligence ── */}
      <LiveIndustryDataSection status={status} />

      {/* ── Activation banner (Day 0 section, identical in Day 1) ── */}
      {profileType === "researcher"
        ? <ResearcherActivationBanner />
        : <CROActivationBanner />
      }

      {/* ── Open opportunities carousel (Day 0 section) ── */}
      {profileType === "researcher"
        ? <ResearcherOpenProjects />
        : <CROOpenProjects />
      }

      {/* ── Quick Wins auto-scroll (Day 0 section) ── */}
      {profileType === "researcher"
        ? <ResearcherQuickWins />
        : <CROQuickWins />
      }

      {/* ── Testimonials (Day 0 section) ── */}
      {profileType === "researcher"
        ? <ResearcherTestimonials />
        : <CROTestimonials />
      }

      {/* ── Talk to Expert / IONS Connect (Day 0 section) ── */}
      {profileType === "researcher"
        ? <ResearcherTalkToExpert />
        : <CROTalkToExpert />
      }

      {/* ── Profile details drawer ── */}
      <ProfileDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        missions={missions}
        completed={completed}
        expanded={expanded}
        onToggle={handleToggle}
        onComplete={handleComplete}
        progress={progress}
        status={status}
        celebrating={celebrating}
      />
    </div>
  );
}

// ─── Public exports ────────────────────────────────────────────────────────────

export function Day1ResearcherDashboard() {
  return <Day1DashboardInner profileType="researcher" />;
}

export function Day1CRODashboard() {
  return <Day1DashboardInner profileType="cro" />;
}
