"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Award,
  Check,
  ChevronDown,
  ChevronRight,
  Beaker,
  TrendingUp,
  Repeat2,
  Rocket,
  FlaskConical,
  Factory,
  Handshake,
  Lightbulb,
  X,
  Upload,
  ImageIcon,
  FileText,
  Trash2,
  ScrollText,
  AlertTriangle,
  Leaf,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import { useResearcherProfileStore } from "@/store/useResearcherProfileStore";
import {
  FormField,
  SectionLabel,
  ChipGroup,
  inputCls,
  DrawerFooter,
  EmptyState,
} from "@/modules/profile/SharedUI";
import { DrawerBase } from "@/modules/profile/DrawerBase";
import {
  EXECUTION_CAPABILITIES,
  INDUSTRIES,
  PREFERRED_ENGAGEMENT,
  CERT_CATEGORIES,
} from "../constants";
import type { ResearchCert } from "../types";
import { cn } from "@/lib/utils";

// ─── Req asterisk ─────────────────────────────────────────────────────────────
function Req() { return <span className="text-red-500 ml-0.5">*</span>; }

// ─── Capability card icons ────────────────────────────────────────────────────
const CAP_ICONS: Record<string, React.ElementType> = {
  "Feasibility": Beaker,
  "Proof of concept / early-stage validation": FlaskConical,
  "Optimization": TrendingUp,
  "Process improvement & yield enhancement": Repeat2,
  "Scale-up": TrendingUp,
  "Lab to pilot / production scale": Factory,
  "Technology Transfer": Handshake,
  "Ready for commercialization": Rocket,
};

// ─── Certification Accordion Drawer ──────────────────────────────────────────

type CertDetailEntry = {
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  imageFile: string;
  documentFile: string;
};
const EMPTY_DETAIL: CertDetailEntry = { issuingAuthority: "", issueDate: "", expiryDate: "", imageFile: "", documentFile: "" };

const OTHER_CATEGORY = "other";

function CertAccordionDrawer({
  open,
  onClose,
  existingCerts,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  existingCerts: ResearchCert[];
  onSave: (certs: ResearchCert[]) => void;
}) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [certDetails, setCertDetails]     = useState<Record<string, CertDetailEntry>>({});
  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({});
  const [showDetails, setShowDetails]     = useState(false);

  // Other (custom) entry
  const [otherName, setOtherName]               = useState("");
  const [otherAuthority, setOtherAuthority]     = useState("");
  const [otherIssue, setOtherIssue]             = useState("");
  const [otherExpiry, setOtherExpiry]           = useState("");
  const [otherErr, setOtherErr]                 = useState("");
  const [otherImageFile, setOtherImageFile]     = useState("");
  const [otherDocumentFile, setOtherDocumentFile] = useState("");
  const [uploadErrors, setUploadErrors]         = useState<Record<string, string>>({});

  // Section refs for quick-nav scroll
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Initialise from existing certs when drawer opens
  useEffect(() => {
    if (!open) return;
    const names = existingCerts.map((c) => c.name);
    const details: Record<string, CertDetailEntry> = {};
    existingCerts.forEach((c) => {
      details[c.name] = {
        issuingAuthority: c.issuingAuthority,
        issueDate: c.issueDate,
        expiryDate: c.expiryDate,
        imageFile: c.imageFile ?? "",
        documentFile: c.documentFile ?? "",
      };
    });
    setSelectedNames(names);
    setCertDetails(details);
    setShowDetails(names.length > 0);
    setUploadErrors({});
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePill = (name: string) => {
    setSelectedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const updateDetail = (name: string, patch: Partial<CertDetailEntry>) => {
    setCertDetails((prev) => ({
      ...prev,
      [name]: { ...(prev[name] ?? EMPTY_DETAIL), ...patch },
    }));
    if (patch.imageFile !== undefined || patch.documentFile !== undefined) {
      setUploadErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  };

  const toggleAccordion = (id: string) =>
    setAccordionOpen((p) => ({ ...p, [id]: !p[id] }));

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSave = () => {
    // Validate: each selected cert needs at least one upload
    const errors: Record<string, string> = {};
    selectedNames.forEach((name) => {
      const d = certDetails[name];
      if (!d?.imageFile && !d?.documentFile) {
        errors[name] = "Upload at least a certificate image or supporting document.";
      }
    });
    if (otherName.trim() && !otherImageFile && !otherDocumentFile) {
      errors["__other__"] = "Upload at least a certificate image or supporting document.";
    }
    if (Object.keys(errors).length > 0) {
      setUploadErrors(errors);
      setShowDetails(true);
      return;
    }

    const saved: ResearchCert[] = selectedNames.map((name, i) => ({
      id: existingCerts.find((c) => c.name === name)?.id ?? `${Date.now()}-${i}`,
      name,
      category: CERT_CATEGORIES.find((cat) => cat.pills.includes(name as never))?.label ?? "Other",
      issuingAuthority: certDetails[name]?.issuingAuthority ?? "",
      issueDate: certDetails[name]?.issueDate ?? "",
      expiryDate: certDetails[name]?.expiryDate ?? "",
      attachment: existingCerts.find((c) => c.name === name)?.attachment ?? "",
      imageFile: certDetails[name]?.imageFile ?? "",
      documentFile: certDetails[name]?.documentFile ?? "",
    }));

    if (otherName.trim()) {
      saved.push({
        id: `${Date.now()}-other`,
        name: otherName.trim(),
        category: "Other",
        issuingAuthority: otherAuthority,
        issueDate: otherIssue,
        expiryDate: otherExpiry,
        attachment: "",
        imageFile: otherImageFile,
        documentFile: otherDocumentFile,
      });
    }

    onSave(saved);
    onClose();
  };

  const totalSelected = selectedNames.length + (otherName.trim() ? 1 : 0);

  return (
    <DrawerBase
      open={open}
      onClose={onClose}
      title="Licenses & Certifications"
      width={620}
      footer={
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#62748e]">{totalSelected} certification{totalSelected !== 1 ? "s" : ""} selected</span>
          <DrawerFooter onCancel={onClose} onSave={handleSave} saveLabel="Save Certifications" />
        </div>
      }
    >
      <div className="flex flex-col gap-0">

        {/* ── Sticky summary header ─────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-white pb-3 pt-1 border-b border-[#f1f5f9] mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "text-[11px] font-bold px-2.5 py-1 rounded-full",
              totalSelected > 0 ? "bg-[#018E7E] text-white" : "bg-[#f1f5f9] text-[#62748e]"
            )}>
              {totalSelected} selected
            </span>
            <span className="text-[11px] text-[#9ca3af]">Quick jump →</span>
            <div className="flex flex-wrap gap-1.5">
              {CERT_CATEGORIES.map((cat) => {
                const catCount = cat.pills.filter((p) => selectedNames.includes(p)).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { scrollToSection(cat.id); setAccordionOpen((p) => ({ ...p, [cat.id]: true })); }}
                    className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors",
                      catCount > 0
                        ? "border-[#018E7E] bg-[#f0faf5] text-[#018E7E]"
                        : "border-[#e4e4e7] bg-white text-[#71717a] hover:border-[#018E7E]/50"
                    )}
                  >
                    {cat.label.split(" ").slice(0, 2).join(" ")} {catCount > 0 && `(${catCount})`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Other — always visible at top ─────────────────────────────── */}
        <div className="mb-4 p-4 rounded-[10px] border-2 border-dashed border-[#e4e4e7] bg-[#fafafa]">
          <p className="text-xs font-semibold text-[#62748e] uppercase tracking-wider mb-3">
            Other (Custom Entry)
          </p>
          <div className="flex flex-col gap-3">
            <FormField label="Certification Name">
              <input
                className={cn(inputCls, otherErr && "border-red-400")}
                value={otherName}
                onChange={(e) => { setOtherName(e.target.value); setOtherErr(""); }}
                placeholder="e.g. Biosafety Level 2, NABL…"
              />
              {otherErr && <p className="text-xs text-red-500">{otherErr}</p>}
            </FormField>
            {otherName.trim() && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField label="Issuing Authority">
                    <input className={inputCls} value={otherAuthority}
                      onChange={(e) => setOtherAuthority(e.target.value)}
                      placeholder="e.g. DST" />
                  </FormField>
                  <FormField label="Issue Date">
                    <input type="date" className={inputCls} value={otherIssue}
                      onChange={(e) => setOtherIssue(e.target.value)} />
                  </FormField>
                  <FormField label="Expiry Date">
                    <input type="date" className={inputCls} value={otherExpiry}
                      onChange={(e) => setOtherExpiry(e.target.value)} />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium text-[#62748e]">Certificate Image <span className="text-[#9ca3af] font-normal">(JPG / PNG)</span></p>
                    <label className={cn("border-2 border-dashed rounded-[8px] p-3 cursor-pointer hover:border-[#1F6F54]/50 transition-colors", otherImageFile ? "border-[#1F6F54]/40 bg-[#f0faf5]" : "border-[#e4e4e7] bg-white")}>
                      {otherImageFile ? (
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#1F6F54] flex-shrink-0" />
                          <span className="text-xs text-[#353535] truncate flex-1">{otherImageFile}</span>
                          <button type="button" onClick={(e) => { e.preventDefault(); setOtherImageFile(""); }} className="text-[#9ca3af] hover:text-red-500 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[#9ca3af]"><Upload className="w-4 h-4 flex-shrink-0" /><span className="text-xs">Browse or drag & drop</span></div>
                      )}
                      <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => { setOtherImageFile(e.target.files?.[0]?.name ?? ""); setUploadErrors((p) => { const n = { ...p }; delete n["__other__"]; return n; }); }} />
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium text-[#62748e]">Supporting Document <span className="text-[#9ca3af] font-normal">(PDF / DOC / DOCX)</span></p>
                    <label className={cn("border-2 border-dashed rounded-[8px] p-3 cursor-pointer hover:border-[#1F6F54]/50 transition-colors", otherDocumentFile ? "border-[#018E7E]/40 bg-[#f0faf5]" : "border-[#e4e4e7] bg-white")}>
                      {otherDocumentFile ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#018E7E] flex-shrink-0" />
                          <span className="text-xs text-[#353535] truncate flex-1">{otherDocumentFile}</span>
                          <button type="button" onClick={(e) => { e.preventDefault(); setOtherDocumentFile(""); }} className="text-[#9ca3af] hover:text-red-500 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[#9ca3af]"><Upload className="w-4 h-4 flex-shrink-0" /><span className="text-xs">Browse or drag & drop</span></div>
                      )}
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { setOtherDocumentFile(e.target.files?.[0]?.name ?? ""); setUploadErrors((p) => { const n = { ...p }; delete n["__other__"]; return n; }); }} />
                    </label>
                  </div>
                </div>
                {uploadErrors["__other__"] && (
                  <p className="text-xs text-red-500">{uploadErrors["__other__"]}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Category accordions ───────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          {CERT_CATEGORIES.map((cat) => {
            const isOpen  = !!accordionOpen[cat.id];
            const catCount = cat.pills.filter((p) => selectedNames.includes(p)).length;

            return (
              <div
                key={cat.id}
                ref={(el) => { sectionRefs.current[cat.id] = el; }}
                className="rounded-[10px] border border-[#e4e4e7] overflow-hidden"
              >
                {/* Accordion header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(cat.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#fafafa] hover:bg-[#f0faf5] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#020202]">{cat.label}</span>
                    {catCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#018E7E] text-white">
                        {catCount}
                      </span>
                    )}
                  </div>
                  {isOpen
                    ? <ChevronDown className="w-4 h-4 text-[#71717a]" />
                    : <ChevronRight className="w-4 h-4 text-[#71717a]" />
                  }
                </button>

                {/* Accordion body — pills */}
                {isOpen && (
                  <div className="px-4 py-4 flex flex-wrap gap-2 bg-white">
                    {cat.pills.map((pill) => {
                      const selected = selectedNames.includes(pill);
                      return (
                        <button
                          key={pill}
                          type="button"
                          onClick={() => togglePill(pill)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
                            selected
                              ? "bg-[#018E7E] border-[#018E7E] text-white"
                              : "bg-white border-[#cbd5e1] text-[#353535] hover:border-[#018E7E]/50"
                          )}
                        >
                          {selected && <Check className="w-3 h-3" strokeWidth={3} />}
                          {pill}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Selected certifications — detail cards ────────────────────── */}
        {selectedNames.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-[10px] bg-[#f0faf5] border border-[#d1fae5] mb-3"
            >
              <span className="text-sm font-semibold text-[#018E7E]">
                Fill in Details for {selectedNames.length} Selected Certification{selectedNames.length > 1 ? "s" : ""}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-[#018E7E] transition-transform", showDetails && "rotate-180")} />
            </button>

            {showDetails && (
              <div className="flex flex-col gap-3">
                {selectedNames.map((name) => {
                  const d = certDetails[name] ?? EMPTY_DETAIL;
                  return (
                    <div key={name} className="rounded-[10px] border border-[#e4e4e7] p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#020202]">{name}</p>
                        <button type="button" onClick={() => togglePill(name)} className="text-[#9ca3af] hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Issuing Authority">
                          <input className={inputCls} value={d.issuingAuthority}
                            onChange={(e) => updateDetail(name, { issuingAuthority: e.target.value })}
                            placeholder="e.g. BIS" />
                        </FormField>
                        <FormField label="Issue Date">
                          <input type="date" className={inputCls} value={d.issueDate}
                            onChange={(e) => updateDetail(name, { issueDate: e.target.value })} />
                        </FormField>
                        <FormField label="Expiry Date">
                          <input type="date" className={inputCls} value={d.expiryDate}
                            onChange={(e) => updateDetail(name, { expiryDate: e.target.value })} />
                        </FormField>
                      </div>

                      {/* ── Upload fields ── */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-medium text-[#62748e]">Certificate Image <span className="text-[#9ca3af] font-normal">(JPG / PNG)</span></p>
                          <label className={cn("border-2 border-dashed rounded-[8px] p-3 cursor-pointer hover:border-[#1F6F54]/50 transition-colors", d.imageFile ? "border-[#1F6F54]/40 bg-[#f0faf5]" : "border-[#e4e4e7] bg-white")}>
                            {d.imageFile ? (
                              <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-[#1F6F54] flex-shrink-0" />
                                <span className="text-xs text-[#353535] truncate flex-1">{d.imageFile}</span>
                                <button type="button" onClick={(e) => { e.preventDefault(); updateDetail(name, { imageFile: "" }); }} className="text-[#9ca3af] hover:text-red-500 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-[#9ca3af]"><Upload className="w-4 h-4 flex-shrink-0" /><span className="text-xs">Browse or drag & drop</span></div>
                            )}
                            <input type="file" accept="image/png,image/jpeg" className="hidden"
                              onChange={(e) => updateDetail(name, { imageFile: e.target.files?.[0]?.name ?? "" })} />
                          </label>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-medium text-[#62748e]">Supporting Document <span className="text-[#9ca3af] font-normal">(PDF / DOC / DOCX)</span></p>
                          <label className={cn("border-2 border-dashed rounded-[8px] p-3 cursor-pointer hover:border-[#1F6F54]/50 transition-colors", d.documentFile ? "border-[#018E7E]/40 bg-[#f0faf5]" : "border-[#e4e4e7] bg-white")}>
                            {d.documentFile ? (
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#018E7E] flex-shrink-0" />
                                <span className="text-xs text-[#353535] truncate flex-1">{d.documentFile}</span>
                                <button type="button" onClick={(e) => { e.preventDefault(); updateDetail(name, { documentFile: "" }); }} className="text-[#9ca3af] hover:text-red-500 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-[#9ca3af]"><Upload className="w-4 h-4 flex-shrink-0" /><span className="text-xs">Browse or drag & drop</span></div>
                            )}
                            <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                              onChange={(e) => updateDetail(name, { documentFile: e.target.files?.[0]?.name ?? "" })} />
                          </label>
                        </div>
                      </div>

                      {uploadErrors[name] && (
                        <p className="text-xs text-red-500 -mt-1">{uploadErrors[name]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DrawerBase>
  );
}

// ─── Cert card — per-category colour scheme ───────────────────────────────────

type CertCatStyle = {
  gradient: string;
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  linkColor: string;
};

const CERT_CAT_STYLES: Record<string, CertCatStyle> = {
  "Basic Regulatory License": {
    gradient: "from-[#f59e0b] to-[#fbbf24]",
    Icon: ScrollText,
    iconBg: "#fffbeb", iconColor: "#d97706",
    label: "Regulatory", linkColor: "#d97706",
  },
  "Product Licenses": {
    gradient: "from-[#2563eb] to-[#60a5fa]",
    Icon: FileText,
    iconBg: "#eff6ff", iconColor: "#2563eb",
    label: "Product", linkColor: "#2563eb",
  },
  "Reagent & Hazardous Chemical Handling": {
    gradient: "from-[#dc2626] to-[#f87171]",
    Icon: AlertTriangle,
    iconBg: "#fef2f2", iconColor: "#dc2626",
    label: "Hazardous", linkColor: "#dc2626",
  },
  "Factory / Process Accreditation": {
    gradient: "from-[#018E7E] to-[#34d399]",
    Icon: ShieldCheck,
    iconBg: "#f0faf5", iconColor: "#018E7E",
    label: "Accreditation", linkColor: "#018E7E",
  },
  "ESG Accreditation": {
    gradient: "from-[#059669] to-[#6ee7b7]",
    Icon: Leaf,
    iconBg: "#ecfdf5", iconColor: "#059669",
    label: "ESG", linkColor: "#059669",
  },
  "Other": {
    gradient: "from-[#7c3aed] to-[#a78bfa]",
    Icon: Award,
    iconBg: "#f5f3ff", iconColor: "#7c3aed",
    label: "Certification", linkColor: "#7c3aed",
  },
};
const FALLBACK_STYLE: CertCatStyle = CERT_CAT_STYLES["Other"];

/** Returns { status, chip } for the expiry date */
function certExpiryStatus(expiryDate: string): { label: string; bg: string; text: string; border: string } | null {
  if (!expiryDate) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp   = new Date(expiryDate);
  const diffMs = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0)  return { label: "Expired",         bg: "#fee2e2", text: "#991b1b", border: "#fecaca" };
  if (diffDays <= 30) return { label: "Expires soon",   bg: "#fef3c7", text: "#92400e", border: "#fde68a" };
  return               { label: "Active",               bg: "#dcfce7", text: "#14532d", border: "#bbf7d0" };
}

function CertDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-[#f3f4f6] last:border-0 gap-2">
      <span className="text-[11px] text-[#9ca3af] flex-shrink-0">{label}</span>
      <span className="text-[11px] font-semibold text-[#020202] text-right">{value}</span>
    </div>
  );
}

function CertCard({ c, onDelete }: { c: ResearchCert; onDelete: () => void }) {
  const style  = CERT_CAT_STYLES[c.category] ?? FALLBACK_STYLE;
  const expiry = certExpiryStatus(c.expiryDate);
  const { Icon } = style;

  return (
    <div className="bg-white rounded-xl border border-[#e4e4e7] shadow-sm flex flex-col overflow-hidden">
      {/* Category-coloured top stripe */}
      <div className={cn("h-1 bg-gradient-to-r", style.gradient)} />

      {/* Header */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {/* Mini category tag */}
          <div className="flex items-center gap-1.5 mb-1">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: style.iconBg }}
            >
              <Icon className="w-3 h-3" style={{ color: style.iconColor }} />
            </div>
            <p
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: style.iconColor }}
            >
              {style.label}
            </p>
          </div>

          {/* Cert name */}
          <p className="text-sm font-bold text-[#020202] leading-snug line-clamp-2">{c.name}</p>

          {/* Expiry status badge */}
          {expiry && (
            <span
              className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{ background: expiry.bg, color: expiry.text, borderColor: expiry.border }}
            >
              {expiry.label}
            </span>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 text-[#d1d5db] hover:text-red-500 transition-colors flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Detail rows */}
      <div className="px-3 pb-2 border-t border-[#f3f4f6] pt-2 flex flex-col flex-1">
        {c.issuingAuthority && <CertDetailRow label="Issued by" value={c.issuingAuthority} />}
        {c.issueDate   && <CertDetailRow label="Issued"   value={c.issueDate} />}
        {c.expiryDate  && <CertDetailRow label="Expires"  value={c.expiryDate} />}
      </div>

      {/* Docs uploaded indicator */}
      {(c.imageFile || c.documentFile) && (
        <div className="px-3 pb-3 pt-1 flex flex-wrap gap-1">
          {c.imageFile && (
            <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
              <ImageIcon className="w-2.5 h-2.5" /> Image
            </span>
          )}
          {c.documentFile && (
            <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f5f3ff] text-[#6d28d9] border border-[#ddd6fe]">
              <FileText className="w-2.5 h-2.5" /> Document
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Collapsible cert card grid ───────────────────────────────────────────────
function CertCardGrid({ certs, onDelete }: { certs: ResearchCert[]; onDelete: (id: string) => void }) {
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 3;
  const visible = showAll ? certs : certs.slice(0, LIMIT);
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((c) => (
          <CertCard key={c.id} c={c} onDelete={() => onDelete(c.id)} />
        ))}
      </div>
      {certs.length > LIMIT && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="mt-3 text-xs font-semibold text-[#1F6F54] hover:text-[#185C45] transition-colors"
        >
          {showAll ? "↑ Show less" : `↓ Show all ${certs.length}`}
        </button>
      )}
    </div>
  );
}

// ─── Step 2 — Industrial Capabilities ────────────────────────────────────────
interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step2Capabilities({ onNext, onBack }: Props) {
  const data              = useResearcherProfileStore((s) => s.data);
  const setData           = useResearcherProfileStore((s) => s.setData);
  const setCertifications = useResearcherProfileStore((s) => s.setCertifications);
  const deleteCert        = useResearcherProfileStore((s) => s.deleteCert);

  const [certOpen, setCertOpen] = useState(false);
  const [touched, setTouched]   = useState(false);

  const toggleCap = (cap: string) => {
    const next = data.executionCapabilities.includes(cap)
      ? data.executionCapabilities.filter((c) => c !== cap)
      : [...data.executionCapabilities, cap];
    setData({ executionCapabilities: next });
  };

  const handleContinue = () => {
    setTouched(true);
    if (
      data.executionCapabilities.length >= 1 &&
      data.industriesWorkedWith.length >= 1 &&
      data.preferredEngagement.length >= 1
    ) onNext();
  };

  return (
    <>
      {/* ── Execution Capabilities — compact card grid ───────────────── */}
      <div className="px-4 sm:px-5 py-4 border-b border-[#F3F4F6] flex flex-col gap-3">
        <div>
          <SectionLabel>Execution Capabilities <Req /></SectionLabel>
          <p className="text-xs text-[#62748e] mt-0.5">Select the R&D stages you are experienced in. At least 1 required.</p>
        </div>

        {/* Compact 2-col grid on md+ — items-stretch keeps all cards the same height per row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 items-stretch">
          {EXECUTION_CAPABILITIES.map((cap) => {
            const selected = data.executionCapabilities.includes(cap);
            const Icon = CAP_ICONS[cap] ?? Lightbulb;
            return (
              <button
                key={cap}
                type="button"
                onClick={() => toggleCap(cap)}
                className={cn(
                  "relative text-left p-3 rounded-[8px] border-2 transition-all duration-150 h-full flex flex-col",
                  selected
                    ? "border-[#018E7E] bg-[#f0faf5]"
                    : "border-[#e4e4e7] bg-white hover:border-[#018E7E]/40"
                )}
              >
                {selected && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#018E7E] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </span>
                )}
                <Icon className={cn("w-4 h-4 mb-1.5 flex-shrink-0", selected ? "text-[#018E7E]" : "text-[#71717a]")} />
                <p className={cn("text-[11px] font-semibold leading-snug", selected ? "text-[#018E7E]" : "text-[#020202]")}>
                  {cap}
                </p>
              </button>
            );
          })}
        </div>

        {touched && data.executionCapabilities.length === 0 && (
          <p className="text-xs text-red-500">Please select at least one capability</p>
        )}
      </div>

      {/* ── Industries Worked With ────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-4 border-b border-[#F3F4F6] flex flex-col gap-3">
        <div>
          <SectionLabel>Industries Worked With <Req /></SectionLabel>
          <p className="text-xs text-[#62748e] mt-0.5">Select industries where your work is applied. At least 1 required.</p>
        </div>
        <ChipGroup
          options={INDUSTRIES}
          selected={data.industriesWorkedWith}
          onChange={(v) => setData({ industriesWorkedWith: v })}
        />
        {touched && data.industriesWorkedWith.length === 0 && (
          <p className="text-xs text-red-500">Please select at least one industry</p>
        )}
      </div>

      {/* ── Preferred Engagement ─────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-4 border-b border-[#F3F4F6] flex flex-col gap-3">
        <div>
          <SectionLabel>Preferred Engagement <Req /></SectionLabel>
          <p className="text-xs text-[#62748e] mt-0.5">Indicate the modes of collaboration you are open to. At least 1 required.</p>
        </div>
        <ChipGroup
          options={PREFERRED_ENGAGEMENT}
          selected={data.preferredEngagement}
          onChange={(v) => setData({ preferredEngagement: v })}
        />
        {touched && data.preferredEngagement.length === 0 && (
          <p className="text-xs text-red-500">Please select at least one engagement type</p>
        )}
      </div>

      {/* ── Licenses & Certifications ─────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <SectionLabel>Licenses & Certifications</SectionLabel>
            <p className="text-xs text-[#62748e] mt-0.5">Optional — add relevant certifications.</p>
          </div>
          <button
            type="button"
            onClick={() => setCertOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#1F6F54] text-[#1F6F54] text-xs font-medium hover:bg-[#f0faf5] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {data.certifications.length > 0 ? "Edit Certifications" : "Add Certifications"}
          </button>
        </div>

        {data.certifications.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No certifications added"
            subtitle="Add licenses or certifications using the category selector."
          />
        ) : (
          <div className="flex flex-col gap-5">
            {/* Group by category — each group gets a coloured section header + card grid */}
            {Array.from(new Set(data.certifications.map((c) => c.category || "Other"))).map((cat) => {
              const style = CERT_CAT_STYLES[cat] ?? FALLBACK_STYLE;
              const { Icon } = style;
              const grouped = data.certifications.filter((c) => (c.category || "Other") === cat);
              return (
                <div key={cat}>
                  {/* Category heading — matches Track Record section header style */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-[8px] bg-[#f1f5f9] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#020202]" />
                    </div>
                    <p className="text-sm font-semibold text-[#020202]">{cat}</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#1F6F54] text-white">
                      {grouped.length}
                    </span>
                  </div>
                  <CertCardGrid certs={grouped} onDelete={deleteCert} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Validation summary ────────────────────────────────────────── */}
      {touched && (() => {
        const issues: string[] = [];
        if (data.executionCapabilities.length === 0) issues.push("Execution Capabilities (at least 1)");
        if (data.industriesWorkedWith.length === 0) issues.push("Industries Worked With (at least 1)");
        if (data.preferredEngagement.length === 0) issues.push("Preferred Engagement (at least 1)");
        if (issues.length === 0) return null;
        return (
          <div className="mx-4 sm:mx-5 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-[8px]">
            <p className="text-xs font-semibold text-amber-700 mb-1">Please complete required fields:</p>
            <ul className="list-disc list-inside text-xs text-amber-600 space-y-0.5">
              {issues.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>
        );
      })()}

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-[#e4e4e7] px-4 sm:px-5 py-3 flex items-center justify-between bg-white rounded-b-[12px]">
        <button type="button" onClick={onBack}
          className="text-sm font-medium text-[#71717a] hover:text-[#020202] transition-colors px-3 py-2 rounded-[6px] hover:bg-[#f7f7f7]">
          ← Back
        </button>
        <button type="button" onClick={handleContinue}
          className="flex items-center gap-2 px-5 py-2 rounded-[6px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-sm font-medium transition-colors">
          <Check className="w-4 h-4" /> Save & Continue
        </button>
      </div>

      <CertAccordionDrawer
        open={certOpen}
        onClose={() => setCertOpen(false)}
        existingCerts={data.certifications}
        onSave={setCertifications}
      />
    </>
  );
}
