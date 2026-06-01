"use client";

import React, { useState, useRef } from "react";
import {
  Plus, Package, Trash2, Upload, FileSpreadsheet, CheckCircle2, X, Download,
  AlertCircle, FileText, Image as ImageIcon, Search, ChevronDown, ChevronUp,
  Clock, SlidersHorizontal, Check, Info, Sparkles, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField, inputCls, DropdownSelect, EmptyState, DrawerFooter } from "../SharedUI";
import { DrawerBase } from "../DrawerBase";
import { INDUSTRIES, PRODUCT_GRADES, MOQ_UNITS, INVENTORY_UNITS } from "../constants";
import { useProfileStore } from "@/store/useProfileStore";
import type { Product } from "../types";

// ─── Local types ───────────────────────────────────────────────────────────────

type CataloguePhase = "none" | "processing" | "complete";

interface UploadedFile {
  id: string;
  name: string;
  ext: string;
  size: string;
  uploadedAt: string;
  status: "processing" | "complete";
}

interface CatalogueProduct extends Product {
  source: "catalogue";
  needsUpdate?: boolean;
  catalogueFile?: string;
}

// ─── Demo catalogue data ───────────────────────────────────────────────────────

const SAMPLE_CATALOGUE_PRODUCTS: CatalogueProduct[] = [
  {
    id: "cat-001", source: "catalogue", catalogueFile: "Mehta_Catalogue_2024.pdf",
    name: "Ibuprofen API", casNo: "15687-27-1", industry: "Pharmaceuticals",
    grade: "Pharmaceutical", purity: "99.5", moq: "100", moqUnit: "kg",
    inventoryStatus: "In inventory", availableQty: "500", availableUnit: "kg",
    availableLocation: "Ankleshwar, Gujarat", crackedChemistry: true, workedOnProduct: true,
  },
  {
    id: "cat-002", source: "catalogue", needsUpdate: true, catalogueFile: "Mehta_Catalogue_2024.pdf",
    name: "Naproxen Sodium", casNo: "26159-34-2", industry: "Pharmaceuticals",
    grade: "Pharmaceutical", purity: "", moq: "", moqUnit: "kg",
    inventoryStatus: "Made to order", availableQty: "", availableUnit: "kg",
    availableLocation: "", crackedChemistry: false, workedOnProduct: true,
  },
  {
    id: "cat-003", source: "catalogue", catalogueFile: "Mehta_Catalogue_2024.pdf",
    name: "Paracetamol API", casNo: "103-90-2", industry: "Pharmaceuticals",
    grade: "IP Grade", purity: "99.8", moq: "200", moqUnit: "kg",
    inventoryStatus: "In inventory", availableQty: "1000", availableUnit: "kg",
    availableLocation: "GIDC, Gujarat", crackedChemistry: true, workedOnProduct: true,
  },
  {
    id: "cat-004", source: "catalogue", needsUpdate: true, catalogueFile: "Products_Excel.xlsx",
    name: "Chloroacetic Acid", casNo: "79-11-8", industry: "Agrochemicals",
    grade: "Commercial", purity: "98.0", moq: "500", moqUnit: "kg",
    inventoryStatus: "In inventory", availableQty: "2000", availableUnit: "kg",
    availableLocation: "Dahej, Gujarat", crackedChemistry: true, workedOnProduct: true,
  },
  {
    id: "cat-005", source: "catalogue", needsUpdate: true, catalogueFile: "Products_Excel.xlsx",
    name: "2-Ethylhexanol", casNo: "104-76-7", industry: "Specialty Chemicals",
    grade: "Industrial", purity: "", moq: "", moqUnit: "kg",
    inventoryStatus: "Made to order", availableQty: "", availableUnit: "kg",
    availableLocation: "", crackedChemistry: false, workedOnProduct: false,
  },
];

const MISSING_FIELDS_MAP: Record<string, string[]> = {
  "cat-002": ["Purity", "MOQ", "Export Readiness", "Lead Time"],
  "cat-004": ["Commercial Availability", "Production Capacity", "Packaging", "Certifications"],
  "cat-005": ["Purity", "MOQ", "Commercial Availability", "Export Readiness", "Lead Time", "Production Capacity"],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getExt(name: string) { return name.split(".").pop()?.toLowerCase() ?? "file"; }

function fmtSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function nowTime() {
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  return `Today, ${h}:${m} ${d.getHours() >= 12 ? "PM" : "AM"}`;
}

function isProductComplete(p: Product) {
  return !!(p.name && p.casNo && p.purity && p.moq);
}

// ─── File icon ─────────────────────────────────────────────────────────────────

function FileIcon({ ext, size = 16 }: { ext: string; size?: number }) {
  const e = ext.toLowerCase();
  if (["xlsx", "xls", "csv"].includes(e)) return <FileSpreadsheet size={size} className="text-[#0F7614]" />;
  if (e === "pdf") return <FileText size={size} style={{ color: "#C30E1A" }} />;
  if (["doc", "docx"].includes(e)) return <FileText size={size} className="text-[#0077CC]" />;
  if (["jpg", "jpeg", "png"].includes(e)) return <ImageIcon size={size} className="text-[#6237C7]" />;
  return <FileText size={size} className="text-[#6B7280]" />;
}

// ─── Accepted types & format chips ────────────────────────────────────────────

const ACCEPT = ".xlsx,.xls,.csv,.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png";

const FORMAT_CHIPS = [
  { label: "Excel", cls: "bg-[#E8FBF2] text-[#0F7614]" },
  { label: "CSV", cls: "bg-[#E8FBF2] text-[#0F7614]" },
  { label: "PDF", cls: "bg-[#FFEFEF] text-[#C30E1A]" },
  { label: "Word", cls: "bg-[#E6F3FB] text-[#0077CC]" },
  { label: "PPT", cls: "bg-[#FEF0EB] text-[#9C5022]" },
  { label: "JPG", cls: "bg-[#EDE8FB] text-[#6237C7]" },
  { label: "PNG", cls: "bg-[#EDE8FB] text-[#6237C7]" },
];

// ─── Upload Catalogue Modal ────────────────────────────────────────────────────

function UploadCatalogueModal({
  open, onClose, onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: (files: UploadedFile[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    setSelectedFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...arr.filter((f) => !existing.has(f.name + f.size))];
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx: number) =>
    setSelectedFiles((p) => p.filter((_, i) => i !== idx));

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    const now = nowTime();
    const uploaded: UploadedFile[] = selectedFiles.map((f, i) => ({
      id: `uf-${Date.now()}-${i}`,
      name: f.name,
      ext: getExt(f.name),
      size: fmtSize(f.size),
      uploadedAt: now,
      status: "processing",
    }));
    onUploaded(uploaded);
    setSelectedFiles([]);
    onClose();
  };

  const handleClose = () => { setSelectedFiles([]); onClose(); };

  const STEPS: {
    n: string; title: string; body: string;
    chips?: string[]; note?: string; bullets?: string[];
    productPreview?: boolean;
  }[] = [
    {
      n: "1", title: "Upload Existing Files",
      body: "Supported formats: Excel (.xlsx, .xls, .csv), PDF, Word (.doc, .docx), PowerPoint, JPG, PNG. Upload one or multiple files.",
      chips: ["Excel", "CSV", "PDF", "Word", "PPT", "JPG", "PNG"],
    },
    {
      n: "2", title: "SciNode Processing",
      body: "Our product intelligence team reviews and structures your catalogue.",
      note: "Estimated: a few hours to 2 business days.",
    },
    {
      n: "3", title: "Products Become Searchable",
      body: "Each product gets a structured, buyer-facing card — discoverable via search, RFQ matching, and industry filters.",
      productPreview: true,
    },
    {
      n: "4", title: "Get Better Buyer Matches",
      body: "Structured catalogue data helps us:",
      bullets: ["Match relevant RFQs", "Improve discovery", "Increase buyer visibility", "Surface catalogue-based opportunities"],
    },
  ];

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,2,2,0.60)" }} onClick={handleClose}>
      <div
        className="bg-white rounded-[18px] w-full max-w-[900px] max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#E8FBF2] flex items-center justify-center border border-[#2ACB83]/20">
              <Upload size={17} className="text-[#018e7e]" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#020202]">Upload Your Existing Product Catalogue</h3>
              <p className="text-[12px] text-[#6B7280]">Already have your catalogue? Upload it and we'll structure your products automatically.</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* ── Body (split) ── */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">

          {/* LEFT — education panel */}
          <div className="lg:w-[56%] overflow-y-auto flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[#F3F4F6]"
            style={{ background: "#F9FAFB" }}>
            <div className="p-6 flex flex-col gap-5">

              {/* Step cards */}
              <div className="flex flex-col">
                {STEPS.map((step, idx) => (
                  <div key={step.n} className="relative flex gap-4">
                    {/* Connector line */}
                    {idx < STEPS.length - 1 && (
                      <div className="absolute left-[15px] top-[34px] bottom-0 w-px bg-[#E5E7EB]" />
                    )}
                    {/* Number circle */}
                    <div className="flex-shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-bold z-10 mt-0.5"
                      style={{ background: "#2ACB83", color: "#020202" }}>
                      {step.n}
                    </div>
                    {/* Content */}
                    <div className={cn("flex-1 pb-5", idx === STEPS.length - 1 && "pb-0")}>
                      <p className="text-[13px] font-semibold text-[#020202] mb-1">{step.title}</p>
                      <p className="text-[12px] text-[#6B7280] leading-[18px] mb-2">{step.body}</p>
                      {step.note && (
                        <p className="text-[11px] text-[#0077CC] font-medium">{step.note}</p>
                      )}
                      {step.chips && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {step.chips.map((c) => {
                            const chip = FORMAT_CHIPS.find((f) => f.label === c);
                            return (
                              <span key={c} className={cn("text-[10px] font-semibold px-2 py-0.5 rounded", chip?.cls ?? "bg-[#F3F4F6] text-[#4B5563]")}>
                                {c}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {/* Standard bullet list (Step 4) */}
                      {step.bullets && (
                        <div className="flex flex-col gap-1 mt-1.5">
                          {step.bullets.map((b) => (
                            <div key={b} className="flex items-center gap-1.5">
                              <Check size={10} className="text-[#2ACB83] shrink-0" strokeWidth={3} />
                              <span className="text-[11.5px] text-[#4B5563]">{b}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Step 3 — 4-card peek carousel */}
                      {step.productPreview && (() => {
                        const MINI = [
                          { name: "Naproxen Sodium",   industry: "Pharmaceuticals",     inv: false, cas: "26159-34-2", purity: "99.0%", moq: "50 kg",  grade: "API"        },
                          { name: "Sodium Bromide",    industry: "Flavors & Frag.",     inv: true,  cas: "7647-15-6",  purity: "99.5%", moq: "56 MT",  grade: "Industrial" },
                          { name: "Ibuprofen API",     industry: "Pharmaceuticals",     inv: true,  cas: "15687-27-1", purity: "99.5%", moq: "100 kg", grade: "Pharma"     },
                          { name: "Paracetamol",       industry: "Pharmaceuticals",     inv: true,  cas: "103-90-2",   purity: "99.8%", moq: "200 kg", grade: "IP Grade"   },
                        ];
                        return (
                          <div className="mt-2.5">
                            {/* Carousel — cards 1 & 4 peek with fade */}
                            <div className="relative overflow-hidden">
                              <div
                                className="flex gap-2"
                                style={{ transform: "translateX(-56px)", width: "calc(100% + 112px)" }}
                              >
                                {MINI.map((c, i) => (
                                  <div
                                    key={i}
                                    className="rounded-xl border border-[#E4E4E7] bg-white overflow-hidden flex-shrink-0"
                                    style={{ width: 118 }}
                                  >
                                    {/* Header */}
                                    <div className="p-2.5 pb-2">
                                      <p className="text-[11px] font-bold text-[#020202] leading-tight line-clamp-2">{c.name}</p>
                                      <p className="text-[9px] font-medium text-[#018e7e] mt-0.5 truncate">{c.industry}</p>
                                      <span className={cn(
                                        "inline-block mt-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full",
                                        c.inv ? "bg-[#B2F3B7] text-[#0F7614]" : "bg-[#F3F4F6] text-[#4B5563]"
                                      )}>
                                        {c.inv ? "IN INVENTORY" : "Made to Order"}
                                      </span>
                                    </div>
                                    {/* Specs */}
                                    <div className="px-2.5 pb-2 border-t border-[#F3F4F6] pt-1.5 flex flex-col gap-[3px]">
                                      {[["CAS", c.cas], ["Purity", c.purity], ["MOQ", c.moq], ["Grade", c.grade]].map(([l, v]) => (
                                        <div key={l} className="flex items-center justify-between">
                                          <span className="text-[8.5px] text-[#9CA3AF]">{l}</span>
                                          <span className="text-[8.5px] font-semibold text-[#020202] truncate max-w-[60px] text-right">{v}</span>
                                        </div>
                                      ))}
                                    </div>
                                    {/* Badge */}
                                    <div className="px-2.5 pb-2">
                                      <span className="text-[7.5px] font-bold px-1.5 py-0.5 rounded-full bg-[#E6F3FB] text-[#0077CC] flex items-center gap-0.5 w-fit">
                                        <Sparkles size={6} /> Catalogue
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {/* Left fade (card 1) */}
                              <div className="absolute inset-y-0 left-0 w-16 pointer-events-none z-10"
                                style={{ background: "linear-gradient(to right, #F9FAFB 30%, transparent)" }} />
                              {/* Right fade (card 4) */}
                              <div className="absolute inset-y-0 right-0 w-16 pointer-events-none z-10"
                                style={{ background: "linear-gradient(to left, #F9FAFB 30%, transparent)" }} />
                            </div>
                            {/* Caption */}
                            <p className="text-[11px] text-[#6B7280] leading-[16px] mt-2.5 italic">
                              Your cards will look like this after our intelligence team reviews and structures your catalogue.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Why upload? info box */}
              <div className="rounded-xl border border-[#0077CC]/20 p-4" style={{ background: "#E6F3FB" }}>
                <div className="flex items-start gap-2.5">
                  <Info size={15} className="text-[#0077CC] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12px] font-semibold text-[#0077CC] mb-1">Why upload a catalogue?</p>
                    <p className="text-[11.5px] text-[#4B5563] leading-[17px]">
                      Manufacturers with complete catalogues receive significantly higher buyer visibility
                      and more relevant project opportunities than those with incomplete product information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — upload panel */}
          <div className="lg:w-[44%] overflow-y-auto flex-shrink-0 p-6 flex flex-col gap-4 bg-white">

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-3 cursor-pointer transition-colors",
                isDragging ? "border-[#2ACB83] bg-[#E8FBF2]" : "border-[#CBD5E1] hover:border-[#2ACB83]/50 hover:bg-[#F9FAFB]"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <Upload size={20} className="text-[#6B7280]" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-[#020202]">Drop your files here</p>
                <p className="text-[13px] text-[#6B7280] mt-0.5">
                  or <span className="text-[#018e7e] font-semibold underline underline-offset-2">Browse Files</span>
                </p>
              </div>
              <p className="text-[11px] text-[#9CA3AF]">Upload one or multiple catalogue documents</p>
              <input ref={fileRef} type="file" accept={ACCEPT} multiple className="hidden"
                onChange={(e) => addFiles(e.target.files)} />
            </div>

            {/* Supported formats */}
            <div>
              <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Supported Formats</p>
              <div className="flex flex-wrap gap-1.5">
                {FORMAT_CHIPS.map((f) => (
                  <span key={f.label} className={cn("text-[10px] font-semibold px-2 py-1 rounded", f.cls)}>
                    {f.label}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-[#9CA3AF] mt-2">Maximum 50 MB per file</p>
            </div>

            {/* Selected files list */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
                </p>
                <div className="flex flex-col gap-1.5">
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                      <FileIcon ext={getExt(f.name)} size={15} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[#020202] truncate">{f.name}</p>
                        <p className="text-[10px] text-[#9CA3AF]">{fmtSize(f.size)}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        className="p-1 rounded hover:bg-[#FFEFEF] text-[#9CA3AF] hover:text-[#C30E1A] transition-colors flex-shrink-0">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                  className="text-[12px] font-medium text-[#018e7e] hover:underline text-left"
                >
                  + Add more files
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#F3F4F6] flex-shrink-0 bg-white">
          <button className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#0077CC] hover:text-[#005fa3] transition-colors">
            <Download size={13} /> Download Sample Catalogue Template
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleClose}
              className="px-4 py-[7px] rounded-lg border border-[#B3B7BD] text-[13px] font-medium text-[#4B5563] hover:bg-[#F9FAFB] transition-colors">
              Cancel
            </button>
            <button onClick={handleUpload} disabled={selectedFiles.length === 0}
              className={cn(
                "flex items-center gap-2 px-5 py-[7px] rounded-lg text-[13px] font-semibold transition-all",
                selectedFiles.length > 0
                  ? "bg-[#2ACB83] text-[#020202] hover:brightness-105"
                  : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
              )}>
              <Upload size={14} />
              Upload Catalogue
              {selectedFiles.length > 0 && <span className="ml-0.5 opacity-70">({selectedFiles.length})</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Processing Banner ─────────────────────────────────────────────────────────

function ProcessingBanner({ onDismiss, onViewFiles }: { onDismiss: () => void; onViewFiles: () => void }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#0077CC]/25 relative"
      style={{ background: "#E6F3FB" }}>
      <Loader2 size={16} className="text-[#0077CC] shrink-0 mt-0.5 animate-spin" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#0077CC]">Catalogue processing in progress</p>
        <p className="text-[12px] text-[#4B5563] mt-0.5">
          Your catalogue is being reviewed and converted into structured product listings.
          You'll receive a notification once processing is complete.
        </p>
        <button onClick={onViewFiles}
          className="mt-2 text-[12px] font-semibold text-[#0077CC] hover:underline">
          View Uploaded Files →
        </button>
      </div>
      <button onClick={onDismiss}
        className="p-1 rounded hover:bg-[#0077CC]/10 text-[#0077CC] transition-colors flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Success Banner ────────────────────────────────────────────────────────────

function SuccessBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#2ACB83]/30 relative"
      style={{ background: "#E8FBF2" }}>
      <CheckCircle2 size={16} className="text-[#018e7e] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#018e7e]">Your catalogue has been processed successfully</p>
        <p className="text-[12px] text-[#4B5563] mt-0.5">
          Your uploaded catalogue has been converted into structured product listings and is now available
          for buyer discovery and project matching.
        </p>
      </div>
      <button onClick={onDismiss}
        className="p-1 rounded hover:bg-[#2ACB83]/10 text-[#018e7e] transition-colors flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Admin Missing Data Banner ─────────────────────────────────────────────────

function AdminMissingDataBanner({ count, onReview, onDismiss }: {
  count: number; onReview: () => void; onDismiss: () => void;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#FD4923]/25 relative"
      style={{ background: "#FEF0EB" }}>
      <AlertCircle size={16} className="text-[#FD4923] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#FD4923]">Additional product details required</p>
        <p className="text-[12px] text-[#4B5563] mt-0.5">
          We found missing information in <strong>{count} products</strong> that may reduce your visibility
          for relevant RFQs and buyer opportunities.
        </p>
        <button onClick={onReview}
          className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-[#FD4923] hover:underline">
          Review Missing Information →
        </button>
      </div>
      <button onClick={onDismiss}
        className="p-1 rounded hover:bg-[#FD4923]/10 text-[#FD4923] transition-colors flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Catalogue Processing Section ─────────────────────────────────────────────

function CatalogueProcessingSection({
  files, onSimulateComplete,
}: {
  files: UploadedFile[];
  onSimulateComplete: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-[#020202]">Uploaded Catalogues</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF0C5] text-[#9C5022]">
            Processing
          </span>
        </div>
        {/* Demo control — simulate admin completing processing */}
        <button onClick={onSimulateComplete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">
          <Check size={11} /> Simulate Processing Complete
        </button>
      </div>

      <p className="text-[12px] text-[#6B7280] -mt-1">
        We're analysing and structuring your uploaded catalogue.
        Estimated completion: 24–48 hours. You can continue using the platform while we prepare your catalogue.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {files.map((f) => (
          <div key={f.id} className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-[#E5E7EB] bg-white">
            <div className="w-9 h-9 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center flex-shrink-0">
              <FileIcon ext={f.ext} size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#020202] truncate">{f.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10.5px] text-[#9CA3AF]">{f.size}</span>
                <span className="text-[10.5px] text-[#9CA3AF]">·</span>
                <div className="flex items-center gap-1">
                  <Clock size={9} className="text-[#9CA3AF]" />
                  <span className="text-[10.5px] text-[#9CA3AF]">{f.uploadedAt}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Loader2 size={12} className="text-[#9C5022] animate-spin" />
              <span className="text-[10px] font-semibold text-[#9C5022]">Processing</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Search + Sort + Filter Toolbar ───────────────────────────────────────────

type FilterKey = "inventory" | "source" | "readiness";

function SearchFilterToolbar({
  search, setSearch,
  sort, setSort,
  filters, setFilter,
}: {
  search: string;
  setSearch: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  filters: Record<FilterKey, string[]>;
  setFilter: (key: FilterKey, val: string) => void;
}) {
  const [showFilters, setShowFilters] = useState(false);

  const SORT_OPTIONS = ["Latest Added", "Oldest Added", "A–Z", "Z–A"];

  const FILTER_GROUPS: { key: FilterKey; label: string; options: string[] }[] = [
    { key: "inventory", label: "Inventory Status", options: ["In Inventory", "Made to Order"] },
    { key: "source",    label: "Product Source",  options: ["Catalogue Generated", "Manually Added"] },
    { key: "readiness", label: "Readiness",        options: ["Complete", "Incomplete"] },
  ];

  const totalFilters = Object.values(filters).flat().length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            className="w-full border border-[#CBD5E1] rounded-lg pl-9 pr-3 py-2 text-[13px] text-[#020202] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2ACB83]/20 focus:border-[#2ACB83] transition-colors"
            placeholder="Search by Product Name or CAS Number"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Sort */}
        <div className="w-[160px] flex-shrink-0">
          <DropdownSelect
            value={sort} onChange={setSort}
            options={SORT_OPTIONS} placeholder="Sort"
          />
        </div>
        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium border transition-colors flex-shrink-0",
            showFilters || totalFilters > 0
              ? "bg-[#E8FBF2] border-[#2ACB83]/40 text-[#018e7e]"
              : "border-[#CBD5E1] text-[#4B5563] hover:bg-[#F9FAFB]"
          )}
        >
          <SlidersHorizontal size={14} />
          Filters
          {totalFilters > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#2ACB83] text-[#020202] text-[9px] font-bold flex items-center justify-center">
              {totalFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 px-4 py-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
          {FILTER_GROUPS.map(({ key, label, options }) => (
            <div key={key} className="flex flex-col gap-1.5 min-w-[160px]">
              <p className="text-[10.5px] font-bold tracking-wide uppercase text-[#6B7280]">{label}</p>
              {options.map((opt) => {
                const checked = filters[key].includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setFilter(key, opt)}
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        checked ? "bg-[#2ACB83] border-[#2ACB83]" : "bg-white border-[#CBD5E1] hover:border-[#2ACB83]"
                      )}
                    >
                      {checked && <Check size={10} className="text-[#020202]" strokeWidth={3} />}
                    </div>
                    <span className="text-[12px] text-[#4B5563]">{opt}</span>
                  </label>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Missing Data Modal ────────────────────────────────────────────────────────

function MissingDataModal({
  open, onClose, products,
}: {
  open: boolean;
  onClose: () => void;
  products: CatalogueProduct[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(products[0]?.id ?? null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const selected = products.find((p) => p.id === selectedId);
  const missingFields = selectedId ? (MISSING_FIELDS_MAP[selectedId] ?? []) : [];

  const handleSave = () => {
    if (!selectedId) return;
    setSaved((s) => new Set([...s, selectedId]));
    setFormData({});
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,2,2,0.60)" }} onClick={onClose}>
      <div className="bg-white rounded-[18px] w-full max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6] flex-shrink-0">
          <div>
            <h3 className="text-[15px] font-semibold text-[#020202]">Products Requiring Updates</h3>
            <p className="text-[12px] text-[#6B7280] mt-0.5">
              {products.length} products with missing information that may affect RFQ matching
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* LEFT — product list */}
          <div className="w-[280px] flex-shrink-0 border-r border-[#F3F4F6] overflow-y-auto" style={{ background: "#F9FAFB" }}>
            <div className="p-3 flex flex-col gap-1.5">
              {products.map((p) => {
                const isSaved = saved.has(p.id);
                const mf = MISSING_FIELDS_MAP[p.id] ?? [];
                return (
                  <button key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={cn(
                      "w-full text-left px-3 py-3 rounded-xl border transition-all",
                      selectedId === p.id
                        ? "bg-white border-[#2ACB83]/40 shadow-sm"
                        : "bg-white border-transparent hover:border-[#E5E7EB]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-semibold text-[#020202] truncate">{p.name}</p>
                        {p.casNo && <p className="text-[10.5px] text-[#9CA3AF] font-mono mt-0.5">{p.casNo}</p>}
                      </div>
                      {isSaved
                        ? <span className="w-4 h-4 rounded-full bg-[#2ACB83] flex items-center justify-center flex-shrink-0">
                            <Check size={9} strokeWidth={3} className="text-white" />
                          </span>
                        : <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FEF0EB] text-[#FD4923] flex-shrink-0 whitespace-nowrap">
                            {mf.length} missing
                          </span>
                      }
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT — form */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {selected ? (
              <div className="p-6 flex flex-col gap-4 flex-1">
                {/* Selected product header */}
                <div className="pb-3 border-b border-[#F3F4F6]">
                  <p className="text-[14px] font-semibold text-[#020202]">{selected.name}</p>
                  {selected.casNo && <p className="text-[12px] text-[#9CA3AF] font-mono mt-0.5">{selected.casNo}</p>}
                  {saved.has(selected.id) && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <CheckCircle2 size={13} className="text-[#018e7e]" />
                      <span className="text-[12px] text-[#018e7e] font-medium">Information saved</span>
                    </div>
                  )}
                </div>

                {/* Dynamic fields */}
                <div className="flex flex-col gap-3 flex-1">
                  {missingFields.map((field) => (
                    <FormField key={field} label={`${field} *`}>
                      {field === "Commercial Availability" ? (
                        <DropdownSelect
                          value={formData[field] ?? ""}
                          onChange={(v) => setFormData((p) => ({ ...p, [field]: v }))}
                          options={["In Inventory", "Made to Order", "On Request"]}
                          placeholder="Select status"
                        />
                      ) : field === "Export Readiness" ? (
                        <DropdownSelect
                          value={formData[field] ?? ""}
                          onChange={(v) => setFormData((p) => ({ ...p, [field]: v }))}
                          options={["Ready for Export", "Domestic Only", "On Request"]}
                          placeholder="Select readiness"
                        />
                      ) : (
                        <input className={inputCls}
                          value={formData[field] ?? ""}
                          onChange={(e) => setFormData((p) => ({ ...p, [field]: e.target.value }))}
                          placeholder={
                            field === "Purity" ? "e.g. 99.5" :
                            field === "MOQ" ? "e.g. 100 kg" :
                            field === "Lead Time" ? "e.g. 4–6 weeks" :
                            field === "Production Capacity" ? "e.g. 500 MT/year" :
                            field === "Packaging" ? "e.g. 25 kg HDPE drums" :
                            field === "Certifications" ? "e.g. ISO 9001, GMP" :
                            `Enter ${field.toLowerCase()}`
                          }
                        />
                      )}
                    </FormField>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[13px] text-[#9CA3AF]">Select a product to fill in missing information</p>
              </div>
            )}

            {/* Footer */}
            {selected && (
              <div className="px-6 py-4 border-t border-[#F3F4F6] flex justify-end gap-2 flex-shrink-0">
                <button onClick={onClose}
                  className="px-4 py-[7px] rounded-lg border border-[#B3B7BD] text-[13px] font-medium text-[#4B5563] hover:bg-[#F9FAFB] transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave}
                  className="px-5 py-[7px] rounded-lg bg-[#2ACB83] text-[#020202] text-[13px] font-semibold hover:brightness-105 transition-all">
                  Update Product Information
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Existing AddProductDrawer (unchanged) ─────────────────────────────────────

const EMPTY: Omit<Product, "id"> = {
  name: "", casNo: "", industry: "", grade: "", purity: "",
  moq: "", moqUnit: "kg",
  inventoryStatus: "Made to order",
  availableQty: "", availableUnit: "kg", availableLocation: "",
  crackedChemistry: false, workedOnProduct: false,
};

function AddProductDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (p: Product) => void;
}) {
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, id: Date.now().toString() });
    setForm(EMPTY);
    onClose();
  };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Product"
      footer={<DrawerFooter onCancel={onClose} onSave={handleSave} saveLabel="Save Product" />}>
      <div className="flex flex-col gap-4">
        <FormField label="Product / Chemical Name *">
          <input className={inputCls} value={form.name}
            onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ibuprofen" />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="CAS Number">
            <input className={inputCls} value={form.casNo}
              onChange={(e) => set("casNo", e.target.value)} placeholder="e.g. 15687-27-1" />
          </FormField>
          <FormField label="Industry">
            <DropdownSelect value={form.industry} onChange={(v) => set("industry", v)}
              options={INDUSTRIES} placeholder="Select industry" />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Grade">
            <DropdownSelect value={form.grade} onChange={(v) => set("grade", v)}
              options={PRODUCT_GRADES} placeholder="Select grade" />
          </FormField>
          <FormField label="Purity (%)">
            <input className={inputCls} type="number" min="0" max="100" step="0.01"
              value={form.purity} onChange={(e) => set("purity", e.target.value)} placeholder="e.g. 99.5" />
          </FormField>
        </div>
        <FormField label="MOQ (Minimum Order Quantity)">
          <div className="flex gap-2">
            <input className={inputCls + " flex-1 min-w-0"} value={form.moq}
              onChange={(e) => set("moq", e.target.value)} placeholder="e.g. 100" />
            <DropdownSelect value={form.moqUnit} onChange={(v) => set("moqUnit", v)}
              options={MOQ_UNITS} className="w-[90px] flex-shrink-0" />
          </div>
        </FormField>
        <FormField label="Commercial & Readiness Status">
          <DropdownSelect value={form.inventoryStatus}
            onChange={(v) => set("inventoryStatus", v as Product["inventoryStatus"])}
            options={["In inventory", "Made to order"]} />
        </FormField>
        {form.inventoryStatus === "In inventory" && (
          <div className="animate-in fade-in-0 duration-200 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Available Quantity">
                <input className={inputCls} type="number" min="0"
                  value={form.availableQty} onChange={(e) => set("availableQty", e.target.value)} placeholder="e.g. 500" />
              </FormField>
              <FormField label="Unit">
                <DropdownSelect value={form.availableUnit} onChange={(v) => set("availableUnit", v)}
                  options={INVENTORY_UNITS} />
              </FormField>
            </div>
            <FormField label="Available at Location">
              <input className={inputCls} value={form.availableLocation}
                onChange={(e) => set("availableLocation", e.target.value)} placeholder="e.g. Ankleshwar, Gujarat" />
            </FormField>
          </div>
        )}
        <div className="flex flex-col gap-2 pt-1">
          {[
            { key: "crackedChemistry" as const, label: "Cracked Chemistry", desc: "You have successfully developed the synthesis route" },
            { key: "workedOnProduct" as const, label: "Worked on this Product", desc: "You have prior experience manufacturing this compound" },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="w-4 h-4 rounded accent-[#1F6F54]" />
              <div>
                <p className="text-sm font-medium text-[#020202]">{label}</p>
                <p className="text-xs text-[#9ca3af]">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </DrawerBase>
  );
}

// ─── DetailRow ─────────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#F3F4F6] last:border-0 gap-2">
      <span className="text-[11px] text-[#9CA3AF] flex-shrink-0">{label}</span>
      <span className="text-[11px] font-semibold text-[#020202] text-right">{value}</span>
    </div>
  );
}

// ─── ProductCard (enhanced) ────────────────────────────────────────────────────

function ProductCard({
  p, onDelete, source, needsUpdate,
}: {
  p: Product;
  onDelete: () => void;
  source?: "manual" | "catalogue";
  needsUpdate?: boolean;
}) {
  const isInInventory = p.inventoryStatus === "In inventory";
  const complete = isProductComplete(p);

  return (
    <div className="bg-white rounded-xl border border-[#E4E4E7] flex flex-col hover:border-[#B3B7BD] transition-colors">
      {/* Header */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-[#020202] leading-snug truncate">{p.name}</p>
          {p.industry && <p className="text-[11px] font-medium text-[#018e7e] mt-0.5 truncate">{p.industry}</p>}
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              isInInventory ? "bg-[#B2F3B7] text-[#0F7614]" : "bg-[#F3F4F6] text-[#4B5563]"
            )}>
              {isInInventory ? "IN INVENTORY" : "Made to Order"}
            </span>
            {needsUpdate && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF0EB] text-[#FD4923]">
                ⚠ Action Required
              </span>
            )}
            {!needsUpdate && !complete && source === "catalogue" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF0C5] text-[#9C5022]">
                Incomplete
              </span>
            )}
          </div>
        </div>
        <button onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-[#FFEFEF] text-[#D1D5DB] hover:text-[#C30E1A] transition-colors flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Details */}
      <div className="px-3 pb-2 border-t border-[#F3F4F6] pt-2 flex flex-col flex-1">
        {p.casNo && <DetailRow label="CAS" value={p.casNo} />}
        {p.purity && <DetailRow label="Purity" value={`${p.purity}%`} />}
        {p.moq && <DetailRow label="MOQ" value={`${p.moq} ${p.moqUnit}`} />}
        {p.grade && <DetailRow label="Grade" value={p.grade} />}
        {isInInventory && p.availableQty && (
          <DetailRow label="Available" value={`${p.availableQty} ${p.availableUnit}`} />
        )}
      </div>

      {/* Footer badges */}
      <div className="px-3 pb-3 flex flex-wrap gap-1 mt-auto">
        {source === "catalogue" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F3FB] text-[#0077CC] flex items-center gap-1">
            <Sparkles size={8} /> Generated from Catalogue
          </span>
        )}
        {source === "manual" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563]">
            Added Manually
          </span>
        )}
        {p.crackedChemistry && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#6D28D9]">
            ⚡ Chemistry Cracked
          </span>
        )}
        {p.workedOnProduct && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E]">
            ✓ Past Experience
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Collapsible Card Grid ─────────────────────────────────────────────────────

function CollapsibleCardGrid<T extends { id: string }>({
  items, renderItem, emptyText,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyText: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 4;
  const visible = showAll ? items : items.slice(0, LIMIT);
  if (items.length === 0) return <p className="text-xs text-[#9CA3AF] py-4 text-center">{emptyText}</p>;
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {visible.map((item) => renderItem(item))}
      </div>
      {items.length > LIMIT && (
        <button type="button" onClick={() => setShowAll((s) => !s)}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#018e7e] hover:text-[#015f54] transition-colors">
          {showAll ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show all {items.length}</>}
        </button>
      )}
    </div>
  );
}

// ─── Pure filter / sort helper (module-level — no closure issues) ─────────────

function filterAndSort<T extends Product>(
  items: T[],
  src: "manual" | "catalogue",
  search: string,
  sort: string,
  filters: Record<"inventory" | "source" | "readiness", string[]>,
): T[] {
  let result = [...items];

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) => p.name.toLowerCase().includes(q) || p.casNo.toLowerCase().includes(q),
    );
  }

  if (filters.inventory.length > 0) {
    result = result.filter((p) => {
      if (filters.inventory.includes("In Inventory") && p.inventoryStatus === "In inventory") return true;
      if (filters.inventory.includes("Made to Order") && p.inventoryStatus === "Made to order") return true;
      return false;
    });
  }

  if (filters.source.length > 0) {
    if (src === "catalogue" && !filters.source.includes("Catalogue Generated")) return [];
    if (src === "manual" && !filters.source.includes("Manually Added")) return [];
  }

  if (filters.readiness.length > 0) {
    result = result.filter((p) => {
      const ok = isProductComplete(p);
      if (filters.readiness.includes("Complete") && ok) return true;
      if (filters.readiness.includes("Incomplete") && !ok) return true;
      return false;
    });
  }

  if (sort === "A–Z") result.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "Z–A") result.sort((a, b) => b.name.localeCompare(a.name));
  else if (sort === "Oldest Added") result.reverse();

  return result;
}

// ─── Group header ──────────────────────────────────────────────────────────────

function GroupHeader({ label, badge, badgeCls }: { label: string; badge: string; badgeCls: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <p className="text-[12px] font-bold text-[#020202]">{label}</p>
      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", badgeCls)}>{badge}</span>
      <div className="flex-1 h-px bg-[#E5E7EB]" />
    </div>
  );
}

// ─── Main Products component ───────────────────────────────────────────────────

export function Products({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const products    = useProfileStore((s) => s.products);
  const addProduct  = useProfileStore((s) => s.addProduct);
  const deleteProduct = useProfileStore((s) => s.deleteProduct);

  const [addProductOpen, setAddProductOpen]           = useState(false);
  const [catalogueModalOpen, setCatalogueModalOpen]   = useState(false);
  const [missingDataModalOpen, setMissingDataModalOpen] = useState(false);

  // Catalogue state machine
  const [cataloguePhase, setCataloguePhase]             = useState<CataloguePhase>("none");
  const [uploadedFiles, setUploadedFiles]               = useState<UploadedFile[]>([]);
  const [catalogueProducts, setCatalogueProducts]       = useState<CatalogueProduct[]>([]);

  // Banner visibility
  const [processingBannerDismissed, setProcessingBannerDismissed] = useState(false);
  const [successBannerDismissed, setSuccessBannerDismissed]       = useState(false);
  const [missingBannerDismissed, setMissingBannerDismissed]       = useState(false);

  // Search / sort / filter
  const [search, setSearch]   = useState("");
  const [sort, setSort]       = useState("Latest Added");
  const [filters, setFiltersState] = useState<Record<"inventory" | "source" | "readiness", string[]>>({
    inventory: [], source: [], readiness: [],
  });

  // Toggle a filter value
  const setFilter = (key: "inventory" | "source" | "readiness", val: string) =>
    setFiltersState((prev) => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter((v) => v !== val) : [...prev[key], val],
    }));

  // Handlers
  const handleUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    setCataloguePhase("processing");
    setProcessingBannerDismissed(false);
  };

  const handleSimulateComplete = () => {
    setCataloguePhase("complete");
    setCatalogueProducts(SAMPLE_CATALOGUE_PRODUCTS);
    setSuccessBannerDismissed(false);
    setMissingBannerDismissed(false);
  };

  // Pure derived data — filter/sort via module-level function (no closure risk)
  const filteredCatalogueProducts = filterAndSort(catalogueProducts, "catalogue", search, sort, filters);
  const filteredManualProducts    = filterAndSort(products as Product[], "manual", search, sort, filters) as Product[];

  const hasAnyProducts = products.length > 0 || (cataloguePhase === "complete" && catalogueProducts.length > 0);
  const missingDataProducts = catalogueProducts.filter((p) => p.needsUpdate);
  const showMissingBanner = cataloguePhase === "complete" && missingDataProducts.length > 0 && !missingBannerDismissed;

  return (
    <>
      <AddProductDrawer open={addProductOpen} onClose={() => setAddProductOpen(false)}
        onSave={(p) => addProduct(p)} />
      <UploadCatalogueModal open={catalogueModalOpen} onClose={() => setCatalogueModalOpen(false)}
        onUploaded={handleUploaded} />
      <MissingDataModal open={missingDataModalOpen} onClose={() => setMissingDataModalOpen(false)}
        products={missingDataProducts} />

      <div className="flex flex-col">
        <div className="p-4 sm:p-5 pb-4 flex flex-col gap-4">

          {/* ── Header bar ── */}
          <div className="flex items-start justify-between gap-4">
            <p className="text-[13px] text-[#6B7280] leading-[20px] max-w-[440px]">
              Your product listings with CAS numbers, purity specifications, applications, and commercial
              information used by buyers to discover your manufacturing capabilities.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {/* Secondary CTA */}
              <button onClick={() => setAddProductOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg border border-[#B3B7BD] text-[#4B5563] text-[13px] font-medium hover:bg-[#F9FAFB] transition-colors">
                <Plus size={14} /> Add Product
              </button>
              {/* Primary CTA */}
              <button onClick={() => setCatalogueModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg bg-[#2ACB83] text-[#020202] text-[13px] font-semibold hover:brightness-105 transition-all">
                <Upload size={14} /> Upload Catalogue
              </button>
            </div>
          </div>

          {/* ── Processing banner ── */}
          {cataloguePhase === "processing" && !processingBannerDismissed && (
            <ProcessingBanner
              onDismiss={() => setProcessingBannerDismissed(true)}
              onViewFiles={() => { /* scroll to section */ }}
            />
          )}

          {/* ── Success banner ── */}
          {cataloguePhase === "complete" && !successBannerDismissed && (
            <SuccessBanner onDismiss={() => setSuccessBannerDismissed(true)} />
          )}

          {/* ── Admin missing data banner ── */}
          {showMissingBanner && (
            <AdminMissingDataBanner
              count={missingDataProducts.length}
              onReview={() => setMissingDataModalOpen(true)}
              onDismiss={() => setMissingBannerDismissed(true)}
            />
          )}

          {/* ── Catalogue processing section ── */}
          {cataloguePhase === "processing" && uploadedFiles.length > 0 && (
            <CatalogueProcessingSection
              files={uploadedFiles}
              onSimulateComplete={handleSimulateComplete}
            />
          )}

          {/* ── Search + Filter toolbar ── */}
          {hasAnyProducts && (
            <SearchFilterToolbar
              search={search} setSearch={setSearch}
              sort={sort} setSort={setSort}
              filters={filters} setFilter={setFilter}
            />
          )}

          {/* ── Product grid ── */}
          {!hasAnyProducts ? (
            <EmptyState icon={Package} title="No products added yet"
              subtitle="Upload your existing catalogue or add products individually to start receiving matched buyer demand." />
          ) : (
            <div className="flex flex-col gap-6">

              {/* Catalogue-generated products group */}
              {cataloguePhase === "complete" && filteredCatalogueProducts.length > 0 && (
                <div>
                  <GroupHeader
                    label="Catalogue Products"
                    badge="Generated from Catalogue"
                    badgeCls="bg-[#E6F3FB] text-[#0077CC]"
                  />
                  <CollapsibleCardGrid
                    items={filteredCatalogueProducts}
                    emptyText="No catalogue products match your filters."
                    renderItem={(p: CatalogueProduct) => (
                      <ProductCard
                        key={p.id}
                        p={p}
                        source="catalogue"
                        needsUpdate={p.needsUpdate}
                        onDelete={() => {
                          setCatalogueProducts((prev) => prev.filter((cp) => cp.id !== p.id));
                        }}
                      />
                    )}
                  />
                </div>
              )}

              {/* Manually added products group */}
              {filteredManualProducts.length > 0 && (
                <div>
                  {cataloguePhase === "complete" && catalogueProducts.length > 0 && (
                    <GroupHeader
                      label="Manually Added"
                      badge="Added Manually"
                      badgeCls="bg-[#F3F4F6] text-[#4B5563]"
                    />
                  )}
                  <CollapsibleCardGrid
                    items={filteredManualProducts}
                    emptyText="No manually added products match your filters."
                    renderItem={(p: Product) => (
                      <ProductCard
                        key={p.id}
                        p={p}
                        source="manual"
                        onDelete={() => deleteProduct(p.id)}
                      />
                    )}
                  />
                </div>
              )}

              {/* No results after filtering */}
              {filteredCatalogueProducts.length === 0 && filteredManualProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Search size={24} className="text-[#9CA3AF]" />
                  <p className="text-[13px] font-medium text-[#4B5563]">No products match your search</p>
                  <p className="text-[12px] text-[#9CA3AF]">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
