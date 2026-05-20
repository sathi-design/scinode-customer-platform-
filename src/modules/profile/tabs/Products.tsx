"use client";

import React, { useState, useRef } from "react";
import { Plus, Package, Trash2, Upload, FileSpreadsheet, CheckCircle2, X, Download, AlertCircle } from "lucide-react";
import {
  FormField, inputCls, DropdownSelect,
  EmptyState, DrawerFooter,
} from "../SharedUI";
import { DrawerBase } from "../DrawerBase";
import { INDUSTRIES, PRODUCT_GRADES, MOQ_UNITS, INVENTORY_UNITS } from "../constants";
import { useProfileStore } from "@/store/useProfileStore";
import type { Product } from "../types";

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
            <DropdownSelect
              value={form.industry}
              onChange={(v) => set("industry", v)}
              options={INDUSTRIES}
              placeholder="Select industry"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Grade">
            <DropdownSelect
              value={form.grade}
              onChange={(v) => set("grade", v)}
              options={PRODUCT_GRADES}
              placeholder="Select grade"
            />
          </FormField>
          <FormField label="Purity (%)">
            <input className={inputCls} type="number" min="0" max="100" step="0.01"
              value={form.purity} onChange={(e) => set("purity", e.target.value)}
              placeholder="e.g. 99.5" />
          </FormField>
        </div>

        <FormField label="MOQ (Minimum Order Quantity)">
          <div className="flex gap-2">
            <input className={inputCls + " flex-1 min-w-0"} value={form.moq}
              onChange={(e) => set("moq", e.target.value)} placeholder="e.g. 100" />
            <DropdownSelect
              value={form.moqUnit}
              onChange={(v) => set("moqUnit", v)}
              options={MOQ_UNITS}
              className="w-[90px] flex-shrink-0"
            />
          </div>
        </FormField>

        <FormField label="Commercial & Readiness Status">
          <DropdownSelect
            value={form.inventoryStatus}
            onChange={(v) => set("inventoryStatus", v as Product["inventoryStatus"])}
            options={["In inventory", "Made to order"]}
          />
        </FormField>

        {form.inventoryStatus === "In inventory" && (
          <div className="animate-in fade-in-0 duration-200 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Available Quantity">
                <input className={inputCls} type="number" min="0"
                  value={form.availableQty} onChange={(e) => set("availableQty", e.target.value)}
                  placeholder="e.g. 500" />
              </FormField>
              <FormField label="Unit">
                <DropdownSelect
                  value={form.availableUnit}
                  onChange={(v) => set("availableUnit", v)}
                  options={INVENTORY_UNITS}
                />
              </FormField>
            </div>
            <FormField label="Available at Location">
              <input className={inputCls} value={form.availableLocation}
                onChange={(e) => set("availableLocation", e.target.value)}
                placeholder="e.g. Ankleshwar, Gujarat" />
            </FormField>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-1">
          {[
            { key: "crackedChemistry" as const, label: "Cracked Chemistry",
              desc: "You have successfully developed the synthesis route" },
            { key: "workedOnProduct" as const, label: "Worked on this Product",
              desc: "You have prior experience manufacturing this compound" },
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#f3f4f6] last:border-0 gap-2">
      <span className="text-[11px] text-[#9ca3af] flex-shrink-0">{label}</span>
      <span className="text-[11px] font-semibold text-[#020202] text-right">{value}</span>
    </div>
  );
}

function CollapsibleCardGrid<T extends { id: string }>({
  items,
  renderItem,
  emptyText,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyText: string;
}) {
  const [showAll, setShowAll] = React.useState(false);
  const LIMIT = 4;
  const visible = showAll ? items : items.slice(0, LIMIT);
  if (items.length === 0) return <p className="text-xs text-[#9ca3af] py-4 text-center">{emptyText}</p>;
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {visible.map((item) => renderItem(item))}
      </div>
      {items.length > LIMIT && (
        <button type="button" onClick={() => setShowAll(s => !s)}
          className="mt-3 text-xs font-semibold text-[#1F6F54] hover:text-[#185C45] transition-colors">
          {showAll ? "↑ Show less" : `↓ Show all ${items.length}`}
        </button>
      )}
    </div>
  );
}

function ProductCard({ p, onDelete }: { p: Product; onDelete: () => void }) {
  const isInInventory = p.inventoryStatus === "In inventory";
  return (
    <div className="bg-white rounded-xl border border-[#e4e4e7] shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#020202] leading-snug truncate">{p.name}</p>
          {p.industry && <p className="text-xs font-medium text-[#1F6F54] mt-0.5 truncate">{p.industry}</p>}
          <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isInInventory
              ? "bg-[#d1fae5] text-[#065f46]"
              : "bg-[#f3f4f6] text-[#62748e]"
          }`}>
            {isInInventory ? "IN INVENTORY" : "Made to order"}
          </span>
        </div>
        <button onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 text-[#d1d5db] hover:text-red-500 transition-colors flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Details */}
      <div className="px-3 pb-2 border-t border-[#f3f4f6] pt-2 flex flex-col flex-1">
        {p.casNo && <DetailRow label="CAS" value={p.casNo} />}
        {p.purity && <DetailRow label="Purity" value={`${p.purity}%`} />}
        {p.moq && <DetailRow label="MOQ" value={`${p.moq} ${p.moqUnit}`} />}
        {p.grade && <DetailRow label="Grade" value={p.grade} />}
        {isInInventory && p.availableQty && (
          <DetailRow label="Available" value={`${p.availableQty} ${p.availableUnit}`} />
        )}
      </div>

      {/* Badges */}
      {(p.crackedChemistry || p.workedOnProduct) && (
        <div className="px-3 pb-3 flex flex-wrap gap-1">
          {p.crackedChemistry && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#6d28d9] border border-[#ddd6fe]">
              ⚡ CHEMISTRY CRACKED
            </span>
          )}
          {p.workedOnProduct && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
              ✓ PAST EXPERIENCE
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Bulk Upload Modal ────────────────────────────────────────────────────────
type UploadPhase = "idle" | "uploading" | "parsing" | "success" | "error";

function BulkUploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase]   = useState<UploadPhase>("idle");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const reset = () => { setPhase("idle"); setFileName(""); setProgress(0); };

  const handleFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "csv", "xls"].includes(ext ?? "")) { setPhase("error"); return; }
    if (file.size > 10 * 1024 * 1024) { setPhase("error"); return; }
    setFileName(file.name);
    setPhase("uploading");
    setProgress(0);
    // Simulate upload + parse
    const tick = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(tick); setPhase("parsing"); return 100; }
        return p + 12;
      });
    }, 120);
    setTimeout(() => { setPhase("success"); }, 2200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClose = () => { reset(); onClose(); };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,2,2,0.55)" }} onClick={handleClose}>
      <div className="bg-white rounded-[18px] w-full max-w-[520px] shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f3f4f6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#e8faf2] flex items-center justify-center">
              <Upload className="w-4.5 h-4.5 text-[#1F6F54]" size={18} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#020202]">Bulk Upload Catalogue</h3>
              <p className="text-[12px] text-[#62748e]">XLSX · CSV · XLS — up to 10 MB</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Helper text */}
          <p className="text-[13px] text-[#62748e] leading-[20px]">
            Upload your complete product catalogue to help us match relevant buyer demand faster. We'll process and map your products automatically.
          </p>

          {/* Upload zone */}
          {phase === "idle" && (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-[12px] py-10 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                isDragging ? "border-[#1F6F54] bg-[#f0faf5]" : "border-[#d1d5db] hover:border-[#1F6F54]/50 hover:bg-[#fafafa]"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#f0faf5] flex items-center justify-center">
                <FileSpreadsheet size={22} className="text-[#1F6F54]" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-[#020202]">Drop your file here</p>
                <p className="text-[12.5px] text-[#62748e] mt-0.5">or <span className="text-[#1F6F54] font-semibold underline underline-offset-2">browse files</span></p>
              </div>
              <p className="text-[11.5px] text-[#9ca3af]">Maximum file size: 10 MB</p>
              <input ref={fileRef} type="file" accept=".xlsx,.csv,.xls" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          )}

          {/* Uploading */}
          {phase === "uploading" && (
            <div className="flex flex-col gap-3 py-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={18} className="text-[#1F6F54] shrink-0" />
                <span className="text-[13px] font-medium text-[#020202] truncate flex-1">{fileName}</span>
                <span className="text-[12px] text-[#62748e]">{progress}%</span>
              </div>
              <div className="w-full h-[6px] bg-[#f3f4f6] rounded-full overflow-hidden">
                <div className="h-full bg-[#1F6F54] rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[12px] text-[#62748e]">Uploading…</p>
            </div>
          )}

          {/* Parsing */}
          {phase === "parsing" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-10 h-10 rounded-full border-2 border-[#1F6F54] border-t-transparent animate-spin" />
              <p className="text-[13px] font-medium text-[#020202]">Parsing catalogue…</p>
              <p className="text-[12px] text-[#62748e]">Reading product rows and validating fields</p>
            </div>
          )}

          {/* Success */}
          {phase === "success" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#e8faf2] flex items-center justify-center">
                <CheckCircle2 size={28} className="text-[#1F6F54]" />
              </div>
              <p className="text-[15px] font-semibold text-[#020202]">Catalogue uploaded successfully</p>
              <p className="text-[13px] text-[#62748e] max-w-[340px] leading-[20px]">
                Our system is processing your products for demand matching. You'll be notified when matching begins.
              </p>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#ffefef] flex items-center justify-center">
                <AlertCircle size={28} className="text-[#C30E1A]" />
              </div>
              <p className="text-[14px] font-semibold text-[#020202]">Upload failed</p>
              <p className="text-[12.5px] text-[#62748e] max-w-[300px] leading-[19px]">
                Please upload a valid .xlsx or .csv file under 10 MB.
              </p>
              <button onClick={reset}
                className="mt-1 px-4 py-2 rounded-[8px] border border-[#e4e4e7] text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors">
                Try Again
              </button>
            </div>
          )}

          {/* Download template */}
          {(phase === "idle" || phase === "error") && (
            <button className="flex items-center justify-center gap-2 text-[12.5px] font-medium text-[#0077CC] hover:text-[#005fa3] transition-colors">
              <Download size={13} /> Download Sample Template
            </button>
          )}
        </div>

        {/* Footer */}
        {(phase === "idle" || phase === "success") && (
          <div className="px-6 py-4 border-t border-[#f3f4f6] flex justify-end gap-2">
            {phase === "idle" && (
              <button onClick={handleClose}
                className="px-4 py-2 rounded-[8px] border border-[#e4e4e7] text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors">
                Cancel
              </button>
            )}
            {phase === "success" && (
              <button onClick={handleClose}
                className="px-5 py-2 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[13px] font-semibold transition-colors">
                Done
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Products({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [open, setOpen]         = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const products                = useProfileStore((s) => s.products);
  const addProduct              = useProfileStore((s) => s.addProduct);
  const deleteProduct           = useProfileStore((s) => s.deleteProduct);

  return (
    <>
      <AddProductDrawer open={open} onClose={() => setOpen(false)} onSave={(p) => addProduct(p)} />
      <BulkUploadModal open={bulkOpen} onClose={() => setBulkOpen(false)} />

      <div className="flex flex-col">
        <div className="p-4 sm:p-6 pb-2">

          {/* Header bar */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-[13px] text-[#62748e] leading-[20px] max-w-[420px]">
                Upload your complete product catalogue to help us match relevant buyer demand faster.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setBulkOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-[8px] border border-[#1F6F54]/50 text-[#1F6F54] text-[13px] font-medium hover:bg-[#f0faf5] transition-colors">
                <Upload className="w-3.5 h-3.5" /> Bulk Upload Catalogue
              </button>
              <button onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[13px] font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Product
              </button>
            </div>
          </div>

          {products.length === 0
            ? <EmptyState icon={Package} title="No products added yet"
                subtitle="Add individual products or bulk upload your catalogue to start receiving matched buyer demand." />
            : <CollapsibleCardGrid
                items={products}
                emptyText="No products added yet."
                renderItem={(p) => (
                  <ProductCard key={p.id} p={p} onDelete={() => deleteProduct(p.id)} />
                )}
              />
          }
        </div>
      </div>
    </>
  );
}
