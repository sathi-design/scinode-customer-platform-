"use client";

import { useState } from "react";
import { ChevronDown, Info, X } from "lucide-react";
import { useIndependentCROProfileStore } from "@/store/useIndependentCROProfileStore";
import { TabFooter } from "@/modules/profile/SharedUI";
import { cn } from "@/lib/utils";

// ─── Service options ──────────────────────────────────────────────────────────

const RESEARCH_CHEM = [
  "Total Synthesis","Medicinal Chemistry","Process Chemistry","Combinatorial Chemistry",
  "Asymmetric Synthesis","Green Chemistry","Polymer Synthesis","Natural Product Chemistry",
  "Fragment-Based Drug Discovery","Structure-Activity Relationship (SAR) Studies",
  "Lead Optimisation","Chiral Chemistry","Peptide Chemistry","Carbohydrate Chemistry",
  "Organometallic Chemistry","Flow Chemistry","Photochemistry","Electrochemistry",
] as const;

const RESEARCH_BIO = [
  "Target Identification & Validation","HTS (High-Throughput Screening)",
  "Biochemical Assay Development","Cell-Based Assay Development","ADME Studies",
  "In Vitro Pharmacology","Toxicology Studies","Protein Expression & Purification",
  "Molecular Biology Services","Genomics & Transcriptomics","Proteomics","Metabolomics",
  "CRISPR/Gene Editing","Flow Cytometry","Bioinformatics Support",
] as const;

const ANALYTICAL_CHEM = [
  "HPLC Analysis","GC Analysis","NMR Spectroscopy","Mass Spectrometry (LC-MS/GC-MS)",
  "FTIR / IR Spectroscopy","UV-Vis Spectroscopy","X-Ray Diffraction (XRD/XRPD)",
  "TGA / DSC (Thermal Analysis)","Elemental Analysis","ICP-OES / ICP-MS",
  "Karl Fischer Titration","Particle Size Analysis","Dissolution Testing",
  "Impurity Profiling","Residual Solvent Analysis","Method Development & Validation",
] as const;

const ANALYTICAL_BIO = [
  "ELISA & Immunoassays","Western Blot","PCR / qPCR / RT-PCR",
  "Next-Gen Sequencing (NGS)","Proteomics Analysis","Metabolomics Profiling",
  "Cell Viability Assays","Microbiology Testing","Sterility Testing",
  "Endotoxin Testing (LAL)","Bioanalytical Method Development","PK/PD Analysis",
  "Cytotoxicity Assays","Receptor Binding Assays","Enzyme Kinetics",
] as const;

const SCALEUP_CHEM = [
  "Lab-Scale Synthesis (mg–g)","Pilot-Scale Synthesis (g–kg)","Kilo-Lab Scale (kg–100 kg)",
  "Commercial Manufacturing Scale","Process Development & Optimisation","Technology Transfer",
  "GMP Manufacturing","cGMP API Synthesis","Continuous Flow Manufacturing",
  "Hazardous Chemistry Scale-Up","High-Pressure Reactions","Cryogenic Reactions",
  "Photochemical Scale-Up",
] as const;

const SCALEUP_BIO = [
  "Fermentation Scale-Up","Upstream Bioprocess Development","Downstream Processing",
  "Cell Culture Scale-Up","Bioreactor Operations (2L–2000L)","Purification & Isolation at Scale",
  "Lyophilisation / Freeze Drying","Fill & Finish Services","Conjugation & Formulation Scale-Up",
  "Quality Control at Scale","Stability Studies",
] as const;

const REGULATORY_CHEM = [
  "ICH Q3A/Q3B Impurity Studies","ICH Q1 Stability Studies","DMF Preparation & Filing",
  "REACH Compliance Dossier","GMP Documentation & SOP Writing",
  "Regulatory Starting Material (RSM) Assessment","CTD Dossier Support",
  "ANDA / NDA Chemistry Section Support","Pharmacopoeial Method Compliance (USP/EP/JP)",
  "Process Validation","Cleaning Validation","Change Control Support",
] as const;

const REGULATORY_BIO = [
  "IND / CTA Filing Support","BLA / MAA Dossier Support","Biosafety & Containment Compliance",
  "GLP Study Conduct","ICH S7A/S7B Safety Pharmacology","ICH S2 Genotoxicity Studies",
  "OECD Guideline Compliance","21 CFR Part 11 Compliance","EU Annex 11 Compliance",
  "Risk-Based Approach to Regulatory Strategy","Regulatory Affairs Consulting",
] as const;

// ─── Section config ───────────────────────────────────────────────────────────

interface SectionConfig {
  title: string;
  subtext: string;
  tooltip: string;
  chemKey: "researchChemistry" | "analyticalChemistry" | "scaleUpChemistry" | "regulatoryChemistry";
  bioKey:  "researchBiology"   | "analyticalBiology"   | "scaleUpBiology"   | "regulatoryBiology";
  chemOptions: readonly string[];
  bioOptions:  readonly string[];
}

const SECTIONS: SectionConfig[] = [
  {
    title: "Research & Discovery",
    subtext: "Buyers looking for novel solutions often start here—strong visibility increases inbound opportunities.",
    tooltip: "Highlight your early-stage research capabilities to attract innovation-driven projects.",
    chemKey: "researchChemistry", bioKey: "researchBiology",
    chemOptions: RESEARCH_CHEM, bioOptions: RESEARCH_BIO,
  },
  {
    title: "Analytical & Characterisation",
    subtext: "Detailed analytical capabilities help buyers assess your technical depth and reliability.",
    tooltip: "Add your analytical strengths to support validation and quality-driven requirements.",
    chemKey: "analyticalChemistry", bioKey: "analyticalBiology",
    chemOptions: ANALYTICAL_CHEM, bioOptions: ANALYTICAL_BIO,
  },
  {
    title: "Scale-Up & Manufacturing",
    subtext: "Buyers prioritize partners who can scale efficiently—this builds strong commercial confidence.",
    tooltip: "Showcase your ability to transition from lab to production.",
    chemKey: "scaleUpChemistry", bioKey: "scaleUpBiology",
    chemOptions: SCALEUP_CHEM, bioOptions: SCALEUP_BIO,
  },
  {
    title: "Regulatory & Compliance",
    subtext: "Demonstrating regulatory readiness reassures buyers, especially for global and sensitive markets.",
    tooltip: "Specify your compliance expertise and certifications.",
    chemKey: "regulatoryChemistry", bioKey: "regulatoryBiology",
    chemOptions: REGULATORY_CHEM, bioOptions: REGULATORY_BIO,
  },
];

// ─── Inline pill summary box (used in both expanded + collapsed states) ───────

function SummaryBox({
  label,
  selected,
  onRemove,
  compact = false,
}: {
  label: string;
  selected: string[];
  onRemove?: (v: string) => void;
  compact?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 3;
  const visible  = showAll ? selected : selected.slice(0, LIMIT);
  const overflow = selected.length - LIMIT;

  return (
    <div className={cn(
      "flex-1 min-w-0 rounded-[8px] border border-[#e4e4e7] bg-white",
      compact ? "px-3 py-2" : "px-3 py-2.5",
    )}>
      <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-1.5 leading-none">
        {label}
      </p>

      {selected.length === 0 ? (
        <p className="text-[11px] text-[#c4c9d4] italic">No services selected</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {visible.map((item) => (
            <span
              key={item}
              className="flex items-center gap-0.5 bg-[#e6f4ef] text-[#1F6F54] text-[10px] font-medium px-2 py-[2px] rounded-full leading-snug"
            >
              {item}
              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(item); }}
                  className="hover:text-[#185C45] transition-colors ml-0.5 flex-shrink-0"
                  aria-label={`Remove ${item}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </span>
          ))}
          {!showAll && overflow > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowAll(true); }}
              className="text-[10px] font-semibold text-[#018E7E] hover:underline px-1 py-[2px]"
            >
              +{overflow} more
            </button>
          )}
          {showAll && overflow > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowAll(false); }}
              className="text-[10px] font-semibold text-[#62748e] hover:underline px-1 py-[2px]"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Multi-select checklist panel ────────────────────────────────────────────

function ChecklistPanel({
  label, options, selected, onChange,
}: {
  label: string; options: readonly string[];
  selected: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);

  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <p className="text-xs font-semibold text-[#62748e] uppercase tracking-wide">{label}</p>
      <div className="border border-[#e4e4e7] rounded-[8px] max-h-[200px] overflow-y-auto">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#f0faf5] cursor-pointer border-b border-[#f3f4f6] last:border-b-0"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="w-3.5 h-3.5 accent-[#1F6F54] flex-shrink-0"
            />
            <span className="text-xs text-[#353535] leading-snug">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Single section card ──────────────────────────────────────────────────────

function ServiceSection({ sec }: { sec: SectionConfig }) {
  const services    = useIndependentCROProfileStore((s) => s.services);
  const setServices = useIndependentCROProfileStore((s) => s.setServices);

  const [expanded, setExpanded] = useState(false);
  const [showTip, setShowTip]   = useState(false);

  const chemSelected = services[sec.chemKey];
  const bioSelected  = services[sec.bioKey];
  const totalCount   = chemSelected.length + bioSelected.length;

  return (
    <div className="rounded-[10px] border border-[#e4e4e7]">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      {/* Wrap in a div so the collapsed SummaryBox (which has buttons) is NOT
          a descendant of the accordion <button> — avoids the nested-button
          hydration error. */}
      <div className={cn(
        "bg-[#fafafa]",
        expanded ? "rounded-t-[10px]" : "rounded-[10px]",
      )}>
        {/* Title row — the only true <button> */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f0faf5] transition-colors text-left rounded-[inherit]"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#020202]">{sec.title}</span>
            {totalCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#018E7E] text-white">
                {totalCount}
              </span>
            )}
            <div
              className="relative flex-shrink-0"
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
            >
              <Info className="w-3.5 h-3.5 text-[#9ca3af]" />
              {showTip && (
                <div className="absolute left-5 top-0 z-10 w-56 p-2 bg-[#1e293b] text-white text-xs rounded-[6px] shadow-lg leading-relaxed pointer-events-none">
                  {sec.tooltip}
                </div>
              )}
            </div>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-[#71717a] transition-transform flex-shrink-0", expanded && "rotate-180")} />
        </button>

        {/* Collapsed 2-box summary — OUTSIDE the <button> to avoid nesting */}
        {!expanded && totalCount > 0 && (
          <div className="flex gap-2 px-4 pb-3 w-full">
            <SummaryBox label="Chemistry" selected={chemSelected} compact />
            <SummaryBox label="Biology"   selected={bioSelected}  compact />
          </div>
        )}
      </div>

      {/* ── Expanded body ──────────────────────────────────────────────── */}
      {expanded && (
        <div className="p-4 flex flex-col gap-4">
          <p className="text-xs text-[#62748e] -mt-1">{sec.subtext}</p>

          {/* Structured 2-box summary with remove actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <SummaryBox
              label="Applied Chemistry Services"
              selected={chemSelected}
              onRemove={(v) => setServices({ [sec.chemKey]: chemSelected.filter((s) => s !== v) })}
            />
            <SummaryBox
              label="Applied Biology Services"
              selected={bioSelected}
              onRemove={(v) => setServices({ [sec.bioKey]: bioSelected.filter((s) => s !== v) })}
            />
          </div>

          {/* Separator */}
          <div className="border-t border-[#f3f4f6]" />

          {/* Checkbox lists */}
          <div className="flex flex-col sm:flex-row gap-4">
            <ChecklistPanel
              label="Applied Chemistry Services"
              options={sec.chemOptions}
              selected={chemSelected}
              onChange={(v) => setServices({ [sec.chemKey]: v })}
            />
            <ChecklistPanel
              label="Applied Biology Services"
              options={sec.bioOptions}
              selected={bioSelected}
              onChange={(v) => setServices({ [sec.bioKey]: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

interface Props { onNext: () => void; onBack: () => void; }

export function Tab4Services({ onNext, onBack }: Props) {
  return (
    <div className="flex flex-col">
      <div className="p-4 sm:p-6 pb-2 flex flex-col gap-4">
        {SECTIONS.map((sec) => <ServiceSection key={sec.title} sec={sec} />)}
      </div>
      <TabFooter onSave={onNext} onBack={onBack} />
    </div>
  );
}
