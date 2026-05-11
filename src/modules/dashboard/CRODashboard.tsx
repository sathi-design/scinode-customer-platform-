"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { DemandDiscoveryDay0 } from "./DemandDiscoverySection";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Sparkles,
  TrendingUp,
  Eye,
  Award,
  ShieldCheck,
  Wrench,
  MessageSquare,
  Plus,
  FlaskConical,
  Building2,
  Package,
  Star,
  Microscope,
  Shield,
  Zap,
  Target,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPLIER_IMAGES } from "@/lib/supplierImages";

// ─── Types ────────────────────────────────────────────────────────────────────
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
}

// ─── Data ─────────────────────────────────────────────────────────────────────
// Percentage distribution (total = 100%):
// Heavier: Company Profile (20%), Services & Capabilities (20%), Certifications (15%)
// Medium:  Products (10%), Equipment (10%), Facility & EHS (10%), T&C (10%)
// Lighter: Utility (5%)
const MISSIONS: Mission[] = [
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
    completionMessage: "Your organisation is now visible to buyers and collaborators. Profile strength increased by +20%.",
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
    completionMessage: "Your products are now discoverable to buyers actively searching. Profile strength increased by +10%.",
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
    completionMessage: "Your compliance credentials are now visible to regulated buyers. Profile strength increased by +15%.",
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
    completionMessage: "Your capabilities are now aligned for relevant project matches. Profile strength increased by +20%.",
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
    completionMessage: "Your equipment inventory signals technical depth to buyers. Profile strength increased by +10%.",
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
    completionMessage: "Your facility and safety standards are now visible to compliance-conscious buyers. Profile strength increased by +10%.",
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
    completionMessage: "Your utility details confirm your operational readiness for complex engagements. Profile strength increased by +5%.",
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
    completionMessage: "Your profile is now ready for trusted collaboration with verified partners. Profile strength increased by +10%.",
  },
];

// Level thresholds map to natural checkpoints in the 8-tab journey:
// Explorer → 0% | Listed Lab → 20% (Company Profile done) |
// Capable Partner → 65% (top 4 tabs done) | Verified CRO → 100%
const COMPLETION_LEVELS = [
  { name: "Explorer",        threshold: 0,  emoji: "🗺️" },
  { name: "Listed Lab",      threshold: 20, emoji: "🧪" },
  { name: "Capable Partner", threshold: 65, emoji: "🔬" },
  { name: "Verified CRO",   threshold: 100, emoji: "✅" },
];

const QUICK_WINS = [
  {
    action: "Add Services",
    benefit: "Helps us align you with relevant projects",
    Icon: Wrench,
    iconBg: "#f0faf5",
    iconColor: "#1f6f54",
  },
  {
    action: "Add Products",
    benefit: "CROs who list products are more likely to get their first project within 5 days",
    Icon: Package,
    iconBg: "#eff6ff",
    iconColor: "#2563eb",
  },
  {
    action: "Add Key Expertise",
    benefit: "Improves how accurately we map your capabilities to relevant buyer requirements",
    Icon: Target,
    iconBg: "#f3f0ff",
    iconColor: "#7c3aed",
  },
  {
    action: "Add Certifications",
    benefit: "Verified expertise improves your selection for regulated buyer requirements",
    Icon: Award,
    iconBg: "#fffbeb",
    iconColor: "#d97706",
  },
  {
    action: "Complete Your Company Profile",
    benefit: "Add your company details, scale, and presence to stand out for relevant buyer requirements",
    Icon: Building2,
    iconBg: "#f0faf5",
    iconColor: "#1f6f54",
  },
];

const TESTIMONIALS = [
  {
    quote: "Scinode matched us with a pharma buyer in the first week. We went from zero qualified leads to three active project discussions within a month.",
    name: "Dr. Rajesh Iyer",
    role: "CEO, BioSynth Labs",
    tag: "CRO",
  },
  {
    quote: "The platform understood our synthesis capabilities and matched us with buyers we wouldn't have found on our own. Our pipeline has never been stronger.",
    name: "Dr. Anita Sharma",
    role: "Research Director, ChemAxon CRO",
    tag: "Scientist",
  },
  {
    quote: "We listed our CDMO services and within two weeks received enquiries from three EU-based manufacturers looking for exactly what we offer.",
    name: "Mr. Suresh Patel",
    role: "Business Head, NovaPharma CDMO",
    tag: "CDMO",
  },
];

const MATCHED_PROJECTS = [
  {
    id: 1,
    title: "Catalyst Development Research",
    company: "Hexion Materials",
    industry: "Green Chemistry",
    matchPct: 92,
    description: "Seeking expert to optimise heterogeneous catalysts for industrial-scale green reactions.",
    image: SUPPLIER_IMAGES.specialty[0],
    locked: false,
  },
  {
    id: 2,
    title: "Asymmetric Synthesis Scale-Up",
    company: "Pavion Materials",
    industry: "Pharma",
    matchPct: 88,
    description: "Scale-up of asymmetric synthesis routes for active pharmaceutical intermediates.",
    image: SUPPLIER_IMAGES.pharma[0],
    locked: false,
  },
  {
    id: 3,
    title: "Bioprocess Optimization Study",
    company: "NovaBio AG",
    industry: "Biotechnology",
    matchPct: 79,
    description: "Optimise fermentation parameters and downstream processing for pilot-scale production.",
    image: SUPPLIER_IMAGES.pharma[1],
    locked: true,
  },
  {
    id: 4,
    title: "Flow Chemistry Implementation",
    company: "ChemVista EU",
    industry: "Industrial Chemistry",
    matchPct: 74,
    description: "Implementation of continuous flow chemistry for exothermic reaction management.",
    image: SUPPLIER_IMAGES.industrial[0],
    locked: true,
  },
  {
    id: 5,
    title: "Polymer Matrix Characterisation",
    company: "AkzoNobel Research",
    industry: "Specialty Chemical",
    matchPct: 68,
    description: "Characterisation of novel polymer matrices for high-performance composite applications.",
    image: SUPPLIER_IMAGES.specialty[1],
    locked: true,
  },
];

const PLATFORM_STATS = [
  { num: 20,   suffix: "+", label: "REQUESTING\nCOUNTRIES" },
  { num: 350,  suffix: "+", label: "R&D ENQUIRIES\nPER WEEK" },
  { num: 1000, suffix: "+", label: "RESEARCHERS & LABS\nONBOARDED" },
  { num: 90,   suffix: "%", label: "PROJECTS\nSUCCESSFULLY MATCHED" },
  { num: 98,   suffix: "%", label: "PARTNER\nSATISFACTION" },
];

// ─── Confetti ─────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ["#4ade80", "#1f6f54", "#2563eb", "#d97706", "#7c3aed", "#f59e0b", "#ec4899", "#34d399"];
const CONFETTI_PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: [4, 7, 5, 6][i % 4],
  delay: i * 38,
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
            left: "50%",
            top: "45%",
            width: p.size,
            height: p.size,
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            background: p.color,
            animation: `cro-cf${p.animIdx} 1.3s cubic-bezier(0.1, 0.8, 0.2, 1) ${p.delay}ms forwards`,
          }}
        />
      ))}
    </>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ value }: { value: number }) {
  const size = 88;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="cro-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1f6f54" />
            <stop offset="100%" stopColor="#4ed589" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e8f0ec" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#cro-ring-grad)" strokeWidth={stroke}
          strokeLinecap="round" fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[18px] font-bold text-[#171717] leading-none">{value}%</span>
        <span className="mt-0.5 text-[10px] font-medium text-[#68747a]">complete</span>
      </div>
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-3 px-5 py-3 bg-[#1f6f54] text-white text-sm font-medium rounded-2xl shadow-2xl">
        <span className="text-lg">🎉</span>
        {message}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function CRODashboard() {
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="space-y-5 pb-12 max-w-[1200px] mx-auto px-4 sm:px-0">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <HeroBanner />

      {/* 60 / 40 split — equal height via stretch, no overflow */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:items-stretch">
        <div className="lg:col-span-3 flex flex-col">
          <OpportunitySection />
        </div>
        <div className="lg:col-span-2 flex flex-col">
          <ProfileEngine onBadgeEarned={(msg) => setToast(msg)} />
        </div>
      </div>

      <ActivationBanner />
      <OpenProjects />
      <PlatformStats />
      <DemandDiscoveryDay0 profileType="cro" />
      <QuickWins />
      <Testimonials />
      <TalkToExpert />
    </div>
  );
}

// ─── 1. Hero Banner ───────────────────────────────────────────────────────────
function HeroBanner() {
  const [tipVisible, setTipVisible] = useState(false);

  return (
    <>
      {/* ── Shared keyframe animations ── */}
      <style>{`
        @keyframes cro-badgeShimmer {
          0%, 100% { background-position: -200% center; }
          50%       { background-position:  200% center; }
        }
        @keyframes cro-cf0 { to { transform: translate(-80px, -90px) rotate(200deg) scale(0.2); opacity: 0; } }
        @keyframes cro-cf1 { to { transform: translate( 90px, -80px) rotate(-150deg) scale(0.2); opacity: 0; } }
        @keyframes cro-cf2 { to { transform: translate(-100px, 40px) rotate(180deg) scale(0.2); opacity: 0; } }
        @keyframes cro-cf3 { to { transform: translate( 85px,  70px) rotate(-120deg) scale(0.2); opacity: 0; } }
        @keyframes cro-cf4 { to { transform: translate(-50px,-110px) rotate(240deg) scale(0.2); opacity: 0; } }
        @keyframes cro-cf5 { to { transform: translate(110px, -50px) rotate(-200deg) scale(0.2); opacity: 0; } }
        @keyframes cro-cf6 { to { transform: translate( 60px, 100px) rotate(300deg) scale(0.2); opacity: 0; } }
        @keyframes cro-cf7 { to { transform: translate(-110px, 60px) rotate(-270deg) scale(0.2); opacity: 0; } }
        @keyframes cro-quickWinsScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        /* Profile breakdown — thin scrollbar, visible only on hover */
        .cro-breakdown-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; transition: scrollbar-color 200ms; }
        .cro-breakdown-scroll:hover { scrollbar-color: #e2e8f0 transparent; }
        .cro-breakdown-scroll::-webkit-scrollbar { width: 3px; }
        .cro-breakdown-scroll::-webkit-scrollbar-track { background: transparent; }
        .cro-breakdown-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 9999px; transition: background 200ms; }
        .cro-breakdown-scroll:hover::-webkit-scrollbar-thumb { background: #e2e8f0; }
      `}</style>

      <section
        className="relative overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(125deg, #002d16 0%, #001a0a 50%, #081625 100%)" }}
      >
        {/* ── Ambient blobs ── */}
        <div className="pointer-events-none absolute -top-24 left-[30%] w-96 h-96 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #1db877 0%, transparent 70%)", filter: "blur(64px)" }} />
        <div className="pointer-events-none absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(48px)" }} />
        <div className="pointer-events-none absolute top-0 right-0 w-72 h-full rounded-r-2xl opacity-30"
          style={{ background: "radial-gradient(ellipse at top right, #0a3d2e 0%, transparent 70%)" }} />

        {/* ── 12-col grid ── */}
        <div className="relative z-10 grid grid-cols-12">

          {/* ══ LEFT — col-span-8 ══ */}
          <div className="col-span-12 lg:col-span-8 px-6 pt-5 pb-5 sm:px-8 sm:pt-6 sm:pb-5 flex flex-col justify-between gap-3">

            {/* ── Security badge ── */}
            <div className="relative inline-block self-start">
              <button
                type="button"
                className="relative overflow-hidden group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-emerald-200/90 border border-emerald-400/20 hover:border-emerald-400/50 hover:scale-[1.03] hover:shadow-[0_0_18px_rgba(74,222,128,0.22)] transition-all duration-200"
                style={{ background: "rgba(20, 55, 30, 0.90)" }}
                onMouseEnter={() => setTipVisible(true)}
                onMouseLeave={() => setTipVisible(false)}
              >
                <div className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.11) 50%, transparent 70%)",
                    backgroundSize: "200% 100%",
                    animation: "cro-badgeShimmer 3.5s ease-in-out infinite",
                  }}
                />
                <span className="relative z-10">🔒</span>
                <span className="relative z-10 font-bold tracking-wide">SCINODE Secure</span>
              </button>
              {/* Tooltip */}
              <div
                className="absolute left-0 top-full mt-2 z-20 w-[268px] pointer-events-none"
                style={{
                  opacity: tipVisible ? 1 : 0,
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

            {/* ── Main copy ── */}
            <div>
              <h1
                className="text-[22px] sm:text-[27px] md:text-[31px] font-bold text-white leading-[1.2] tracking-[-0.02em] mb-2"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Unlock Global R&amp;D Opportunities and<br className="hidden md:block" /> Fuel Your Next Innovation
              </h1>
              <p className="text-[#8faabb] text-[13px] sm:text-sm leading-relaxed max-w-[500px]">
                You&apos;re a few steps away from tapping into global demand and securing high-impact collaborations.
              </p>
            </div>

            {/* ── CTA row ── */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1f6f54] hover:bg-[#185c45] active:bg-[#144d3a] text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70">
                Complete Your Technical Profile <ArrowRight size={15} strokeWidth={2.5} />
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 border border-white/25 text-white/90 text-sm font-semibold rounded-lg hover:bg-white/10 hover:border-white/40 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
                View Matched Projects <ArrowRight size={15} strokeWidth={2} />
              </button>
            </div>

            {/* ── Supporting value section ── */}
            <div className="pt-4 border-t border-white/[0.12]">
              <h3
                className="text-[16px] font-semibold leading-snug tracking-[-0.01em] mb-1.5"
                style={{ color: "rgba(255,255,255,0.88)" }}
              >
                Start receiving demand for your products
              </h3>
              <p
                className="text-[13px] leading-relaxed max-w-[480px]"
                style={{ color: "rgba(255,255,255,0.58)" }}
              >
                List your ready to sell products. Start receiving qualified inquiries.
              </p>
            </div>
          </div>

          {/* ══ RIGHT — col-span-4: Live Signal ══ */}
          <div className="col-span-12 lg:col-span-4 flex">
            <div className="hidden lg:block w-px self-stretch bg-white/[0.07] shrink-0" />
            <div
              className="flex-1 flex flex-col px-5 py-5 sm:px-6 sm:py-5"
              style={{ background: "rgba(0,0,0,0.18)" }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-[8px] w-[8px] shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex rounded-full h-[8px] w-[8px] bg-emerald-400" />
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.18em]">
                    Live Signal
                  </span>
                </div>
                <p className="text-white text-[15px] font-semibold leading-snug">
                  EU buyers are searching for green chemistry process experts
                </p>
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-4">
                <div className="flex items-end gap-3">
                  <span
                    className="text-[42px] font-black leading-none tracking-tight"
                    style={{
                      background: "linear-gradient(135deg, #4ade80 0%, #34d399 60%, #2dd4bf 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    +58%
                  </span>
                  <span className="text-[#7a9aaa] text-[12px] leading-snug pb-1.5">
                    demand this week<br />vs last week
                  </span>
                </div>
                <div className="border-t border-white/[0.08] pt-3">
                  <p className="text-[10px] text-[#4e6272]">Updated hourly · Scinode Intelligence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── 2. Opportunity Section (left 70%) ────────────────────────────────────────
function OpportunitySection() {
  return (
    <section className="group relative overflow-hidden rounded-2xl border-2 border-[#0e6f5c] bg-white p-6 flex flex-col flex-1 shadow-sm transition-shadow duration-300 hover:shadow-lg">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, rgba(1,99,88,0.22) 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div className="pointer-events-none absolute bottom-0 right-0 w-56 h-56 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)", filter: "blur(36px)" }} />
      <div className="pointer-events-none absolute -bottom-10 -left-12 w-[280px] h-[300px] opacity-[0.13]"
        style={{
          background: "radial-gradient(ellipse at 40% 60%, #2DD17C 0%, #1FB39D 30%, #0F90C6 65%, #0172E7 100%)",
          filter: "blur(44px)",
          borderRadius: "50%",
        }}
      />
      <div className="pointer-events-none absolute -top-10 -right-10 w-[260px] h-[280px] opacity-[0.10]"
        style={{
          background: "linear-gradient(180deg, #0E6F5C 0%, #1ABC9C 100%)",
          filter: "blur(48px)",
          borderRadius: "50%",
        }}
      />

      {/* Tag */}
      <div className="relative z-10 flex items-center gap-2 mb-2">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#1f6f54] text-[#1f6f54] text-[11px] font-semibold"
          style={{ background: "#dff3ee" }}>
          <Sparkles size={11} />
          Collaboration Opportunity
        </span>
      </div>

      {/* Big number */}
      <div className="relative z-10 font-black text-[#1f6f54] leading-none transition-transform duration-300 group-hover:scale-[1.02] origin-left"
        style={{ fontSize: "clamp(60px, 8vw, 96px)" }}>
        400+
      </div>

      <h2 className="relative z-10 mt-3 font-bold text-[#171717] leading-tight"
        style={{ fontSize: "clamp(20px, 2.8vw, 32px)" }}>
        Open R&amp;D Opportunities waiting for you
      </h2>
      <p className="relative z-10 mt-2 text-[#6b7280] text-sm leading-relaxed max-w-[520px]">
        Complete your profile to help us align your products and capabilities with the right opportunity.
      </p>

      <button className="relative z-10 mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1f6f54] hover:bg-[#185c45] text-white text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md w-fit">
        Complete your profile <ArrowRight size={15} />
      </button>

      {/* Divider */}
      <div className="relative z-10 my-5 border-t border-[#e2e5e3]" />

      {/* High Impact */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
            ⚡ HIGH IMPACT
          </span>
        </div>
        <p className="text-base font-bold text-[#171717] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
          A complete profile helps us:
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: "#d7f9f2" }}>
            <div className="shrink-0 w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center">
              <Eye size={18} className="text-[#1f6f54]" />
            </div>
            <div>
              <span className="text-3xl font-black text-[#1f6f54] leading-none">+42%</span>
              <p className="text-[11px] font-medium text-[#1f6f54]/80 mt-0.5 leading-snug">Improve visibility across relevant work</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: "#eaf1ff" }}>
            <div className="shrink-0 w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center">
              <TrendingUp size={18} className="text-[#2f66d0]" />
            </div>
            <div>
              <span className="text-3xl font-black text-[#2f66d0] leading-none">+63%</span>
              <p className="text-[11px] font-medium text-[#2f66d0]/80 mt-0.5 leading-snug">Strengthen collaboration fit</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 3. Profile Completion Engine (right 40%) ─────────────────────────────────
function ProfileEngine({ onBadgeEarned }: { onBadgeEarned: (msg: string) => void }) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState<{ mission: Mission; levelName: string } | null>(null);

  const progress = useMemo(
    () => MISSIONS.reduce((sum, m) => sum + (completed[m.id] ? m.contribution : 0), 0),
    [completed],
  );

  const activeLevel = useMemo(() => {
    let active = COMPLETION_LEVELS[0];
    for (const lv of COMPLETION_LEVELS) if (progress >= lv.threshold) active = lv;
    return active;
  }, [progress]);

  useEffect(() => {
    if (!celebrating) return;
    const t = setTimeout(() => setCelebrating(null), 2800);
    return () => clearTimeout(t);
  }, [celebrating]);

  const handleComplete = (m: Mission) => {
    if (completed[m.id]) return;
    const newProgress = progress + m.contribution;
    let newLevel = COMPLETION_LEVELS[0];
    for (const lv of COMPLETION_LEVELS) if (newProgress >= lv.threshold) newLevel = lv;
    setCompleted((prev) => ({ ...prev, [m.id]: true }));
    setExpanded(null);
    setCelebrating({ mission: m, levelName: newLevel.name });
    onBadgeEarned(`You've earned the ${m.badge} badge ${m.badgeEmoji}`);
  };

  return (
    <section className="relative bg-white rounded-[20px] border border-slate-200 p-6 shadow-sm flex flex-col flex-1 overflow-hidden">

      {/* ── Celebration overlay ── */}
      {celebrating && (
        <div
          className="absolute inset-0 z-30 rounded-[20px] flex flex-col items-center justify-center gap-3"
          style={{ background: "rgba(10, 22, 15, 0.82)", backdropFilter: "blur(6px)" }}
        >
          <Confetti />
          <div className="relative z-10 text-center px-6 flex flex-col items-center gap-2">
            <span className="text-4xl">🎉</span>
            <p className="text-white font-bold text-[17px] leading-snug mt-1">
              You are now a{" "}
              <span className="text-[#4ade80]">{celebrating.levelName}</span>
            </p>
            <p className="text-[#9fcfba] text-[13px] leading-snug">
              You&apos;ve strengthened {celebrating.mission.contribution}% of your profile
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold text-[#4ade80] border border-[#4ade80]/35"
              style={{ background: "rgba(74,222,128,0.15)" }}>
              {celebrating.mission.badgeEmoji} {celebrating.mission.badge} badge earned
            </div>
            <button
              onClick={() => setCelebrating(null)}
              className="mt-2 text-[11px] text-[#6aab82] hover:text-[#9fcfba] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── SECTION 1: Progress ring + level pill ── */}
      <div className="flex items-center gap-5">
        <ProgressRing value={progress} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-[#171717]">Profile Completion</h3>
          <p className="mt-0.5 text-[12px] leading-snug text-[#68747a]">
            {progress}% complete • Complete key sections to help us align your capabilities with relevant opportunities.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#dff3ee] px-2.5 py-1 text-[11px] font-bold text-[#1f6f54] shadow-[0_0_0_3px_rgba(31,111,84,0.08)]">
            <span>{activeLevel.emoji}</span>
            <span>{activeLevel.name}</span>
            <span className="opacity-60">• Active</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Horizontal level stepper ── */}
      <div className="mt-6 flex items-center gap-1">
        {COMPLETION_LEVELS.map((lv, i) => {
          const reached     = progress >= lv.threshold;
          const isActive    = lv.name === activeLevel.name;
          const nextReached = i < COMPLETION_LEVELS.length - 1 && progress >= COMPLETION_LEVELS[i + 1].threshold;
          return (
            <div key={lv.name} className="flex flex-1 items-center gap-1">
              <div className="flex flex-1 flex-col items-center gap-1" title={lv.name}>
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] transition-all duration-300",
                  isActive
                    ? "bg-[#1f6f54] text-white ring-2 ring-[#1f6f54]/20"
                    : reached
                      ? "bg-[#1f6f54] text-white"
                      : "bg-slate-100 text-[#94a3b8]",
                )}>
                  {reached
                    ? <Check className="h-3 w-3" strokeWidth={3} />
                    : <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  }
                </div>
                <span className={cn(
                  "text-[9px] font-medium leading-none text-center",
                  isActive ? "text-[#1f6f54]" : "text-[#94a3b8]",
                )}>
                  {lv.name.split(" ")[0]}
                </span>
              </div>
              {i < COMPLETION_LEVELS.length - 1 && (
                <div className={cn(
                  "h-px flex-1 transition-colors duration-300",
                  nextReached ? "bg-[#1f6f54]" : "bg-slate-200",
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="my-5 h-px bg-slate-100" />

      {/* ── SECTION 3: Profile Breakdown — label is sticky, only rows scroll ── */}
      <div className="flex flex-col min-h-0">
        {/* Sticky label — never scrolls */}
        <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8] shrink-0">
          Profile Breakdown
        </p>
        {/* Rows — 4 visible (~208px), rest accessible via scroll */}
        <div className="cro-breakdown-scroll overflow-y-auto pr-0.5" style={{ maxHeight: "208px" }}>
          <div className="space-y-1">
            {MISSIONS.map((m) => (
              <MissionRow
                key={m.id}
                mission={m}
                done={!!completed[m.id]}
                open={expanded === m.id}
                onToggle={() => setExpanded((prev) => (prev === m.id ? null : m.id))}
                onComplete={() => handleComplete(m)}
              />
            ))}
          </div>
          <div className="h-2" />
        </div>
      </div>

    </section>
  );
}

// ─── Mission Row (accordion) ──────────────────────────────────────────────────
function MissionRow({
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
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-2.5 py-2 text-left"
      >
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

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#171717]">{mission.title}</p>
          {done ? (
            <p className="truncate text-[11px] font-medium text-[#2563eb]">
              {mission.earnedLabel} · +{mission.contribution}% profile strength
            </p>
          ) : (
            <p className="truncate text-[11px] text-[#68747a]">{mission.subtitle}</p>
          )}
        </div>

        <span className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold transition-all duration-300",
          done ? "text-white" : "bg-[#dff3ee] text-[#1f6f54]",
        )}
          style={done ? {
            background: "linear-gradient(135deg, #1f6f54, #2d9e70)",
            boxShadow: "0 0 0 2px rgba(31,111,84,0.15), 0 0 8px rgba(31,111,84,0.18)",
          } : undefined}
        >
          {done ? `✓ ${mission.earnedLabel}` : `+${mission.contribution}%`}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-3 py-2.5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {done ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #1f6f54, #2d9e70)" }}
                  >
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-[12px] font-bold text-[#1f6f54]">{mission.earnedLabel}</p>
                </div>
                <div
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-[#1f6f54]"
                  style={{
                    background: "#dff3ee",
                    boxShadow: "0 0 0 2px rgba(31,111,84,0.12), 0 0 10px rgba(31,111,84,0.18)",
                  }}
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

// ─── 4. Activation Banner ─────────────────────────────────────────────────────
export function ActivationBanner() {
  return (
    <section
      className="relative overflow-hidden rounded-[20px] px-5 py-5 sm:px-7 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
      style={{ background: "linear-gradient(135deg, #001f0c 0%, #002e13 40%, #001a09 100%)" }}
    >
      <div className="pointer-events-none absolute right-[120px] top-0 w-56 h-full opacity-20"
        style={{ background: "radial-gradient(ellipse at center, #4ade80 0%, transparent 70%)", filter: "blur(40px)" }} />

      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0 relative z-10">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4ade80] mb-1">
            <span>🎯</span> Activation Goal
          </p>
          <h3
            className="text-white font-bold text-[16px] sm:text-[18px] leading-snug"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            You&apos;re{" "}
            <span className="text-[#4ade80]">2 steps</span>
            {" "}away from unlocking<br className="hidden sm:block" /> a high-fit project match
          </h3>
          <p className="text-[#6aab82] text-[12px] sm:text-[13px] mt-1.5 leading-snug">
            We&apos;ve identified a potential collaboration aligned with your capabilities. Add a few details to help us finalize the fit.
          </p>
        </div>
      </div>

      <button
        className="shrink-0 relative z-10 flex items-center gap-2.5 px-5 py-3 rounded-[12px] text-white text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-lg whitespace-nowrap"
        style={{ background: "#2a8c5a" }}
      >
        Add Capability Details <ArrowRight size={15} strokeWidth={2.5} />
      </button>
    </section>
  );
}

// ─── 5. Open Projects ─────────────────────────────────────────────────────────
export function OpenProjects() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    carouselRef.current.scrollTo({ left: scrollLeft + (dir === "left" ? -clientWidth / 2 : clientWidth / 2), behavior: "smooth" });
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1f6f54] mb-1">
            Explore Beyond Your Matches
          </p>
          <h2 className="text-lg font-bold text-[#171717]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Open Opportunities
          </h2>
          <p className="text-sm text-[#68747a] mt-0.5">
            Browse current open projects, send us the proposal and unlock your next breakthrough.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#1f6f54] transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#1f6f54] transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden -mx-0.5">
        <div
          ref={carouselRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-1 px-0.5"
          style={{ scrollBehavior: "smooth", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {MATCHED_PROJECTS.map((proj) => (
            <MatchCard key={proj.id} proj={proj} />
          ))}
        </div>
        <div className="pointer-events-none absolute top-0 right-0 w-16 h-full"
          style={{ background: "linear-gradient(to left, #ffffff 30%, transparent 100%)" }} />
      </div>
    </section>
  );
}

function MatchCard({ proj }: { proj: typeof MATCHED_PROJECTS[0] }) {
  return (
    <div className="w-[240px] flex-shrink-0 snap-start group self-stretch">
      <div className={cn(
        "relative rounded-[16px] border flex flex-col overflow-hidden transition-all duration-300 h-full",
        proj.locked
          ? "border-slate-200 bg-[#f8fafc]"
          : "border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-[#1f6f54]/25 hover:-translate-y-0.5"
      )}>
        <div className="relative h-[148px] overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proj.image}
            alt={proj.title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-300",
              proj.locked ? "blur-sm scale-105" : "group-hover:scale-105"
            )}
          />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)" }} />

          {!proj.locked && (
            <div className="absolute inset-x-0 bottom-0 px-3 pb-2.5 flex items-end justify-between">
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ background: "rgba(0,0,0,0.52)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <Star size={9} fill="#fbbf24" className="text-amber-400 shrink-0" />
                Open Project
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-[21px] font-black text-white leading-none tabular-nums">{proj.matchPct}%</span>
                <span className="text-[9px] font-semibold text-white/75 pb-0.5"> Match</span>
              </div>
            </div>
          )}

          {proj.locked && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(240,244,248,0.72)", backdropFilter: "blur(2px)" }}>
              <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                <Lock size={14} className="text-slate-400" />
              </div>
            </div>
          )}
        </div>

        <div className={cn("flex flex-col p-3.5 flex-1", proj.locked ? "gap-2 items-center text-center justify-center" : "gap-2")}>
          {proj.locked ? (
            <>
              <p className="text-[12px] font-medium text-[#68747a] leading-snug px-1">
                Complete your profile to unlock this project
              </p>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#1f6f54] text-[#1f6f54] text-[11px] font-semibold hover:bg-[#f0faf5] transition-all">
                Go to Profile <ArrowRight size={10} />
              </button>
            </>
          ) : (
            <>
              <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-[#dff3ee] text-[#1f6f54] text-[10px] font-semibold border border-[#1f6f54]/15">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1f6f54]" />
                Well Matched
              </span>
              <h3 className="font-bold text-[14px] text-[#171717] leading-snug line-clamp-2"
                style={{ fontFamily: "Poppins, sans-serif" }}>
                {proj.title}
              </h3>
              <p className="text-[11px] text-[#68747a] leading-snug line-clamp-2 flex-1">{proj.description}</p>
              <div className="flex justify-end pt-0.5">
                <button className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 w-7 h-7 rounded-full bg-[#1f6f54] flex items-center justify-center shadow-sm hover:bg-[#185c45]">
                  <ArrowUpRight size={13} className="text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 6. Platform Stats ────────────────────────────────────────────────────────
function PlatformStats() {
  const [counts, setCounts] = useState(PLATFORM_STATS.map(() => 0));
  const animatingRef = useRef(false);

  const startAnimation = useCallback(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounts(PLATFORM_STATS.map((s) => Math.floor(s.num * eased)));
      if (progress < 1) requestAnimationFrame(tick);
      else animatingRef.current = false;
    };
    requestAnimationFrame(tick);
  }, []);

  const fmt = (count: number, s: typeof PLATFORM_STATS[0]) => String(count) + s.suffix;

  return (
    <section className="bg-[#0d1117] rounded-2xl px-4 py-6 sm:px-8 sm:py-8" onMouseEnter={startAnimation}>
      <p className="text-center text-slate-500 text-[11px] font-bold uppercase tracking-[0.25em] mb-8">
        What&apos;s Happening on IONS
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
        {PLATFORM_STATS.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <span className="text-3xl sm:text-5xl md:text-6xl font-black text-white tabular-nums leading-none">
              {fmt(counts[i], s)}
            </span>
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider leading-[1.6] whitespace-pre-line">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 7. Quick Wins (auto-scroll) ──────────────────────────────────────────────
export function QuickWins() {
  const [paused, setPaused] = useState(false);
  const doubled = [...QUICK_WINS, ...QUICK_WINS];

  return (
    <section className="bg-white rounded-2xl border border-slate-200 px-4 pt-5 pb-4 sm:px-6 sm:pt-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base sm:text-lg font-bold text-[#171717]">
          Improve your match quality with a few key inputs
        </h2>
        <p className="text-sm text-[#68747a] mt-0.5">
          Small additions help us better align your profile with the right projects and collaborations.
        </p>
      </div>

      <div className="overflow-hidden relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10"
          style={{ background: "linear-gradient(to right, #ffffff, transparent)" }} />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10"
          style={{ background: "linear-gradient(to left, #ffffff, transparent)" }} />

        <div
          className="flex gap-4"
          style={{
            animation: paused ? "none" : "cro-quickWinsScroll 28s linear infinite",
            width: "max-content",
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {doubled.map((w, i) => (
            <div key={i}
              className="relative w-[220px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-[250ms] group cursor-pointer">
              <div
                className="absolute inset-0 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-[250ms] origin-bottom-right"
                style={{ background: `${w.iconColor}18` }}
              />
              <div className="relative z-10">
                <div className="relative w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors duration-[250ms]"
                  style={{ background: w.iconBg }}>
                  <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-[250ms]" />
                  <w.Icon size={16} className="relative z-10" style={{ color: w.iconColor }} />
                </div>
                <p className="text-sm font-semibold text-[#171717] leading-snug mb-1">{w.action}</p>
                <p className="text-xs text-[#68747a] leading-snug mb-3">{w.benefit}</p>
                <button className="flex items-center gap-1.5 text-xs font-bold text-[#1f6f54] hover:text-[#185c45] transition-colors">
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Community avatars ────────────────────────────────────────────────────────
const COMMUNITY_AVATARS = [
  { initials: "RI", bg: "#1f6f54" },
  { initials: "AS", bg: "#2563eb" },
  { initials: "SP", bg: "#d97706" },
  { initials: "NK", bg: "#7c3aed" },
];

// ─── 8. Testimonials ─────────────────────────────────────────────────────────
export function Testimonials() {
  const [idx, setIdx] = useState(0);
  const total = TESTIMONIALS.length;
  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 px-4 pt-5 pb-5 sm:px-6 sm:pt-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#171717]">
            Trusted by researchers and industry partners
          </h2>
          <p className="text-sm text-[#68747a] mt-0.5">What our partners say about Scinode</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === idx ? "w-7 bg-[#1f6f54]" : "w-2 bg-slate-300 hover:bg-slate-400",
                )}
              />
            ))}
          </div>
          <div className="flex gap-1.5">
            <button onClick={prev} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#f0faf5] hover:text-[#1f6f54] hover:border-[#1f6f54]/30 transition-all">
              <ChevronLeft size={16} />
            </button>
            <button onClick={next} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#f0faf5] hover:text-[#1f6f54] hover:border-[#1f6f54]/30 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        className="relative rounded-2xl overflow-hidden p-4 sm:p-6"
        style={{ background: "linear-gradient(145deg, #edfaf3 0%, #f0f7ff 60%, #edf6f3 100%)" }}
      >
        <div className="pointer-events-none absolute -top-4 -left-1 select-none font-black leading-none text-[#1f6f54]"
          style={{ fontSize: 140, opacity: 0.08, fontFamily: "Georgia, serif", lineHeight: 1 }}
          aria-hidden="true">&ldquo;</div>
        <div className="pointer-events-none absolute -bottom-8 right-2 select-none font-black leading-none text-[#1f6f54]"
          style={{ fontSize: 140, opacity: 0.08, fontFamily: "Georgia, serif", lineHeight: 1 }}
          aria-hidden="true">&rdquo;</div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-400 ease-in-out"
            style={{ transform: `translateX(-${idx * 88}%)` }}
          >
            {TESTIMONIALS.map((item, i) => (
              <div key={i} className="w-[88%] shrink-0 mr-[4%]">
                <div className={cn(
                  "rounded-xl p-5 sm:p-6 flex flex-col gap-5 transition-all duration-300",
                  i === idx
                    ? "bg-white border border-slate-200/80 shadow-lg shadow-[#1f6f54]/5"
                    : "bg-white/60 border border-slate-200/40 opacity-60",
                )}>
                  <div className="w-9 h-9 rounded-xl bg-[#dff3ee] flex items-center justify-center shrink-0">
                    <span className="text-[#1f6f54] text-xl font-black leading-none" style={{ fontFamily: "Georgia, serif" }}>
                      &ldquo;
                    </span>
                  </div>
                  <p className="text-[#171717] text-[15px] sm:text-base font-medium leading-[1.75] flex-1">
                    {item.quote}
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-sm"
                      style={{ background: "linear-gradient(135deg, #1f6f54 0%, #4ed589 100%)" }}
                    >
                      {item.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-[#171717] leading-snug">{item.name}</p>
                      <p className="text-[12px] text-[#68747a] mt-0.5 leading-snug">{item.role}</p>
                    </div>
                    <span className="shrink-0 px-3 py-1 rounded-full bg-[#dff3ee] text-[#1f6f54] text-[11px] font-semibold border border-[#1f6f54]/15">
                      {item.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex -space-x-2.5">
          {COMMUNITY_AVATARS.map((av, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold ring-2 ring-white shadow-sm"
              style={{ background: av.bg, zIndex: COMMUNITY_AVATARS.length - i }}
            >
              {av.initials}
            </div>
          ))}
        </div>
        <p className="text-[13px] text-[#68747a] font-medium">
          <span className="font-bold text-[#171717]">+120 labs & CROs</span> joined this month
        </p>
      </div>
    </section>
  );
}

// ─── 9. Talk to Expert ────────────────────────────────────────────────────────
export function TalkToExpert() {
  return (
    <section className="relative overflow-hidden rounded-[16px] px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10"
      style={{ background: "linear-gradient(115deg, #003a1b 0%, #001c08 55%, #0a1a2e 100%)" }}>
      <div className="pointer-events-none absolute right-[200px] top-[60px] w-[256px] h-[256px] rounded-full bg-emerald-400/10 blur-[64px]" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
        <div className="flex-1 min-w-0 flex flex-col gap-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative shrink-0 w-[45px] h-[45px]">
              <div className="absolute inset-0 rounded-[8px]"
                style={{ background: "linear-gradient(135deg, rgba(247,254,231,0.50) 0%, rgba(247,254,231,0.10) 100%)" }} />
              <div className="absolute top-[10px] left-[10px] w-6 h-6 text-white/80">
                <MessageSquare size={22} />
              </div>
            </div>
            <div>
              <h3 className="text-white text-[20px] font-semibold leading-[28px]"
                style={{ fontFamily: "Poppins, sans-serif" }}>
                Position your capabilities for the right projects
              </h3>
              <p className="text-[#94a3b8] text-[16px] leading-[24px]">
                Get support in presenting your offerings, capabilities, and strengths effectively.
              </p>
            </div>
          </div>

          <p className="text-[#cbd5e1] text-[16px] leading-[24px] mb-6 max-w-[640px]">
            We help you structure your profile and capabilities so they align with relevant project requirements and buyer expectations.
          </p>

          <div className="flex items-center gap-8">
            <button className="flex items-center gap-2 bg-[#1f6f54] hover:bg-[#185C45] transition-colors px-4 py-2 rounded-[6px] text-white text-sm font-medium">
              <Plus size={16} /> Schedule a call via IONS CONNECT
            </button>
            <div className="flex items-center gap-[10px]">
              <span className="relative flex h-[10px] w-[10px] shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                <span className="relative inline-flex rounded-full h-[10px] w-[10px] bg-[#10b981]" />
              </span>
              <span className="text-[#94a3b8] text-[14px] whitespace-nowrap">Available now</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center shrink-0 w-[192px] h-[192px] rounded-full border border-white/10"
          style={{ background: "linear-gradient(136.89deg, rgba(1,114,231,0.20) 20.20%, rgba(45,209,124,0.20) 83.55%)" }}>
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
            <FlaskConical size={40} className="text-emerald-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
