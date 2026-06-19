"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Plus, Package, Trash2, Upload, FileSpreadsheet, CheckCircle2, X, Download,
  AlertCircle, FileText, Image as ImageIcon, Search, ChevronDown, ChevronUp,
  Clock, SlidersHorizontal, Check, Info, Sparkles, Loader2,
  MoreVertical, Columns3, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Eye, Copy, Ban,
  Star, Megaphone, ChevronRight,
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
          <div className="lg:w-[56%] overflow-y-auto overflow-x-hidden flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[#F3F4F6]"
            style={{ background: "#F9FAFB", scrollbarWidth: "none" }}>
            <div className="p-6 flex flex-col gap-5">

              {/* ── 1. HOOK — Value proposition (most important, shown first) ── */}
              <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, #E8FBF2 0%, #f0fdf9 100%)", border: "1px solid #2ACB83/20" }}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#018e7e] mb-2">Why upload your catalogue?</p>
                <p className="text-[14px] font-semibold text-[#020202] leading-[20px] mb-3">
                  Manufacturers with a complete catalogue get <span style={{ color: "#018e7e" }}>3× more buyer enquiries</span> and surface on relevant RFQs automatically.
                </p>
                {/* Metric chips */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "+25%", sub: "Discovery Score" },
                    { label: "3×", sub: "Buyer Enquiries" },
                    { label: "Auto", sub: "RFQ Matching" },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center gap-1.5 bg-white border border-[#2ACB83]/30 rounded-lg px-2.5 py-1.5">
                      <span className="text-[13px] font-bold" style={{ color: "#018e7e" }}>{m.label}</span>
                      <span className="text-[10px] text-[#4B5563]">{m.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 2. HOW IT WORKS — compact 3-step horizontal flow ── */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">How it works</p>
                <div className="flex items-start gap-0">
                  {[
                    { n: "1", icon: "📁", title: "You Upload", sub: "Excel, PDF, Word, CSV — any format you have" },
                    { n: "2", icon: "⚡", title: "We Structure", sub: "Our team cleans & formats within 1–2 days" },
                    { n: "3", icon: "🔍", title: "Buyers Find You", sub: "Products go live on search & RFQ matching" },
                  ].map((s, i) => (
                    <div key={s.n} className="flex-1 flex flex-col items-center text-center relative">
                      {/* connector line */}
                      {i < 2 && (
                        <div className="absolute top-[16px] left-[calc(50%+16px)] right-[calc(-50%+16px)] h-px bg-[#E5E7EB] z-0" />
                      )}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] z-10 mb-2"
                        style={{ background: "#E8FBF2", border: "1.5px solid #2ACB83" }}>
                        {s.icon}
                      </div>
                      <p className="text-[11px] font-semibold text-[#020202]">{s.title}</p>
                      <p className="text-[10px] text-[#6B7280] leading-[14px] mt-0.5 px-1">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 3. VISUAL PROOF — what your product cards look like ── */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">Your products, structured & buyer-ready</p>
                {(() => {
                  const MINI = [
                    { name: "Naproxen Sodium", industry: "Pharmaceuticals", inv: false, cas: "26159-34-2", purity: "99.0%", moq: "50 kg"  },
                    { name: "Sodium Bromide",  industry: "Flavors & Frag.", inv: true,  cas: "7647-15-6",  purity: "99.5%", moq: "56 MT"  },
                    { name: "Ibuprofen API",   industry: "Pharmaceuticals", inv: true,  cas: "15687-27-1", purity: "99.5%", moq: "100 kg" },
                  ];
                  return (
                    <>
                      <div className="flex gap-2">
                        {MINI.map((c, i) => (
                          <div key={i} className="flex-1 rounded-xl border border-[#E4E4E7] bg-white overflow-hidden">
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
                            <div className="px-2.5 pb-2 border-t border-[#F3F4F6] pt-1.5 flex flex-col gap-[3px]">
                              {[["CAS", c.cas], ["Purity", c.purity], ["MOQ", c.moq]].map(([l, v]) => (
                                <div key={l} className="flex items-center justify-between gap-1">
                                  <span className="text-[8.5px] text-[#9CA3AF] flex-shrink-0">{l}</span>
                                  <span className="text-[8.5px] font-semibold text-[#020202] truncate text-right">{v}</span>
                                </div>
                              ))}
                            </div>
                            <div className="px-2.5 pb-2">
                              <span className="text-[7.5px] font-bold px-1.5 py-0.5 rounded-full bg-[#E6F3FB] text-[#0077CC] flex items-center gap-0.5 w-fit">
                                <Sparkles size={6} /> Catalogue
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-[#9CA3AF] leading-[16px] mt-2 italic">
                        Sample cards — yours will be structured from your uploaded files.
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* ── 4. OUTCOMES — what unlocks after upload ── */}
              <div className="rounded-xl border border-[#E4E4E7] bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">What you unlock</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: "🎯", title: "Matched to RFQs", body: "Auto-matched to live buyer requests by product & chemistry" },
                    { icon: "📈", title: "Higher Discovery", body: "+25% score boost — appear higher in buyer searches" },
                    { icon: "👁️", title: "Buyer Visibility", body: "Verified buyers browse your structured product listings" },
                    { icon: "💼", title: "More Projects", body: "Surface on exclusive CDMO & CMO project opportunities" },
                  ].map((o) => (
                    <div key={o.title} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: "#F9FAFB" }}>
                      <span className="text-[14px] flex-shrink-0">{o.icon}</span>
                      <div>
                        <p className="text-[11px] font-semibold text-[#020202]">{o.title}</p>
                        <p className="text-[10px] text-[#6B7280] leading-[14px] mt-0.5">{o.body}</p>
                      </div>
                    </div>
                  ))}
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

type MissingForm = {
  industry: string;
  grade: string;
  purity: string;
  moq: string;
  moqUnit: string;
  inventoryStatus: string;
  availableQty: string;
  availableUnit: string;
  availableLocation: string;
  crackedChemistry: boolean;
  workedOnProduct: boolean;
};

const MISSING_FORM_DEFAULT: MissingForm = {
  industry: "",
  grade: "", purity: "", moq: "", moqUnit: "kg",
  inventoryStatus: "Made to order",
  availableQty: "", availableUnit: "kg", availableLocation: "",
  crackedChemistry: false, workedOnProduct: false,
};

function countMissingFields(p: CatalogueProduct): number {
  const mf = MISSING_FIELDS_MAP[p.id];
  if (mf) return mf.length;
  // Fallback: count blank key fields
  return [p.grade, p.purity, p.moq].filter((v) => !v).length;
}

function MissingDataModal({
  open, onClose, products,
}: {
  open: boolean;
  onClose: () => void;
  products: CatalogueProduct[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Per-product forms — initialised from the product's existing data on first touch
  const [forms, setForms] = useState<Record<string, MissingForm>>({});
  const [saved, setSaved] = useState<Set<string>>(new Set());

  // Auto-select first product when the modal opens
  React.useEffect(() => {
    if (open && products.length > 0) {
      const firstId = products[0].id;
      setSelectedId(firstId);
      // Seed form data from existing product data so pre-filled values appear
      setForms((prev) => {
        if (prev[firstId]) return prev;
        const p = products[0];
        return {
          ...prev,
          [firstId]: {
            industry:         p.industry         ?? "",
            grade:            p.grade            ?? "",
            purity:           p.purity           ?? "",
            moq:              p.moq              ?? "",
            moqUnit:          p.moqUnit          ?? "kg",
            inventoryStatus:  p.inventoryStatus  ?? "Made to order",
            availableQty:     p.availableQty     ?? "",
            availableUnit:    p.availableUnit    ?? "kg",
            availableLocation: p.availableLocation ?? "",
            crackedChemistry: p.crackedChemistry ?? false,
            workedOnProduct:  p.workedOnProduct  ?? false,
          },
        };
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectProduct = (p: CatalogueProduct) => {
    setSelectedId(p.id);
    // Seed form from product data if not yet touched
    setForms((prev) => {
      if (prev[p.id]) return prev;
      return {
        ...prev,
        [p.id]: {
          industry:         p.industry         ?? "",
          grade:            p.grade            ?? "",
          purity:           p.purity           ?? "",
          moq:              p.moq              ?? "",
          moqUnit:          p.moqUnit          ?? "kg",
          inventoryStatus:  p.inventoryStatus  ?? "Made to order",
          availableQty:     p.availableQty     ?? "",
          availableUnit:    p.availableUnit    ?? "kg",
          availableLocation: p.availableLocation ?? "",
          crackedChemistry: p.crackedChemistry ?? false,
          workedOnProduct:  p.workedOnProduct  ?? false,
        },
      };
    });
  };

  const selected = products.find((p) => p.id === selectedId);
  const form: MissingForm = (selectedId && forms[selectedId]) ? forms[selectedId] : MISSING_FORM_DEFAULT;

  const setField = <K extends keyof MissingForm>(k: K, v: MissingForm[K]) => {
    if (!selectedId) return;
    setForms((prev) => ({ ...prev, [selectedId]: { ...form, [k]: v } }));
  };

  const handleSave = () => {
    if (!selectedId) return;
    setSaved((s) => new Set([...s, selectedId]));
    // Auto-advance to the next unsaved product
    const remaining = products.filter((p) => !saved.has(p.id) && p.id !== selectedId);
    if (remaining.length > 0) selectProduct(remaining[0]);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/30 z-40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full bg-white z-50 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "w-full md:max-w-[840px]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E4E7] flex-shrink-0 bg-white">
          <div>
            <h3 className="text-[15px] font-semibold text-[#020202]">Products Requiring Updates</h3>
            <p className="text-[12px] text-[#6B7280] mt-0.5">
              {products.length} product{products.length !== 1 ? "s" : ""} with missing information that may affect RFQ matching
            </p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Body (two panels side-by-side) ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* LEFT — scrollable product list */}
          <div className="w-[260px] flex-shrink-0 border-r border-[#E4E4E7] overflow-y-auto"
            style={{ background: "#F9FAFB" }}>
            <div className="p-3 flex flex-col gap-1.5">
              {products.map((p) => {
                const isSaved = saved.has(p.id);
                const missing = countMissingFields(p);
                return (
                  <button key={p.id}
                    onClick={() => selectProduct(p)}
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
                        ? <span className="w-5 h-5 rounded-full bg-[#2ACB83] flex items-center justify-center flex-shrink-0">
                            <Check size={10} strokeWidth={3} className="text-white" />
                          </span>
                        : missing > 0
                          ? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FEF0EB] text-[#FD4923] flex-shrink-0 whitespace-nowrap">
                              {missing} missing
                            </span>
                          : null
                      }
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT — form fields (same UI as AddProductDrawer) */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {selected ? (
              <>
                {/* Scrollable form area */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

                  {/* Product heading */}
                  <div className="pb-3 border-b border-[#F3F4F6]">
                    <p className="text-[15px] font-semibold text-[#020202]">{selected.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {selected.casNo && <p className="text-[12px] text-[#9CA3AF] font-mono">{selected.casNo}</p>}
                      {form.industry && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E8FBF2] text-[#018e7e]">
                          {form.industry}
                        </span>
                      )}
                    </div>
                    {saved.has(selected.id) && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <CheckCircle2 size={13} className="text-[#018e7e]" />
                        <span className="text-[12px] text-[#018e7e] font-medium">Information saved</span>
                      </div>
                    )}
                  </div>

                  {/* Industry */}
                  <FormField label="Industry">
                    <DropdownSelect value={form.industry} onChange={(v) => setField("industry", v)}
                      options={INDUSTRIES} placeholder="Select industry" />
                  </FormField>

                  {/* Grade + Purity */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Grade">
                      <DropdownSelect value={form.grade} onChange={(v) => setField("grade", v)}
                        options={PRODUCT_GRADES} placeholder="Select grade" />
                    </FormField>
                    <FormField label="Purity (%)">
                      <input className={inputCls} type="number" min="0" max="100" step="0.01"
                        value={form.purity} onChange={(e) => setField("purity", e.target.value)}
                        placeholder="e.g. 99.5" />
                    </FormField>
                  </div>

                  {/* MOQ */}
                  <FormField label="MOQ (Minimum Order Quantity)">
                    <div className="flex gap-2">
                      <input className={inputCls + " flex-1 min-w-0"} value={form.moq}
                        onChange={(e) => setField("moq", e.target.value)} placeholder="e.g. 100" />
                      <DropdownSelect value={form.moqUnit} onChange={(v) => setField("moqUnit", v)}
                        options={MOQ_UNITS} className="w-[90px] flex-shrink-0" />
                    </div>
                  </FormField>

                  {/* Commercial & Readiness Status */}
                  <FormField label="Commercial & Readiness Status">
                    <DropdownSelect value={form.inventoryStatus}
                      onChange={(v) => setField("inventoryStatus", v)}
                      options={["In inventory", "Made to order"]} />
                  </FormField>

                  {/* In-inventory conditional fields */}
                  {form.inventoryStatus === "In inventory" && (
                    <div className="animate-in fade-in-0 duration-200 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="Available Quantity">
                          <input className={inputCls} type="number" min="0"
                            value={form.availableQty}
                            onChange={(e) => setField("availableQty", e.target.value)}
                            placeholder="e.g. 500" />
                        </FormField>
                        <FormField label="Unit">
                          <DropdownSelect value={form.availableUnit}
                            onChange={(v) => setField("availableUnit", v)}
                            options={INVENTORY_UNITS} />
                        </FormField>
                      </div>
                      <FormField label="Available at Location">
                        <input className={inputCls} value={form.availableLocation}
                          onChange={(e) => setField("availableLocation", e.target.value)}
                          placeholder="e.g. Ankleshwar, Gujarat" />
                      </FormField>
                    </div>
                  )}

                  {/* Checkboxes */}
                  <div className="flex flex-col gap-2 pt-1">
                    {([
                      { key: "crackedChemistry" as const, label: "Cracked Chemistry",     desc: "You have successfully developed the synthesis route" },
                      { key: "workedOnProduct"  as const, label: "Worked on this Product", desc: "You have prior experience manufacturing this compound" },
                    ] as const).map(({ key, label, desc }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form[key]}
                          onChange={(e) => setField(key, e.target.checked)}
                          className="w-4 h-4 rounded accent-[#1F6F54]" />
                        <div>
                          <p className="text-sm font-medium text-[#020202]">{label}</p>
                          <p className="text-xs text-[#9ca3af]">{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                </div>

                {/* Footer — pinned to bottom of right panel */}
                <div className="flex-shrink-0 border-t border-[#E4E4E7] px-6 py-4 flex justify-end gap-2">
                  <button onClick={onClose}
                    className="px-4 py-[7px] rounded-lg border border-[#B3B7BD] text-[13px] font-medium text-[#4B5563] hover:bg-[#F9FAFB] transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave}
                    className="px-5 py-[7px] rounded-lg bg-[#2ACB83] text-[#020202] text-[13px] font-semibold hover:brightness-105 transition-all">
                    Update Product Information
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[13px] text-[#9CA3AF]">Select a product to fill in missing information</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
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

export function ProfileAddProductDrawer({ open, onClose, onSave }: {
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

// ─── Column definitions ────────────────────────────────────────────────────────

type ColKey = "name" | "cas" | "industry" | "grade" | "purity" | "moq" | "status" | "source" | "chemistry" | "readiness" | "lastAction";

interface ColDef { key: ColKey; label: string; width: number; }

const ALL_COLS: ColDef[] = [
  { key: "name",       label: "Product Name",          width: 160 },
  { key: "cas",        label: "CAS Number",            width: 130 },
  { key: "industry",   label: "Industry",              width: 160 },
  { key: "grade",      label: "Grade",                 width: 120 },
  { key: "purity",     label: "Purity",                width: 90  },
  { key: "moq",        label: "MOQ",                   width: 110 },
  { key: "status",     label: "Status / Availability", width: 190 },
  { key: "source",     label: "Source",                width: 130 },
  { key: "chemistry",  label: "Chemistry",             width: 140 },
  { key: "readiness",  label: "Readiness",             width: 110 },
  { key: "lastAction", label: "Last Action",           width: 140 },
];

// ─── Columns popover ───────────────────────────────────────────────────────────

function ColumnsPopover({ visible, onChange, onClose, anchorRef }: {
  visible: Set<ColKey>;
  onChange: (k: ColKey, on: boolean) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  if (!pos || typeof document === "undefined") return null;

  return createPortal(
    <div ref={ref}
      style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999, minWidth: 220 }}
      className="bg-white rounded-xl border border-[#E4E4E7] shadow-2xl overflow-hidden">
      <div className="px-3 py-2.5 border-b border-[#F3F4F6] flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Toggle Columns</p>
        <button onClick={() => {
          ALL_COLS.forEach(c => onChange(c.key, true));
        }} className="text-[10.5px] text-[#018e7e] font-semibold hover:underline">Select all</button>
      </div>
      <div className="py-1 max-h-[280px] overflow-y-auto">
        {ALL_COLS.map(col => {
          const on = visible.has(col.key);
          return (
            <label key={col.key}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors">
              <div
                onClick={() => onChange(col.key, !on)}
                className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  on ? "bg-[#018e7e] border-[#018e7e]" : "bg-white border-slate-300"
                )}>
                {on && <Check size={9} className="text-white" strokeWidth={3} />}
              </div>
              <span className="text-[12.5px] text-slate-700">{col.label}</span>
            </label>
          );
        })}
      </div>
    </div>,
    document.body
  );
}

// ─── Row 3-dot menu ────────────────────────────────────────────────────────────

function RowMenu({ onEdit, onDelete, onDuplicate, onDeactivate, onClose, anchorRef }: {
  onEdit: () => void; onDelete: () => void;
  onDuplicate: () => void; onDeactivate: () => void; onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      // Position to the left of the anchor button, aligned to its top
      setPos({ top: r.top, right: window.innerWidth - r.left + 4 });
    }
    const handler = (e: MouseEvent) => {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  if (!pos || typeof document === "undefined") return null;

  const items = [
    { icon: Pencil, label: "Edit",       action: onEdit,       cls: "text-slate-700" },
    { icon: Copy,   label: "Duplicate",  action: onDuplicate,  cls: "text-slate-700" },
    { icon: Ban,    label: "Deactivate", action: onDeactivate, cls: "text-amber-600" },
    { icon: Trash2, label: "Delete",     action: onDelete,     cls: "text-red-500"   },
  ];

  return createPortal(
    <div ref={ref}
      style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 99999, minWidth: 168 }}
      className="bg-white rounded-xl border border-[#E4E4E7] shadow-2xl overflow-hidden py-1">
      {items.map(({ icon: Icon, label, action, cls }) => (
        <button key={label} onClick={() => { action(); onClose(); }}
          className={cn("w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12.5px] font-medium hover:bg-slate-50 transition-colors text-left", cls)}>
          <Icon size={13} /> {label}
        </button>
      ))}
    </div>,
    document.body
  );
}

// ─── Demand Catalyst Banner ────────────────────────────────────────────────────

function DemandCatalystBanner({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#1F6F54" }}>
      <div className="flex items-center justify-between px-4 py-2.5 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/15 bg-white/10">
            <Megaphone size={13} className="text-[#2ACB83]" />
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="text-[12.5px] font-bold text-white whitespace-nowrap">Demand Catalyst</span>
            <span className="text-white/35 hidden sm:inline">·</span>
            <span className="text-[12px] text-white/70 hidden sm:inline leading-tight">
              Grow your business — get qualified leads on your star products delivered by SCINODE&apos;s team.
            </span>
          </div>
        </div>
        <button onClick={onSelect}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#1F6F54] text-[11.5px] font-bold flex-shrink-0 hover:bg-white/90 transition-all whitespace-nowrap">
          <Star size={11} fill="currentColor" />
          Select Star Products
        </button>
      </div>
    </div>
  );
}

// ─── DC Scene Switcher (demo control) ─────────────────────────────────────────

type DcScene = "banner" | "sel-0" | "sel-1-only" | "sel-3" | "sel-5" | "confirm";

const DC_SCENES: { key: DcScene; label: string }[] = [
  { key: "banner",    label: "Banner" },
  { key: "sel-0",     label: "Selecting 0/5" },
  { key: "sel-1-only", label: "1 product only" },
  { key: "sel-3",     label: "3/5 selected" },
  { key: "sel-5",     label: "5/5 ready" },
  { key: "confirm",   label: "Confirm popup" },
];

function DcSceneSwitcher({ scene, onChange }: { scene: DcScene; onChange: (s: DcScene) => void }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap px-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF] whitespace-nowrap">DC Demo:</span>
      {DC_SCENES.map(s => (
        <button key={s.key} onClick={() => onChange(s.key)}
          className={cn(
            "px-2 py-0.5 rounded text-[10.5px] font-medium transition-colors whitespace-nowrap",
            scene === s.key
              ? "bg-[#020202] text-white"
              : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
          )}>
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ─── Star Tracker (replaces banner in selection mode) ─────────────────────────

function StarTracker({
  count, totalProducts, onCancel, onConfirm, onSelectAll,
}: {
  count: number; totalProducts: number;
  onCancel: () => void; onConfirm: () => void; onSelectAll: () => void;
}) {
  const MAX = 5;
  const remaining = MAX - count;
  const isMax = count >= MAX;

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#1F6F54" }}>
      <div className="px-4 py-2.5 flex items-center gap-3 flex-wrap">
        {/* Slot dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX }).map((_, i) => (
            <div key={i} className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
              i < count ? "bg-[#2ACB83]" : "bg-white/15 border border-white/25"
            )}>
              {i < count && <Star size={9} fill="white" className="text-white" />}
            </div>
          ))}
        </div>
        {/* Status text */}
        <div className="flex-1 min-w-0">
          <span className="text-[13px] font-bold text-white">{count} / {MAX} </span>
          <span className="text-[12px] text-white/70">
            {isMax
              ? "Maximum reached — ready to activate"
              : count === 0
                ? "star products — tap ☆ on a product to nominate it"
                : `selected · ${remaining} slot${remaining !== 1 ? "s" : ""} remaining`}
          </span>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          {!isMax && totalProducts > 0 && (
            <button onClick={onSelectAll}
              className="text-[11px] font-medium text-white/60 hover:text-white/90 underline underline-offset-2 transition-colors whitespace-nowrap">
              Select all ({Math.min(totalProducts, MAX)})
            </button>
          )}
          <button onClick={onCancel}
            className="px-2.5 py-1.5 rounded-lg border border-white/25 text-[11.5px] font-medium text-white/80 hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={count === 0}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-bold whitespace-nowrap transition-all",
              count > 0
                ? "bg-white text-[#1F6F54] hover:bg-white/90"
                : "bg-white/15 text-white/35 cursor-not-allowed"
            )}>
            {isMax ? "Review & Activate" : count > 0 ? `Confirm ${count} Star${count !== 1 ? "s" : ""}` : "Select First"}
            {count > 0 && <ChevronRight size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Low Catalogue Nudge ──────────────────────────────────────────────────────

function LowCatalogueNudge({
  totalProducts, selectedCount, onAddProducts, onContinue,
}: {
  totalProducts: number; selectedCount: number;
  onAddProducts: () => void; onContinue: () => void;
}) {
  const MAX = 5;
  const emptySlots = MAX - Math.min(totalProducts, MAX);
  const remainingSlots = MAX - selectedCount;

  return (
    <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-[#0077CC]/25" style={{ background: "#EFF6FF" }}>
      <Info size={15} className="text-[#0077CC] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#0077CC]">
          {totalProducts === 1
            ? "Your catalogue has 1 product"
            : `Your catalogue has ${totalProducts} product${totalProducts !== 1 ? "s" : ""} — ${emptySlots} slot${emptySlots !== 1 ? "s" : ""} will be empty`}
        </p>
        <p className="text-[12px] text-[#374151] mt-0.5 leading-relaxed">
          {totalProducts === 1
            ? `Select it as your star product now — you can fill the remaining ${remainingSlots} slot${remainingSlots !== 1 ? "s" : ""} after adding more products to your catalogue.`
            : `Add more products to your catalogue to fill all ${MAX} Demand Catalyst slots. You can always update your star selection later.`}
        </p>
        <div className="flex items-center gap-3 mt-2.5">
          <button onClick={onAddProducts}
            className="flex items-center gap-1 text-[12px] font-semibold text-[#0077CC] hover:underline transition-colors">
            <Plus size={12} /> Add more products
          </button>
          {selectedCount > 0 && (
            <>
              <span className="text-[#CBD5E1]">|</span>
              <button onClick={onContinue}
                className="text-[12px] font-medium text-[#4B5563] hover:text-[#020202] transition-colors">
                Continue with {selectedCount} star{selectedCount !== 1 ? "s" : ""} →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DC Confirm Popup ─────────────────────────────────────────────────────────

function DcConfirmPopup({
  starIds, allProducts, onBack, onActivate,
}: {
  starIds: Set<string>;
  allProducts: (Product | CatalogueProduct)[];
  onBack: () => void;
  onActivate: () => void;
}) {
  const MAX = 5;
  const selectedProducts = allProducts.filter(p => starIds.has(p.id));
  const count = selectedProducts.length;
  const remaining = MAX - count;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onBack}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-[680px] rounded-2xl overflow-hidden shadow-2xl pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-200"
          style={{ background: "linear-gradient(160deg, #f0fdf9 0%, #e4f5ed 100%)" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start gap-3 px-6 py-5 border-b border-[#2ACB83]/20">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1F6F54, #2ACB83)" }}>
              <Star size={19} fill="white" className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-[#020202]">
                {count} Star Product{count !== 1 ? "s" : ""} Selected
              </p>
              <p className="text-[12.5px] text-[#6B7280] mt-0.5">
                {remaining === 0
                  ? "All 5 slots filled — your Demand Catalyst campaign is ready to launch."
                  : `${remaining} slot${remaining !== 1 ? "s" : ""} remaining — you can add more star products after activating.`}
              </p>
            </div>
            <button onClick={onBack}
              className="p-1.5 text-[#9CA3AF] hover:text-[#374151] hover:bg-black/5 rounded-lg transition-colors flex-shrink-0">
              <X size={16} />
            </button>
          </div>

          {/* Product rows */}
          <div className="px-6 py-4 flex flex-col gap-2">
            <div className="grid grid-cols-[24px_1fr_140px_140px] gap-x-4 px-3 pb-1.5 border-b border-[#D1FAE5]">
              <span />
              <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF]">Product Name</span>
              <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF]">CAS Number</span>
              <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF]">Industry</span>
            </div>

            {/* Filled rows */}
            {selectedProducts.map((p, i) => (
              <div key={p.id}
                className="grid grid-cols-[24px_1fr_140px_140px] gap-x-4 items-center px-3 py-2.5 rounded-xl bg-white border border-[#2ACB83]/25 shadow-sm">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #1F6F54, #2ACB83)" }}>
                  <Star size={11} fill="white" className="text-white" />
                </div>
                <p className="text-[13px] font-semibold text-[#020202] truncate">{p.name}</p>
                <p className="text-[12px] text-[#6B7280] font-mono truncate">{p.casNo || "—"}</p>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E8FBF2] text-[#018e7e] truncate w-fit">
                  {p.industry || "—"}
                </span>
              </div>
            ))}

            {/* Empty slot rows */}
            {Array.from({ length: remaining }).map((_, i) => (
              <div key={`empty-${i}`}
                className="grid grid-cols-[24px_1fr_140px_140px] gap-x-4 items-center px-3 py-2.5 rounded-xl border border-dashed border-[#CBD5E1] bg-white/50">
                <div className="w-6 h-6 rounded-full border-2 border-dashed border-[#CBD5E1] flex items-center justify-center flex-shrink-0">
                  <Star size={10} className="text-[#CBD5E1]" />
                </div>
                <p className="text-[12.5px] text-[#9CA3AF] italic">Empty slot {selectedProducts.length + i + 1}</p>
                <p className="text-[12px] text-[#CBD5E1]">—</p>
                <p className="text-[12px] text-[#CBD5E1]">—</p>
              </div>
            ))}

            {remaining > 0 && (
              <p className="text-[12px] text-[#6B7280] leading-relaxed bg-white/70 rounded-lg px-3 py-2.5 border border-[#E5E7EB] mt-1">
                💡 You can fill the remaining {remaining} slot{remaining !== 1 ? "s" : ""} by adding more products and updating your star selection from Demand Catalyst.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#2ACB83]/20 flex items-center justify-between gap-3">
            <button onClick={onBack}
              className="text-[13px] font-medium text-[#6B7280] hover:text-[#020202] transition-colors">
              ← Back to selection
            </button>
            <button onClick={onActivate}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-[13px] font-bold hover:brightness-110 transition-all shadow-lg"
              style={{ background: "linear-gradient(135deg, #1F6F54, #2ACB83)" }}>
              <Megaphone size={14} />
              Activate Demand Catalyst
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Product Table ─────────────────────────────────────────────────────────────

const MIN_ROWS = 5;

export function ProductTable({
  products, onDelete, onAddClick, starMode, starIds, onStarToggle,
}: {
  products: (Product | CatalogueProduct)[];
  onDelete: (id: string) => void;
  onAddClick: () => void;
  starMode?: boolean;
  starIds?: Set<string>;
  onStarToggle?: (id: string) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Number of empty placeholder rows: at least 1, or enough to reach MIN_ROWS
  const emptyCount = Math.max(1, MIN_ROWS - products.length);
  // All columns visible by default — table scrolls horizontally
  const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(new Set(ALL_COLS.map(c => c.key)));
  const [showColPopover, setShowColPopover] = useState(false);
  const colBtnRef = useRef<HTMLButtonElement>(null);
  const [sortCol, setSortCol] = useState<ColKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const toggleCol = (k: ColKey, on: boolean) =>
    setVisibleCols(prev => { const s = new Set(prev); on ? s.add(k) : s.delete(k); return s; });

  const toggleAll = () => {
    if (selectedIds.size === products.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(products.map(p => p.id)));
  };

  const toggleRow = (id: string) =>
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const handleSort = (k: ColKey) => {
    if (sortCol === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(k); setSortDir("asc"); }
  };

  const getCell = (p: Product | CatalogueProduct, k: ColKey): string => {
    switch (k) {
      case "name":       return p.name;
      case "cas":        return p.casNo;
      case "industry":   return p.industry;
      case "grade":      return p.grade;
      case "purity":     return p.purity ? `${p.purity}%` : "";
      case "moq":        return p.moq ? `${p.moq} ${p.moqUnit}` : "";
      case "status":     return p.inventoryStatus;
      case "readiness":  return isProductComplete(p) ? "Complete" : "Incomplete";
      case "source":     return "source" in p && (p as CatalogueProduct).source === "catalogue" ? "Catalogue" : "Manual";
      case "chemistry":  return p.crackedChemistry ? "⚡ Cracked" : p.workedOnProduct ? "✓ Experience" : "";
      case "lastAction": return "Added manually";
      default:           return "";
    }
  };

  const shownCols = ALL_COLS.filter(c => visibleCols.has(c.key));

  const sorted = [...products].sort((a, b) => {
    if (!sortCol) return 0;
    const va = getCell(a, sortCol).toLowerCase();
    const vb = getCell(b, sortCol).toLowerCase();
    return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const SortIcon = ({ col }: { col: ColKey }) => {
    if (sortCol !== col) return <ArrowUpDown size={10} className="opacity-30 group-hover:opacity-60" />;
    return sortDir === "asc" ? <ArrowUp size={10} className="text-[#018e7e]" /> : <ArrowDown size={10} className="text-[#018e7e]" />;
  };

  return (
    <div className="flex flex-col">
      {/* Toolbar: selection info + Columns button */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#F3F4F6] bg-[#FAFAFA]">
        <div className="flex items-center gap-2">
          {starMode ? (
            <div className="flex items-center gap-1.5">
              <Star size={12} fill="#F59E0B" className="text-[#F59E0B]" />
              <span className="text-[12px] font-semibold text-[#92400E]">
                {(starIds?.size ?? 0)} / 5 star products nominated
              </span>
            </div>
          ) : selectedIds.size > 0 ? (
            <>
              <span className="text-[12px] font-semibold text-[#018e7e]">{selectedIds.size} selected</span>
              <button onClick={() => { selectedIds.forEach(id => onDelete(id)); setSelectedIds(new Set()); }}
                className="flex items-center gap-1 text-[11.5px] text-red-500 hover:text-red-700 font-medium transition-colors">
                <Trash2 size={11} /> Delete
              </button>
            </>
          ) : (
            <p className="text-[12px] text-slate-400">{products.length} product{products.length !== 1 ? "s" : ""}</p>
          )}
        </div>
        <div className="relative">
          <button
            ref={colBtnRef}
            onClick={() => setShowColPopover(v => !v)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium border transition-colors",
              showColPopover ? "bg-[#E8FBF2] border-[#2ACB83]/40 text-[#018e7e]" : "border-[#E4E4E7] text-slate-600 hover:bg-slate-50"
            )}>
            <Columns3 size={13} /> Columns
          </button>
          {showColPopover && (
            <ColumnsPopover
              visible={visibleCols}
              onChange={toggleCol}
              onClose={() => setShowColPopover(false)}
              anchorRef={colBtnRef}
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" style={{ minWidth: Math.min(shownCols.reduce((a, c) => a + c.width, 0) + 88, 9999) }}>
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E4E4E7]">
              {/* Sticky left: master checkbox OR star mode header */}
              <th className="sticky left-0 z-20 bg-[#F9FAFB] w-10 px-3 py-2.5 border-r border-[#E4E4E7]">
                {starMode ? (
                  <Star size={13} fill="#F59E0B" className="text-[#F59E0B]" />
                ) : (
                  <div
                    onClick={toggleAll}
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors",
                      selectedIds.size === products.length && products.length > 0
                        ? "bg-[#018e7e] border-[#018e7e]"
                        : "bg-white border-slate-300 hover:border-[#018e7e]"
                    )}>
                    {selectedIds.size === products.length && products.length > 0 && (
                      <Check size={9} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                )}
              </th>

              {/* Columns — name is sticky left-10, rest scroll */}
              {shownCols.map(col => (
                <th key={col.key}
                  style={{ width: col.width, minWidth: col.width, ...(col.key === "name" ? { left: 40 } : {}) }}
                  className={cn(
                    "px-3 py-2.5 border-r border-[#F3F4F6]",
                    col.key === "name"
                      ? "sticky z-20 bg-[#F9FAFB] shadow-[3px_0_6px_-1px_rgba(0,0,0,0.1)] border-r border-[#E4E4E7]"
                      : "last:border-r-0"
                  )}>
                  <button
                    onClick={() => handleSort(col.key)}
                    className="group flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-500 hover:text-slate-800 transition-colors whitespace-nowrap w-full">
                    {col.label}
                    <SortIcon col={col.key} />
                  </button>
                </th>
              ))}

              {/* Sticky right: 3-dot header */}
              <th className="sticky right-0 z-20 bg-[#F9FAFB] w-9 p-0 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.08)] border-l border-[#E4E4E7]" />
            </tr>
          </thead>

          <tbody>
            {sorted.map((p, idx) => {
              const isSel    = selectedIds.has(p.id);
              const isStarred = starMode && (starIds?.has(p.id) ?? false);
              const catP     = p as CatalogueProduct;
              const isInInv  = p.inventoryStatus === "In inventory";
              const rowBgBase = isStarred ? "bg-[#FFFBEB]" : isSel ? "bg-[#F0FDF9]" : idx % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]";

              return (
                <tr key={p.id}
                  className={cn(
                    "border-b border-[#F3F4F6] last:border-0 transition-colors group/row",
                    rowBgBase,
                    starMode ? "hover:bg-[#FFFBEB]" : "hover:bg-[#F0FDF9]"
                  )}>

                  {/* Sticky left: star toggle OR row checkbox */}
                  <td className={cn("sticky left-0 z-10 w-10 px-3 py-2 border-r border-[#F3F4F6]",
                    rowBgBase,
                    starMode ? "group-hover/row:bg-[#FFFBEB]" : "group-hover/row:bg-[#F0FDF9]"
                  )}>
                    {starMode ? (
                      <button
                        onClick={() => onStarToggle?.(p.id)}
                        disabled={(starIds?.size ?? 0) >= 5 && !isStarred}
                        className="transition-transform hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={isStarred ? "Remove star" : (starIds?.size ?? 0) >= 5 ? "Maximum 5 stars reached" : "Nominate as star product"}
                      >
                        <Star
                          size={16}
                          fill={isStarred ? "#F59E0B" : "none"}
                          className={isStarred ? "text-[#F59E0B]" : "text-slate-300 hover:text-[#F59E0B]"}
                        />
                      </button>
                    ) : (
                      <div
                        onClick={() => toggleRow(p.id)}
                        className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors",
                          isSel ? "bg-[#018e7e] border-[#018e7e]" : "bg-white border-slate-300 hover:border-[#018e7e]"
                        )}>
                        {isSel && <Check size={9} className="text-white" strokeWidth={3} />}
                      </div>
                    )}
                  </td>

                  {/* Cells — name sticky, rest scroll */}
                  {shownCols.map(col => {
                    const val = getCell(p, col.key);
                    const hoverBg = starMode ? "group-hover/row:bg-[#FFFBEB]" : "group-hover/row:bg-[#F0FDF9]";
                    return (
                      <td key={col.key}
                        style={{ width: col.width, minWidth: col.width, ...(col.key === "name" ? { left: 40 } : {}) }}
                        className={cn(
                          "px-3 py-2 border-r border-[#F3F4F6] align-middle",
                          col.key === "name"
                            ? cn("sticky z-10 shadow-[3px_0_6px_-1px_rgba(0,0,0,0.09)] border-r border-[#E4E4E7]", rowBgBase, hoverBg)
                            : "last:border-r-0"
                        )}>
                        {col.key === "name" ? (
                          <div className="w-full">
                            <p className="text-[12.5px] font-semibold text-slate-900 leading-snug truncate w-full">{p.name}</p>
                            {catP.needsUpdate && (
                              <span className="text-[9.5px] font-bold text-[#FD4923] bg-[#FEF0EB] px-1.5 py-0.5 rounded-full inline-block mt-0.5">⚠ Action needed</span>
                            )}
                          </div>
                        ) : col.key === "status" ? (
                          <div className="flex flex-col gap-0.5">
                            <span className={cn(
                              "text-[10.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap w-fit",
                              isInInv ? "bg-[#B2F3B7] text-[#0F7614]" : "bg-[#F3F4F6] text-[#4B5563]"
                            )}>
                              {isInInv ? "In Inventory" : "Made to Order"}
                            </span>
                            {isInInv && (p.availableQty || p.availableLocation) && (
                              <p className="text-[10.5px] text-slate-500 leading-tight">
                                {p.availableQty ? `${p.availableQty} ${p.availableUnit}` : ""}
                                {p.availableQty && p.availableLocation ? " · " : ""}
                                {p.availableLocation || ""}
                              </p>
                            )}
                          </div>
                        ) : col.key === "source" ? (
                          <span className={cn(
                            "text-[10.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
                            "source" in p && (p as CatalogueProduct).source === "catalogue" ? "bg-[#E6F3FB] text-[#0077CC]" : "bg-[#F3F4F6] text-[#4B5563]"
                          )}>
                            {"source" in p && (p as CatalogueProduct).source === "catalogue" ? "Catalogue" : "Manual"}
                          </span>
                        ) : col.key === "chemistry" ? (
                          val ? (
                            <span className={cn(
                              "text-[10.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
                              p.crackedChemistry ? "bg-[#EDE9FE] text-[#6D28D9]" : "bg-[#FEF3C7] text-[#92400E]"
                            )}>
                              {val}
                            </span>
                          ) : <span className="text-slate-300 text-[11px]">—</span>
                        ) : col.key === "readiness" ? (
                          <span className={cn(
                            "text-[10.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
                            isProductComplete(p) ? "bg-[#E8FBF2] text-[#018e7e]" : "bg-[#FEF0EB] text-[#C30E1A]"
                          )}>
                            {isProductComplete(p) ? "✓ Complete" : "Incomplete"}
                          </span>
                        ) : col.key === "lastAction" ? (
                          <span className="text-[11px] text-slate-400 whitespace-nowrap">{val || "Added manually"}</span>
                        ) : val ? (
                          <span className="text-[12px] text-slate-700 whitespace-nowrap">{val}</span>
                        ) : (
                          <span className="text-slate-300 text-[11px]">—</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Sticky right: 3-dot menu — flush to edge, no padding */}
                  <td className={cn(
                    "sticky right-0 z-10 w-9 p-0 relative border-l border-[#E4E4E7]",
                    "shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.08)]",
                    rowBgBase,
                    starMode ? "group-hover/row:bg-[#FFFBEB]" : "group-hover/row:bg-[#F0FDF9]"
                  )}>
                    <button
                      ref={el => { menuBtnRefs.current[p.id] = el; }}
                      onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                      className="w-9 h-full min-h-[40px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                      <MoreVertical size={14} />
                    </button>
                    {openMenuId === p.id && (
                      <RowMenu
                        anchorRef={{ current: menuBtnRefs.current[p.id] }}
                        onEdit={() => {}}
                        onDelete={() => { onDelete(p.id); setOpenMenuId(null); }}
                        onDuplicate={() => setOpenMenuId(null)}
                        onDeactivate={() => setOpenMenuId(null)}
                        onClose={() => setOpenMenuId(null)}
                      />
                    )}
                  </td>
                </tr>
              );
            })}

            {/* ── Empty placeholder rows ── */}
            {Array.from({ length: emptyCount }).map((_, i) => (
              <tr
                key={`empty-${i}`}
                onClick={onAddClick}
                className="border-b border-[#F3F4F6] last:border-0 cursor-pointer group/empty hover:bg-[#f0fdf9] transition-colors"
              >
                {/* Left checkbox (empty) */}
                <td className="sticky left-0 z-10 w-10 px-3 py-2.5 border-r border-[#F3F4F6] bg-white group-hover/empty:bg-[#f0fdf9]">
                  <div className="w-4 h-4 rounded border-2 border-dashed border-slate-200" />
                </td>

                {/* Name cell — shows "Add product…" hint on first empty row */}
                {shownCols.map(col => (
                  <td
                    key={col.key}
                    style={{ width: col.width, minWidth: col.width, ...(col.key === "name" ? { left: 40 } : {}) }}
                    className={cn(
                      "px-3 py-2.5 border-r border-[#F3F4F6]",
                      col.key === "name"
                        ? "sticky z-10 bg-white group-hover/empty:bg-[#f0fdf9] shadow-[3px_0_6px_-1px_rgba(0,0,0,0.09)] border-r border-[#E4E4E7]"
                        : "last:border-r-0"
                    )}
                  >
                    {col.key === "name" ? (
                      <span className={cn(
                        "text-[12px] select-none transition-colors",
                        i === 0
                          ? "text-slate-400 italic group-hover/empty:text-[#018e7e]"
                          : "text-slate-300 italic"
                      )}>
                        {i === 0 ? "+ Add product…" : "—"}
                      </span>
                    ) : (
                      <span className="text-[12px] text-slate-300 select-none">—</span>
                    )}
                  </td>
                ))}

                {/* Sticky right: empty kebab cell */}
                <td className="sticky right-0 z-10 w-9 p-0 border-l border-[#E4E4E7] shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.08)] bg-white group-hover/empty:bg-[#f0fdf9]" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Pure filter / sort helper (module-level — no closure issues) ─────────────

function filterAndSort<T extends Product>(
  items: T[],
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
    result = result.filter((p) => {
      const isCat = "source" in p && (p as CatalogueProduct).source === "catalogue";
      if (isCat && filters.source.includes("Catalogue Generated")) return true;
      if (!isCat && filters.source.includes("Manually Added")) return true;
      return false;
    });
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
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#F3F4F6] bg-[#FAFAFA]">
      <p className="text-[12px] font-semibold text-slate-700">{label}</p>
      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", badgeCls)}>{badge}</span>
    </div>
  );
}

// ─── Main Products component ───────────────────────────────────────────────────

export function Products({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const router      = useRouter();
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

  // ── Demand Catalyst star-selection state ──────────────────────────────────────
  const [dcMode, setDcMode] = useState<"off" | "selecting" | "confirm">("off");
  const [starIds, setStarIds] = useState<Set<string>>(new Set());
  const [dcScene, setDcScene] = useState<DcScene>("banner");

  // Apply demo scene → drive dcMode + starIds + catalogue products
  useEffect(() => {
    const ALL_IDS = SAMPLE_CATALOGUE_PRODUCTS.map(p => p.id);
    switch (dcScene) {
      case "banner":
        setDcMode("off"); setStarIds(new Set());
        break;
      case "sel-0":
        setCataloguePhase("complete"); setCatalogueProducts(SAMPLE_CATALOGUE_PRODUCTS);
        setDcMode("selecting"); setStarIds(new Set());
        break;
      case "sel-1-only":
        setCataloguePhase("complete"); setCatalogueProducts(SAMPLE_CATALOGUE_PRODUCTS.slice(0, 1));
        setDcMode("selecting"); setStarIds(new Set([ALL_IDS[0]]));
        break;
      case "sel-3":
        setCataloguePhase("complete"); setCatalogueProducts(SAMPLE_CATALOGUE_PRODUCTS);
        setDcMode("selecting"); setStarIds(new Set(ALL_IDS.slice(0, 3)));
        break;
      case "sel-5":
        setCataloguePhase("complete"); setCatalogueProducts(SAMPLE_CATALOGUE_PRODUCTS);
        setDcMode("selecting"); setStarIds(new Set(ALL_IDS.slice(0, 5)));
        break;
      case "confirm":
        setCataloguePhase("complete"); setCatalogueProducts(SAMPLE_CATALOGUE_PRODUCTS);
        setDcMode("confirm"); setStarIds(new Set(ALL_IDS.slice(0, 3)));
        break;
    }
  }, [dcScene]);

  const handleStarToggle = (id: string) => {
    setStarIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); }
      else if (next.size < 5) { next.add(id); }
      return next;
    });
  };

  const handleSelectAll = () => {
    const ids = allProducts.slice(0, 5).map(p => p.id);
    setStarIds(new Set(ids));
  };

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
  const [showFilters, setShowFilters] = useState(false);

  // Toggle a filter value
  const setFilter = (key: "inventory" | "source" | "readiness", val: string) =>
    setFiltersState((prev) => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter((v) => v !== val) : [...prev[key], val],
    }));

  const FILTER_GROUPS: { key: "inventory" | "source" | "readiness"; label: string; options: string[] }[] = [
    { key: "inventory", label: "Inventory Status", options: ["In Inventory", "Made to Order"] },
    { key: "source",    label: "Product Source",   options: ["Catalogue Generated", "Manually Added"] },
    { key: "readiness", label: "Readiness",         options: ["Complete", "Incomplete"] },
  ];
  const totalFilters = Object.values(filters).flat().length;

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

  // Pure derived data — merge all products, filter/sort via module-level function
  const allProducts = [
    ...(cataloguePhase === "complete" ? catalogueProducts : []),
    ...(products as Product[]),
  ];
  const filteredProducts = filterAndSort(allProducts, search, sort, filters);

  const hasAnyProducts = products.length > 0 || (cataloguePhase === "complete" && catalogueProducts.length > 0);
  const missingDataProducts = catalogueProducts.filter((p) => p.needsUpdate);
  const showMissingBanner = cataloguePhase === "complete" && missingDataProducts.length > 0 && !missingBannerDismissed;
  const totalProductCount = allProducts.length;

  return (
    <>
      <ProfileAddProductDrawer open={addProductOpen} onClose={() => setAddProductOpen(false)}
        onSave={(p) => addProduct(p)} />
      <UploadCatalogueModal open={catalogueModalOpen} onClose={() => setCatalogueModalOpen(false)}
        onUploaded={handleUploaded} />
      <MissingDataModal open={missingDataModalOpen} onClose={() => setMissingDataModalOpen(false)}
        products={missingDataProducts} />

      {/* ═══════════════════════════════════════════════════════════════
          FILTERS SIDE DRAWER
          ═══════════════════════════════════════════════════════════════ */}
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 z-40 transition-opacity duration-300",
          showFilters ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setShowFilters(false)}
      />
      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full bg-white z-50 flex flex-col w-full md:max-w-[320px]",
          "transition-transform duration-300 ease-in-out",
          showFilters ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E4E7] flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-[#4B5563]" />
            <h3 className="text-[15px] font-semibold text-[#020202]">Filters</h3>
            {totalFilters > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#2ACB83] text-[#020202] text-[10px] font-bold flex items-center justify-center">
                {totalFilters}
              </span>
            )}
          </div>
          <button onClick={() => setShowFilters(false)}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Drawer body — filter groups stacked */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
          {FILTER_GROUPS.map(({ key, label, options }) => (
            <div key={key} className="flex flex-col gap-3">
              <p className="text-[11px] font-bold tracking-wider uppercase text-[#9CA3AF]">{label}</p>
              <div className="flex flex-col gap-2.5">
                {options.map((opt) => {
                  const checked = filters[key].includes(opt);
                  return (
                    <label key={opt}
                      onClick={() => setFilter(key, opt)}
                      className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn(
                        "w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                        checked
                          ? "bg-[#2ACB83] border-[#2ACB83]"
                          : "bg-white border-[#CBD5E1] group-hover:border-[#2ACB83]"
                      )}>
                        {checked && <Check size={11} className="text-[#020202]" strokeWidth={3} />}
                      </div>
                      <span className="text-[13px] text-[#374151] group-hover:text-[#020202] transition-colors">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer footer */}
        <div className="flex-shrink-0 border-t border-[#E4E4E7] px-5 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => setFiltersState({ inventory: [], source: [], readiness: [] })}
            disabled={totalFilters === 0}
            className="text-[13px] font-medium text-[#6B7280] hover:text-[#020202] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={() => setShowFilters(false)}
            className="flex-1 py-2 rounded-lg bg-[#2ACB83] text-[#020202] text-[13px] font-semibold hover:brightness-105 transition-all"
          >
            {totalFilters > 0 ? `Apply ${totalFilters} filter${totalFilters !== 1 ? "s" : ""}` : "Done"}
          </button>
        </div>
      </div>

      <div className="flex flex-col">

        {/* ═══════════════════════════════════════════════════════════════
            TOP ACTION BAR  —  Search · Sort · Filters | Add · Upload
            Mobile: 2 rows  /  Tablet+: single row
            ═══════════════════════════════════════════════════════════════ */}
        <div className="px-4 sm:px-5 pt-3.5 pb-3 border-b border-[#F3F4F6] flex flex-col gap-2">

          {/* Row 1 — Search (always full-width on mobile) */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                className="w-full border border-[#CBD5E1] rounded-lg pl-9 pr-3 py-[7px] text-[13px] text-[#020202] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2ACB83]/20 focus:border-[#2ACB83] transition-colors"
                placeholder="Search by product name or CAS number"
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Sort — hidden on mobile (shown in row 2) */}
            <div className="hidden sm:block w-[200px] flex-shrink-0">
              <DropdownSelect
                value={sort} onChange={setSort}
                options={["Latest Added", "Oldest Added", "A–Z", "Z–A"]}
                prefix="Sort by: "
              />
            </div>

            {/* Filters toggle — hidden on mobile (shown in row 2) */}
            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-[13px] font-medium border transition-colors flex-shrink-0",
                totalFilters > 0
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

            {/* Divider — desktop only */}
            <div className="hidden sm:block h-6 w-px bg-[#E5E7EB] flex-shrink-0 mx-0.5" />

            {/* Add Product */}
            <button onClick={() => setAddProductOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-[7px] rounded-lg border border-[#B3B7BD] text-[#4B5563] text-[13px] font-medium hover:bg-[#F9FAFB] transition-colors flex-shrink-0">
              <Plus size={14} />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Upload Catalogue */}
            <button onClick={() => setCatalogueModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-[7px] rounded-lg bg-[#1F6F54] text-white text-[13px] font-semibold hover:bg-[#185e46] transition-colors flex-shrink-0">
              <Upload size={14} />
              <span className="hidden sm:inline">Upload Catalogue</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>

          {/* Row 2 — Sort + Filters (mobile only) */}
          <div className="flex items-center gap-2 sm:hidden">
            <div className="flex-1 min-w-0">
              <DropdownSelect
                value={sort} onChange={setSort}
                options={["Latest Added", "Oldest Added", "A–Z", "Z–A"]}
                prefix="Sort by: "
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-[13px] font-medium border transition-colors flex-shrink-0",
                totalFilters > 0
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

        </div>

        {/* ═══════════════════════════════════════════════════════════════
            CONTENT AREA
            ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">

          {/* ── DC Demo scene switcher ── */}
          <DcSceneSwitcher scene={dcScene} onChange={setDcScene} />

          {/* ── Demand Catalyst banner / tracker / confirm ── */}
          {dcMode === "off" && (
            <DemandCatalystBanner onSelect={() => { setDcMode("selecting"); setDcScene("sel-0"); }} />
          )}
          {dcMode === "selecting" && (
            <>
              <StarTracker
                count={starIds.size}
                totalProducts={allProducts.length}
                onCancel={() => { setDcMode("off"); setStarIds(new Set()); setDcScene("banner"); }}
                onConfirm={() => setDcMode("confirm")}
                onSelectAll={handleSelectAll}
              />
              {/* Low-product nudge: show when user has fewer products than star slots */}
              {allProducts.length < 5 && (
                <LowCatalogueNudge
                  totalProducts={allProducts.length === 0 ? 1 : allProducts.length}
                  selectedCount={starIds.size}
                  onAddProducts={() => setAddProductOpen(true)}
                  onContinue={() => { setDcMode("confirm"); setDcScene("confirm"); }}
                />
              )}
            </>
          )}
          {dcMode === "confirm" && (
            <DcConfirmPopup
              starIds={starIds}
              allProducts={allProducts}
              onBack={() => setDcMode("selecting")}
              onActivate={() => router.push("/dashboard/demand-catalyst")}
            />
          )}

          {/* ── System banners ── */}
          {cataloguePhase === "processing" && !processingBannerDismissed && (
            <ProcessingBanner
              onDismiss={() => setProcessingBannerDismissed(true)}
              onViewFiles={() => {}}
            />
          )}
          {cataloguePhase === "complete" && !successBannerDismissed && (
            <SuccessBanner onDismiss={() => setSuccessBannerDismissed(true)} />
          )}
          {showMissingBanner && (
            <AdminMissingDataBanner
              count={missingDataProducts.length}
              onReview={() => setMissingDataModalOpen(true)}
              onDismiss={() => setMissingBannerDismissed(true)}
            />
          )}

          {/* ── SECTION: Uploaded Catalogues (visible while processing) ── */}
          {cataloguePhase === "processing" && uploadedFiles.length > 0 && (
            <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
              {/* Section header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-[#020202]">Uploaded Catalogues</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF0C5] text-[#9C5022]">
                    Processing
                  </span>
                </div>
                <button onClick={handleSimulateComplete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
                  <Check size={11} /> Simulate Processing Complete
                </button>
              </div>
              {/* Section body */}
              <div className="p-4 flex flex-col gap-3">
                <p className="text-[12px] text-[#6B7280] leading-[18px]">
                  We&apos;re analysing and structuring your uploaded catalogue. Estimated completion: <span className="font-medium text-[#4B5563]">24–48 hours</span>. You can continue using the platform in the meantime.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {uploadedFiles.map((f) => (
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
            </div>
          )}

          {/* ── SECTION: Products ── */}
          {!hasAnyProducts ? (
            <EmptyState icon={Package} title="No products added yet"
              subtitle="Upload your existing catalogue or add products individually to start receiving matched buyer demand." />
          ) : (
            <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
              {/* Section header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E7EB]">
                <div>
                  <p className="text-[13px] font-semibold text-[#020202]">Products</p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    {totalProductCount} product{totalProductCount !== 1 ? "s" : ""} listed — visible to buyers on Scinode
                  </p>
                </div>
              </div>
              {/* Section body — single unified table */}
              <div>
                {filteredProducts.length > 0 ? (
                  <ProductTable
                    products={filteredProducts}
                    onDelete={(id) => {
                      if (id.startsWith("cat-")) {
                        setCatalogueProducts(prev => prev.filter(p => p.id !== id));
                      } else {
                        deleteProduct(id);
                      }
                    }}
                    onAddClick={() => setAddProductOpen(true)}
                    starMode={dcMode === "selecting"}
                    starIds={starIds}
                    onStarToggle={handleStarToggle}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Search size={22} className="text-[#9CA3AF]" />
                    <p className="text-[13px] font-medium text-[#4B5563]">No products match your search</p>
                    <p className="text-[12px] text-[#9CA3AF]">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
