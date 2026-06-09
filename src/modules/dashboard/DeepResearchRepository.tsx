"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FlaskConical, BookOpen, Search, Plus, ArrowRight, Lock,
  CheckCircle2, Star, Zap, FileText, Share2, Download,
  Crown, ChevronRight, Clock, BookMarked, Beaker,
  Microscope, Database, TrendingUp, Users, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanType = "free" | "premium";
type FilterType = "all" | "compounds" | "literature" | "patents";

// ─── Constants ────────────────────────────────────────────────────────────────

const MOLECULES_USED = 0;
const MOLECULES_LIMIT = 20;

const WORKSPACE_CARDS = [
  {
    id: "research",
    icon: FlaskConical,
    iconBg: "#e3f5ec",
    iconColor: "#1a5c3a",
    tag: "AI RESEARCH WORKSPACE",
    title: "Research Workspace",
    description:
      "Generate retrosynthesis routes, compare synthesis pathways, evaluate reaction feasibility, and explore alternative synthetic approaches ranked by confidence score.",
    features: ["Route Generation", "Route Variants", "Graph View", "Process Flow"],
    cta: "Open Research Workspace",
    href: "#research-workspace",
  },
  {
    id: "literature",
    icon: BookOpen,
    iconBg: "#e8f0fb",
    iconColor: "#1e50a2",
    tag: "LITERATURE SYNTHESIS",
    title: "Literature Workspace",
    description:
      "Search journals, patents, publications, and scientific evidence simultaneously. Get citation-backed synthesis summaries — every claim traced to its exact source.",
    features: ["Literature Analysis", "Patent Search", "Evidence Summaries", "Citation Tracking"],
    cta: "Open Literature Workspace",
    href: "#literature-workspace",
  },
] as const;

const BUSINESS_VALUE = [
  {
    icon: Zap,
    color: "#1a5c3a",
    bg: "#e3f5ec",
    title: "Faster Route Discovery",
    desc: "Reduce hours of manual research into minutes with AI-ranked synthesis routes.",
  },
  {
    icon: CheckCircle2,
    color: "#1e50a2",
    bg: "#e8f0fb",
    title: "Improve Research Confidence",
    desc: "Validate findings using literature, patents, and scientific evidence in one query.",
  },
  {
    icon: TrendingUp,
    color: "#7c3aed",
    bg: "#ede9fe",
    title: "Increase Project Throughput",
    desc: "Research more compounds in less time, with every route scored and ready to refine.",
  },
  {
    icon: Database,
    color: "#9C5022",
    bg: "#FBF0C5",
    title: "Preserve Research Knowledge",
    desc: "Store and revisit all research from a centralized repository, automatically organized.",
  },
];

const GETTING_STARTED_STEPS = [
  {
    n: "1",
    title: "Search your molecule",
    desc: "Enter a Molecule Name, CAS Number, InChI, or SMILES string.",
    icon: Search,
  },
  {
    n: "2",
    title: "Generate insights",
    desc: "Get synthesis routes ranked by confidence score, literature references, and patent data.",
    icon: FlaskConical,
  },
  {
    n: "3",
    title: "Save to repository",
    desc: "All findings are automatically stored in your research repository.",
    icon: Database,
  },
  {
    n: "4",
    title: "Export and share",
    desc: "Export lab-ready protocols and share research results with your team.",
    icon: Share2,
  },
];

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[480px] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-5" style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center border border-white/30 text-white/70 hover:text-white transition-colors">
            <X size={13} />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Crown size={16} className="text-white" />
            </div>
            <span className="text-white text-[11px] font-bold tracking-[0.15em]">PREMIUM RESEARCH</span>
          </div>
          <h2 className="text-white text-[22px] font-bold leading-tight mb-1.5">Unlock Unlimited Research</h2>
          <p className="text-white/70 text-[13px] leading-relaxed">
            Research unlimited molecules, modify synthesis paths, export full reports, and access the complete research repository.
          </p>
        </div>
        <div className="px-6 py-5 flex flex-col gap-3">
          {[
            "Unlimited molecule research — no caps",
            "Modify Path — edit routes, reagents, and conditions",
            "Export full synthesis reports as PDF",
            "Complete literature citations and provenance",
            "Unlimited repository access",
          ].map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#e3f5ec" }}>
                <CheckCircle2 size={11} style={{ color: "#1a5c3a" }} />
              </div>
              <span className="text-[13px] text-slate-700 leading-snug">{b}</span>
            </div>
          ))}
        </div>
        <div className="px-6 pb-5 pt-1 flex gap-3 border-t border-slate-100">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-semibold hover:bg-slate-50 transition-colors">
            Maybe later
          </button>
          <button className="flex-1 py-2.5 rounded-xl text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
            <Crown size={13} /> Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DeepResearchRepository() {
  const router = useRouter();
  const [plan] = useState<PlanType>("free");
  const [filter, setFilter] = useState<FilterType>("all");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const pct = (MOLECULES_USED / MOLECULES_LIMIT) * 100;

  return (
    <>
      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}

      <div className="flex flex-col gap-5 pb-12 max-w-[1200px] mx-auto px-4 sm:px-0">

        {/* ── FREE PLAN USAGE BANNER ──────────────────────────────────────── */}
        {plan === "free" && (
          <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border"
            style={{ background: "#f9fafb", borderColor: "#e4e4e7" }}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "#e3f5ec" }}>
                <FlaskConical size={14} style={{ color: "#1a5c3a" }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[11px] font-bold px-2 py-[2px] rounded-full"
                    style={{ background: "#e3f5ec", color: "#1a5c3a" }}>FREE PLAN</span>
                  <span className="text-[12px] text-slate-600 font-medium">
                    {MOLECULES_USED} / {MOLECULES_LIMIT} molecules researched
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 max-w-[200px] h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: "#1a5c3a" }} />
                  </div>
                  <span className="text-[10px] text-slate-400">{MOLECULES_LIMIT - MOLECULES_USED} remaining</span>
                </div>
              </div>
            </div>
            <button onClick={() => setUpgradeOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-[12px] font-bold shrink-0 hover:brightness-110 transition-all"
              style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
              <Crown size={12} /> Upgrade to Premium
            </button>
          </div>
        )}

        {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg,#0d2818 0%,#0a1f14 50%,#091510 100%)" }}>
          {/* Grid texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }} />
          {/* Glow */}
          <div className="absolute -top-20 left-[30%] w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(26,92,58,0.35) 0%,transparent 70%)", filter: "blur(60px)" }} />

          <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">

            {/* Left: text */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold mb-4"
                style={{ background: "rgba(26,92,58,0.40)", border: "1px solid rgba(26,92,58,0.55)", color: "#6ee7b7" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                DEEP RESEARCH MODULE
              </div>
              <h1 className="text-white font-bold leading-[1.1] tracking-[-0.02em] mb-3"
                style={{ fontSize: "clamp(24px,3.5vw,38px)" }}>
                Accelerate Chemical Research<br />
                <span style={{ color: "#6ee7b7" }}>with AI-Powered Deep Research</span>
              </h1>
              <p className="text-white/60 text-[13px] sm:text-[14px] leading-relaxed max-w-[540px] mb-6">
                Discover synthesis routes, compare alternative pathways, explore scientific literature, and build evidence-backed research workflows. All research is automatically organised in your repository.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setUpgradeOpen(false)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold text-[#0d2818] hover:brightness-105 transition-all"
                  style={{ background: "#6ee7b7" }}>
                  <Plus size={14} /> Start New Research
                </button>
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold border border-white/20 text-white/80 hover:bg-white/10 transition-colors">
                  <BookOpen size={14} /> Explore Literature
                </button>
              </div>
            </div>

            {/* Right: feature pills */}
            <div className="hidden lg:flex flex-col gap-2 shrink-0">
              {[
                { icon: FlaskConical, label: "Retrosynthesis Routes",  sub: "AI-ranked by confidence" },
                { icon: BookOpen,     label: "Literature Synthesis",    sub: "Journals, patents, preprints" },
                { icon: Database,     label: "Research Repository",     sub: "All findings auto-saved" },
                { icon: FileText,     label: "Lab-Ready Export",        sub: "PDF protocols on demand" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(110,231,183,0.12)" }}>
                    <Icon size={14} style={{ color: "#6ee7b7" }} />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-white leading-tight">{label}</p>
                    <p className="text-[10px] text-white/40">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN 70/30 LAYOUT ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-start">

          {/* ══ LEFT 70% ══ */}
          <div className="lg:col-span-7 flex flex-col gap-5">

            {/* Research Workspaces */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">RESEARCH WORKSPACES</p>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WORKSPACE_CARDS.map((w) => {
                  const Icon = w.icon;
                  return (
                    <div key={w.id}
                      className="bg-white rounded-2xl border border-[#e4e4e7] p-5 flex flex-col gap-4 hover:border-[#1a5c3a]/30 hover:shadow-sm transition-all cursor-pointer group">

                      {/* Tag + icon */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-2">
                          <span className="text-[9.5px] font-bold tracking-[0.14em] text-slate-400">{w.tag}</span>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: w.iconBg }}>
                            <Icon size={20} style={{ color: w.iconColor }} />
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-200 text-slate-300 group-hover:border-[#1a5c3a] group-hover:text-[#1a5c3a] transition-colors">
                          <ArrowRight size={13} />
                        </div>
                      </div>

                      {/* Title + desc */}
                      <div>
                        <h3 className="text-[15px] font-bold text-slate-900 mb-1.5 leading-tight">{w.title}</h3>
                        <p className="text-[12.5px] text-slate-500 leading-relaxed">{w.description}</p>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1.5">
                        {w.features.map(f => (
                          <span key={f}
                            className="flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded"
                            style={{ background: "#f0fdf4", color: "#1a5c3a" }}>
                            <CheckCircle2 size={9} /> {f}
                          </span>
                        ))}
                      </div>

                      {/* CTA */}
                      <button
                        className="w-full py-2 rounded-lg text-[12.5px] font-bold border-2 transition-all hover:text-white hover:bg-[#1a5c3a] group-hover:border-[#1a5c3a]"
                        style={{ borderColor: "#1a5c3a", color: "#1a5c3a" }}>
                        {w.cta}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Business value */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">HOW DEEP RESEARCH HELPS</p>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BUSINESS_VALUE.map(({ icon: Icon, color, bg, title, desc }) => (
                  <div key={title}
                    className="bg-white rounded-xl border border-[#e4e4e7] p-4 flex flex-col gap-2.5 hover:border-slate-300 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: bg }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    <p className="text-[12px] font-bold text-slate-800 leading-tight">{title}</p>
                    <p className="text-[10.5px] text-slate-500 leading-snug">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Research */}
            <section>
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">RECENT RESEARCH</p>
                  <div className="h-px w-12 bg-slate-100" />
                </div>
                {/* Filter bar */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["all", "compounds", "literature", "patents"] as FilterType[]).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[11px] font-semibold transition-all capitalize",
                        filter === f
                          ? "bg-[#1a5c3a] text-white"
                          : "bg-[#f3f4f6] text-slate-500 hover:bg-slate-200"
                      )}>
                      {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Empty state */}
              <div className="bg-white rounded-2xl border-2 border-dashed border-[#e4e4e7] py-14 px-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "#f0fdf4" }}>
                  <FlaskConical size={26} style={{ color: "#1a5c3a" }} />
                </div>
                <p className="text-[15px] font-bold text-slate-800 mb-1.5">No Research Yet</p>
                <p className="text-[12.5px] text-slate-400 max-w-[320px] leading-relaxed mb-5">
                  Start your first Deep Research session to discover synthesis routes, literature references, and chemical insights.
                </p>
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[13px] font-bold hover:brightness-110 transition-all"
                  style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
                  <Plus size={14} /> Start New Research
                </button>
              </div>
            </section>

          </div>

          {/* ══ RIGHT 30% ══ */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* Getting Started */}
            <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
              <div className="px-4 py-3.5 border-b border-[#f3f4f6]"
                style={{ background: "#f9fafb" }}>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-0.5">GETTING STARTED</p>
                <h3 className="text-[14px] font-bold text-slate-900">4 steps to your first insight</h3>
              </div>
              <div className="px-4 py-4 flex flex-col gap-0">
                {GETTING_STARTED_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex gap-3">
                      {/* Line + number */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 z-10"
                          style={{ background: "#e3f5ec", color: "#1a5c3a" }}>
                          {step.n}
                        </div>
                        {i < GETTING_STARTED_STEPS.length - 1 && (
                          <div className="w-px flex-1 mt-1 mb-1" style={{ background: "#e4e4e7", minHeight: 20 }} />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pb-4 min-w-0 flex-1">
                        <p className="text-[12.5px] font-bold text-slate-800 leading-tight mb-0.5">{step.title}</p>
                        <p className="text-[11px] text-slate-400 leading-snug">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 pb-4">
                <button
                  className="w-full py-2.5 rounded-lg text-white text-[12.5px] font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                  style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
                  <Search size={13} /> Start New Research
                </button>
              </div>
            </div>

            {/* Premium features card */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#0d1f14", border: "1px solid rgba(110,231,183,0.15)" }}>
              <div className="px-4 py-3.5 border-b" style={{ borderColor: "rgba(110,231,183,0.10)" }}>
                <div className="flex items-center gap-2 mb-0.5">
                  <Lock size={12} style={{ color: "#6ee7b7" }} />
                  <p className="text-[10px] font-bold tracking-[0.14em]" style={{ color: "#6ee7b7" }}>PREMIUM FEATURES</p>
                </div>
                <p className="text-[12px] text-white/60">Unlock the full research workflow</p>
              </div>
              <div className="px-4 py-4 flex flex-col gap-2.5">
                {[
                  { icon: "✏️", label: "Modify Path",       desc: "Edit routes, reagents & conditions" },
                  { icon: "📄", label: "Export PDF",         desc: "Full synthesis reports" },
                  { icon: "🔢", label: "Stoichiometry",      desc: "Edit quantities & reaction scale" },
                  { icon: "📚", label: "Full Citations",     desc: "Complete provenance for every claim" },
                  { icon: "∞",  label: "Unlimited Molecules", desc: "No research caps" },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[14px] shrink-0 mt-[1px]">{f.icon}</span>
                    <div>
                      <p className="text-[11.5px] font-semibold text-white/80 leading-tight">{f.label}</p>
                      <p className="text-[10px]" style={{ color: "rgba(110,231,183,0.50)" }}>{f.desc}</p>
                    </div>
                    <Lock size={9} className="ml-auto shrink-0 mt-[3px]" style={{ color: "rgba(110,231,183,0.35)" }} />
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4">
                <button onClick={() => setUpgradeOpen(true)}
                  className="w-full py-2.5 rounded-lg text-[#0d1f14] text-[12px] font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                  style={{ background: "#6ee7b7" }}>
                  <Crown size={12} /> Upgrade to Premium
                </button>
              </div>
            </div>

            {/* Team plan nudge */}
            <div className="bg-white rounded-2xl border border-[#e4e4e7] px-4 py-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-0.5">
                <Users size={13} style={{ color: "#1a5c3a" }} />
                <p className="text-[11px] font-bold text-slate-700">Using Deep Research for your team?</p>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Get a shared repository, team molecule limits, and priority support for your lab or CRO.
              </p>
              <button className="flex items-center gap-1.5 text-[11.5px] font-semibold hover:opacity-75 transition-opacity"
                style={{ color: "#1a5c3a" }}>
                Request Team Plan <ChevronRight size={12} />
              </button>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
