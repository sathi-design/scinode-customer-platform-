"use client";

import { useState, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Package,
  FileText,
  Plus,
  Layers,
  Users,
  MessageSquare,
  Network,
  Factory,
  Building2,
  Award,
  Wrench,
  Zap,
  FileCheck,
  type LucideIcon,
} from "lucide-react";
import { SUPPLIER_IMAGES } from "@/lib/supplierImages";

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ManufacturingDashboard() {
  return (
    <div className="space-y-5 pb-12 max-w-[1200px] mx-auto px-4 sm:px-0">
      <WelcomeBanner />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:items-start">
        {/* 400+ card — drives the row height via its natural content */}
        <div className="lg:col-span-3">
          <OpportunitySection />
        </div>
        {/* Checklist — stretches to match 400+ height; flex col lets section fill via flex-1 */}
        <div className="lg:col-span-2 lg:self-stretch lg:min-h-0 flex flex-col">
          <OnboardingChecklist />
        </div>
      </div>

      <ProductListings />
      <ProjectsMatched />
      <PlatformStats />
      <BuyersLooking />
      <ToolsServices />
      <ExpertCTA />
    </div>
  );
}

// ─── 1. Welcome Banner ────────────────────────────────────────────────────────
function WelcomeBanner() {
  const profileCompletion = 15;
  const circumference = 2 * Math.PI * 40;
  const strokeDash = (profileCompletion / 100) * circumference;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#182133] to-[#016358] p-4 sm:p-6 md:p-8">
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-emerald-300/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex-1 max-w-xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
            Welcome, Unlock Global Manufacturing Opportunities
          </h1>
          <p className="text-emerald-100/80 text-sm leading-relaxed mb-6">
            List your products, share your plant strengths, and get matched with companies actively looking for reliable manufacturing partners.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-800 text-sm font-bold rounded-lg hover:bg-emerald-50 transition-all shadow-sm">
              Set Up Your Plant Profile <ArrowRight size={15} />
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-white/40 text-white text-sm font-bold rounded-lg hover:bg-white/10 transition-all">
              Browse Buyer Requirements <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="relative w-[168px] h-[168px]">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="none" />
              <circle
                cx="50" cy="50" r="40"
                stroke="white"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${strokeDash} ${circumference}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-black text-white">{profileCompletion}%</span>
            </div>
          </div>
          <span className="text-white/70 text-sm font-medium text-center">Profile completed</span>
        </div>
      </div>
    </section>
  );
}

// ─── 2a. Opportunity Section ──────────────────────────────────────────────────
function OpportunitySection() {
  return (
    <section className="group relative overflow-hidden rounded-2xl border-2 border-[#1F6F54] bg-white p-6 flex flex-col shadow-sm transition-shadow duration-300 hover:shadow-lg">

      {/* ── Decorative gradient blobs ── */}
      <div
        className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(1,99,88,0.28) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-60 h-60 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(15,144,198,0.22) 0%, transparent 70%)",
          filter: "blur(36px)",
        }}
      />

      {/* ── Big number ── */}
      <div
        className="relative z-10 font-black text-[#1f6f54] leading-none transition-transform duration-300 group-hover:scale-[1.02] origin-left"
        style={{ fontSize: "clamp(64px, 8vw, 88px)" }}
      >
        400+
      </div>

      {/* ── Heading ── */}
      <h2
        className="relative z-10 mt-3 font-bold text-[#171717] leading-tight"
        style={{ fontSize: "clamp(22px, 2.8vw, 34px)" }}
      >
        Opportunity waiting for you
      </h2>

      {/* ── Body copy ── */}
      <p className="relative z-10 mt-2 text-[#6b7280] text-sm leading-relaxed">
        Start onboarding, get verified, and get matched. Your next big partnership is just a few clicks away.
      </p>

      {/* ── Primary CTA — sits right after body copy ── */}
      <button className="relative z-10 mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1f6f54] hover:bg-[#185c45] text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
        <Plus size={16} /> Start Onboarding Now
      </button>

      {/* ── Inner teaser card ── */}
      <div className="relative z-10 mt-4 rounded-2xl border border-[#cfd8dc] bg-white/80 backdrop-blur-sm p-4 flex items-start gap-3 transition-all duration-300 hover:shadow-md">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-[#e8f5f2] flex items-center justify-center">
          <Layers size={20} className="text-[#1f6f54]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#171717] leading-snug">
            Get leads right away for your matched products
          </p>
          <p className="mt-1 text-xs text-[#6b7280] leading-relaxed">
            Start aligning your ready-to-sell products and crack your first deal.
          </p>
          <button className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1f6f54] text-[#1f6f54] text-xs font-semibold hover:bg-[#1f6f54] hover:text-white transition-all duration-200">
            Browse Buyer Requirements <ArrowRight size={11} />
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="relative z-10 mt-3 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#d7f9f2] flex-1">
          <FileText size={15} className="text-[#1f6f54] shrink-0" />
          <div>
            <span className="text-sm font-black text-[#1f6f54]">350+</span>
            <span className="ml-1 text-[11px] font-medium text-[#1f6f54]/80">Open RFQs</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#eaf1ff] flex-1">
          <Users size={15} className="text-[#3b5bdb] shrink-0" />
          <div>
            <span className="text-sm font-black text-[#3b5bdb]">120+</span>
            <span className="ml-1 text-[11px] font-medium text-[#3b5bdb]/80">Active Buyers</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 2b. Onboarding Checklist ─────────────────────────────────────────────────
const STEPS = [
  { Icon: Building2, label: "COMPANY PROFILE",          desc: "Add basic details about your plant profile",                                               done: true,  action: "Done",             iconBg: "#eff6ff", iconColor: "#2563eb" },
  { Icon: Package,   label: "PRODUCTS",                  desc: "Upload or add your product catalogue",                                                      done: false, action: "Add Details →",    iconBg: "#dff3ee", iconColor: "#1f6f54" },
  { Icon: Award,     label: "LICENCES & CERTIFICATIONS", desc: "Upload one of success like ISO, GMP, or audits",                                            done: false, action: "Add Details →",    iconBg: "#fffbeb", iconColor: "#d97706" },
  { Icon: Factory,   label: "REACTIONS",                 desc: "Upload your reactors and their capacities",                                                  done: false, action: "Add Details →",    iconBg: "#f3f0ff", iconColor: "#7c3aed" },
  { Icon: Wrench,    label: "EQUIPMENTS",                desc: "Tell buyers about your equipment, and its capacity",                                         done: false, action: "Add Details →",    iconBg: "#eff6ff", iconColor: "#2563eb" },
  { Icon: Zap,       label: "EHS & FACILITY",            desc: "You can add details about your fire fighting capability or if you have an ETP facility",     done: false, action: "Add Details →",    iconBg: "#fffbeb", iconColor: "#d97706" },
  { Icon: Zap,       label: "UTILITIES",                 desc: "Add details like chilling plant, boilers, etc",                                              done: false, action: "Add Details →",    iconBg: "#f3f0ff", iconColor: "#7c3aed" },
  { Icon: FileCheck, label: "TERMS & CONDITION",         desc: "Review and accept platform terms to activate your account",                                  done: false, action: "Review & Accept →", iconBg: "#dff3ee", iconColor: "#1f6f54" },
];

function OnboardingChecklist() {
  const doneCount = STEPS.filter((s) => s.done).length;
  const total = STEPS.length;
  const pct = Math.round((doneCount / total) * 100);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex-1 min-h-0 flex flex-col shadow-sm">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
          {doneCount} of {total} done
        </span>
      </div>
      <h3 className="font-bold text-slate-900 text-lg mt-2">Onboarding Checklist</h3>

      {/* ── Progress bar ── */}
      <div className="flex items-center justify-between mt-2 mb-1">
        <span className="text-xs text-slate-500 font-medium">Profile Completion</span>
        <span className="text-xs font-semibold text-[#1F6F54]">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-[#1F6F54] rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* ── Scrollable item list ── */}
      <div
        className={[
          "space-y-1 overflow-y-auto pr-1",
          "[&::-webkit-scrollbar]:w-[3px]",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-slate-200",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb:hover]:bg-slate-300",
        ].join(" ")}
        style={{ maxHeight: "340px" }}
      >
        {STEPS.map((step) => (
          <div
            key={step.label}
            className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
              step.done ? "bg-emerald-50" : "hover:bg-slate-50"
            }`}
          >
            {/* Icon circle */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={step.done
                ? { background: "#1F6F54" }
                : { background: step.iconBg }
              }
            >
              {step.done
                ? <Check className="w-3.5 h-3.5 text-white" />
                : <step.Icon className="w-3 h-3" style={{ color: step.iconColor }} />
              }
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 uppercase tracking-wide leading-snug">
                {step.label}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                {step.desc}
              </p>
              {step.done
                ? <span className="text-[11px] font-medium text-[#1F6F54]">Done</span>
                : <button className="text-[11px] font-medium text-[#2f66d0] hover:underline mt-0.5">
                    {step.action}
                  </button>
              }
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 3. Product Listings ──────────────────────────────────────────────────────
function ProductListings() {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Showcase Your Products to Get Noticed</h2>
        <p className="text-sm text-slate-500 mt-1">
          Add your product list so buyers can find you when they&apos;re searching for specific chemicals or capabilities.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#dff3ee" }}>
          <Package size={28} style={{ color: "#1f6f54" }} />
        </div>
        <p className="text-sm font-semibold text-slate-500 mb-1">No product listings yet.</p>
        <p className="text-xs text-slate-400 mb-5 text-center max-w-xs">
          Start by adding your key products or services. This helps us match you with the right buyers.
        </p>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1F6F54] hover:bg-[#185C45] text-white text-sm font-bold rounded-xl transition-all shadow-sm">
          <Plus size={16} /> Add Your Products
        </button>
      </div>
    </section>
  );
}

// ─── 4. Projects Matched ──────────────────────────────────────────────────────
const STAR_ICON = "https://www.figma.com/api/mcp/asset/8749bfbf-c143-471d-b88f-25e83b75af4c";

type DashBadgeType = "Exclusive" | "CMO" | "RFQ" | "Tech Transfer" | "Open";

const DASH_BADGE_CONFIG: Record<DashBadgeType, { bg: string; text: string; hasStar: boolean }> = {
  Exclusive:       { bg: "#020202",  text: "white", hasStar: true  },
  CMO:             { bg: "#1F6F54",  text: "white", hasStar: false },
  RFQ:             { bg: "#0077CC",  text: "white", hasStar: false },
  "Tech Transfer": { bg: "#7C3AED",  text: "white", hasStar: false },
  Open:            { bg: "#D97706",  text: "white", hasStar: false },
};

const MATCHED_PROJECTS: Array<{
  id: number;
  image: string;
  badge: DashBadgeType | null;
  industry: string;
  title: string;
  description: string;
}> = [
  { id: 1, image: SUPPLIER_IMAGES.agro[0],       badge: "Exclusive",      industry: "Agro Chemical",        title: "Reactive ingredient for acrylate polymer synthesis",             description: "Gas Chromatography–Mass Spectrometry (GC-MS) analysis required for purity verification" },
  { id: 2, image: SUPPLIER_IMAGES.agro[1],       badge: "CMO",            industry: "Industrial Chemicals",  title: "Large-scale production of specialty surfactant series",           description: "Batch scale-up from 50 g to 200 kg with full regulatory support documentation" },
  { id: 3, image: SUPPLIER_IMAGES.agro[2],       badge: "RFQ",            industry: "Agro Chemical",         title: "Technical grade herbicide formulation development and scale-up",  description: "EC and WP formulations to be developed with stability data at accelerated conditions" },
  { id: 4, image: SUPPLIER_IMAGES.pharma[0],     badge: "CMO",            industry: "Pharmaceutical",        title: "Custom synthesis of novel kinase inhibitor scaffold",             description: "Requires stereoselective hydrogenation at multi-gram scale with chiral HPLC analysis" },
  { id: 5, image: SUPPLIER_IMAGES.pharma[1],     badge: "Tech Transfer",  industry: "Pharmaceutical",        title: "API impurity profiling and forced degradation study",             description: "ICH Q1A compliant stress testing across thermal, photolytic and hydrolytic conditions" },
  { id: 6, image: SUPPLIER_IMAGES.industrial[0], badge: "Open",           industry: "Metallurgy Chemicals",  title: "Development of low-VOC metal surface treatment solution",         description: "Replacement of chromate-based passivation with RoHS-compliant alternative chemistry" },
];

function ProjectsMatched() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      carouselRef.current.scrollTo({
        left: scrollLeft + (dir === "left" ? -clientWidth / 2 : clientWidth / 2),
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      {/* Keyframes for gradient border animation */}
      <style>{`
        @keyframes dashGradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Projects Matched for your Industry</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Based on your profile, here are projects you may be a good fit for, we will match you better as we learn more about you.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 sm:ml-4">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#1F6F54] transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#1F6F54] transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/*
        Border-fix wrapper: overflow-x-auto clips absolute children.
        py-[4px] -my-[4px] gives the 1.5px gradient border clearance top & bottom.
        px-[4px] -mx-[4px] gives clearance on left/right edges.
      */}
      <div className="overflow-hidden -mx-[4px] -my-[4px]">
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory mt-4 py-[4px] px-[4px]"
          style={{ scrollBehavior: "smooth" }}
        >
        {MATCHED_PROJECTS.map((p) => {
          const badge = p.badge ? DASH_BADGE_CONFIG[p.badge] : null;
          return (
            /* Outer wrapper — gradient border appears on hover */
            <div key={p.id} className="w-[280px] sm:w-[230px] flex-shrink-0 snap-start group relative cursor-pointer">
              {/* Animated gradient border layer */}
              <div
                className="absolute -inset-[1.5px] rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(135deg, #1F6F54 0%, #2ACB83 40%, #1F6F54 70%, #2dd194 100%)",
                  backgroundSize: "300% 300%",
                  animation: "dashGradientShift 3s ease infinite",
                }}
              />

              {/* Card body */}
              <div className="relative bg-white rounded-[12px] p-[10px] flex flex-col gap-3.5 overflow-hidden shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.06)] group-hover:shadow-[0px_16px_32px_rgba(31,111,84,0.18)] group-hover:pb-11 transition-[box-shadow,padding] duration-300 ease-in-out h-full">
                {/* Image */}
                <div className="relative overflow-hidden rounded-[10px] h-[130px] bg-[#cfd8dc] flex-shrink-0">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.07]"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badge */}
                  {p.badge && badge && (
                    <div
                      className="absolute top-[8px] left-[9px] flex items-center gap-[5px] px-2 py-1 rounded-[39px] border border-white/30"
                      style={{ backgroundColor: badge.bg }}
                    >
                      {badge.hasStar && (
                        <img src={STAR_ICON} alt="" className="w-[14px] h-[14px] object-contain flex-shrink-0" />
                      )}
                      <span className="text-[11px] font-medium leading-[20px]" style={{ color: badge.text }}>
                        {p.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Industry pill */}
                <div>
                  <span className="inline-flex items-center px-[10px] py-[2px] rounded-full bg-[#e3f4ff] text-[#171717] text-[13px] font-medium leading-[24px]">
                    {p.industry}
                  </span>
                </div>

                {/* Text */}
                <div className="flex flex-col gap-[5px] flex-1">
                  <h3 className="font-semibold text-[15px] leading-[22px] text-black line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-[12px] font-normal leading-[18px] text-[#353535] line-clamp-2">
                    {p.description}
                  </p>
                </div>

                {/* Arrow — appears on hover */}
                <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-[#1F6F54] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}

// ─── 5. Platform Stats ────────────────────────────────────────────────────────
const STATS = [
  { num: 500,  suffix: "+",  label: "MANUFACTURERS\nALREADY ONBOARDED" },
  { num: 120,  suffix: "+",  label: "UNIQUE PROJECTS\nSUCCESSFULLY COMPLETED" },
  { num: 2400, suffix: "+",  label: "SUPPLIER REQUIREMENTS\nSHARED", thousands: true },
  { num: 130,  suffix: "+",  label: "COUNTRIES\nREQUESTING" },
  { num: 4.8,  suffix: "/5", label: "SUPPLIER\nSATISFACTION", decimal: true },
];

function PlatformStats() {
  const [counts, setCounts] = useState(STATS.map(() => 0));
  const animatingRef = useRef(false);
  const rafRef = useRef<number | undefined>(undefined);

  const startAnimation = () => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCounts(STATS.map(s =>
        s.decimal ? Math.round(s.num * eased * 10) / 10 : Math.floor(s.num * eased)
      ));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        animatingRef.current = false;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const formatCount = (count: number, s: typeof STATS[0]) => {
    if (s.decimal) return count.toFixed(1) + s.suffix;
    if (s.thousands && count >= 1000)
      return Math.floor(count / 1000) + "," + String(count % 1000).padStart(3, "0") + s.suffix;
    return String(count) + s.suffix;
  };

  return (
    <section
      className="bg-[#0d1117] rounded-2xl px-4 py-6 sm:px-8 sm:py-8"
      onMouseEnter={startAnimation}
    >
      <p className="text-center text-slate-500 text-[11px] font-bold uppercase tracking-[0.25em] mb-8">
        What&apos;s Happening on the Platform
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
        {STATS.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <span className="text-3xl sm:text-5xl md:text-6xl font-black text-white tabular-nums leading-none">
              {formatCount(counts[i], s)}
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

// ─── 6. Buyers Looking ────────────────────────────────────────────────────────
const BUYERS = [
  { id: 1, image: SUPPLIER_IMAGES.industrial[2], badges: ["RFQ", "LIVE DEMAND"], text: "Looking for high-pressure hydrogenation capability (up to 90 bar) for a 5-ton batch.",               category: "Industrial Chemicals" },
  { id: 2, image: SUPPLIER_IMAGES.agro[1],        badges: ["CDMO"],               text: "Seeking CDMO partner for scale-up of pesticide intermediate (pilot to commercial).",               category: "Agrochemicals" },
  { id: 3, image: SUPPLIER_IMAGES.pharma[0],      badges: ["RFQ"],                text: "Requirement for solvent recovery and purification at 10 KL scale.",                                category: "Pharma" },
  { id: 4, image: SUPPLIER_IMAGES.industrial[1],  badges: ["CMO", "LIVE DEMAND"], text: "Urgent requirement for custom catalyst synthesis for polymer production. Immediate start preferred.", category: "Industrial Chemicals" },
  { id: 5, image: SUPPLIER_IMAGES.specialty[0],   badges: ["RFQ"],                text: "Looking for cryogenic reaction capability (−78°C) for specialty intermediate synthesis.",           category: "Specialty Chemicals" },
  { id: 6, image: SUPPLIER_IMAGES.agro[0],        badges: ["CDMO", "LIVE DEMAND"],text: "Seeking partner for novel herbicide formulation scale-up. Pilot plant scale (100 kg).",             category: "Agrochemicals" },
  { id: 7, image: SUPPLIER_IMAGES.specialty[1],   badges: ["CMO"],                text: "Bulk production of specialty coating additives. ISO 9001 certification required.",                  category: "Polymers" },
  { id: 8, image: SUPPLIER_IMAGES.pharma[2],      badges: ["RFQ", "LIVE DEMAND"], text: "High-purity solvent purification project. Distillation & Fractional Crystallization.",             category: "Industrial Chemicals" },
];

function BuyersLooking() {
  const [page, setPage] = useState(0);
  const perPage = 4;
  const total = Math.ceil(BUYERS.length / perPage);
  const current = BUYERS.slice(page * perPage, (page + 1) * perPage);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Buyers Are Already Looking for You</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 tabular-nums">{page + 1} / {total}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => (p - 1 + total) % total)}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#1F6F54] transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPage((p) => (p + 1) % total)}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#1F6F54] transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-200">
        {current.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-slate-100 flex overflow-hidden hover:shadow-md hover:border-slate-200 transition-all duration-300 cursor-pointer group h-[120px]"
          >
            <div className="relative w-1/3 overflow-hidden shrink-0">
              <img
                src={b.image}
                alt="Buyer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                {/* Badge row — LIVE DEMAND removed, only type badges shown */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {b.badges
                    .filter((badge) => badge !== "LIVE DEMAND")
                    .map((badge) => {
                      const styles: Record<string, string> = {
                        RFQ:  "bg-[#e3f4ff] text-[#0077CC]",
                        CMO:  "bg-[#f0faf5] text-[#1F6F54]",
                        CDMO: "bg-[#f3f0ff] text-[#7C3AED]",
                      };
                      return (
                        <span
                          key={badge}
                          className={`inline-flex items-center px-[10px] py-[2px] rounded-full text-[11px] font-medium leading-[20px] ${styles[badge] ?? "bg-slate-100 text-slate-600"}`}
                        >
                          {badge}
                        </span>
                      );
                    })}
                </div>
                <p className="text-[#020202] text-[13px] font-normal leading-[20px] line-clamp-3">&quot;{b.text}&quot;</p>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="inline-flex items-center px-[10px] py-[2px] rounded-full bg-[#e3f4ff] text-[#171717] text-[11px] font-medium leading-[20px]">{b.category}</span>
                <div className="w-6 h-6 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#1F6F54] group-hover:text-white transition-all duration-300">
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 7. Tools & Services ──────────────────────────────────────────────────────
function ToolsServices() {
  return (
    <section>
      <h2
        className="mb-6 text-base sm:text-lg font-bold text-slate-900"
      >
        Tools and Services
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
        {/* Card 1 — Source Raw Materials (blue tint) */}
        <ToolCard
          cardBg="bg-[#f3f5f8]"
          iconBadgeBg="bg-[#e7f0fb]"
          iconColor="text-blue-500"
          Icon={Network}
          title="Source Raw Materials from Verified Suppliers"
          description="Find trusted suppliers for your raw materials, intermediates, and specialty chemicals - all in one place"
          cta="START SOURCING"
          ctaColor="text-[#2563eb]"
        />

        {/* Card 2 — Find Manufacturing Partner (green tint) */}
        <ToolCard
          cardBg="bg-[#f2f7f5]"
          iconBadgeBg="bg-[#e2f9ed]"
          iconColor="text-emerald-600"
          Icon={Factory}
          title="Find the Right Manufacturing Partner"
          description="Need extra capacity or a specialized process? Connect with facilities that can take your product from pilot to full-scale production."
          cta="FIND PARTNERS"
          ctaColor="text-[#2563eb]"
        />
      </div>
    </section>
  );
}

function ToolCard({
  cardBg,
  iconBadgeBg,
  iconColor,
  Icon,
  title,
  description,
  cta,
  ctaColor,
}: {
  cardBg: string;
  iconBadgeBg: string;
  iconColor: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  ctaColor: string;
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-[12px] border border-[#cfd8dc] p-4
        ${cardBg}
        shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]
        hover:shadow-[0px_12px_28px_0px_rgba(0,0,0,0.13)]
        transition-all duration-300 cursor-pointer group
        flex flex-col gap-[10px]
      `}
    >
      {/* ── Decorative background icon — scales up on hover ── */}
      <div
        className={`
          pointer-events-none absolute -top-6 right-2 ${iconColor} opacity-[0.07]
          transition-transform duration-500 ease-out
          group-hover:scale-125 group-hover:opacity-[0.11]
          origin-top-right
        `}
      >
        <Icon size={200} strokeWidth={1} />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col gap-[6px]">
        {/* Small icon badge */}
        <div
          className={`w-[45px] h-[45px] rounded-[8px] flex items-center justify-center shadow-[0px_3.5px_5.5px_0px_rgba(0,0,0,0.02)] ${iconBadgeBg}`}
        >
          <Icon size={22} className={iconColor} />
        </div>

        {/* Text */}
        <div className="flex flex-col mt-1">
          <p className="font-semibold text-[18px] leading-[28px] text-[#0f172a]">{title}</p>
          <p className="font-normal text-[16px] leading-[24px] text-[#64748b] mt-0.5">{description}</p>
        </div>

        {/* CTA — slightly larger on hover */}
        <div className="flex items-center gap-[6px] px-4 pt-3">
          <span
            className={`
              font-bold text-[14px] leading-[24px] underline decoration-solid ${ctaColor}
              transition-all duration-200
              group-hover:text-[15px]
            `}
          >
            {cta}
          </span>
          <ArrowRight
            size={16}
            className={`
              ${ctaColor}
              transition-all duration-200
              group-hover:translate-x-1 group-hover:scale-110
            `}
          />
        </div>
      </div>
    </div>
  );
}

// ─── 8. Expert CTA ────────────────────────────────────────────────────────────
// Figma asset — right-side graphic (users icon)
const EXPERT_ICON_SRC =
  "https://www.figma.com/api/mcp/asset/1261a390-80d9-42d7-a1ce-22e3b804b103";

function ExpertCTA() {
  return (
    <section className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#182133] to-[#016358] px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
      {/* Ambient green glow — matches Figma blur blob */}
      <div className="pointer-events-none absolute right-[200px] top-[60px] w-[256px] h-[256px] rounded-full bg-[rgba(42,203,131,0.10)] blur-[64px]" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">

        {/* ── LEFT: content ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-0">

          {/* Header row: icon badge + title + subtitle */}
          <div className="flex items-center gap-3 mb-4">
            {/* Glass icon badge */}
            <div className="relative shrink-0 w-[45px] h-[45px]">
              <div
                className="absolute inset-0 rounded-[8px] shadow-[0px_3.5px_5.5px_0px_rgba(0,0,0,0.02)]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(247,254,231,0.50) 0%, rgba(247,254,231,0.10) 100%)",
                }}
              />
              <div className="absolute top-[10px] left-[10px] w-6 h-6 text-white/80">
                <MessageSquare size={22} />
              </div>
            </div>

            {/* Title + subtitle */}
            <div className="flex flex-col">
              <h3
                className="text-white text-[20px] font-semibold leading-[28px] tracking-[-0.005em] whitespace-nowrap"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Talk to a Manufacturing Expert
              </h3>
              <p className="text-[#94a3b8] text-[16px] font-normal leading-[24px]">
                Get expert guidance on setting up your capabilities.
              </p>
            </div>
          </div>

          {/* Body paragraph */}
          <p className="text-[#cbd5e1] text-[16px] font-normal leading-[24px] mb-6 max-w-[700px]">
            Not sure how to get started or increase enquiries? Our team can guide you on
            setting up your profile, improving visibility, and connecting with the right
            opportunities.
          </p>

          {/* CTA row: button + Available now */}
          <div className="flex items-center gap-8">
            {/* Schedule a call button */}
            <button className="flex items-center gap-2 bg-[#1f6f54] hover:bg-[#185C45] transition-colors px-4 py-2 rounded-[6px] text-white text-sm font-medium leading-[24px] shrink-0">
              <Plus size={16} />
              Schedule a call
            </button>

            {/* Available now indicator */}
            <div className="flex items-center gap-[10px]">
              {/* Pulsing green dot */}
              <span className="relative flex h-[10px] w-[10px] shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                <span className="relative inline-flex rounded-full h-[10px] w-[10px] bg-[#10b981]" />
              </span>
              <span className="text-[#94a3b8] text-[14px] font-normal leading-[20px] whitespace-nowrap">
                Available now
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: circle graphic ──────────────────────────── */}
        <div
          className="hidden md:flex items-center justify-center shrink-0 w-[192px] h-[192px] rounded-full border border-white/10"
          style={{
            background:
              "linear-gradient(136.89deg, rgba(1,114,231,0.20) 20.20%, rgba(45,209,124,0.20) 83.55%)",
          }}
        >
          <img
            src={EXPERT_ICON_SRC}
            alt="Expert"
            className="w-[80px] h-[80px] object-contain"
          />
        </div>

      </div>
    </section>
  );
}
