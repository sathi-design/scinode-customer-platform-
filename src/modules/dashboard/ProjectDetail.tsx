"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Download,
  Eye,
  FileText,
  FlaskConical,
  LayoutGrid,
  BookOpen,
  Factory,
  Building2,
  FileCheck,
  Send,
  Mail,
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { getProjectDetail, type BadgeType } from "@/lib/projectsData";
import { cn } from "@/lib/utils";
import { ProposalDrawer } from "./ProposalDrawer";

// ─── Badge styling ─────────────────────────────────────────────────────────────
const BADGE_CONFIG: Record<BadgeType, { bg: string; text: string }> = {
  Exclusive:       { bg: "#020202",  text: "#fff"   },
  CMO:             { bg: "#1F6F54",  text: "#fff"   },
  RFQ:             { bg: "#0077CC",  text: "#fff"   },
  "Tech Transfer": { bg: "#7C3AED",  text: "#fff"   },
  Open:            { bg: "#D97706",  text: "#fff"   },
};

// ─── Reusable sub-components ──────────────────────────────────────────────────
function SectionCard({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  tintBg,
  tintBorder,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  tintBg?: string;
  tintBorder?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] border p-5",
        tintBg ?? "bg-white",
        tintBorder ?? "border-[#e4e4e7]",
      )}
    >
      {/* Section header */}
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

function KVRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-[#62748e] uppercase tracking-wide">{label}</span>
      <span className="text-[14px] font-semibold text-[#020202]">{value}</span>
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

// ─── Main Component ────────────────────────────────────────────────────────────
export function ProjectDetail({ id }: { id: number }) {
  const router = useRouter();
  const p = getProjectDetail(id);
  const badge = p.badge ? BADGE_CONFIG[p.badge] : null;
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <ProposalDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        project={p}
      />
    <div className="flex flex-col gap-0 pb-12 max-w-[1200px] mx-auto px-4 sm:px-0">

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[13px] text-[#62748e] mb-4 px-1">
        <button
          onClick={() => router.push("/dashboard")}
          className="hover:text-[#1F6F54] transition-colors"
        >
          Dashboard
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#cbd5e1]" />
        <button
          onClick={() => router.push("/dashboard/projects")}
          className="hover:text-[#1F6F54] transition-colors"
        >
          Open Projects
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#cbd5e1]" />
        <span className="text-[#020202] font-medium line-clamp-1 max-w-[320px]">Project Detail</span>
      </nav>

      {/* ── Project Summary Header ──────────────────────────────────────── */}
      <div className="bg-white rounded-[16px] border border-[#e4e4e7] shadow-[0px_2px_8px_rgba(0,0,0,0.06)] p-4 sm:p-5 mb-5 flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
        {/* Project image */}
        <div className="w-[110px] h-[82px] rounded-[10px] overflow-hidden flex-shrink-0 bg-[#cfd8dc]">
          <img
            src={p.image}
            alt={p.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          {/* Engagement type pill — high-visibility, above title */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-[10px] py-[2px] rounded-full bg-[#f0faf5] text-[#1F6F54] text-[11px] font-semibold border border-[#bbf7d0] leading-[20px] uppercase tracking-wide">
              {p.engagementType}
            </span>
            <span className="inline-flex items-center px-3 py-[2px] rounded-full text-[11px] font-semibold bg-[#fef3c7] text-[#92400e] border border-[#fde68a] leading-[20px]">
              {p.status}
            </span>
          </div>
          <h1 className="text-[17px] font-bold text-[#020202] leading-[24px] mb-1.5">
            {p.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#62748e]">
            <span>
              Project ID:{" "}
              <span className="font-semibold text-[#020202]"># {p.projectId}</span>
            </span>
            <span className="w-px h-4 bg-[#e4e4e7]" />
            <span>
              Posted:{" "}
              <span className="font-medium text-[#353535]">{p.postedDate}</span>
            </span>
          </div>
        </div>

        {/* Export + Back buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] border border-[#e4e4e7] text-[13px] font-medium text-[#62748e] hover:bg-[#f7f7f7] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] border border-[#e4e4e7] text-[13px] font-medium text-[#353535] hover:bg-[#f7f7f7] transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* ── Two-column body ─────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ════════════════ LEFT COLUMN (70%) ════════════════ */}
        <div className="w-full lg:flex-[7] flex flex-col gap-4 min-w-0">

          {/* Project Specification */}
          <SectionCard
            icon={<FlaskConical className="w-[18px] h-[18px]" />}
            iconBg="bg-[#d1fae5]"
            iconColor="text-[#1F6F54]"
            title="Project Specification"
            tintBg="bg-[#f0fdf4]"
            tintBorder="border-[#bbf7d0]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <KVRow label="Target Molecule" value={p.targetMolecule} />
              </div>
              <KVRow label="CAS No." value={p.cas} />
              <KVRow label="Type" value={p.specType} />
            </div>
          </SectionCard>

          {/* Project Overview */}
          <SectionCard
            icon={<LayoutGrid className="w-[18px] h-[18px]" />}
            iconBg="bg-[#dbeafe]"
            iconColor="text-[#0077CC]"
            title="Project Overview"
            tintBg="bg-[#f0f9ff]"
            tintBorder="border-[#bae6fd]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
              {/* Left column */}
              <KVRow label="Industry" value={p.industry} />
              {/* Right column */}
              <KVRow label="Quantity" value={p.quantity} />

              <KVRow label="Engagement Type" value={p.engagementType} />
              <KVRow label="Purity" value={p.purity} />

              <KVRow label="Timeline" value={p.timeline} />
              <KVRow label="Product Form" value={p.productForm} />
            </div>
          </SectionCard>

          {/* Project Description */}
          <SectionCard
            icon={<BookOpen className="w-[18px] h-[18px]" />}
            iconBg="bg-[#fef3c7]"
            iconColor="text-[#D97706]"
            title="Project Description"
          >
            <p className="text-[13px] text-[#353535] leading-[22px]">{p.fullDescription}</p>
          </SectionCard>

          {/* Manufacturing Scope */}
          <SectionCard
            icon={<Factory className="w-[18px] h-[18px]" />}
            iconBg="bg-[#ede9fe]"
            iconColor="text-[#7C3AED]"
            title="Manufacturing Scope"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-wide mb-3">
                  Scope of Work
                </p>
                <BulletList items={p.scopeOfWork} color="#1F6F54" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-wide mb-3">
                  Deliverables
                </p>
                <BulletList items={p.deliverables} color="#0077CC" />
              </div>
            </div>
          </SectionCard>

          {/* Required Facility Capabilities */}
          <SectionCard
            icon={<Building2 className="w-[18px] h-[18px]" />}
            iconBg="bg-[#fce7f3]"
            iconColor="text-[#be185d]"
            title="Required Facility Capabilities"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-wide mb-3">
                  Facility Certification
                </p>
                <BulletList items={p.facilityCertifications} color="#1F6F54" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-wide mb-3">
                  Required Equipment
                </p>
                <BulletList items={p.requiredEquipment} color="#7C3AED" />
              </div>
            </div>
            <Divider />
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#62748e] font-medium">Min Batch Capacity:</span>
              <span className="text-[13px] font-bold text-[#020202]">{p.minBatchCapacity}</span>
            </div>
          </SectionCard>

          {/* Technical Documents */}
          <SectionCard
            icon={<FileCheck className="w-[18px] h-[18px]" />}
            iconBg="bg-[#f3f4f6]"
            iconColor="text-[#62748e]"
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
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#0077CC] bg-[#e3f4ff] border border-[#bae6fd] hover:bg-[#dbeafe] transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ════════════════ RIGHT COLUMN (30%) ════════════════ */}
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

          {/* SCINODE Connect — matches Figma 2881-10748 */}
          <div
            className="rounded-[12px] p-[10px] relative overflow-hidden"
            style={{ backgroundColor: "#020202" }}
          >
            {/* Background texture image — rotated science photo */}
            <img
              src="https://www.figma.com/api/mcp/asset/64b9de91-7f92-4877-8f68-da095e3780c9"
              alt=""
              aria-hidden
              className="absolute pointer-events-none object-cover opacity-40"
              style={{
                width: "311px",
                height: "412px",
                top: "-128px",
                left: "-14px",
                transform: "rotate(90.62deg)",
                transformOrigin: "center center",
              }}
            />

            {/* Content — sits above background image */}
            <div className="relative flex flex-col gap-[15px]">
              {/* Header row: logo + title */}
              <div className="flex items-center gap-4">
                <img
                  src="https://www.figma.com/api/mcp/asset/bbe3cff8-2ecb-4fd7-aa23-8e4c0905b7ef"
                  alt="SCINODE"
                  className="w-[40px] h-[39px] object-contain flex-shrink-0"
                />
                <h3 className="text-[18px] font-semibold text-white leading-[28px]">
                  SCINODE Connect
                </h3>
              </div>

              {/* Subtitle */}
              <p className="text-[14px] font-normal text-white leading-[24px]">
                Get instant help with technical expertise.
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-[9px]">
                {/* Send an Email — white outline */}
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[6px] border border-white text-white text-[14px] font-medium leading-[24px] hover:bg-white/10 transition-colors">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  Send an Email
                </button>
                {/* Schedule — solid green fill */}
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[6px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[14px] font-medium leading-[24px] transition-colors">
                  <CalendarDays className="w-4 h-4 flex-shrink-0" />
                  Schedule discussion Call
                </button>
              </div>
            </div>
          </div>

          {/* Requirements & Files */}
          <div className="bg-white rounded-[14px] border border-[#e4e4e7] shadow-[0px_2px_8px_rgba(0,0,0,0.06)] p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-[10px] bg-[#fef3c7] flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-[#D97706]" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#020202]">Requirements & Files</h3>
            </div>

            {/* Requirements */}
            <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-wide mb-3">
              Requirements
            </p>
            <div className="flex flex-col gap-2 mb-4">
              {p.requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F54] flex-shrink-0" />
                  <span className="text-[13px] text-[#353535]">
                    <span className="font-medium">{req.label}:</span> {req.value}
                  </span>
                </div>
              ))}
            </div>

            <Divider />

            {/* Attached Documents */}
            <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-wide mb-3">
              Attached Documents
            </p>
            <div className="flex flex-col gap-2">
              {p.attachedDocs.map((doc, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 text-[13px] font-medium text-[#0077CC] hover:text-[#005fa3] hover:underline transition-colors text-left"
                >
                  <Download className="w-3.5 h-3.5 flex-shrink-0" />
                  {doc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Badge (if present) */}
          {p.badge && badge && (
            <div
              className="rounded-[14px] p-4 flex items-center gap-3"
              style={{ backgroundColor: badge.bg }}
            >
              <div className="w-8 h-8 rounded-[10px] bg-white/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wide">Project Type</p>
                <p className="text-[14px] font-bold text-white">{p.badge}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
