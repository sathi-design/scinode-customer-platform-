"use client";

import { useState, useEffect } from "react";
import { Plus, Award, Upload, Pencil, X, ImageIcon, FileText, ScrollText, ShieldCheck, Leaf, Globe, Trash2 } from "lucide-react";
import { FormField, inputCls, EmptyState, DrawerFooter } from "../SharedUI";
import { DrawerBase } from "../DrawerBase";
import { CERT_CATEGORIES } from "../constants";
import { useProfileStore } from "@/store/useProfileStore";
import type { Certificate } from "../types";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CertRow {
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  noExpiry: boolean;
  fileName: string;
  imageFile: string;
  documentFile: string;
}

const EMPTY_ROW: CertRow = {
  issuingAuthority: "", issueDate: "", expiryDate: "", noExpiry: false,
  fileName: "", imageFile: "", documentFile: "",
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function getCategoryForCert(name: string): string {
  return (
    CERT_CATEGORIES.find((cat) =>
      (cat.options as readonly string[]).includes(name)
    )?.label ?? ""
  );
}

// ─── Cert card styles by category ────────────────────────────────────────────

type CertStyle = {
  gradient: string;
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
};

const CATEGORY_STYLES: Record<string, CertStyle> = {
  "Basic Regulatory Compliance": {
    gradient: "from-[#f59e0b] to-[#fbbf24]",
    Icon: ScrollText,
    iconBg: "#fffbeb",
    iconColor: "#d97706",
  },
  "Product Licenses": {
    gradient: "from-[#2563eb] to-[#60a5fa]",
    Icon: FileText,
    iconBg: "#eff6ff",
    iconColor: "#2563eb",
  },
  "Quality & Accreditation": {
    gradient: "from-[#018E7E] to-[#34d399]",
    Icon: ShieldCheck,
    iconBg: "#f0faf5",
    iconColor: "#018E7E",
  },
  "Environment & Safety": {
    gradient: "from-[#059669] to-[#6ee7b7]",
    Icon: Leaf,
    iconBg: "#ecfdf5",
    iconColor: "#059669",
  },
  "Export & Trade": {
    gradient: "from-[#6366f1] to-[#a5b4fc]",
    Icon: Globe,
    iconBg: "#eef2ff",
    iconColor: "#4f46e5",
  },
};

const FALLBACK_STYLE: CertStyle = {
  gradient: "from-[#7c3aed] to-[#a78bfa]",
  Icon: Award,
  iconBg: "#f5f3ff",
  iconColor: "#7c3aed",
};

function getCertStyle(category: string): CertStyle {
  return CATEGORY_STYLES[category] ?? FALLBACK_STYLE;
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-[#f3f4f6] last:border-0 gap-2">
      <span className="text-[11px] text-[#9ca3af] flex-shrink-0">{label}</span>
      <span className="text-[11px] font-semibold text-[#020202] text-right">{value}</span>
    </div>
  );
}

// ─── Expiry badge ─────────────────────────────────────────────────────────────

function ExpiryBadge({ expiryDate, noExpiry }: { expiryDate: string; noExpiry: boolean }) {
  if (noExpiry) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]">
        No Expiry
      </span>
    );
  }
  if (!expiryDate) return null;

  const now = new Date();
  const exp = new Date(expiryDate);
  const diffMs = exp.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-[#fee2e2] text-[#991b1b] border-[#fecaca]">
        Expired
      </span>
    );
  }
  if (diffDays <= 30) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-[#fef3c7] text-[#92400e] border-[#fde68a]">
        Expires soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-[#dcfce7] text-[#14532d] border-[#bbf7d0]">
      Active
    </span>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────

function Pill({ label, selected, onClick }: {
  label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
        selected
          ? "bg-[#1F6F54] border-[#1F6F54] text-white"
          : "bg-white border-[#e4e4e7] text-[#62748e] hover:border-[#1F6F54]/50 hover:text-[#1F6F54]"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Cert form row (inside drawer) ────────────────────────────────────────────

function CertFormRow({ certName, data, onChange, onRemove }: {
  certName: string;
  data: CertRow;
  onChange: (field: keyof CertRow, value: string | boolean) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-[8px] border border-[#e4e4e7] p-4 flex flex-col gap-3 bg-[#fafafa]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#020202]">{certName}</p>
        <button
          type="button"
          onClick={onRemove}
          className="text-[#9ca3af] hover:text-red-500 transition-colors"
          title="Remove"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <FormField label="Issuing Authority">
        <input
          className={inputCls}
          value={data.issuingAuthority}
          onChange={(e) => onChange("issuingAuthority", e.target.value)}
          placeholder="Authority name"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Issue Date">
          <input
            className={inputCls}
            type="date"
            value={data.issueDate}
            onChange={(e) => onChange("issueDate", e.target.value)}
          />
        </FormField>
        <FormField label="Date of Expiry">
          <input
            className={inputCls}
            type="date"
            value={data.noExpiry ? "" : data.expiryDate}
            onChange={(e) => onChange("expiryDate", e.target.value)}
            disabled={data.noExpiry}
          />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-xs text-[#62748e] cursor-pointer -mt-1">
        <input
          type="checkbox"
          checked={data.noExpiry}
          onChange={(e) => onChange("noExpiry", e.target.checked)}
          className="w-3.5 h-3.5 rounded accent-[#1F6F54]"
        />
        No expiry date
      </label>

      {/* ── Split upload: image + document ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Certificate Image */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-[#62748e]">Certificate Image <span className="text-[#9ca3af] font-normal">(JPG / PNG)</span></p>
          <label className={`border-2 border-dashed rounded-[8px] p-3 cursor-pointer hover:border-[#1F6F54]/50 transition-colors ${data.imageFile ? "border-[#1F6F54]/40 bg-[#f0faf5]" : "border-[#e4e4e7] bg-white"}`}>
            {data.imageFile ? (
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#1F6F54] flex-shrink-0" />
                <span className="text-xs text-[#353535] truncate flex-1">{data.imageFile}</span>
                <button type="button" onClick={(e) => { e.preventDefault(); onChange("imageFile", ""); }} className="text-[#9ca3af] hover:text-red-500 flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#9ca3af]">
                <Upload className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">Browse or drag & drop</span>
              </div>
            )}
            <input type="file" accept="image/png,image/jpeg" className="hidden"
              onChange={(e) => onChange("imageFile", e.target.files?.[0]?.name ?? "")} />
          </label>
        </div>

        {/* Supporting Document */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-[#62748e]">Supporting Document <span className="text-[#9ca3af] font-normal">(PDF / DOC / DOCX)</span></p>
          <label className={`border-2 border-dashed rounded-[8px] p-3 cursor-pointer hover:border-[#1F6F54]/50 transition-colors ${data.documentFile ? "border-[#018E7E]/40 bg-[#f0faf5]" : "border-[#e4e4e7] bg-white"}`}>
            {data.documentFile ? (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#018E7E] flex-shrink-0" />
                <span className="text-xs text-[#353535] truncate flex-1">{data.documentFile}</span>
                <button type="button" onClick={(e) => { e.preventDefault(); onChange("documentFile", ""); }} className="text-[#9ca3af] hover:text-red-500 flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#9ca3af]">
                <Upload className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">Browse or drag & drop</span>
              </div>
            )}
            <input type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={(e) => onChange("documentFile", e.target.files?.[0]?.name ?? "")} />
          </label>
        </div>
      </div>
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function CertDrawer({ open, onClose, editingCert }: {
  open: boolean;
  onClose: () => void;
  editingCert: Certificate | null;
}) {
  const addCert    = useProfileStore((s) => s.addCert);
  const updateCert = useProfileStore((s) => s.updateCert);

  // Ordered list of selected cert names (preserves user selection order)
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  // Per-cert form data keyed by cert name
  const [certForms,     setCertForms]     = useState<Record<string, CertRow>>({});
  // "Other Certificate" section
  const [otherName,     setOtherName]     = useState("");
  const [otherForm,     setOtherForm]     = useState<CertRow>({ ...EMPTY_ROW });

  // Initialise / reset when drawer opens or editing target changes
  useEffect(() => {
    if (!open) return;
    if (editingCert) {
      if (editingCert.category === "Other") {
        setOtherName(editingCert.otherName);
        setOtherForm({
          issuingAuthority: editingCert.issuingAuthority,
          issueDate:        editingCert.issueDate,
          expiryDate:       editingCert.expiryDate,
          noExpiry:         editingCert.noExpiry,
          fileName:         editingCert.fileName,
          imageFile:        editingCert.imageFile ?? "",
          documentFile:     editingCert.documentFile ?? "",
        });
        setSelectedNames([]);
        setCertForms({});
      } else {
        const name = editingCert.name;
        setSelectedNames([name]);
        setCertForms({
          [name]: {
            issuingAuthority: editingCert.issuingAuthority,
            issueDate:        editingCert.issueDate,
            expiryDate:       editingCert.expiryDate,
            noExpiry:         editingCert.noExpiry,
            fileName:         editingCert.fileName,
            imageFile:        editingCert.imageFile ?? "",
            documentFile:     editingCert.documentFile ?? "",
          },
        });
        setOtherName("");
        setOtherForm({ ...EMPTY_ROW });
      }
    } else {
      setSelectedNames([]);
      setCertForms({});
      setOtherName("");
      setOtherForm({ ...EMPTY_ROW });
    }
  }, [open, editingCert]);

  const togglePill = (certName: string) => {
    if (selectedNames.includes(certName)) {
      setSelectedNames((p) => p.filter((n) => n !== certName));
      setCertForms((p) => { const next = { ...p }; delete next[certName]; return next; });
    } else {
      setSelectedNames((p) => [...p, certName]);
      setCertForms((p) => ({ ...p, [certName]: { ...EMPTY_ROW } }));
    }
  };

  const updateForm = (certName: string, field: keyof CertRow, value: string | boolean) => {
    setCertForms((p) => ({ ...p, [certName]: { ...p[certName], [field]: value } }));
  };

  const removeSelected = (certName: string) => {
    setSelectedNames((p) => p.filter((n) => n !== certName));
    setCertForms((p) => { const next = { ...p }; delete next[certName]; return next; });
  };

  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    // Validate: each selected cert needs at least one upload
    const errors: Record<string, string> = {};
    selectedNames.forEach((name) => {
      const f = certForms[name];
      if (!f?.imageFile && !f?.documentFile) {
        errors[name] = "Upload at least a certificate image or supporting document.";
      }
    });
    if (otherName.trim() && !otherForm.imageFile && !otherForm.documentFile) {
      errors["__other__"] = "Upload at least a certificate image or supporting document.";
    }
    if (Object.keys(errors).length > 0) {
      setUploadErrors(errors);
      return;
    }

    if (editingCert) {
      // Update single existing cert
      if (editingCert.category === "Other") {
        updateCert({ ...editingCert, otherName, ...otherForm });
      } else {
        updateCert({ ...editingCert, ...(certForms[editingCert.name] ?? EMPTY_ROW) });
      }
    } else {
      // Add each selected cert as a separate card
      selectedNames.forEach((name, i) => {
        addCert({
          id:             `${Date.now()}-${i}`,
          category:       getCategoryForCert(name),
          name,
          otherName:      "",
          ...(certForms[name] ?? EMPTY_ROW),
        });
      });
      // Add "Other" cert if name is filled
      if (otherName.trim()) {
        addCert({
          id:        `${Date.now()}-other`,
          category:  "Other",
          name:      "Other",
          otherName,
          ...otherForm,
        });
      }
    }
    onClose();
  };

  return (
    <DrawerBase
      open={open}
      onClose={onClose}
      title={editingCert ? "Edit Licence / Certification" : "Add Licence / Certification"}
      width={520}
      footer={
        <DrawerFooter
          onCancel={onClose}
          onSave={handleSave}
          saveLabel={editingCert ? "Update Certificate" : "Save Certificate"}
        />
      }
    >
      <div className="flex flex-col gap-6">

        {/* ── Category sections ─────────────────────────────────────────────── */}
        {CERT_CATEGORIES.map((cat) => {
          const selectedInCat = selectedNames.filter((n) =>
            (cat.options as readonly string[]).includes(n)
          );
          return (
            <div key={cat.label} className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-[#020202]">{cat.label}</p>

              {/* Pills */}
              <div className="flex flex-wrap gap-2">
                {cat.options.map((opt) => (
                  <Pill
                    key={opt}
                    label={opt}
                    selected={selectedNames.includes(opt)}
                    onClick={() => togglePill(opt)}
                  />
                ))}
              </div>

              {/* Dynamic form rows for selected certs in this category */}
              {selectedInCat.length > 0 && (
                <div className="flex flex-col gap-3">
                  {selectedInCat.map((name) => (
                    <div key={name}>
                      <CertFormRow
                        certName={name}
                        data={certForms[name] ?? EMPTY_ROW}
                        onChange={(field, value) => {
                          updateForm(name, field, value);
                          if (field === "imageFile" || field === "documentFile") {
                            setUploadErrors((p) => { const n = { ...p }; delete n[name]; return n; });
                          }
                        }}
                        onRemove={() => removeSelected(name)}
                      />
                      {uploadErrors[name] && (
                        <p className="text-xs text-red-500 mt-1 px-1">{uploadErrors[name]}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div className="border-t border-[#f3f4f6]" />

        {/* ── Other Certificate ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-[#020202]">Other Certificate</p>

          <FormField label="Certificate Name">
            <input
              className={inputCls}
              value={otherName}
              onChange={(e) => setOtherName(e.target.value)}
              placeholder="Enter certificate name"
            />
          </FormField>

          <FormField label="Issuing Authority">
            <input
              className={inputCls}
              value={otherForm.issuingAuthority}
              onChange={(e) => setOtherForm((p) => ({ ...p, issuingAuthority: e.target.value }))}
              placeholder="Authority name"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Issue Date">
              <input
                className={inputCls}
                type="date"
                value={otherForm.issueDate}
                onChange={(e) => setOtherForm((p) => ({ ...p, issueDate: e.target.value }))}
              />
            </FormField>
            <FormField label="Date of Expiry">
              <input
                className={inputCls}
                type="date"
                value={otherForm.noExpiry ? "" : otherForm.expiryDate}
                onChange={(e) => setOtherForm((p) => ({ ...p, expiryDate: e.target.value }))}
                disabled={otherForm.noExpiry}
              />
            </FormField>
          </div>

          <label className="flex items-center gap-2 text-xs text-[#62748e] cursor-pointer -mt-1">
            <input
              type="checkbox"
              checked={otherForm.noExpiry}
              onChange={(e) => setOtherForm((p) => ({ ...p, noExpiry: e.target.checked }))}
              className="w-3.5 h-3.5 rounded accent-[#1F6F54]"
            />
            No expiry date
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-[#62748e]">Certificate Image <span className="text-[#9ca3af] font-normal">(JPG / PNG)</span></p>
              <label className={`border-2 border-dashed rounded-[8px] p-3 cursor-pointer hover:border-[#1F6F54]/50 transition-colors ${otherForm.imageFile ? "border-[#1F6F54]/40 bg-[#f0faf5]" : "border-[#e4e4e7] bg-white"}`}>
                {otherForm.imageFile ? (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#1F6F54] flex-shrink-0" />
                    <span className="text-xs text-[#353535] truncate flex-1">{otherForm.imageFile}</span>
                    <button type="button" onClick={(e) => { e.preventDefault(); setOtherForm((p) => ({ ...p, imageFile: "" })); }} className="text-[#9ca3af] hover:text-red-500 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[#9ca3af]"><Upload className="w-4 h-4 flex-shrink-0" /><span className="text-xs">Browse or drag & drop</span></div>
                )}
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => setOtherForm((p) => ({ ...p, imageFile: e.target.files?.[0]?.name ?? "" }))} />
              </label>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-[#62748e]">Supporting Document <span className="text-[#9ca3af] font-normal">(PDF / DOC / DOCX)</span></p>
              <label className={`border-2 border-dashed rounded-[8px] p-3 cursor-pointer hover:border-[#1F6F54]/50 transition-colors ${otherForm.documentFile ? "border-[#018E7E]/40 bg-[#f0faf5]" : "border-[#e4e4e7] bg-white"}`}>
                {otherForm.documentFile ? (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#018E7E] flex-shrink-0" />
                    <span className="text-xs text-[#353535] truncate flex-1">{otherForm.documentFile}</span>
                    <button type="button" onClick={(e) => { e.preventDefault(); setOtherForm((p) => ({ ...p, documentFile: "" })); }} className="text-[#9ca3af] hover:text-red-500 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[#9ca3af]"><Upload className="w-4 h-4 flex-shrink-0" /><span className="text-xs">Browse or drag & drop</span></div>
                )}
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { setOtherForm((p) => ({ ...p, documentFile: e.target.files?.[0]?.name ?? "" })); setUploadErrors((p) => { const n = { ...p }; delete n["__other__"]; return n; }); }} />
              </label>
            </div>
          </div>
          {uploadErrors["__other__"] && (
            <p className="text-xs text-red-500">{uploadErrors["__other__"]}</p>
          )}
        </div>

      </div>
    </DrawerBase>
  );
}

// ─── Cert card (listing) ──────────────────────────────────────────────────────

function CertCard({ c, onEdit, onDelete }: {
  c: Certificate;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const displayName = c.name === "Other" ? c.otherName : c.name;
  const style = getCertStyle(c.category);
  const { Icon } = style;

  return (
    <div className="bg-white rounded-xl border border-[#e4e4e7] shadow-sm flex flex-col overflow-hidden">
      {/* Gradient stripe */}
      <div className={cn("h-1 bg-gradient-to-r", style.gradient)} />

      {/* Header: icon badge + cert name + expiry badge + actions */}
      <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-[6px] flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: style.iconBg }}
          >
            <Icon className="w-4 h-4" style={{ color: style.iconColor }} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium leading-none mb-0.5" style={{ color: style.iconColor }}>
              {c.category || "Other"}
            </p>
            <p className="text-sm font-bold text-[#020202] leading-snug truncate">{displayName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
          <button
            onClick={onEdit}
            className="text-[#9ca3af] hover:text-[#1F6F54] transition-colors p-0.5"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="text-[#9ca3af] hover:text-red-500 transition-colors p-0.5"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expiry badge */}
      <div className="px-4 pb-2">
        <ExpiryBadge expiryDate={c.expiryDate} noExpiry={c.noExpiry} />
      </div>

      {/* Detail rows */}
      <div className="px-4 pb-2 flex flex-col">
        {c.issuingAuthority && (
          <DetailRow label="Issued by" value={c.issuingAuthority} />
        )}
        {c.issueDate && (
          <DetailRow label="Issue Date" value={c.issueDate} />
        )}
        {!c.noExpiry && c.expiryDate && (
          <DetailRow label="Expires" value={c.expiryDate} />
        )}
      </div>

      {/* Upload indicator chips */}
      {(c.imageFile || c.documentFile) && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3 pt-1">
          {c.imageFile && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]">
              <ImageIcon className="w-2.5 h-2.5" /> Image
            </span>
          )}
          {c.documentFile && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#f5f3ff] text-[#7c3aed] border border-[#ede9fe]">
              <FileText className="w-2.5 h-2.5" /> Document
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export function LicencesCertifications({ onNext, onBack }: {
  onNext: () => void; onBack: () => void;
}) {
  const [open,        setOpen]        = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [showAll,     setShowAll]     = useState(false);

  const certs      = useProfileStore((s) => s.certs);
  const deleteCert = useProfileStore((s) => s.deleteCert);

  const openAdd  = () => { setEditingCert(null); setOpen(true); };
  const openEdit = (c: Certificate) => { setEditingCert(c); setOpen(true); };
  const handleClose = () => { setOpen(false); setEditingCert(null); };

  const PAGE = 6;
  const visibleCerts = showAll ? certs : certs.slice(0, PAGE);
  const hasMore = certs.length > PAGE;

  return (
    <>
      <CertDrawer open={open} onClose={handleClose} editingCert={editingCert} />

      <div className="flex flex-col">
        <div className="p-4 sm:p-6 pb-2">
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Certificate
            </button>
          </div>

          {certs.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No certifications added yet"
              subtitle="Click Add Certificate to add your quality and regulatory certifications."
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleCerts.map((c) => (
                  <CertCard
                    key={c.id}
                    c={c}
                    onEdit={() => openEdit(c)}
                    onDelete={() => deleteCert(c.id)}
                  />
                ))}
              </div>
              {hasMore && (
                <button
                  onClick={() => setShowAll((p) => !p)}
                  className="self-center text-sm font-medium text-[#1F6F54] hover:text-[#185C45] transition-colors underline-offset-2 hover:underline"
                >
                  {showAll ? "Show less" : `Show all ${certs.length}`}
                </button>
              )}
            </div>
          )}
        </div>
        {/* navigation handled by ProfileSetup header */}
      </div>
    </>
  );
}
