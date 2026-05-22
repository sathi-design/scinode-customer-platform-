"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight, FileText, FlaskConical, LayoutGrid, BookOpen,
  Factory, Building2, FileCheck, Send, Mail, CalendarDays,
  CheckCircle2, ArrowLeft, Lock, Download, Eye, Zap, Clock,
} from "lucide-react";
import { getProjectDetail } from "@/lib/projectsData";
import { cn } from "@/lib/utils";
import { ProposalDrawer } from "./ProposalDrawer";
import { UpgradePremiumModal } from "./UpgradePremiumModal";

// ─── Demo config ───────────────────────────────────────────────────────────────
type DetailDemoState    = "free" | "premium";
const DETAIL_MATCH_TYPE = "Capability-Based" as const;  // or "Product Catalogue-Based"
const DETAIL_CAP_TYPE   = "Co-Development";             // RFQ | Co-Development | Contract Manufacturing

// ─── Shared primitives ─────────────────────────────────────────────────────────
function SectionCard({
  icon, iconBg, iconColor, title, subtitle, tintBg, tintBorder, children,
}: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  title: string; subtitle?: string; tintBg?: string; tintBorder?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-[14px] border p-5", tintBg ?? "bg-white", tintBorder ?? "border-[#e4e4e7]")}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0", iconBg)}>
          <span className={iconColor}>{icon}</span>
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-[#020202] leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-[#62748e] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function KVRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-[#62748e] uppercase tracking-wide">{label}</span>
      <span className={cn(
        "font-semibold text-[#020202]",
        highlight ? "text-[17px]" : "text-[14px]",
      )}>{value}</span>
    </div>
  );
}

function BulletList({ items, color = "#1F6F54" }: { items: string[]; color?: string }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
          <span className="text-[13px] text-[#353535] leading-[20px]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Divider() {
  return <div className="border-t border-[#f3f4f6] my-4" />;
}

// ─── Demo switcher ─────────────────────────────────────────────────────────────
function DetailDemoSwitcher({ current, onChange }: { current: DetailDemoState; onChange: (s: DetailDemoState) => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#e4e4e7] bg-[#fafafa] mb-4">
      <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest shrink-0">Demo</span>
      <div className="flex items-center gap-1">
        {(["free", "premium"] as const).map(s => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={cn(
              "px-2.5 py-[3px] rounded-[5px] text-[11px] font-semibold transition-all duration-150",
              current === s ? "bg-[#020202] text-white" : "text-[#6b7280] hover:bg-[#f0f0f0]",
            )}
          >
            {s === "free" ? "Free Plan" : "Premium"}
          </button>
        ))}
      </div>
      <span className="text-[10.5px] text-[#9ca3af] italic hidden sm:block">
        {current === "free" ? "Free plan — 2 proposals on Open Projects" : "Premium — unlimited access"}
      </span>
    </div>
  );
}

// ─── Gold glow upgrade button (shared across locked overlay + trial card) ───────
function GoldGlowButton({
  label = "Upgrade to Premium",
  className = "",
  onClick,
}: {
  label?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-bold text-[#020202] transition-all hover:brightness-110 active:scale-[0.98] ${className}`}
      style={{
        background: "linear-gradient(90deg,#f5c842,#c9a227)",
        boxShadow: "0 0 18px rgba(245,200,66,0.50), 0 2px 6px rgba(0,0,0,0.25)",
      }}
    >
      <Zap size={13} /> {label}
    </button>
  );
}

// ─── Locked section overlay ────────────────────────────────────────────────────
function LockedSection({ children, onUpgrade }: { children: React.ReactNode; onUpgrade?: () => void }) {
  return (
    <div className="relative rounded-[14px] overflow-hidden">
      {/* Blurred card content */}
      <div className="pointer-events-none select-none" style={{ filter: "blur(5px)", opacity: 0.4 }}>
        {children}
      </div>
      {/* Overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-[14px] px-6 text-center"
        style={{ background: "rgba(2,2,2,0.62)", backdropFilter: "blur(2px)" }}
      >
        <div className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
          style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(245,200,66,0.30)" }}>
          <Lock size={20} style={{ color: "#f5c842" }} />
        </div>
        <p className="text-[13px] font-semibold text-white mb-1.5 leading-snug">
          Upgrade to unlock this section
        </p>
        <p className="text-[11.5px] text-slate-400 leading-relaxed mb-4 max-w-[260px]">
          Upgrade to Premium to unlock manufacturing requirements, technical specifications, and documentation.
        </p>
        <GoldGlowButton onClick={onUpgrade} />
      </div>
    </div>
  );
}

// ─── Scinode Connect (inline SVGs instead of broken Figma MCP URLs) ────────────
function ScinodeConnectCard() {
  return (
    <div className="rounded-[12px] p-[14px] relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #003A1B 0%, #001C08 100%)" }}>
      {/* Decorative background pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke="#2ACB83" strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)" />
      </svg>
      {/* Radial glow */}
      <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
        style={{ background: "radial-gradient(circle at 100% 0%,rgba(42,203,131,0.18) 0%,transparent 65%)" }} />

      <div className="relative flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          {/* Scinode logo mark */}
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 bg-[#1F6F54]/60 border border-[#2ACB83]/25">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="3" fill="#2ACB83"/>
              <circle cx="11" cy="3"  r="2" fill="#2ACB83" opacity="0.7"/>
              <circle cx="11" cy="19" r="2" fill="#2ACB83" opacity="0.7"/>
              <circle cx="3"  cy="11" r="2" fill="#2ACB83" opacity="0.7"/>
              <circle cx="19" cy="11" r="2" fill="#2ACB83" opacity="0.7"/>
              <line x1="11" y1="8" x2="11" y2="5"   stroke="#2ACB83" strokeWidth="1.2" opacity="0.6"/>
              <line x1="11" y1="14" x2="11" y2="17" stroke="#2ACB83" strokeWidth="1.2" opacity="0.6"/>
              <line x1="8"  y1="11" x2="5"  y2="11" stroke="#2ACB83" strokeWidth="1.2" opacity="0.6"/>
              <line x1="14" y1="11" x2="17" y2="11" stroke="#2ACB83" strokeWidth="1.2" opacity="0.6"/>
            </svg>
          </div>
          <h3 className="text-[17px] font-semibold text-white leading-tight">SCINODE Connect</h3>
        </div>

        <p className="text-[13px] text-white/70 leading-[22px] -mt-1">
          Get instant help with technical expertise.
        </p>

        <div className="flex flex-col gap-2">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] border border-white/25 text-white text-[13px] font-medium hover:bg-white/10 transition-colors">
            <Mail className="w-4 h-4 flex-shrink-0" />
            Send an Email
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[13px] font-medium transition-colors">
            <CalendarDays className="w-4 h-4 flex-shrink-0" />
            Schedule Discussion Call
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Trial state sidebar card ──────────────────────────────────────────────────
function TrialStateCard({ demo, isExclusive, onUpgrade }: { demo: DetailDemoState; isExclusive: boolean; onUpgrade?: () => void }) {
  if (demo === "free") {
    return (
      <div className="rounded-[14px] border bg-[#0e0e0e] p-4 flex flex-col gap-3"
        style={{ borderColor: "rgba(201,162,39,0.30)" }}>

        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock size={13} style={{ color: "#c9a227" }} />
            <span className="text-[13px] font-semibold text-white">Free Plan</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: "rgba(245,200,66,0.10)", color: "#f5c842", border: "1px solid rgba(201,162,39,0.35)" }}>
            2 proposals
          </span>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

        {/* Hero — "2 Proposals Included" gold pill */}
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-[5px] rounded-[6px] text-[11.5px] font-bold text-[#020202] shrink-0"
            style={{
              background: "linear-gradient(90deg,#f5c842,#c9a227)",
              boxShadow: "0 0 10px rgba(245,200,66,0.35)",
            }}
          >
            <Zap size={10} /> 2 Proposals Included
          </span>
          <span className="text-[11px] text-white/40">on Open Projects</span>
        </div>

        {/* Body */}
        <p className="text-[12px] text-white/60 leading-[19px]">
          {isExclusive
            ? "Exclusive Projects are reserved for Premium members. Upgrade to access this project."
            : "Use your 2 free proposals on Open Projects. Upgrade to Premium for unlimited submissions."}{" "}
        </p>

        {/* Primary CTA */}
        <GoldGlowButton label="Upgrade to Premium" className="w-full py-2.5 text-[13px]" onClick={onUpgrade} />

        {/* Secondary */}
        <button className="w-full py-2 rounded-[8px] text-[12px] font-medium text-white/55 border transition-colors hover:text-white hover:border-white/30"
          style={{ borderColor: "rgba(255,255,255,0.14)" }}>
          Compare Plans
        </button>
      </div>
    );
  }

  // Premium — green accent card
  return (
    <div className="rounded-[14px] border bg-[#f0faf5] p-4 flex flex-col gap-3"
      style={{ borderColor: "rgba(31,111,84,0.30)" }}>

      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "rgba(31,111,84,0.12)", border: "1px solid rgba(31,111,84,0.25)" }}>
          <CheckCircle2 size={11} style={{ color: "#1F6F54" }} />
        </div>
        <span className="text-[13px] font-semibold" style={{ color: "#1F6F54" }}>Premium Active</span>
        <span className="text-[13px] text-[#62748e]">— Full Access</span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(31,111,84,0.10)" }} />

      {/* Callout */}
      <div className="px-3 py-2.5 rounded-[8px]" style={{ background: "rgba(31,111,84,0.06)", border: "1px solid rgba(31,111,84,0.12)" }}>
        <p className="text-[12px] text-[#374151] leading-[19px]">
          You have{" "}
          <span className="font-bold text-[#1F6F54]">unlimited proposals</span>{" "}
          and full access to{" "}
          <span className="font-bold text-[#1F6F54]">Exclusive Projects</span>{" "}
          and Market Intelligence.
        </p>
      </div>

      {/* CTA — submit proposal directly */}
      <button
        className="w-full py-2.5 rounded-[8px] text-[13px] font-semibold text-white transition-colors"
        style={{ background: "#1F6F54" }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#185C45")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#1F6F54")}
      >
        Submit Proposal
      </button>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
export function ManufacturerProjectDetail({ id }: { id: number }) {
  const router  = useRouter();
  const p       = getProjectDetail(id);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [demo, setDemo]               = useState<DetailDemoState>("free");

  const isLocked    = false;  // all project details visible on both free and premium plans
  const isExclusive = p.badge === "Exclusive";

  // Match type derived from project ID (odd = Capability, even = Catalogue)
  const matchType = id % 2 !== 0 ? DETAIL_MATCH_TYPE : "Product Catalogue-Based";

  const openUpgrade = () => setUpgradeOpen(true);

  return (
    <>
      <ProposalDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} project={p} onUpgrade={openUpgrade} planMode={demo} />
      <UpgradePremiumModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      <div className="flex flex-col gap-0 pb-12 max-w-[1200px] mx-auto px-4 sm:px-0">

        {/* ── Demo switcher ───────────────────────────────────────── */}
        <DetailDemoSwitcher current={demo} onChange={setDemo} />

        {/* ── Breadcrumb ──────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-[13px] text-[#62748e] mb-4 px-1">
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="hover:text-[#1F6F54] transition-colors font-medium"
          >
            Projects
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#cbd5e1]" />
          <span className="text-[#020202] font-medium line-clamp-1 max-w-[400px]">{p.title}</span>
        </nav>

        {/* ── Header card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-[16px] border border-[#e4e4e7] shadow-[0px_2px_8px_rgba(0,0,0,0.06)] p-4 sm:p-5 mb-5 flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          {/* Thumbnail */}
          <div className="w-[110px] h-[82px] rounded-[10px] overflow-hidden flex-shrink-0 bg-[#cfd8dc] relative">
            <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
            {/* Top scrim for pill contrast */}
            <div className="absolute inset-x-0 top-0 h-10"
              style={{ background: "linear-gradient(to bottom,rgba(0,0,0,0.35) 0%,transparent 100%)" }} />
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            {/* Badge row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* Badge 1 — match type */}
              <span className={cn(
                "inline-flex items-center px-2.5 py-[2px] rounded-[4px] text-[11px] font-semibold leading-[20px]",
                matchType === "Capability-Based"
                  ? "bg-[#e8faf2] text-[#0E6F5C] border border-[#bbf7d0]"
                  : "bg-[#ede9fe] text-[#6237C7] border border-[#ddd6fe]",
              )}>
                {matchType}
              </span>
              {/* Badge 2 — capability type */}
              <span className="inline-flex items-center px-2.5 py-[2px] rounded-[4px] text-[11px] font-semibold bg-[#f3f4f6] text-[#374151] border border-[#e4e4e7] leading-[20px]">
                {DETAIL_CAP_TYPE}
              </span>
              {/* Badge 3 — status */}
              <span className="inline-flex items-center px-2.5 py-[2px] rounded-[4px] text-[11px] font-semibold bg-[#fef3c7] text-[#92400e] border border-[#fde68a] leading-[20px]">
                Open for Proposal
              </span>
            </div>

            <h1 className="text-[17px] font-bold text-[#020202] leading-[24px] mb-2">
              {p.title}
            </h1>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#62748e]">
              <span>
                Project ID: <span className="font-semibold text-[#020202] font-mono text-[12px]"># {p.projectId}</span>
              </span>
              <span className="w-px h-4 bg-[#e4e4e7]" />
              <span>
                Posted: <span className="font-medium text-[#353535]">{p.postedDate}</span>
              </span>
              <span className="w-px h-4 bg-[#e4e4e7]" />
              <span>
                Engagement: <span className="font-medium text-[#353535]">{p.engagementType}</span>
              </span>
            </div>
          </div>

          {/* Back button only (Export removed) */}
          <div className="flex-shrink-0 self-start sm:self-auto">
            <button
              onClick={() => router.push("/dashboard/projects")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] border border-[#e4e4e7] text-[13px] font-medium text-[#62748e] hover:bg-[#f7f7f7] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          </div>
        </div>

        {/* ── Two-column body ─────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ════════ LEFT COLUMN — 70% ════════ */}
          <div className="w-full lg:flex-[7] flex flex-col gap-4 min-w-0">

            {/* CARD 1 — Project Specification (always visible) */}
            <SectionCard
              icon={<FlaskConical className="w-[18px] h-[18px]" />}
              iconBg="bg-[#d1fae5]" iconColor="text-[#1F6F54]"
              title="Project Specification"
              tintBg="bg-[#f0fdf4]" tintBorder="border-[#bbf7d0]"
            >
              {/* Target molecule — highlighted full-width */}
              <div className="mb-4 p-3 rounded-[10px] bg-white border border-[#bbf7d0]/60">
                <KVRow label="Target Molecule" value={p.targetMolecule} highlight />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="border-r border-[#f0f0f0] pr-4">
                  <KVRow label="CAS No." value={p.cas} />
                </div>
                <KVRow label="Type" value={p.specType} />
              </div>
            </SectionCard>

            {/* CARD 2 — Project Overview (always visible) */}
            <SectionCard
              icon={<LayoutGrid className="w-[18px] h-[18px]" />}
              iconBg="bg-[#dbeafe]" iconColor="text-[#0077CC]"
              title="Project Overview"
              tintBg="bg-[#f0f9ff]" tintBorder="border-[#bae6fd]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="border-b sm:border-b-0 sm:border-r border-[#e8f4ff] pb-4 sm:pb-0 sm:pr-6">
                  <KVRow label="Industry" value={p.industry} />
                </div>
                <KVRow label="Quantity" value={p.quantity} />
                <div className="border-b sm:border-b-0 sm:border-r border-[#e8f4ff] pb-4 sm:pb-0 sm:pr-6 pt-1">
                  <KVRow label="Engagement Type" value={p.engagementType} />
                </div>
                <div className="pt-1"><KVRow label="Purity" value={p.purity} /></div>
                <div className="border-b sm:border-b-0 sm:border-r border-[#e8f4ff] pb-4 sm:pb-0 sm:pr-6 pt-1">
                  <KVRow label="Timeline" value={p.timeline} />
                </div>
                <div className="pt-1"><KVRow label="Product Form" value={p.productForm} /></div>
              </div>
            </SectionCard>

            {/* CARD 3 — Project Description (always visible) */}
            <SectionCard
              icon={<BookOpen className="w-[18px] h-[18px]" />}
              iconBg="bg-[#fef3c7]" iconColor="text-[#D97706]"
              title="Project Description"
            >
              <p className="text-[13px] text-[#353535] leading-[22px]">{p.fullDescription}</p>
            </SectionCard>

            {/* CARD 4 — Manufacturing Scope (locked if expired) */}
            {isLocked ? (
              <LockedSection onUpgrade={openUpgrade}>
                <SectionCard
                  icon={<Factory className="w-[18px] h-[18px]" />}
                  iconBg="bg-[#ede9fe]" iconColor="text-[#7C3AED]"
                  title="Manufacturing Scope"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-wide mb-3">Scope of Work</p>
                      <BulletList items={p.scopeOfWork} color="#1F6F54" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-wide mb-3">Deliverables</p>
                      <BulletList items={p.deliverables} color="#0077CC" />
                    </div>
                  </div>
                </SectionCard>
              </LockedSection>
            ) : (
              <SectionCard
                icon={<Factory className="w-[18px] h-[18px]" />}
                iconBg="bg-[#ede9fe]" iconColor="text-[#7C3AED]"
                title="Manufacturing Scope"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:border-r border-[#f3f4f6] sm:pr-6">
                    <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-wide mb-3">Scope of Work</p>
                    <BulletList items={p.scopeOfWork} color="#1F6F54" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-wide mb-3">Deliverables</p>
                    <BulletList items={p.deliverables} color="#0077CC" />
                  </div>
                </div>
              </SectionCard>
            )}

            {/* CARD 5 — Required Facility Capabilities (locked if expired) */}
            {isLocked ? (
              <LockedSection onUpgrade={openUpgrade}>
                <SectionCard
                  icon={<Building2 className="w-[18px] h-[18px]" />}
                  iconBg="bg-[#fce7f3]" iconColor="text-[#be185d]"
                  title="Required Facility Capabilities"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-wide mb-3">Facility Certification</p>
                      <BulletList items={p.facilityCertifications} color="#1F6F54" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-wide mb-3">Required Equipment</p>
                      <BulletList items={p.requiredEquipment} color="#7C3AED" />
                    </div>
                  </div>
                  <Divider />
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#62748e] font-medium">Min Batch Capacity:</span>
                    <span className="text-[13px] font-bold text-[#020202]">{p.minBatchCapacity}</span>
                  </div>
                </SectionCard>
              </LockedSection>
            ) : (
              <SectionCard
                icon={<Building2 className="w-[18px] h-[18px]" />}
                iconBg="bg-[#fce7f3]" iconColor="text-[#be185d]"
                title="Required Facility Capabilities"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:border-r border-[#f3f4f6] sm:pr-6">
                    <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-wide mb-3">Facility Certification</p>
                    <BulletList items={p.facilityCertifications} color="#1F6F54" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-wide mb-3">Required Equipment</p>
                    <BulletList items={p.requiredEquipment} color="#7C3AED" />
                  </div>
                </div>
                <Divider />
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#62748e] font-medium">Min Batch Capacity:</span>
                  <span className="text-[13px] font-bold text-[#020202]">{p.minBatchCapacity}</span>
                </div>
              </SectionCard>
            )}

            {/* CARD 6 — Technical Documents (locked if expired) */}
            {isLocked ? (
              <LockedSection onUpgrade={openUpgrade}>
                <SectionCard
                  icon={<FileCheck className="w-[18px] h-[18px]" />}
                  iconBg="bg-[#f3f4f6]" iconColor="text-[#62748e]"
                  title="Technical Documents"
                >
                  <div className="flex flex-col gap-3">
                    {p.documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between py-3 px-4 rounded-[10px] bg-[#f9fafb] border border-[#e4e4e7]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[8px] bg-[#e3f4ff] flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-[#0077CC]" />
                          </div>
                          <span className="text-[13px] font-medium text-[#020202]">{doc.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </LockedSection>
            ) : (
              <SectionCard
                icon={<FileCheck className="w-[18px] h-[18px]" />}
                iconBg="bg-[#f3f4f6]" iconColor="text-[#62748e]"
                title="Technical Documents"
              >
                <div className="flex flex-col gap-3">
                  {p.documents.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 px-4 rounded-[10px] bg-[#f9fafb] border border-[#e4e4e7] hover:border-[#1F6F54]/30 hover:bg-[#f0faf5] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[8px] bg-[#e3f4ff] flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-[#0077CC]" />
                        </div>
                        <span className="text-[13px] font-medium text-[#020202]">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#1F6F54] bg-[#f0faf5] border border-[#bbf7d0] hover:bg-[#d1fae5] transition-colors">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#0077CC] bg-[#e3f4ff] border border-[#bae6fd] hover:bg-[#dbeafe] transition-colors">
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          {/* ════════ RIGHT SIDEBAR — 30% ════════ */}
          <div className="w-full lg:flex-[3] lg:w-auto flex flex-col gap-4 min-w-0 lg:sticky lg:top-4">

            {/* Submit Proposal */}
            <div className="bg-white rounded-[14px] border border-[#e4e4e7] shadow-[0px_2px_8px_rgba(0,0,0,0.06)] p-5">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-[10px] bg-[#f0faf5] flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#1F6F54]" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#020202]">Submit Proposal</h3>
              </div>
              <p className="text-[13px] text-[#62748e] leading-[20px] mb-4">
                Submit your proposal directly to get started
              </p>
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[14px] font-semibold transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                Submit Proposal
              </button>
            </div>

            {/* Trial / Upgrade state card */}
            <TrialStateCard demo={demo} isExclusive={isExclusive} onUpgrade={openUpgrade} />

            {/* Scinode Connect */}
            <ScinodeConnectCard />
          </div>
        </div>
      </div>
    </>
  );
}
