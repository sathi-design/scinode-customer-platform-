"use client";

import React, { useState, useRef, useEffect } from "react";
import { Award, Plus, ChevronDown, ChevronRight, Check, X, Upload, ImageIcon, FileText, Trash2, ScrollText, ShieldCheck, AlertTriangle, Leaf } from "lucide-react";
import { useIndependentCROProfileStore } from "@/store/useIndependentCROProfileStore";
import {
  FormField, inputCls, EmptyState, DrawerFooter, TabFooter,
} from "@/modules/profile/SharedUI";
import { DrawerBase } from "@/modules/profile/DrawerBase";
import { CRO_CERT_CATEGORIES } from "../constants";
import type { CROCertification } from "../types";
import { cn } from "@/lib/utils";

type CertDetailEntry = {
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  imageFile: string;
  documentFile: string;
};
const EMPTY_DETAIL: CertDetailEntry = { issuingAuthority: "", issueDate: "", expiryDate: "", imageFile: "", documentFile: "" };

function CertAccordionDrawer({
  open, onClose, existingCerts, onSave,
}: {
  open: boolean; onClose: () => void;
  existingCerts: CROCertification[];
  onSave: (certs: CROCertification[]) => void;
}) {
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [certDetails, setCertDetails]     = useState<Record<string, CertDetailEntry>>({});
  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({});
  const [showDetails, setShowDetails]     = useState(false);
  const [otherName, setOtherName]               = useState("");
  const [otherAuthority, setOtherAuthority]     = useState("");
  const [otherIssue, setOtherIssue]             = useState("");
  const [otherExpiry, setOtherExpiry]           = useState("");
  const [otherImageFile, setOtherImageFile]     = useState("");
  const [otherDocumentFile, setOtherDocumentFile] = useState("");
  const [uploadErrors, setUploadErrors]         = useState<Record<string, string>>({});

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!open) return;
    const names = existingCerts.filter((c) => c.category !== "Other").map((c) => c.name);
    const details: Record<string, CertDetailEntry> = {};
    existingCerts.filter((c) => c.category !== "Other").forEach((c) => {
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
    const other = existingCerts.find((c) => c.category === "Other");
    setOtherName(other?.name ?? "");
    setOtherAuthority(other?.issuingAuthority ?? "");
    setOtherIssue(other?.issueDate ?? "");
    setOtherExpiry(other?.expiryDate ?? "");
    setOtherImageFile(other?.imageFile ?? "");
    setOtherDocumentFile(other?.documentFile ?? "");
    setUploadErrors({});
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePill = (name: string) => {
    setSelectedNames((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);
  };

  const updateDetail = (name: string, patch: Partial<CertDetailEntry>) => {
    setCertDetails((prev) => ({ ...prev, [name]: { ...(prev[name] ?? EMPTY_DETAIL), ...patch } }));
    if (patch.imageFile !== undefined || patch.documentFile !== undefined) {
      setUploadErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  };

  const toggleAccordion = (id: string) => setAccordionOpen((p) => ({ ...p, [id]: !p[id] }));

  const scrollToSection = (id: string) => sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });

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

    const saved: CROCertification[] = selectedNames.map((name, i) => ({
      id: existingCerts.find((c) => c.name === name)?.id ?? `${Date.now()}-${i}`,
      name,
      category: CRO_CERT_CATEGORIES.find((cat) => (cat.pills as readonly string[]).includes(name))?.label ?? "",
      issuingAuthority: certDetails[name]?.issuingAuthority ?? "",
      issueDate: certDetails[name]?.issueDate ?? "",
      expiryDate: certDetails[name]?.expiryDate ?? "",
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
        imageFile: otherImageFile,
        documentFile: otherDocumentFile,
      });
    }
    onSave(saved);
    onClose();
  };

  const totalSelected = selectedNames.length + (otherName.trim() ? 1 : 0);

  return (
    <DrawerBase open={open} onClose={onClose} title="Licenses & Certifications" width={620}
      footer={
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#62748e]">{totalSelected} certification{totalSelected !== 1 ? "s" : ""} selected</span>
          <DrawerFooter onCancel={onClose} onSave={handleSave} saveLabel="Save Certifications" />
        </div>
      }
    >
      <div className="flex flex-col gap-0">

        {/* Sticky summary header */}
        <div className="sticky top-0 z-10 bg-white pb-3 pt-1 border-b border-[#f1f5f9] mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full", totalSelected > 0 ? "bg-[#018E7E] text-white" : "bg-[#f1f5f9] text-[#62748e]")}>
              {totalSelected} selected
            </span>
            <span className="text-[11px] text-[#9ca3af]">Quick jump →</span>
            <div className="flex flex-wrap gap-1.5">
              {CRO_CERT_CATEGORIES.map((cat) => {
                const catCount = cat.pills.filter((p) => selectedNames.includes(p)).length;
                return (
                  <button key={cat.id} type="button"
                    onClick={() => { scrollToSection(cat.id); setAccordionOpen((p) => ({ ...p, [cat.id]: true })); }}
                    className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors",
                      catCount > 0 ? "border-[#018E7E] bg-[#f0faf5] text-[#018E7E]" : "border-[#e4e4e7] bg-white text-[#71717a] hover:border-[#018E7E]/50"
                    )}>
                    {cat.label.split(" ").slice(0, 2).join(" ")} {catCount > 0 && `(${catCount})`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Other — custom entry */}
        <div className="mb-4 p-4 rounded-[10px] border-2 border-dashed border-[#e4e4e7] bg-[#fafafa]">
          <p className="text-xs font-semibold text-[#62748e] uppercase tracking-wider mb-3">Other (Custom Entry)</p>
          <div className="flex flex-col gap-3">
            <FormField label="Certification Name">
              <input className={inputCls} value={otherName} onChange={(e) => setOtherName(e.target.value)} placeholder="e.g. Biosafety Level 2, NABL…" />
            </FormField>
            {otherName.trim() && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField label="Issuing Authority">
                    <input className={inputCls} value={otherAuthority} onChange={(e) => setOtherAuthority(e.target.value)} placeholder="e.g. DST" />
                  </FormField>
                  <FormField label="Issue Date">
                    <input type="date" className={inputCls} value={otherIssue} onChange={(e) => setOtherIssue(e.target.value)} />
                  </FormField>
                  <FormField label="Expiry Date">
                    <input type="date" className={inputCls} value={otherExpiry} onChange={(e) => setOtherExpiry(e.target.value)} />
                  </FormField>
                </div>
                {/* Upload fields */}
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

        {/* Category accordions */}
        <div className="flex flex-col gap-2">
          {CRO_CERT_CATEGORIES.map((cat) => {
            const isOpen   = !!accordionOpen[cat.id];
            const catCount = cat.pills.filter((p) => selectedNames.includes(p)).length;
            return (
              <div key={cat.id} ref={(el) => { sectionRefs.current[cat.id] = el; }}
                className="rounded-[10px] border border-[#e4e4e7] overflow-hidden">
                <button type="button" onClick={() => toggleAccordion(cat.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#fafafa] hover:bg-[#f0faf5] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#020202]">{cat.label}</span>
                    {catCount > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#018E7E] text-white">{catCount}</span>}
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-[#71717a]" /> : <ChevronRight className="w-4 h-4 text-[#71717a]" />}
                </button>
                {isOpen && (
                  <div className="px-4 py-4 flex flex-wrap gap-2 bg-white">
                    {cat.pills.map((pill) => {
                      const selected = selectedNames.includes(pill);
                      return (
                        <button key={pill} type="button" onClick={() => togglePill(pill)}
                          className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
                            selected ? "bg-[#018E7E] border-[#018E7E] text-white" : "bg-white border-[#cbd5e1] text-[#353535] hover:border-[#018E7E]/50"
                          )}>
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

        {/* Selected cert detail cards */}
        {selectedNames.length > 0 && (
          <div className="mt-4">
            <button type="button" onClick={() => setShowDetails((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-[10px] bg-[#f0faf5] border border-[#d1fae5] mb-3">
              <span className="text-sm font-semibold text-[#018E7E]">Fill in Details for {selectedNames.length} Selected Certification{selectedNames.length > 1 ? "s" : ""}</span>
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
                        {/* Certificate Image */}
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

                        {/* Supporting Document */}
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

// ─── Cert card helpers ────────────────────────────────────────────────────────

type CertCatStyle = {
  gradient: string;
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
};

const CERT_CAT_STYLES: Record<string, CertCatStyle> = {
  "Basic Regulatory License":              { gradient: "from-[#f59e0b] to-[#fbbf24]", Icon: ScrollText,    iconBg: "#fffbeb", iconColor: "#d97706", label: "Regulatory" },
  "Product Licenses":                      { gradient: "from-[#2563eb] to-[#60a5fa]", Icon: FileText,      iconBg: "#eff6ff", iconColor: "#2563eb", label: "Product" },
  "Reagent & Hazardous Chemical Handling": { gradient: "from-[#dc2626] to-[#f87171]", Icon: AlertTriangle, iconBg: "#fef2f2", iconColor: "#dc2626", label: "Hazardous" },
  "Factory / Process Accreditation":       { gradient: "from-[#018E7E] to-[#34d399]", Icon: ShieldCheck,   iconBg: "#f0fdf4", iconColor: "#018E7E", label: "Accreditation" },
  "ESG Accreditation":                     { gradient: "from-[#059669] to-[#6ee7b7]", Icon: Leaf,          iconBg: "#ecfdf5", iconColor: "#059669", label: "ESG" },
  "Other":                                 { gradient: "from-[#7c3aed] to-[#a78bfa]", Icon: Award,         iconBg: "#f5f3ff", iconColor: "#7c3aed", label: "Other" },
};

function certExpiryStatus(expiryDate: string): { label: string; cls: string } | null {
  if (!expiryDate) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp   = new Date(expiryDate);
  const days  = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
  if (days < 0)   return { label: "Expired",     cls: "bg-red-100 text-red-700" };
  if (days <= 30) return { label: "Expires soon", cls: "bg-amber-100 text-amber-700" };
  return               { label: "Active",         cls: "bg-green-100 text-green-700" };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#f3f4f6] last:border-0 gap-2">
      <span className="text-[11px] text-[#9ca3af] flex-shrink-0">{label}</span>
      <span className="text-[11px] font-semibold text-[#020202] text-right">{value}</span>
    </div>
  );
}

function CertCard({ c, onDelete }: { c: CROCertification; onDelete: () => void }) {
  const style = CERT_CAT_STYLES[c.category] ?? CERT_CAT_STYLES["Other"];
  const { Icon } = style;
  const expiry = certExpiryStatus(c.expiryDate);

  return (
    <div className="bg-white rounded-xl border border-[#e4e4e7] shadow-sm flex flex-col overflow-hidden">
      {/* Gradient stripe */}
      <div className={cn("h-1 bg-gradient-to-r", style.gradient)} />

      {/* Header */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-[4px] flex items-center justify-center flex-shrink-0" style={{ background: style.iconBg }}>
              <Icon className="w-3 h-3" style={{ color: style.iconColor }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: style.iconColor }}>{style.label}</span>
          </div>
          <p className="text-sm font-bold text-[#020202] leading-snug line-clamp-2">{c.name}</p>
          {expiry && (
            <span className={cn("inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full", expiry.cls)}>
              {expiry.label}
            </span>
          )}
        </div>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-[#d1d5db] hover:text-red-500 transition-colors flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Detail rows */}
      {(c.issuingAuthority || c.issueDate || c.expiryDate) && (
        <div className="px-3 pb-2 border-t border-[#f3f4f6] pt-2 flex flex-col flex-1">
          {c.issuingAuthority && <DetailRow label="Issued By" value={c.issuingAuthority} />}
          {c.issueDate        && <DetailRow label="Issue Date" value={c.issueDate} />}
          {c.expiryDate       && <DetailRow label="Expiry" value={c.expiryDate} />}
        </div>
      )}

      {/* Upload chips */}
      {(c.imageFile || c.documentFile) && (
        <div className="px-3 pb-3 flex flex-wrap gap-1">
          {c.imageFile && (
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] truncate max-w-[140px]">
              <ImageIcon className="w-2.5 h-2.5 flex-shrink-0" />{c.imageFile}
            </span>
          )}
          {c.documentFile && (
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#059669] border border-[#bbf7d0] truncate max-w-[140px]">
              <FileText className="w-2.5 h-2.5 flex-shrink-0" />{c.documentFile}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function CertCardGrid({ certs, onDelete }: { certs: CROCertification[]; onDelete: (id: string) => void }) {
  const [showAll, setShowAll] = React.useState(false);
  const LIMIT = 6;
  const visible = showAll ? certs : certs.slice(0, LIMIT);
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((c) => (
          <CertCard key={c.id} c={c} onDelete={() => onDelete(c.id)} />
        ))}
      </div>
      {certs.length > LIMIT && (
        <button type="button" onClick={() => setShowAll((s) => !s)}
          className="mt-3 text-xs font-semibold text-[#1F6F54] hover:text-[#185C45] transition-colors">
          {showAll ? "↑ Show less" : `↓ Show all ${certs.length}`}
        </button>
      )}
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

interface Props { onNext: () => void; onBack: () => void; }

export function Tab3Certifications({ onNext, onBack }: Props) {
  const [open, setOpen]             = useState(false);
  const certifications              = useIndependentCROProfileStore((s) => s.certifications);
  const setCertifications           = useIndependentCROProfileStore((s) => s.setCertifications);
  const deleteCert                  = useIndependentCROProfileStore((s) => s.deleteCert);

  return (
    <>
      <CertAccordionDrawer open={open} onClose={() => setOpen(false)}
        existingCerts={certifications} onSave={setCertifications} />

      <div className="flex flex-col">
        <div className="p-4 sm:p-6 pb-2">
          <div className="flex items-center justify-end mb-4">
            <button onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#1F6F54] text-[#1F6F54] text-xs font-medium hover:bg-[#f0faf5] transition-colors">
              <Plus className="w-3.5 h-3.5" />
              {certifications.length > 0 ? "Edit Certifications" : "Add Certifications"}
            </button>
          </div>

          {certifications.length === 0
            ? <EmptyState icon={Award} title="No certifications added yet"
                subtitle="Add licenses or certifications using the category selector." />
            : <CertCardGrid certs={certifications} onDelete={deleteCert} />
          }
        </div>
        <TabFooter onSave={onNext} onBack={onBack} />
      </div>
    </>
  );
}

