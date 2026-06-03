"use client";

import React, { useState, useRef } from "react";
import {
  Plus, Package, Trash2, Upload, FileSpreadsheet, CheckCircle2, X, Download,
  AlertCircle, FileText, Image as ImageIcon, Search, ChevronDown, ChevronUp,
  Clock, SlidersHorizontal, Check, Sparkles, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField, inputCls, DropdownSelect, EmptyState, DrawerFooter } from "@/modules/profile/SharedUI";
import { DrawerBase } from "@/modules/profile/DrawerBase";
import { useIndependentCROProfileStore } from "@/store/useIndependentCROProfileStore";
import type { CROProduct } from "../types";
import { CRO_INDUSTRIES, CRO_MOQ_UNITS } from "../constants";

// ─── Local constants ───────────────────────────────────────────────────────────

const PRODUCT_GRADES = [
  "Technical Grade", "Reagent Grade", "Analytical Grade",
  "Food Grade", "Pharmaceutical Grade", "Industrial Grade", "Lab Grade",
] as const;

const INVENTORY_UNITS = ["g", "Kg", "MT", "L"] as const;

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

interface CatProduct extends CROProduct {
  source: "catalogue";
  needsUpdate?: boolean;
  catalogueFile?: string;
}

type FilterKey = "inventory" | "source" | "readiness";

// ─── Sample catalogue data (demo) ─────────────────────────────────────────────

const SAMPLE_CATALOGUE_PRODUCTS: CatProduct[] = [
  {
    id: "cat-001", source: "catalogue", catalogueFile: "CRO_Catalogue_2024.pdf",
    name: "Naproxen Sodium", casNumber: "26159-34-2", industry: "Pharmaceutical",
    grade: "Pharmaceutical Grade", purity: "99.5", moq: "50", moqUnit: "Kg",
    inventoryStatus: "In Inventory", availableQty: "200", availableUnit: "Kg",
    availableLocation: "Hyderabad, Telangana", crackedChemistry: true, workedOnProduct: true,
  },
  {
    id: "cat-002", source: "catalogue", needsUpdate: true, catalogueFile: "CRO_Catalogue_2024.pdf",
    name: "Ibuprofen API", casNumber: "15687-27-1", industry: "Pharmaceutical",
    grade: "Pharmaceutical Grade", purity: "", moq: "", moqUnit: "Kg",
    inventoryStatus: "Made to Order", availableQty: "", availableUnit: "Kg",
    availableLocation: "", crackedChemistry: false, workedOnProduct: true,
  },
  {
    id: "cat-003", source: "catalogue", catalogueFile: "CRO_Catalogue_2024.pdf",
    name: "Sodium Bromide", casNumber: "7647-15-6", industry: "Industrial Chemicals",
    grade: "Reagent Grade", purity: "99.8", moq: "100", moqUnit: "Kg",
    inventoryStatus: "In Inventory", availableQty: "500", availableUnit: "Kg",
    availableLocation: "Pune, Maharashtra", crackedChemistry: true, workedOnProduct: true,
  },
  {
    id: "cat-004", source: "catalogue", needsUpdate: true, catalogueFile: "Products_Excel.xlsx",
    name: "Benzaldehyde", casNumber: "100-52-7", industry: "Flavors & Fragrances",
    grade: "Technical Grade", purity: "98.0", moq: "200", moqUnit: "Kg",
    inventoryStatus: "In Inventory", availableQty: "1000", availableUnit: "Kg",
    availableLocation: "Mumbai, Maharashtra", crackedChemistry: true, workedOnProduct: true,
  },
  {
    id: "cat-005", source: "catalogue", needsUpdate: true, catalogueFile: "Products_Excel.xlsx",
    name: "Methyl Benzoate", casNumber: "93-58-3", industry: "Flavors & Fragrances",
    grade: "Analytical Grade", purity: "", moq: "", moqUnit: "Kg",
    inventoryStatus: "Made to Order", availableQty: "", availableUnit: "Kg",
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

function isCROProductComplete(p: CROProduct) {
  return !!(p.name && p.casNumber && p.purity && p.moq);
}

function countMissingFields(p: CatProduct): number {
  const mf = MISSING_FIELDS_MAP[p.id];
  if (mf) return mf.length;
  return [p.grade, p.purity, p.moq].filter((v) => !v).length;
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

const ACCEPT = ".xlsx,.xls,.csv,.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png";

const FORMAT_CHIPS = [
  { label: "Excel", cls: "bg-[#E8FBF2] text-[#0F7614]" },
  { label: "CSV",   cls: "bg-[#E8FBF2] text-[#0F7614]" },
  { label: "PDF",   cls: "bg-[#FFEFEF] text-[#C30E1A]" },
  { label: "Word",  cls: "bg-[#E6F3FB] text-[#0077CC]" },
  { label: "PPT",   cls: "bg-[#FEF0EB] text-[#9C5022]" },
  { label: "JPG",   cls: "bg-[#EDE8FB] text-[#6237C7]" },
  { label: "PNG",   cls: "bg-[#EDE8FB] text-[#6237C7]" },
];

// ─── Upload Catalogue Modal ────────────────────────────────────────────────────

function UploadCatalogueModal({ open, onClose, onUploaded }: {
  open: boolean; onClose: () => void; onUploaded: (files: UploadedFile[]) => void;
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

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); };
  const removeFile = (idx: number) => setSelectedFiles((p) => p.filter((_, i) => i !== idx));

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    const now = nowTime();
    const uploaded: UploadedFile[] = selectedFiles.map((f, i) => ({
      id: `uf-${Date.now()}-${i}`, name: f.name, ext: getExt(f.name),
      size: fmtSize(f.size), uploadedAt: now, status: "processing",
    }));
    onUploaded(uploaded);
    setSelectedFiles([]);
    onClose();
  };

  const handleClose = () => { setSelectedFiles([]); onClose(); };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,2,2,0.60)" }} onClick={handleClose}>
      <div className="bg-white rounded-[18px] w-full max-w-[900px] max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
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

        {/* Body */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">

          {/* LEFT — education panel */}
          <div className="lg:w-[56%] overflow-y-auto overflow-x-hidden flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[#F3F4F6]"
            style={{ background: "#F9FAFB", scrollbarWidth: "none" }}>
            <div className="p-6 flex flex-col gap-5">

              {/* Value prop */}
              <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, #E8FBF2 0%, #f0fdf9 100%)", border: "1px solid rgba(42,203,131,0.20)" }}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#018e7e] mb-2">Why upload your catalogue?</p>
                <p className="text-[14px] font-semibold text-[#020202] leading-[20px] mb-3">
                  CROs with a complete catalogue get <span style={{ color: "#018e7e" }}>3× more buyer enquiries</span> and surface on relevant RFQs automatically.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[{ label: "+25%", sub: "Discovery Score" }, { label: "3×", sub: "Buyer Enquiries" }, { label: "Auto", sub: "RFQ Matching" }].map((m) => (
                    <div key={m.label} className="flex items-center gap-1.5 bg-white border border-[#2ACB83]/30 rounded-lg px-2.5 py-1.5">
                      <span className="text-[13px] font-bold" style={{ color: "#018e7e" }}>{m.label}</span>
                      <span className="text-[10px] text-[#4B5563]">{m.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">How it works</p>
                <div className="flex items-start gap-0">
                  {[
                    { n: "1", icon: "📁", title: "You Upload",        sub: "Excel, PDF, Word, CSV — any format you have"         },
                    { n: "2", icon: "⚡", title: "We Structure",       sub: "Our team cleans & formats within 1–2 days"           },
                    { n: "3", icon: "🔍", title: "Buyers Find You",    sub: "Products go live on search & RFQ matching"           },
                  ].map((s, i) => (
                    <div key={s.n} className="flex-1 flex flex-col items-center text-center relative">
                      {i < 2 && <div className="absolute top-[16px] left-[calc(50%+16px)] right-[calc(-50%+16px)] h-px bg-[#E5E7EB] z-0" />}
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

              {/* Product preview */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">Your products, structured & buyer-ready</p>
                <div className="flex gap-2">
                  {[
                    { name: "Naproxen Sodium",  industry: "Pharmaceutical",      inv: true,  cas: "26159-34-2", purity: "99.5%", moq: "50 Kg"  },
                    { name: "Sodium Bromide",   industry: "Industrial Chemicals", inv: true,  cas: "7647-15-6",  purity: "99.8%", moq: "100 Kg" },
                    { name: "Methyl Benzoate",  industry: "Flavors & Frag.",      inv: false, cas: "93-58-3",    purity: "99.0%", moq: "25 Kg"  },
                  ].map((c, i) => (
                    <div key={i} className="flex-1 rounded-xl border border-[#E4E4E7] bg-white overflow-hidden">
                      <div className="p-2.5 pb-2">
                        <p className="text-[11px] font-bold text-[#020202] leading-tight line-clamp-2">{c.name}</p>
                        <p className="text-[9px] font-medium text-[#018e7e] mt-0.5 truncate">{c.industry}</p>
                        <span className={cn("inline-block mt-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full", c.inv ? "bg-[#B2F3B7] text-[#0F7614]" : "bg-[#F3F4F6] text-[#4B5563]")}>
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
              </div>

              {/* What you unlock */}
              <div className="rounded-xl border border-[#E4E4E7] bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">What you unlock</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: "🎯", title: "Matched to RFQs",    body: "Auto-matched to live buyer requests by product & chemistry" },
                    { icon: "📈", title: "Higher Discovery",   body: "+25% score boost — appear higher in buyer searches"         },
                    { icon: "👁️", title: "Buyer Visibility",   body: "Verified buyers browse your structured product listings"    },
                    { icon: "💼", title: "More Projects",      body: "Surface on exclusive CDMO & CMO project opportunities"      },
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
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-3 cursor-pointer transition-colors",
                isDragging ? "border-[#2ACB83] bg-[#E8FBF2]" : "border-[#CBD5E1] hover:border-[#2ACB83]/50 hover:bg-[#F9FAFB]"
              )}>
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

            <div>
              <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Supported Formats</p>
              <div className="flex flex-wrap gap-1.5">
                {FORMAT_CHIPS.map((f) => (
                  <span key={f.label} className={cn("text-[10px] font-semibold px-2 py-1 rounded", f.cls)}>{f.label}</span>
                ))}
              </div>
              <p className="text-[11px] text-[#9CA3AF] mt-2">Maximum 50 MB per file</p>
            </div>

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
                <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                  className="text-[12px] font-medium text-[#018e7e] hover:underline text-left">
                  + Add more files
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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
                selectedFiles.length > 0 ? "bg-[#2ACB83] text-[#020202] hover:brightness-105" : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
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

// ─── Banners ───────────────────────────────────────────────────────────────────

function ProcessingBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#0077CC]/25 relative" style={{ background: "#E6F3FB" }}>
      <Loader2 size={16} className="text-[#0077CC] shrink-0 mt-0.5 animate-spin" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#0077CC]">Catalogue processing in progress</p>
        <p className="text-[12px] text-[#4B5563] mt-0.5">
          Your catalogue is being reviewed and converted into structured product listings. You&apos;ll receive a notification once processing is complete.
        </p>
      </div>
      <button onClick={onDismiss} className="p-1 rounded hover:bg-[#0077CC]/10 text-[#0077CC] transition-colors flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

function SuccessBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#2ACB83]/30 relative" style={{ background: "#E8FBF2" }}>
      <CheckCircle2 size={16} className="text-[#018e7e] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#018e7e]">Your catalogue has been processed successfully</p>
        <p className="text-[12px] text-[#4B5563] mt-0.5">
          Your uploaded catalogue has been converted into structured product listings and is now available for buyer discovery and project matching.
        </p>
      </div>
      <button onClick={onDismiss} className="p-1 rounded hover:bg-[#2ACB83]/10 text-[#018e7e] transition-colors flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

function AdminMissingDataBanner({ count, onReview, onDismiss }: {
  count: number; onReview: () => void; onDismiss: () => void;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#FD4923]/25 relative" style={{ background: "#FEF0EB" }}>
      <AlertCircle size={16} className="text-[#FD4923] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#FD4923]">Additional product details required</p>
        <p className="text-[12px] text-[#4B5563] mt-0.5">
          We found missing information in <strong>{count} products</strong> that may reduce your visibility for relevant RFQs and buyer opportunities.
        </p>
        <button onClick={onReview} className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-[#FD4923] hover:underline">
          Review Missing Information →
        </button>
      </div>
      <button onClick={onDismiss} className="p-1 rounded hover:bg-[#FD4923]/10 text-[#FD4923] transition-colors flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Missing Data Drawer ────────────────────────────────────────────────────────

type MissingForm = {
  industry: string; grade: string; purity: string;
  moq: string; moqUnit: string; inventoryStatus: string;
  availableQty: string; availableUnit: string; availableLocation: string;
  crackedChemistry: boolean; workedOnProduct: boolean;
};

const MISSING_FORM_DEFAULT: MissingForm = {
  industry: "", grade: "", purity: "", moq: "", moqUnit: "Kg",
  inventoryStatus: "Made to Order",
  availableQty: "", availableUnit: "Kg", availableLocation: "",
  crackedChemistry: false, workedOnProduct: false,
};

function MissingDataDrawer({ open, onClose, products }: {
  open: boolean; onClose: () => void; products: CatProduct[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, MissingForm>>({});
  const [saved, setSaved] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (open && products.length > 0) {
      const firstId = products[0].id;
      setSelectedId(firstId);
      setForms((prev) => {
        if (prev[firstId]) return prev;
        const p = products[0];
        return { ...prev, [firstId]: { industry: p.industry ?? "", grade: p.grade ?? "", purity: p.purity ?? "", moq: p.moq ?? "", moqUnit: p.moqUnit ?? "Kg", inventoryStatus: p.inventoryStatus ?? "Made to Order", availableQty: p.availableQty ?? "", availableUnit: p.availableUnit ?? "Kg", availableLocation: p.availableLocation ?? "", crackedChemistry: p.crackedChemistry ?? false, workedOnProduct: p.workedOnProduct ?? false } };
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectProduct = (p: CatProduct) => {
    setSelectedId(p.id);
    setForms((prev) => {
      if (prev[p.id]) return prev;
      return { ...prev, [p.id]: { industry: p.industry ?? "", grade: p.grade ?? "", purity: p.purity ?? "", moq: p.moq ?? "", moqUnit: p.moqUnit ?? "Kg", inventoryStatus: p.inventoryStatus ?? "Made to Order", availableQty: p.availableQty ?? "", availableUnit: p.availableUnit ?? "Kg", availableLocation: p.availableLocation ?? "", crackedChemistry: p.crackedChemistry ?? false, workedOnProduct: p.workedOnProduct ?? false } };
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
    const remaining = products.filter((p) => !saved.has(p.id) && p.id !== selectedId);
    if (remaining.length > 0) selectProduct(remaining[0]);
  };

  return (
    <>
      <div className={cn("fixed inset-0 bg-black/30 z-40 transition-opacity duration-300", open ? "opacity-100" : "opacity-0 pointer-events-none")}
        onClick={onClose} />
      <div className={cn("fixed top-0 right-0 h-full bg-white z-50 flex flex-col transition-transform duration-300 ease-in-out w-full md:max-w-[840px]", open ? "translate-x-0" : "translate-x-full")}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E4E7] flex-shrink-0 bg-white">
          <div>
            <h3 className="text-[15px] font-semibold text-[#020202]">Products Requiring Updates</h3>
            <p className="text-[12px] text-[#6B7280] mt-0.5">
              {products.length} product{products.length !== 1 ? "s" : ""} with missing information that may affect RFQ matching
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* LEFT — product list */}
          <div className="w-[260px] flex-shrink-0 border-r border-[#E4E4E7] overflow-y-auto" style={{ background: "#F9FAFB" }}>
            <div className="p-3 flex flex-col gap-1.5">
              {products.map((p) => {
                const isSaved = saved.has(p.id);
                const missing = countMissingFields(p);
                return (
                  <button key={p.id} onClick={() => selectProduct(p)}
                    className={cn("w-full text-left px-3 py-3 rounded-xl border transition-all",
                      selectedId === p.id ? "bg-white border-[#2ACB83]/40 shadow-sm" : "bg-white border-transparent hover:border-[#E5E7EB]")}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-semibold text-[#020202] truncate">{p.name}</p>
                        {p.casNumber && <p className="text-[10.5px] text-[#9CA3AF] font-mono mt-0.5">{p.casNumber}</p>}
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

          {/* RIGHT — form */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {selected ? (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
                  <div className="pb-3 border-b border-[#F3F4F6]">
                    <p className="text-[15px] font-semibold text-[#020202]">{selected.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {selected.casNumber && <p className="text-[12px] text-[#9CA3AF] font-mono">{selected.casNumber}</p>}
                      {form.industry && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E8FBF2] text-[#018e7e]">{form.industry}</span>
                      )}
                    </div>
                    {saved.has(selected.id) && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <CheckCircle2 size={13} className="text-[#018e7e]" />
                        <span className="text-[12px] text-[#018e7e] font-medium">Information saved</span>
                      </div>
                    )}
                  </div>

                  <FormField label="Industry">
                    <DropdownSelect value={form.industry} onChange={(v) => setField("industry", v)}
                      options={CRO_INDUSTRIES} placeholder="Select industry" />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Grade">
                      <DropdownSelect value={form.grade} onChange={(v) => setField("grade", v)}
                        options={PRODUCT_GRADES} placeholder="Select grade" />
                    </FormField>
                    <FormField label="Purity (%)">
                      <input className={inputCls} type="number" min="0" max="100" step="0.01"
                        value={form.purity} onChange={(e) => setField("purity", e.target.value)} placeholder="e.g. 99.5" />
                    </FormField>
                  </div>

                  <FormField label="MOQ (Minimum Order Quantity)">
                    <div className="flex gap-2">
                      <input className={inputCls + " flex-1 min-w-0"} value={form.moq}
                        onChange={(e) => setField("moq", e.target.value)} placeholder="e.g. 100" />
                      <DropdownSelect value={form.moqUnit} onChange={(v) => setField("moqUnit", v)}
                        options={CRO_MOQ_UNITS} className="w-[90px] flex-shrink-0" />
                    </div>
                  </FormField>

                  <FormField label="Commercial & Readiness Status">
                    <DropdownSelect value={form.inventoryStatus} onChange={(v) => setField("inventoryStatus", v)}
                      options={["In Inventory", "Made to Order"]} />
                  </FormField>

                  {form.inventoryStatus === "In Inventory" && (
                    <div className="animate-in fade-in-0 duration-200 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="Available Quantity">
                          <input className={inputCls} type="number" min="0"
                            value={form.availableQty} onChange={(e) => setField("availableQty", e.target.value)} placeholder="e.g. 500" />
                        </FormField>
                        <FormField label="Unit">
                          <DropdownSelect value={form.availableUnit} onChange={(v) => setField("availableUnit", v)} options={INVENTORY_UNITS} />
                        </FormField>
                      </div>
                      <FormField label="Available at Location">
                        <input className={inputCls} value={form.availableLocation}
                          onChange={(e) => setField("availableLocation", e.target.value)} placeholder="e.g. Hyderabad, Telangana" />
                      </FormField>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-1">
                    {([
                      { key: "crackedChemistry" as const, label: "Cracked Chemistry",     desc: "You have successfully developed the synthesis route"      },
                      { key: "workedOnProduct"  as const, label: "Worked on this Product", desc: "You have prior experience manufacturing this compound"    },
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

// ─── Add Product Drawer ────────────────────────────────────────────────────────

const EMPTY: Omit<CROProduct, "id"> = {
  name: "", casNumber: "", industry: "", grade: "", purity: "",
  moq: "", moqUnit: "Kg", inventoryStatus: "Made to Order",
  availableQty: "", availableUnit: "Kg", availableLocation: "",
  crackedChemistry: false, workedOnProduct: false,
};

function AddProductDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (p: CROProduct) => void;
}) {
  const [form, setForm] = useState<Omit<CROProduct, "id">>(EMPTY);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((p) => ({ ...p, [k]: v }));

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
            onChange={(e) => set("name", e.target.value)} placeholder="e.g. Naproxen Sodium" />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="CAS Number">
            <input className={inputCls} value={form.casNumber}
              onChange={(e) => set("casNumber", e.target.value)} placeholder="e.g. 26159-34-2" />
          </FormField>
          <FormField label="Industry">
            <DropdownSelect value={form.industry} onChange={(v) => set("industry", v)}
              options={CRO_INDUSTRIES} placeholder="Select industry" />
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
              onChange={(e) => set("moq", e.target.value)} placeholder="e.g. 50" />
            <DropdownSelect value={form.moqUnit} onChange={(v) => set("moqUnit", v)}
              options={CRO_MOQ_UNITS} className="w-[90px] flex-shrink-0" />
          </div>
        </FormField>
        <FormField label="Commercial & Readiness Status">
          <DropdownSelect value={form.inventoryStatus} onChange={(v) => set("inventoryStatus", v)}
            options={["In Inventory", "Made to Order"]} />
        </FormField>
        {form.inventoryStatus === "In Inventory" && (
          <div className="animate-in fade-in-0 duration-200 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Available Quantity">
                <input className={inputCls} type="number" min="0"
                  value={form.availableQty} onChange={(e) => set("availableQty", e.target.value)} placeholder="e.g. 500" />
              </FormField>
              <FormField label="Unit">
                <DropdownSelect value={form.availableUnit} onChange={(v) => set("availableUnit", v)} options={INVENTORY_UNITS} />
              </FormField>
            </div>
            <FormField label="Available at Location">
              <input className={inputCls} value={form.availableLocation}
                onChange={(e) => set("availableLocation", e.target.value)} placeholder="e.g. Hyderabad, Telangana" />
            </FormField>
          </div>
        )}
        <div className="flex flex-col gap-2 pt-1">
          {[
            { key: "crackedChemistry" as const, label: "Cracked Chemistry",     desc: "You have successfully developed the synthesis route"   },
            { key: "workedOnProduct"  as const, label: "Worked on this Product", desc: "You have prior experience working with this compound" },
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

// ─── Detail Row ────────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#F3F4F6] last:border-0 gap-2">
      <span className="text-[11px] text-[#9CA3AF] flex-shrink-0">{label}</span>
      <span className="text-[11px] font-semibold text-[#020202] text-right">{value}</span>
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({ p, onDelete, source, needsUpdate }: {
  p: CROProduct; onDelete: () => void; source?: "manual" | "catalogue"; needsUpdate?: boolean;
}) {
  const isInInventory = p.inventoryStatus === "In Inventory";
  const complete = isCROProductComplete(p);

  return (
    <div className="bg-white rounded-xl border border-[#E4E4E7] flex flex-col hover:border-[#B3B7BD] transition-colors">
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-[#020202] leading-snug truncate">{p.name}</p>
          {p.industry && <p className="text-[11px] font-medium text-[#018e7e] mt-0.5 truncate">{p.industry}</p>}
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
              isInInventory ? "bg-[#B2F3B7] text-[#0F7614]" : "bg-[#F3F4F6] text-[#4B5563]")}>
              {isInInventory ? "IN INVENTORY" : "Made to Order"}
            </span>
            {needsUpdate && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF0EB] text-[#FD4923]">⚠ Action Required</span>
            )}
            {!needsUpdate && !complete && source === "catalogue" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF0C5] text-[#9C5022]">Incomplete</span>
            )}
          </div>
        </div>
        <button onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-[#FFEFEF] text-[#D1D5DB] hover:text-[#C30E1A] transition-colors flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-3 pb-2 border-t border-[#F3F4F6] pt-2 flex flex-col flex-1">
        {p.casNumber && <DetailRow label="CAS" value={p.casNumber} />}
        {p.purity    && <DetailRow label="Purity" value={`${p.purity}%`} />}
        {p.moq       && <DetailRow label="MOQ" value={`${p.moq} ${p.moqUnit}`} />}
        {p.grade     && <DetailRow label="Grade" value={p.grade} />}
        {isInInventory && p.availableQty && <DetailRow label="Available" value={`${p.availableQty} ${p.availableUnit}`} />}
      </div>

      <div className="px-3 pb-3 flex flex-wrap gap-1 mt-auto">
        {source === "catalogue" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F3FB] text-[#0077CC] flex items-center gap-1">
            <Sparkles size={8} /> Generated from Catalogue
          </span>
        )}
        {source === "manual" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563]">Added Manually</span>
        )}
        {p.crackedChemistry && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#6D28D9]">⚡ Chemistry Cracked</span>
        )}
        {p.workedOnProduct && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E]">✓ Past Experience</span>
        )}
      </div>
    </div>
  );
}

// ─── Collapsible Card Grid ─────────────────────────────────────────────────────

function CollapsibleCardGrid<T extends { id: string }>({ items, renderItem, emptyText }: {
  items: T[]; renderItem: (item: T) => React.ReactNode; emptyText: string;
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

// ─── Filter / sort helper ──────────────────────────────────────────────────────

function filterAndSort<T extends CROProduct>(
  items: T[], src: "manual" | "catalogue",
  search: string, sort: string,
  filters: Record<FilterKey, string[]>,
): T[] {
  let result = [...items];

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q) || p.casNumber.toLowerCase().includes(q));
  }

  if (filters.inventory.length > 0) {
    result = result.filter((p) => {
      if (filters.inventory.includes("In Inventory") && p.inventoryStatus === "In Inventory") return true;
      if (filters.inventory.includes("Made to Order") && p.inventoryStatus === "Made to Order") return true;
      return false;
    });
  }

  if (filters.source.length > 0) {
    if (src === "catalogue" && !filters.source.includes("Catalogue Generated")) return [];
    if (src === "manual"    && !filters.source.includes("Manually Added"))      return [];
  }

  if (filters.readiness.length > 0) {
    result = result.filter((p) => {
      const ok = isCROProductComplete(p);
      if (filters.readiness.includes("Complete")   && ok)  return true;
      if (filters.readiness.includes("Incomplete") && !ok) return true;
      return false;
    });
  }

  if (sort === "A–Z")          result.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "Z–A")     result.sort((a, b) => b.name.localeCompare(a.name));
  else if (sort === "Oldest Added") result.reverse();

  return result;
}

// ─── Main Tab2Products ─────────────────────────────────────────────────────────

import { TabFooter } from "@/modules/profile/SharedUI";

interface Props { onNext: () => void; onBack: () => void; }

export function Tab2Products({ onNext, onBack }: Props) {
  const products      = useIndependentCROProfileStore((s) => s.products);
  const addProduct    = useIndependentCROProfileStore((s) => s.addProduct);
  const deleteProduct = useIndependentCROProfileStore((s) => s.deleteProduct);

  const [addProductOpen,       setAddProductOpen]       = useState(false);
  const [catalogueModalOpen,   setCatalogueModalOpen]   = useState(false);
  const [missingDrawerOpen,    setMissingDrawerOpen]    = useState(false);

  // Catalogue state machine
  const [cataloguePhase,    setCataloguePhase]    = useState<CataloguePhase>("none");
  const [uploadedFiles,     setUploadedFiles]     = useState<UploadedFile[]>([]);
  const [catalogueProducts, setCatalogueProducts] = useState<CatProduct[]>([]);

  // Banner visibility
  const [processingBannerDismissed, setProcessingBannerDismissed] = useState(false);
  const [successBannerDismissed,    setSuccessBannerDismissed]    = useState(false);
  const [missingBannerDismissed,    setMissingBannerDismissed]    = useState(false);

  // Search / sort / filter
  const [search, setSearch] = useState("");
  const [sort,   setSort]   = useState("Latest Added");
  const [filters, setFiltersState] = useState<Record<FilterKey, string[]>>({ inventory: [], source: [], readiness: [] });
  const [showFilters, setShowFilters] = useState(false);

  const FILTER_GROUPS: { key: FilterKey; label: string; options: string[] }[] = [
    { key: "inventory", label: "Inventory Status", options: ["In Inventory", "Made to Order"] },
    { key: "source",    label: "Product Source",   options: ["Catalogue Generated", "Manually Added"] },
    { key: "readiness", label: "Readiness",         options: ["Complete", "Incomplete"] },
  ];
  const totalFilters = Object.values(filters).flat().length;

  const setFilter = (key: FilterKey, val: string) =>
    setFiltersState((prev) => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter((v) => v !== val) : [...prev[key], val],
    }));

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

  const filteredCatalogueProducts = filterAndSort(catalogueProducts, "catalogue", search, sort, filters);
  const filteredManualProducts    = filterAndSort(products, "manual", search, sort, filters);

  const missingDataProducts = catalogueProducts.filter((p) => p.needsUpdate);
  const showMissingBanner   = cataloguePhase === "complete" && missingDataProducts.length > 0 && !missingBannerDismissed;

  return (
    <>
      <AddProductDrawer open={addProductOpen} onClose={() => setAddProductOpen(false)} onSave={addProduct} />
      <UploadCatalogueModal open={catalogueModalOpen} onClose={() => setCatalogueModalOpen(false)} onUploaded={handleUploaded} />
      <MissingDataDrawer open={missingDrawerOpen} onClose={() => setMissingDrawerOpen(false)} products={missingDataProducts} />

      {/* ── Filters side drawer ── */}
      <div className={cn("fixed inset-0 bg-black/20 z-40 transition-opacity duration-300", showFilters ? "opacity-100" : "opacity-0 pointer-events-none")}
        onClick={() => setShowFilters(false)} />
      <div className={cn("fixed top-0 right-0 h-full bg-white z-50 flex flex-col w-full md:max-w-[320px] transition-transform duration-300 ease-in-out", showFilters ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E4E7] flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-[#4B5563]" />
            <h3 className="text-[15px] font-semibold text-[#020202]">Filters</h3>
            {totalFilters > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#2ACB83] text-[#020202] text-[10px] font-bold flex items-center justify-center">{totalFilters}</span>
            )}
          </div>
          <button onClick={() => setShowFilters(false)} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
          {FILTER_GROUPS.map(({ key, label, options }) => (
            <div key={key} className="flex flex-col gap-3">
              <p className="text-[11px] font-bold tracking-wider uppercase text-[#9CA3AF]">{label}</p>
              <div className="flex flex-col gap-2.5">
                {options.map((opt) => {
                  const checked = filters[key].includes(opt);
                  return (
                    <label key={opt} onClick={() => setFilter(key, opt)} className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn("w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                        checked ? "bg-[#2ACB83] border-[#2ACB83]" : "bg-white border-[#CBD5E1] group-hover:border-[#2ACB83]")}>
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
        <div className="flex-shrink-0 border-t border-[#E4E4E7] px-5 py-4 flex items-center justify-between gap-3">
          <button onClick={() => setFiltersState({ inventory: [], source: [], readiness: [] })} disabled={totalFilters === 0}
            className="text-[13px] font-medium text-[#6B7280] hover:text-[#020202] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Clear all
          </button>
          <button onClick={() => setShowFilters(false)}
            className="flex-1 py-2 rounded-lg bg-[#2ACB83] text-[#020202] text-[13px] font-semibold hover:brightness-105 transition-all">
            {totalFilters > 0 ? `Apply ${totalFilters} filter${totalFilters !== 1 ? "s" : ""}` : "Done"}
          </button>
        </div>
      </div>

      <div className="flex flex-col">

        {/* ── Action bar ── */}
        <div className="px-4 sm:px-5 pt-3.5 pb-3 border-b border-[#F3F4F6] flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                className="w-full border border-[#CBD5E1] rounded-lg pl-9 pr-3 py-[7px] text-[13px] text-[#020202] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2ACB83]/20 focus:border-[#2ACB83] transition-colors"
                placeholder="Search by product name or CAS number"
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="hidden sm:block w-[200px] flex-shrink-0">
              <DropdownSelect value={sort} onChange={setSort}
                options={["Latest Added", "Oldest Added", "A–Z", "Z–A"]} prefix="Sort by: " />
            </div>
            <button onClick={() => setShowFilters(true)}
              className={cn("hidden sm:flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-[13px] font-medium border transition-colors flex-shrink-0",
                totalFilters > 0 ? "bg-[#E8FBF2] border-[#2ACB83]/40 text-[#018e7e]" : "border-[#CBD5E1] text-[#4B5563] hover:bg-[#F9FAFB]")}>
              <SlidersHorizontal size={14} />
              Filters
              {totalFilters > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#2ACB83] text-[#020202] text-[9px] font-bold flex items-center justify-center">{totalFilters}</span>
              )}
            </button>
            <div className="hidden sm:block h-6 w-px bg-[#E5E7EB] flex-shrink-0 mx-0.5" />
            <button onClick={() => setAddProductOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-[7px] rounded-lg border border-[#B3B7BD] text-[#4B5563] text-[13px] font-medium hover:bg-[#F9FAFB] transition-colors flex-shrink-0">
              <Plus size={14} />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button onClick={() => setCatalogueModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-[7px] rounded-lg bg-[#2ACB83] text-[#020202] text-[13px] font-semibold hover:brightness-105 transition-all flex-shrink-0">
              <Upload size={14} />
              <span className="hidden sm:inline">Upload Catalogue</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>
          {/* Mobile row 2 */}
          <div className="flex items-center gap-2 sm:hidden">
            <div className="flex-1 min-w-0">
              <DropdownSelect value={sort} onChange={setSort}
                options={["Latest Added", "Oldest Added", "A–Z", "Z–A"]} prefix="Sort by: " />
            </div>
            <button onClick={() => setShowFilters(true)}
              className={cn("flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-[13px] font-medium border transition-colors flex-shrink-0",
                totalFilters > 0 ? "bg-[#E8FBF2] border-[#2ACB83]/40 text-[#018e7e]" : "border-[#CBD5E1] text-[#4B5563] hover:bg-[#F9FAFB]")}>
              <SlidersHorizontal size={14} />
              Filters
              {totalFilters > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#2ACB83] text-[#020202] text-[9px] font-bold flex items-center justify-center">{totalFilters}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">

          {/* Banners */}
          {cataloguePhase === "processing" && !processingBannerDismissed && (
            <ProcessingBanner onDismiss={() => setProcessingBannerDismissed(true)} />
          )}
          {cataloguePhase === "complete" && !successBannerDismissed && (
            <SuccessBanner onDismiss={() => setSuccessBannerDismissed(true)} />
          )}
          {showMissingBanner && (
            <AdminMissingDataBanner count={missingDataProducts.length}
              onReview={() => setMissingDrawerOpen(true)}
              onDismiss={() => setMissingBannerDismissed(true)} />
          )}

          {/* Uploaded Catalogues — processing state */}
          {cataloguePhase === "processing" && uploadedFiles.length > 0 && (
            <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-[#020202]">Uploaded Catalogues</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF0C5] text-[#9C5022]">Processing</span>
                </div>
                <button onClick={handleSimulateComplete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
                  <Check size={11} /> Simulate Processing Complete
                </button>
              </div>
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

          {/* Catalogue Products — complete state */}
          {cataloguePhase === "complete" && filteredCatalogueProducts.length > 0 && (
            <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-[#020202]">Uploaded Catalogues</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8FBF2] text-[#018e7e]">
                    {filteredCatalogueProducts.length} Products
                  </span>
                </div>
              </div>
              <div className="p-4">
                <CollapsibleCardGrid
                  items={filteredCatalogueProducts}
                  emptyText="No catalogue products match your filters."
                  renderItem={(p) => (
                    <ProductCard key={p.id} p={p} source="catalogue" needsUpdate={(p as CatProduct).needsUpdate}
                      onDelete={() => setCatalogueProducts((prev) => prev.filter((x) => x.id !== p.id))} />
                  )}
                />
              </div>
            </div>
          )}

          {/* Products section */}
          <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold text-[#020202]">Products</p>
                {products.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563]">
                    {products.length} listed — visible to buyers on Scinode
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              {products.length === 0 && filteredManualProducts.length === 0 ? (
                <EmptyState icon={Package} title="No products added yet"
                  subtitle="Click Add Product to list your chemicals and compounds, or upload your existing catalogue." />
              ) : (
                <CollapsibleCardGrid
                  items={filteredManualProducts}
                  emptyText="No products match your filters."
                  renderItem={(p) => (
                    <ProductCard key={p.id} p={p} source="manual"
                      onDelete={() => deleteProduct(p.id)} />
                  )}
                />
              )}
            </div>
          </div>

        </div>

        <TabFooter onSave={onNext} onBack={onBack} />
      </div>
    </>
  );
}
