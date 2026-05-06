"use client";

import React, { useState, useEffect } from "react";
import { useState as useStateSearch, useRef, useEffect as useEffectSearch } from "react";
import { Plus, Microscope, Wrench, FlaskConical, Settings2, ChevronDown, ChevronUp, X, Search, AlertCircle, Trash2 } from "lucide-react";
import {
  FormField, inputCls, DropdownSelect, DrawerFooter, TabFooter, YNToggle,
} from "@/modules/profile/SharedUI";
import { DrawerBase } from "@/modules/profile/DrawerBase";
import { useIndependentCROProfileStore } from "@/store/useIndependentCROProfileStore";
import { CRO_LAB_EQUIPMENT_FULL, CRO_MOC_OPTIONS } from "../constants";
import type { CROLabEquip, CRODistillation, CROFilterDryer, CROOtherEquip } from "../types";
import { cn } from "@/lib/utils";

const FILTER_TYPES = [
  "Plate Frame Filter","ANF","ANFD","Basket Centrifuge","Sparkler Filter","Candle Filter",
  "Ultra Filtration","Micro Filtration","Nano Filtration","Leaf Filter","Continuous Separator",
  "Bag Filter","Sintered Metal Catalyst Filter","Line Filter","Filter Press","Box Filter",
  "Cartridge Filter","Ceramic Filter","Membrane Filter","Nutsche Filter","Pressure Filter",
  "Pressure Nutsche Filter","Sintered Cartridge Candle Filter","Vacuum Filter","Vacuum Nutsche Filter",
] as const;

const DRYER_TYPES = [
  "Continuous Fluidised Bed Dryer","Rotary Cone Vacuum Dryer","Rotary Vacuum Paddle Dryer",
  "Rotary Vacuum Dryer","Tray Dryer","Spray Fluid Dryer","Vacuum Tray Dryer","ATFD",
  "Drying Milling Equipment","Flask Freeze Dryer","Rotary Cone Dryer","Rotary Dryer",
  "Spin Flash Dryer","Spray Dryer","Vacuum Dryer",
] as const;

const DRYING_MEDIA = ["Hot Air","Hot Water","Steam","Hot Oil"] as const;
const PACKING_TYPES = ["Structured","Random"] as const;
const RANDOM_PACKING = ["Raschig","Pall","Saddle","Bubble Cap"] as const;

const OTHER_EQUIP_NAMES = [
  "Evaporators","Blenders","Extraction Columns","Adsorption Columns",
  "Size Reduction Equipments (Mills, Granulator, Crusher)","Settler / Clarifier Parameters",
] as const;

const OTHER_EQUIP_SUBTYPES: Record<string, string[]> = {
  "Evaporators": ["Multiple Effect Evaporator","Agitated Thin Film Evaporator","Falling Film Evaporator","Rising Film Evaporator","Plate Evaporator","Multiple Effect Evaporator with ATFD","Rotary Evaporator","Wiped Film Evaporator"],
  "Blenders": ["Ribbon","Octagonal","Double Cone","V-Blender","Paddle Mixer"],
  "Extraction Columns": ["Liquid-Liquid Exchange","Ion-Exchange Column","Solid-Liquid Extraction Column"],
  "Adsorption Columns": ["Fixed Bed","Moving Bed","Pressure Swing Adsorption","Gas/Liquid Adsorption","Fluidised Bed"],
  "Size Reduction Equipments (Mills, Granulator, Crusher)": ["Multi Mill","Ball Mill","Hammer Mill","Jet Mill","Crusher","Colloid Mill","Air Jet Mill","Pin Mill","Granulator"],
  "Settler / Clarifier Parameters": ["Gravity Settler","Lamella Clarifier","Oil-Water Separator","Solid-Liquid Settler","Overflow-Weir Settler","Phase Separator"],
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon, title, count, open, onToggle, onAdd, addLabel,
}: {
  icon: React.ElementType; title: string; count: number;
  open: boolean; onToggle: () => void; onAdd: () => void; addLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <button onClick={onToggle} className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-[6px] bg-[#f0faf5] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#1F6F54]" />
        </div>
        <span className="text-sm font-semibold text-[#020202]">{title}</span>
        {count > 0 && (
          <span className="text-xs bg-[#f0faf5] text-[#1F6F54] border border-[#1F6F54]/20 px-2 py-0.5 rounded-full font-medium">{count}</span>
        )}
        {open ? <ChevronUp className="w-4 h-4 text-[#9ca3af]" /> : <ChevronDown className="w-4 h-4 text-[#9ca3af]" />}
      </button>
      <button onClick={onAdd}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-xs font-medium transition-colors">
        <Plus className="w-3.5 h-3.5" /> {addLabel}
      </button>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-[#f3f4f6] last:border-0 gap-2">
      <span className="text-[11px] text-[#9ca3af] flex-shrink-0">{label}</span>
      <span className="text-[11px] font-semibold text-[#020202] text-right">{value}</span>
    </div>
  );
}

function ItemCard({
  label, sub, onDelete, gradient, sectionLabel, iconColor, isRare,
}: {
  label: string; sub?: string; onDelete: () => void;
  gradient?: string; sectionLabel?: string; iconColor?: string; isRare?: boolean;
}) {
  const subParts = sub ? sub.split(" · ").filter(Boolean) : [];
  return (
    <div className="bg-white rounded-xl border border-[#e4e4e7] shadow-sm flex flex-col overflow-hidden">
      {gradient && <div className={cn("h-1 bg-gradient-to-r", gradient)} />}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {sectionLabel && (
            <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: iconColor ?? "#1F6F54" }}>
              {sectionLabel}
            </p>
          )}
          <p className="text-sm font-bold text-[#020202] leading-snug line-clamp-2">{label}</p>
        </div>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-[#d1d5db] hover:text-red-500 transition-colors flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {subParts.length > 0 && (
        <div className="px-3 pb-2 border-t border-[#f3f4f6] pt-2 flex flex-col flex-1">
          {subParts.map((part, i) => {
            const colonIdx = part.indexOf(": ");
            if (colonIdx > 0) {
              return <DetailRow key={i} label={part.slice(0, colonIdx)} value={part.slice(colonIdx + 2)} />;
            }
            return <p key={i} className="text-[11px] text-[#9ca3af] py-1">{part}</p>;
          })}
        </div>
      )}
      {isRare && (
        <div className="px-3 pb-3">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#6d28d9] border border-[#ddd6fe]">🔬 RARE EQUIPMENT</span>
        </div>
      )}
    </div>
  );
}

function CollapsibleEquipGrid<T extends { id: string }>({
  items, renderItem, emptyText,
}: {
  items: T[]; renderItem: (item: T) => React.ReactNode; emptyText: string;
}) {
  const [showAll, setShowAll] = React.useState(false);
  const LIMIT = 4;
  const visible = showAll ? items : items.slice(0, LIMIT);
  if (items.length === 0) return <p className="text-xs text-[#9ca3af] py-4 text-center">{emptyText}</p>;
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((item) => renderItem(item))}
      </div>
      {items.length > LIMIT && (
        <button type="button" onClick={() => setShowAll((s) => !s)}
          className="mt-3 text-xs font-semibold text-[#1F6F54] hover:text-[#185C45] transition-colors">
          {showAll ? "↑ Show less" : `↓ Show all ${items.length}`}
        </button>
      )}
    </div>
  );
}

const RARE_BANNER = "Rare equipment includes specialized analytical or process tools that are not commonly available (e.g., LCMS, HRMS, specialized high-pressure reactors).";

// ─── Rare equipment banner (visible, no hover) ────────────────────────────────
function RareEquipField({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 accent-[#1F6F54] flex-shrink-0"
        />
        <span className="text-sm font-medium text-[#020202]">Mark as Rare Equipment</span>
      </label>
      <div className="flex items-start gap-2 rounded-[8px] bg-[#fffbeb] border border-[#fde68a] px-3 py-2.5">
        <AlertCircle className="w-3.5 h-3.5 text-[#b45309] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#92400e] leading-relaxed">{RARE_BANNER}</p>
      </div>
    </div>
  );
}

// ─── Typeahead search dropdown for long option lists ──────────────────────────
function TypeaheadSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: readonly string[]; placeholder?: string;
}) {
  const [query, setQuery] = useStateSearch("");
  const [open, setOpen]   = useStateSearch(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffectSearch(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (opt: string) => { onChange(opt); setQuery(""); setOpen(false); };
  const clear  = () => { onChange(""); setQuery(""); };

  return (
    <div className="relative" ref={ref}>
      <div className={inputCls + " flex items-center gap-2 h-auto min-h-[38px] px-3 py-2 cursor-text"} onClick={() => setOpen(true)}>
        <Search className="w-3.5 h-3.5 text-[#9ca3af] flex-shrink-0" />
        {value && !open ? (
          <span className="flex-1 text-sm text-[#020202] truncate">{value}</span>
        ) : (
          <input
            autoFocus={open}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={value || placeholder || "Type to search…"}
            className="flex-1 outline-none text-sm bg-transparent placeholder:text-[#9ca3af]"
          />
        )}
        {value && (
          <button type="button" onClick={(e) => { e.stopPropagation(); clear(); }} className="text-[#9ca3af] hover:text-[#62748e]">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-[#cbd5e1] rounded-[6px] shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[#9ca3af]">No matches found</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt} type="button"
                onClick={() => select(opt)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-[#f0faf5] transition-colors border-b border-[#f3f4f6] last:border-b-0 ${value === opt ? "bg-[#f0faf5] text-[#1F6F54] font-medium" : "text-[#353535]"}`}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Inline validation error ──────────────────────────────────────────────────
function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 flex-shrink-0" />{msg}</p>;
}

// ─── 1. Lab Equipment Drawer ──────────────────────────────────────────────────

const LAB_EMPTY: Omit<CROLabEquip, "id"> = { equipType: "", equipOther: "", count: "", make: "", isRare: false };

function LabEquipDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (e: CROLabEquip) => void;
}) {
  const [form, setForm] = useState<Omit<CROLabEquip, "id">>(LAB_EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => { if (!open) { setForm(LAB_EMPTY); setErrors({}); } }, [open]);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k as string]: "" }));
  };

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!form.equipType) errs.equipType = "Equipment type is required.";
    if (!form.count) errs.count = "Count is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, id: Date.now().toString() });
    onClose();
  };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Lab Equipment" width={540}
      footer={<DrawerFooter onCancel={onClose} onSave={handleSave} saveLabel="Save Equipment" />}>
      <div className="flex flex-col gap-4">
        <FormField label={<>Equipment Type <span className="text-red-500">*</span></>}
          hint="Type to search from 80+ equipment types">
          <TypeaheadSelect
            value={form.equipType}
            onChange={(v) => { set("equipType", v); set("equipOther", ""); }}
            options={CRO_LAB_EQUIPMENT_FULL}
            placeholder="Search equipment type…"
          />
          <FieldError msg={errors.equipType ?? ""} />
        </FormField>
        {form.equipType === "Other" && (
          <FormField label="Specify Equipment">
            <input className={inputCls} value={form.equipOther} onChange={(e) => set("equipOther", e.target.value)} placeholder="Describe the equipment" />
          </FormField>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={<>Count <span className="text-red-500">*</span></>}>
            <input className={`${inputCls} ${errors.count ? "border-red-400 focus:ring-red-300" : ""}`}
              type="number" min="1" value={form.count}
              onChange={(e) => set("count", e.target.value)} placeholder="e.g. 2" />
            <FieldError msg={errors.count ?? ""} />
          </FormField>
          <FormField label="Make">
            <input className={inputCls} value={form.make} onChange={(e) => set("make", e.target.value)} placeholder="e.g. Agilent, Waters" />
          </FormField>
        </div>
        <RareEquipField checked={form.isRare} onChange={(v) => set("isRare", v)} />
      </div>
    </DrawerBase>
  );
}

// ─── 2. Distillation Drawer ───────────────────────────────────────────────────

const DIST_EMPTY: Omit<CRODistillation, "id"> = {
  distType: "Batch", distTypeOther: "", moc: "", colDiameter: "", colHeight: "",
  capacity: "", count: "", packingType: "", packingMake: "", packingRandom: "", tempRange: "", pressureRange: "",
};

function DistillationDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (d: CRODistillation) => void;
}) {
  const [form, setForm] = useState<Omit<CRODistillation, "id">>(DIST_EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => { if (!open) { setForm(DIST_EMPTY); setErrors({}); } }, [open]);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k as string]: "" }));
  };
  const capacityUnit = form.distType === "Continuous" ? "Kg/Hr" : "KL";

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!form.capacity) errs.capacity = "Capacity is required.";
    if (!form.count)    errs.count    = "Count is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, id: Date.now().toString() });
    onClose();
  };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Distillation" width={540}
      footer={<DrawerFooter onCancel={onClose} onSave={handleSave} saveLabel="Save Equipment" />}>
      <div className="flex flex-col gap-4">
        <FormField label={<>Type <span className="text-red-500">*</span></>}>
          <div className="flex rounded-[6px] overflow-hidden border border-[#cbd5e1] w-fit">
            {(["Batch", "Continuous", "Other"] as const).map((t) => (
              <button key={t} type="button" onClick={() => { set("distType", t); set("distTypeOther", ""); }}
                className={`px-5 py-2 text-sm font-medium transition-colors ${form.distType === t ? "bg-[#1F6F54] text-white" : "bg-white text-[#71717a] hover:bg-[#f7f7f7]"}`}>{t}</button>
            ))}
          </div>
        </FormField>
        {form.distType === "Other" && (
          <FormField label="Specify Type"><input className={inputCls} value={form.distTypeOther} onChange={(e) => set("distTypeOther", e.target.value)} placeholder="Enter distillation type" /></FormField>
        )}
        <FormField label="MOC (Material of Construction)">
          <DropdownSelect value={form.moc} onChange={(v) => set("moc", v)} options={CRO_MOC_OPTIONS} placeholder="Select MOC" />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Column Diameter"><input className={inputCls} value={form.colDiameter} onChange={(e) => set("colDiameter", e.target.value)} placeholder="e.g. 800 mm" /></FormField>
          <FormField label="Column Length / Height"><input className={inputCls} value={form.colHeight} onChange={(e) => set("colHeight", e.target.value)} placeholder="e.g. 6 m" /></FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={<>Total Distillation Capacity ({capacityUnit}) <span className="text-red-500">*</span></>}>
            <input className={`${inputCls} ${errors.capacity ? "border-red-400" : ""}`} type="number" min="0" value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)} placeholder={form.distType === "Continuous" ? "e.g. 500" : "e.g. 10"} />
            <FieldError msg={errors.capacity ?? ""} />
          </FormField>
          <FormField label={<>Count <span className="text-red-500">*</span></>}>
            <input className={`${inputCls} ${errors.count ? "border-red-400" : ""}`} type="number" min="1" value={form.count}
              onChange={(e) => set("count", e.target.value)} placeholder="e.g. 2" />
            <FieldError msg={errors.count ?? ""} />
          </FormField>
        </div>
        <FormField label="Packing Type">
          <DropdownSelect value={form.packingType} onChange={(v) => { set("packingType", v); set("packingMake", ""); set("packingRandom", ""); }} options={PACKING_TYPES} placeholder="Select packing type" />
        </FormField>
        {form.packingType === "Structured" && (
          <FormField label="Make (Structured Packing)"><input className={inputCls} value={form.packingMake} onChange={(e) => set("packingMake", e.target.value)} placeholder="e.g. Sulzer, Koch-Glitsch" /></FormField>
        )}
        {form.packingType === "Random" && (
          <FormField label="Packing Material">
            <DropdownSelect value={form.packingRandom} onChange={(v) => set("packingRandom", v)} options={RANDOM_PACKING} placeholder="Select packing material" />
          </FormField>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Temp Range"><input className={inputCls} value={form.tempRange} onChange={(e) => set("tempRange", e.target.value)} placeholder="e.g. 20 – 180°C" /></FormField>
          <FormField label="Pressure Range"><input className={inputCls} value={form.pressureRange} onChange={(e) => set("pressureRange", e.target.value)} placeholder="e.g. 0.1 – 10 bar" /></FormField>
        </div>
      </div>
    </DrawerBase>
  );
}

// ─── 3. Filter & Dryer Drawer ─────────────────────────────────────────────────

const FD_EMPTY: Omit<CROFilterDryer, "id"> = { category: "Filter", equipType: "", capacity: "", moc: "", dryingMedia: "" };

function FilterDryerDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (f: CROFilterDryer) => void;
}) {
  const [form, setForm] = useState<Omit<CROFilterDryer, "id">>(FD_EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => { if (!open) { setForm(FD_EMPTY); setErrors({}); } }, [open]);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k as string]: "" }));
  };
  const typeOptions = form.category === "Filter" ? FILTER_TYPES : DRYER_TYPES;

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!form.equipType) errs.equipType = "Type is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, id: Date.now().toString() });
    onClose();
  };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Filter & Dryer" width={540}
      footer={<DrawerFooter onCancel={onClose} onSave={handleSave} saveLabel="Save Equipment" />}>
      <div className="flex flex-col gap-4">
        <FormField label="Category">
          <div className="flex rounded-[6px] overflow-hidden border border-[#cbd5e1] w-fit">
            {(["Filter", "Dryer"] as const).map((cat) => (
              <button key={cat} type="button" onClick={() => { set("category", cat); set("equipType", ""); set("dryingMedia", ""); }}
                className={`px-6 py-2 text-sm font-medium transition-colors ${form.category === cat ? "bg-[#1F6F54] text-white" : "bg-white text-[#71717a] hover:bg-[#f7f7f7]"}`}>{cat}</button>
            ))}
          </div>
        </FormField>
        <FormField label={<>Type <span className="text-red-500">*</span></>}>
          <DropdownSelect value={form.equipType} onChange={(v) => set("equipType", v)} options={typeOptions} placeholder="Select type" />
          <FieldError msg={errors.equipType ?? ""} />
        </FormField>
        <FormField label="Capacity"><input className={inputCls} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="e.g. 500 L" /></FormField>
        <FormField label="MOC (Material of Construction)">
          <DropdownSelect value={form.moc} onChange={(v) => set("moc", v)} options={CRO_MOC_OPTIONS} placeholder="Select MOC" />
        </FormField>
        {form.category === "Dryer" && (
          <FormField label="Drying Media">
            <DropdownSelect value={form.dryingMedia} onChange={(v) => set("dryingMedia", v)} options={DRYING_MEDIA} placeholder="Select drying media" />
          </FormField>
        )}
      </div>
    </DrawerBase>
  );
}

// ─── 4. Other Equipment Drawer ────────────────────────────────────────────────

const OTHER_EMPTY: Omit<CROOtherEquip, "id"> = { equipName: "", subType: "", moc: "", capacity: "", count: "", notes: "", isRare: false };

function OtherEquipDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (o: CROOtherEquip) => void;
}) {
  const [form, setForm] = useState<Omit<CROOtherEquip, "id">>(OTHER_EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => { if (!open) { setForm(OTHER_EMPTY); setErrors({}); } }, [open]);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k as string]: "" }));
  };
  const subtypes = form.equipName ? (OTHER_EQUIP_SUBTYPES[form.equipName] ?? []) : [];

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!form.equipName) errs.equipName = "Equipment name is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, id: Date.now().toString() });
    onClose();
  };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Other Equipment" width={540}
      footer={<DrawerFooter onCancel={onClose} onSave={handleSave} saveLabel="Save Equipment" />}>
      <div className="flex flex-col gap-4">
        <FormField label={<>Equipment Name <span className="text-red-500">*</span></>}>
          <TypeaheadSelect
            value={form.equipName}
            onChange={(v) => { set("equipName", v); set("subType", ""); }}
            options={OTHER_EQUIP_NAMES}
            placeholder="Search or select equipment…"
          />
          <FieldError msg={errors.equipName ?? ""} />
        </FormField>
        {subtypes.length > 0 && (
          <FormField label="Sub-Type">
            <DropdownSelect value={form.subType} onChange={(v) => set("subType", v)} options={subtypes as string[]} placeholder="Select type" />
          </FormField>
        )}
        <FormField label="MOC (Material of Construction)">
          <DropdownSelect value={form.moc} onChange={(v) => set("moc", v)} options={CRO_MOC_OPTIONS} placeholder="Select MOC" />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Capacity"><input className={inputCls} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="e.g. 500 L" /></FormField>
          <FormField label="Count"><input className={inputCls} type="number" min="1" value={form.count} onChange={(e) => set("count", e.target.value)} placeholder="e.g. 2" /></FormField>
        </div>
        <FormField label="Notes">
          <textarea className={inputCls + " resize-none"} rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any additional details…" />
        </FormField>
        <RareEquipField checked={form.isRare} onChange={(v) => set("isRare", v)} />
      </div>
    </DrawerBase>
  );
}

// ─── Pilot plant gate message ─────────────────────────────────────────────────

function PilotPlantGate() {
  return (
    <div className="rounded-[10px] border border-[#fde68a] bg-[#fffbeb] p-4 text-sm text-[#92400e]">
      Pilot/Manufacturing plant sections are available once you confirm you have a Pilot Plant in the Company Profile tab.
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

interface Props { onNext: () => void; onBack: () => void; }

export function Tab5Equipment({ onNext, onBack }: Props) {
  const [labOpen,   setLabOpen]   = useState(false);
  const [distOpen,  setDistOpen]  = useState(false);
  const [fdOpen,    setFdOpen]    = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);

  const [labExpanded,   setLabExpanded]   = useState(true);
  const [distExpanded,  setDistExpanded]  = useState(true);
  const [fdExpanded,    setFdExpanded]    = useState(true);
  const [otherExpanded, setOtherExpanded] = useState(true);

  const company          = useIndependentCROProfileStore((s) => s.company);
  const labEquipments    = useIndependentCROProfileStore((s) => s.labEquipments);
  const distillationItems = useIndependentCROProfileStore((s) => s.distillationItems);
  const filterDryerItems  = useIndependentCROProfileStore((s) => s.filterDryerItems);
  const otherEquipItems   = useIndependentCROProfileStore((s) => s.otherEquipItems);
  const addLabEquip      = useIndependentCROProfileStore((s) => s.addLabEquip);
  const deleteLabEquip   = useIndependentCROProfileStore((s) => s.deleteLabEquip);
  const addDistillation  = useIndependentCROProfileStore((s) => s.addDistillation);
  const deleteDistillation = useIndependentCROProfileStore((s) => s.deleteDistillation);
  const addFilterDryer   = useIndependentCROProfileStore((s) => s.addFilterDryer);
  const deleteFilterDryer = useIndependentCROProfileStore((s) => s.deleteFilterDryer);
  const addOtherEquip    = useIndependentCROProfileStore((s) => s.addOtherEquip);
  const deleteOtherEquip = useIndependentCROProfileStore((s) => s.deleteOtherEquip);

  return (
    <>
      <LabEquipDrawer  open={labOpen}   onClose={() => setLabOpen(false)}   onSave={addLabEquip} />
      <DistillationDrawer open={distOpen} onClose={() => setDistOpen(false)} onSave={addDistillation} />
      <FilterDryerDrawer  open={fdOpen}   onClose={() => setFdOpen(false)}   onSave={addFilterDryer} />
      <OtherEquipDrawer   open={otherOpen} onClose={() => setOtherOpen(false)} onSave={addOtherEquip} />

      <div className="flex flex-col">
        <div className="p-4 sm:p-6 pb-2 flex flex-col gap-6">

          {/* Lab Equipment */}
          <div className="flex flex-col gap-3">
            <SectionHeader icon={Microscope} title="Lab Equipments" count={labEquipments.length}
              open={labExpanded} onToggle={() => setLabExpanded((v) => !v)}
              onAdd={() => setLabOpen(true)} addLabel="Add Lab Equipment" />
            {labExpanded && (
              <CollapsibleEquipGrid
                items={labEquipments}
                emptyText="No lab equipment added yet."
                renderItem={(e) => (
                  <ItemCard key={e.id}
                    label={e.equipType === "Other" ? `Other: ${e.equipOther}` : e.equipType}
                    sub={[e.make && `Make: ${e.make}`, e.count && `Qty: ${e.count}`].filter(Boolean).join(" · ")}
                    gradient="from-[#018E7E] to-[#34d399]"
                    sectionLabel="Lab Equipment"
                    iconColor="#018E7E"
                    isRare={e.isRare}
                    onDelete={() => deleteLabEquip(e.id)} />
                )}
              />
            )}
          </div>

          <div className="border-t border-[#f3f4f6]" />

          {/* Distillation */}
          {company.pilotPlant === true ? (
            <div className="flex flex-col gap-3">
              <SectionHeader icon={Wrench} title="Distillation" count={distillationItems.length}
                open={distExpanded} onToggle={() => setDistExpanded((v) => !v)}
                onAdd={() => setDistOpen(true)} addLabel="Add Distillation" />
              {distExpanded && (
                <CollapsibleEquipGrid
                  items={distillationItems}
                  emptyText="No distillation equipment added yet."
                  renderItem={(e) => (
                    <ItemCard key={e.id}
                      label={`${e.distType === "Other" ? e.distTypeOther : e.distType} Distillation${e.moc ? ` — ${e.moc}` : ""}`}
                      sub={[e.capacity && `Capacity: ${e.capacity} ${e.distType === "Continuous" ? "Kg/Hr" : "KL"}`, e.count && `Qty: ${e.count}`, e.tempRange && `Temp: ${e.tempRange}`].filter(Boolean).join(" · ")}
                      gradient="from-[#2563eb] to-[#60a5fa]"
                      sectionLabel="Distillation"
                      iconColor="#2563eb"
                      onDelete={() => deleteDistillation(e.id)} />
                  )}
                />
              )}
            </div>
          ) : <PilotPlantGate />}

          <div className="border-t border-[#f3f4f6]" />

          {/* Filter & Dryer */}
          {company.pilotPlant === true ? (
            <div className="flex flex-col gap-3">
              <SectionHeader icon={FlaskConical} title="Filter & Dryer" count={filterDryerItems.length}
                open={fdExpanded} onToggle={() => setFdExpanded((v) => !v)}
                onAdd={() => setFdOpen(true)} addLabel="Add Filter & Dryer" />
              {fdExpanded && (
                <CollapsibleEquipGrid
                  items={filterDryerItems}
                  emptyText="No filter or dryer equipment added yet."
                  renderItem={(e) => (
                    <ItemCard key={e.id}
                      label={e.equipType || e.category}
                      sub={[e.category, e.capacity && `Capacity: ${e.capacity}`, e.moc && `MOC: ${e.moc}`, e.dryingMedia && `Media: ${e.dryingMedia}`].filter(Boolean).join(" · ")}
                      gradient="from-[#d97706] to-[#fbbf24]"
                      sectionLabel="Filter / Dryer"
                      iconColor="#d97706"
                      onDelete={() => deleteFilterDryer(e.id)} />
                  )}
                />
              )}
            </div>
          ) : <PilotPlantGate />}

          <div className="border-t border-[#f3f4f6]" />

          {/* Other Equipment */}
          {company.pilotPlant === true ? (
            <div className="flex flex-col gap-3">
              <SectionHeader icon={Settings2} title="Other Equipments" count={otherEquipItems.length}
                open={otherExpanded} onToggle={() => setOtherExpanded((v) => !v)}
                onAdd={() => setOtherOpen(true)} addLabel="Add Other Equipment" />
              {otherExpanded && (
                <CollapsibleEquipGrid
                  items={otherEquipItems}
                  emptyText="No other equipment added yet."
                  renderItem={(e) => (
                    <ItemCard key={e.id}
                      label={`${e.equipName}${e.subType ? ` — ${e.subType}` : ""}`}
                      sub={[e.capacity && `Capacity: ${e.capacity}`, e.count && `Qty: ${e.count}`, e.moc && `MOC: ${e.moc}`].filter(Boolean).join(" · ")}
                      gradient="from-[#7c3aed] to-[#a78bfa]"
                      sectionLabel="Other Equipment"
                      iconColor="#7c3aed"
                      isRare={e.isRare}
                      onDelete={() => deleteOtherEquip(e.id)} />
                  )}
                />
              )}
            </div>
          ) : <PilotPlantGate />}

        </div>
        <TabFooter onSave={onNext} onBack={onBack} />
      </div>
    </>
  );
}
