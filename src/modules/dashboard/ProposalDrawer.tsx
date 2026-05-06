"use client";

import {
  useState, useEffect, useRef, useCallback, ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  X, ChevronDown, Upload, Trash2, FileText, List,
  Send, CheckCircle2, Clock, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectDetail } from "@/lib/projectsData";
import { useProposalStore } from "@/store/useProposalStore";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProposalType = "CMO" | "RFQ";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
}

interface FormState {
  // Shared
  proposedQtyValue: string;
  proposedQtyUnit: string;
  productSpec: string;
  termsConditions: string;
  // CMO-specific
  processNotes: string;
  whyGoodFit: string;
  // RFQ-specific
  costValue: string;
  currency: string;
  costUnit: string;
  timeline: string;
  shipmentTerms: string;
  packaging: string;
  paymentTerms: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const QTY_UNITS = ["kg", "g", "mg", "MT", "L", "mL", "lb", "oz"];
const CURRENCIES = ["USD", "EUR", "INR", "GBP", "JPY", "AED"];
const COST_UNITS = ["kg", "g", "L", "unit", "MT", "batch"];
const TIMELINE_OPTS = [
  "1–2 weeks", "2–4 weeks", "4–8 weeks",
  "1–2 months", "2–3 months", "3–6 months", "> 6 months",
];
const SHIPMENT_OPTS = [
  "EXW (Ex Works)", "FOB (Free On Board)", "CIF (Cost, Insurance & Freight)",
  "DDP (Delivered Duty Paid)", "DAP (Delivered at Place)", "FCA (Free Carrier)",
];
const PACKAGING_OPTS = [
  "Drums (200 L)", "IBC (1000 L)", "HDPE Bags (25 kg)",
  "HDPE Bags (50 kg)", "Glass Bottles", "Flexitanks", "Custom",
];
const PAYMENT_OPTS = [
  "Net 30", "Net 60", "Net 90",
  "50% advance + 50% on delivery", "Letter of Credit (LC)", "Escrow",
];

const EMPTY_FORM: FormState = {
  proposedQtyValue: "", proposedQtyUnit: "kg",
  productSpec: "", termsConditions: "",
  processNotes: "", whyGoodFit: "",
  costValue: "", currency: "USD", costUnit: "kg",
  timeline: "", shipmentTerms: "", packaging: "", paymentTerms: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getProposalType(project: ProjectDetail): ProposalType {
  if (
    project.badge === "RFQ" ||
    project.engagementType?.toLowerCase().includes("rfq")
  ) return "RFQ";
  return "CMO";
}

function parseQty(qty: string): { value: string; unit: string } {
  const m = qty.match(/^([\d.,]+)\s*([a-zA-Z]+)/);
  return m
    ? { value: m[1], unit: m[2].toLowerCase() }
    : { value: "", unit: "kg" };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ─── Small reusable sub-components ───────────────────────────────────────────
const inputCls =
  "w-full border border-[#cbd5e1] rounded-[8px] px-3 py-2.5 text-[13px] text-[#020202] " +
  "placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1F6F54]/30 " +
  "focus:border-[#1F6F54] transition-colors bg-white";

const textareaCls = inputCls + " resize-none leading-[22px]";

function FormLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[12px] font-semibold text-[#353535] uppercase tracking-wide mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function FormGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-[#f0f0f0]" />
      <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-[#f0f0f0]" />
    </div>
  );
}

// Textarea with a bullet-insert toolbar button
function RichTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const insertBullet = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);
    // Insert bullet at line start
    const lineStart = before.lastIndexOf("\n") + 1;
    const newVal =
      value.slice(0, lineStart) + "• " + value.slice(lineStart);
    onChange(newVal);
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = start + 2;
      el.focus();
    }, 0);
  };

  return (
    <div className="border border-[#cbd5e1] rounded-[8px] overflow-hidden focus-within:ring-2 focus-within:ring-[#1F6F54]/30 focus-within:border-[#1F6F54] transition-colors">
      {/* Mini toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-[#f9fafb] border-b border-[#e4e4e7]">
        <button
          type="button"
          onClick={insertBullet}
          title="Insert bullet point"
          className="p-1 rounded hover:bg-[#e4e4e7] text-[#62748e] transition-colors"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] text-[#9ca3af] ml-1">Bullet list</span>
      </div>
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck
        className="w-full px-3 py-2.5 text-[13px] text-[#020202] placeholder:text-[#9ca3af] focus:outline-none leading-[22px] bg-white resize-none"
      />
    </div>
  );
}

// Inline select dropdown
function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          inputCls,
          "appearance-none pr-8 cursor-pointer",
          !value && "text-[#9ca3af]",
        )}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a] pointer-events-none" />
    </div>
  );
}

// Unit select (compact, appended to input)
function UnitSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative flex-shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-full border-l border-[#cbd5e1] rounded-r-[8px] pl-3 pr-7 text-[13px] font-medium text-[#353535] bg-[#f9fafb] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1F6F54]/30 focus:ring-inset"
        style={{ minWidth: 64 }}
      >
        {options.map((u) => <option key={u}>{u}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717a] pointer-events-none" />
    </div>
  );
}

// Quantity input + unit
function QtyInput({
  value,
  unit,
  onValue,
  onUnit,
  units = QTY_UNITS,
  placeholder = "e.g. 25",
}: {
  value: string;
  unit: string;
  onValue: (v: string) => void;
  onUnit: (v: string) => void;
  units?: string[];
  placeholder?: string;
}) {
  return (
    <div className="flex border border-[#cbd5e1] rounded-[8px] overflow-hidden focus-within:ring-2 focus-within:ring-[#1F6F54]/30 focus-within:border-[#1F6F54] transition-colors">
      <input
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(e) => onValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2.5 text-[13px] text-[#020202] placeholder:text-[#9ca3af] focus:outline-none bg-white min-w-0"
      />
      <UnitSelect value={unit} onChange={onUnit} options={units} />
    </div>
  );
}

// File upload zone
function FileUploadZone({
  files,
  onAdd,
  onRemove,
}: {
  files: UploadedFile[];
  onAdd: (files: UploadedFile[]) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({
      id: `${f.name}-${Date.now()}`,
      name: f.name,
      size: formatFileSize(f.size),
      type: f.name.split(".").pop()?.toUpperCase() ?? "FILE",
    }));
    onAdd(newFiles);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          processFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-[10px] px-4 py-5 flex flex-col items-center gap-2 cursor-pointer transition-colors",
          dragging
            ? "border-[#1F6F54] bg-[#f0faf5]"
            : "border-[#cbd5e1] bg-[#f9fafb] hover:border-[#1F6F54]/50 hover:bg-[#f0faf5]",
        )}
      >
        <div className="w-9 h-9 rounded-full bg-[#e3f4ff] flex items-center justify-center">
          <Upload className="w-4 h-4 text-[#0077CC]" />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-medium text-[#353535]">
            Drop files here or{" "}
            <span className="text-[#1F6F54] underline">browse</span>
          </p>
          <p className="text-[11px] text-[#9ca3af] mt-0.5">
            PDF, DOCX, PPTX, XLSX — max 10 MB each
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
      </div>

      {/* Uploaded file list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] bg-white border border-[#e4e4e7]"
            >
              <div className="w-8 h-8 rounded-[6px] bg-[#e3f4ff] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-[#0077CC]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#020202] truncate">{f.name}</p>
                <p className="text-[11px] text-[#9ca3af]">{f.type} · {f.size}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(f.id)}
                className="p-1.5 rounded-[6px] text-[#9ca3af] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CMO Form ─────────────────────────────────────────────────────────────────
function CMOForm({
  form,
  set,
  files,
  onAddFiles,
  onRemoveFile,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  files: UploadedFile[];
  onAddFiles: (f: UploadedFile[]) => void;
  onRemoveFile: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Proposed Quantity */}
      <FormGroup>
        <FormLabel required>Proposed Quantity</FormLabel>
        <QtyInput
          value={form.proposedQtyValue}
          unit={form.proposedQtyUnit}
          onValue={(v) => set("proposedQtyValue", v)}
          onUnit={(v) => set("proposedQtyUnit", v)}
        />
      </FormGroup>

      <SectionDivider label="Technical Details" />

      {/* Product Specification */}
      <FormGroup>
        <FormLabel>Product Specification</FormLabel>
        <RichTextarea
          value={form.productSpec}
          onChange={(v) => set("productSpec", v)}
          placeholder={"Describe your product specifications...\n• Purity: ≥ 99%\n• Form: white powder\n• Particle size: D90 < 100 μm"}
          rows={4}
        />
      </FormGroup>

      {/* Process Notes */}
      <FormGroup>
        <FormLabel>Process Notes</FormLabel>
        <RichTextarea
          value={form.processNotes}
          onChange={(v) => set("processNotes", v)}
          placeholder={"Describe your manufacturing process approach...\n• Equipment available\n• Experience with similar chemistry\n• Scale-up capabilities"}
          rows={4}
        />
      </FormGroup>

      {/* Why are you a good fit */}
      <FormGroup>
        <FormLabel required>Why are you a good fit?</FormLabel>
        <RichTextarea
          value={form.whyGoodFit}
          onChange={(v) => set("whyGoodFit", v)}
          placeholder={"Explain why your facility is best suited for this project...\n• Relevant certifications\n• Past experience\n• Unique capabilities"}
          rows={5}
        />
      </FormGroup>

      <SectionDivider label="Legal & Documents" />

      {/* Terms & Conditions */}
      <FormGroup>
        <FormLabel>Terms & Conditions</FormLabel>
        <RichTextarea
          value={form.termsConditions}
          onChange={(v) => set("termsConditions", v)}
          placeholder={"Outline your commercial and legal terms...\n• Payment: Net 60\n• Lead time: 6–8 weeks\n• Confidentiality: NDA required"}
          rows={4}
        />
      </FormGroup>

      {/* File Upload */}
      <FormGroup>
        <FormLabel>Supporting Documents</FormLabel>
        <FileUploadZone
          files={files}
          onAdd={onAddFiles}
          onRemove={onRemoveFile}
        />
      </FormGroup>
    </div>
  );
}

// ─── RFQ Form ─────────────────────────────────────────────────────────────────
function RFQForm({
  form,
  set,
  files,
  onAddFiles,
  onRemoveFile,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  files: UploadedFile[];
  onAddFiles: (f: UploadedFile[]) => void;
  onRemoveFile: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Proposed Quantity */}
      <FormGroup>
        <FormLabel required>Proposed Quantity</FormLabel>
        <QtyInput
          value={form.proposedQtyValue}
          unit={form.proposedQtyUnit}
          onValue={(v) => set("proposedQtyValue", v)}
          onUnit={(v) => set("proposedQtyUnit", v)}
        />
      </FormGroup>

      {/* Cost Per Unit */}
      <FormGroup>
        <FormLabel required>Cost Per Unit</FormLabel>
        <div className="flex border border-[#cbd5e1] rounded-[8px] overflow-hidden focus-within:ring-2 focus-within:ring-[#1F6F54]/30 focus-within:border-[#1F6F54] transition-colors">
          {/* Currency */}
          <div className="relative flex-shrink-0 border-r border-[#cbd5e1]">
            <select
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
              className="appearance-none h-full px-3 pr-7 text-[13px] font-medium text-[#353535] bg-[#f9fafb] cursor-pointer focus:outline-none"
              style={{ minWidth: 72 }}
            >
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717a] pointer-events-none" />
          </div>
          {/* Amount */}
          <input
            type="number"
            min="0"
            step="any"
            value={form.costValue}
            onChange={(e) => set("costValue", e.target.value)}
            placeholder="0.00"
            className="flex-1 px-3 py-2.5 text-[13px] text-[#020202] placeholder:text-[#9ca3af] focus:outline-none bg-white min-w-0"
          />
          {/* Per unit */}
          <UnitSelect
            value={form.costUnit}
            onChange={(v) => set("costUnit", v)}
            options={COST_UNITS}
          />
        </div>
      </FormGroup>

      <SectionDivider label="Commercial Terms" />

      {/* Timeline */}
      <FormGroup>
        <FormLabel required>Timeline</FormLabel>
        <Select
          value={form.timeline}
          onChange={(v) => set("timeline", v)}
          options={TIMELINE_OPTS}
          placeholder="Select delivery timeline"
        />
      </FormGroup>

      {/* Shipment Terms */}
      <FormGroup>
        <FormLabel required>Shipment Terms</FormLabel>
        <Select
          value={form.shipmentTerms}
          onChange={(v) => set("shipmentTerms", v)}
          options={SHIPMENT_OPTS}
          placeholder="Select shipment terms"
        />
      </FormGroup>

      {/* Packaging */}
      <FormGroup>
        <FormLabel>Packaging Details</FormLabel>
        <Select
          value={form.packaging}
          onChange={(v) => set("packaging", v)}
          options={PACKAGING_OPTS}
          placeholder="Select packaging type"
        />
      </FormGroup>

      {/* Payment Terms */}
      <FormGroup>
        <FormLabel>Payment Terms</FormLabel>
        <Select
          value={form.paymentTerms}
          onChange={(v) => set("paymentTerms", v)}
          options={PAYMENT_OPTS}
          placeholder="Select payment terms"
        />
      </FormGroup>

      <SectionDivider label="Technical & Legal" />

      {/* Product Specification */}
      <FormGroup>
        <FormLabel>Product Specification</FormLabel>
        <RichTextarea
          value={form.productSpec}
          onChange={(v) => set("productSpec", v)}
          placeholder={"Describe specifications you can meet...\n• Purity\n• Form\n• Certifications"}
          rows={4}
        />
      </FormGroup>

      {/* Terms & Conditions */}
      <FormGroup>
        <FormLabel>Terms & Conditions</FormLabel>
        <RichTextarea
          value={form.termsConditions}
          onChange={(v) => set("termsConditions", v)}
          placeholder={"Outline your commercial and legal terms..."}
          rows={3}
        />
      </FormGroup>

      {/* File Upload */}
      <FormGroup>
        <FormLabel>Supporting Documents</FormLabel>
        <FileUploadZone
          files={files}
          onAdd={onAddFiles}
          onRemove={onRemoveFile}
        />
      </FormGroup>
    </div>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────
export function ProposalDrawer({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project: ProjectDetail;
}) {
  const router = useRouter();
  const addProposal = useProposalStore((s) => s.addProposal);
  const proposalType = getProposalType(project);
  const storageKey = `proposal_draft_${project.projectId}`;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState<FormState>(() => {
    const parsed = parseQty(project.quantity);
    return {
      ...EMPTY_FORM,
      proposedQtyValue: parsed.value,
      proposedQtyUnit: QTY_UNITS.includes(parsed.unit) ? parsed.unit : "kg",
    };
  });
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [saved, setSaved] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Field setter
  const set = useCallback(<K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  }, []);

  // ── Restore from localStorage on open ─────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed.form }));
        setFiles(parsed.files ?? []);
      }
    } catch { /* ignore */ }
  }, [open, storageKey]);

  // ── Auto-save (debounced 1.2s) ─────────────────────────────────────────────
  useEffect(() => {
    if (submitted) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ form, files }));
        setSaved(true);
      } catch { /* ignore */ }
    }, 1200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form, files, storageKey, submitted]);

  // ── Close on Escape ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // ── Body scroll lock ───────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAddFiles = (newFiles: UploadedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setSaved(false);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setSaved(false);
  };

  const handleSubmit = () => {
    addProposal({
      id: `PROP-${Date.now()}`,
      projectId: project.projectId,
      projectTitle: project.title,
      projectBadge: project.badge ?? "",
      proposalType,
      submittedDate: new Date().toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      }),
      status: "Proposal Sent",
      proposedQtyValue: form.proposedQtyValue,
      proposedQtyUnit: form.proposedQtyUnit,
      productSpec: form.productSpec,
      processNotes: form.processNotes,
      whyGoodFit: form.whyGoodFit,
      termsConditions: form.termsConditions,
      costValue: form.costValue,
      currency: form.currency,
      costUnit: form.costUnit,
      timeline: form.timeline,
      shipmentTerms: form.shipmentTerms,
      packaging: form.packaging,
      paymentTerms: form.paymentTerms,
      fileCount: files.length,
      cas: project.cas ?? "",
      productName: project.targetMolecule ?? "",
      industry: project.industry ?? "",
      negotiationPhase: "submitted",
      revisions: [],
    });
    localStorage.removeItem(storageKey);
    setSubmitted(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full z-50 flex flex-col bg-[#f7f8fa]",
          "w-full md:max-w-[540px] shadow-2xl",
          "transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* ── Fixed Header ──────────────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-white border-b border-[#e4e4e7] shadow-sm">
          {/* Drawer title row */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-[#f0faf5] flex items-center justify-center">
                <Send className="w-4 h-4 text-[#1F6F54]" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-[#020202] leading-tight">
                  Submit Proposal
                </h2>
                <p className="text-[11px] text-[#9ca3af]">
                  {proposalType} · {project.industry}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Auto-save indicator */}
              {!submitted && (
                <span className={cn(
                  "flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full",
                  saved
                    ? "bg-[#f0faf5] text-[#1F6F54]"
                    : "bg-[#fef3c7] text-[#92400e]",
                )}>
                  {saved
                    ? <><CheckCircle2 className="w-3 h-3" /> Saved</>
                    : <><Clock className="w-3 h-3" /> Saving…</>
                  }
                </span>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#71717a] hover:bg-[#f3f4f6] hover:text-[#020202] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Project summary card */}
          <div className="mx-5 mb-4 rounded-[12px] border border-[#e4e4e7] bg-[#f9fafb] p-3 flex items-center gap-3">
            <div className="w-[56px] h-[44px] rounded-[8px] overflow-hidden flex-shrink-0 bg-[#cfd8dc]">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#020202] line-clamp-1 leading-tight">
                {project.title}
              </p>
              <p className="text-[11px] text-[#62748e] mt-0.5">
                {project.projectId}
              </p>
            </div>
            <span className={cn(
              "flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border",
              submitted
                ? "bg-[#f0faf5] text-[#1F6F54] border-[#bbf7d0]"
                : "bg-[#fef3c7] text-[#92400e] border-[#fde68a]",
            )}>
              {submitted ? "Submitted" : "Draft"}
            </span>
          </div>
        </div>

        {/* ── Scrollable Form Body ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold border",
              proposalType === "RFQ"
                ? "bg-[#e3f4ff] text-[#0077CC] border-[#bae6fd]"
                : "bg-[#f0faf5] text-[#1F6F54] border-[#bbf7d0]",
            )}>
              {proposalType} Proposal
            </span>
            <span className="text-[12px] text-[#9ca3af]">
              Fill all required fields to submit
            </span>
          </div>

          {/* Dynamic form */}
          <div className="bg-white rounded-[14px] border border-[#e4e4e7] p-5 shadow-[0px_1px_4px_rgba(0,0,0,0.06)]">
            {proposalType === "RFQ" ? (
              <RFQForm
                form={form}
                set={set}
                files={files}
                onAddFiles={handleAddFiles}
                onRemoveFile={handleRemoveFile}
              />
            ) : (
              <CMOForm
                form={form}
                set={set}
                files={files}
                onAddFiles={handleAddFiles}
                onRemoveFile={handleRemoveFile}
              />
            )}
          </div>

          {/* Bottom spacing */}
          <div className="h-2" />
        </div>

        {/* ── Fixed Footer ───────────────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-white border-t border-[#e4e4e7] px-5 py-4 flex items-center justify-between gap-3">
          {submitted ? (
            <>
              {/* Success state footer */}
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-[10px] border border-[#e4e4e7] text-[14px] font-semibold text-[#62748e] hover:bg-[#f7f7f7] hover:text-[#353535] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => { onClose(); router.push("/dashboard/proposals"); }}
                className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-[10px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[14px] font-semibold transition-colors shadow-sm"
              >
                <ClipboardList className="w-4 h-4" /> Track your Proposal
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-[10px] border border-[#e4e4e7] text-[14px] font-semibold text-[#62748e] hover:bg-[#f7f7f7] hover:text-[#353535] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-[10px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[14px] font-semibold transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" /> Submit Proposal
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
