"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Wrench, FlaskConical, Microscope, Settings2, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  FormField, inputCls, DropdownSelect,
  DrawerFooter, SectionLabel,
} from "../SharedUI";
import { DrawerBase } from "../DrawerBase";
import {
  MOC_OPTIONS, DISTILLATION_TYPES, PACKING_TYPES, RANDOM_PACKING_OPTIONS,
  FILTER_TYPES, DRYER_TYPES, DRYING_MEDIA, LAB_EQUIPMENT_TYPES,
  OTHER_EQUIPMENT_NAMES, OTHER_EQUIPMENT_SUBTYPES,
} from "../constants";
import { useProfileStore } from "@/store/useProfileStore";
import type { DistillationItem, FilterDryerItem, LabEquipItem, OtherEquipItem } from "../types";

// ─── Section header ───────────────────────────────────────────────────────────

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
          <span className="text-xs bg-[#f0faf5] text-[#1F6F54] border border-[#1F6F54]/20 px-2 py-0.5 rounded-full font-medium">
            {count}
          </span>
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

function ItemCard({ label, sub, onDelete, gradient, accentLabel }: {
  label: string; sub: string; onDelete: () => void;
  gradient?: string; accentLabel?: string;
}) {
  const details = sub
    ? sub.split(" · ").map((part) => {
        const colonIdx = part.indexOf(": ");
        if (colonIdx !== -1) {
          return { key: part.slice(0, colonIdx), val: part.slice(colonIdx + 2) };
        }
        return { key: part, val: "" };
      })
    : [];

  return (
    <div className="bg-white rounded-xl border border-[#e4e4e7] shadow-sm flex flex-col">
      {gradient && <div className={cn("h-1 bg-gradient-to-r rounded-t-xl", gradient)} />}
      {/* Header */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {accentLabel && (
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#9ca3af] mb-0.5">{accentLabel}</p>
          )}
          <p className="text-sm font-bold text-[#020202] leading-snug">{label}</p>
        </div>
        <button onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 text-[#d1d5db] hover:text-red-500 transition-colors flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Details */}
      {details.length > 0 && (
        <div className="px-3 pb-3 border-t border-[#f3f4f6] pt-2 flex flex-col flex-1">
          {details.map(({ key, val }, i) =>
            val
              ? <DetailRow key={i} label={key} value={val} />
              : <p key={i} className="text-[11px] text-[#9ca3af] py-1">{key}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 1. Distillation ──────────────────────────────────────────────────────────

const DIST_EMPTY: Omit<DistillationItem, "id"> = {
  type: "Batch", typeOther: "", moc: "", mocOther: "",
  colDiameter: "", colHeight: "", totalCapacity: "", count: "",
  packingType: "", packingMake: "", packingRandom: "",
  tempRange: "", pressureRange: "",
};

function DistillationDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (e: DistillationItem) => void;
}) {
  const [form, setForm] = useState<Omit<DistillationItem, "id">>(DIST_EMPTY);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));
  const capacityUnit = form.type === "Continuous" ? "Kg/Hr" : "KL";

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Distillation Equipment"
      footer={<DrawerFooter onCancel={onClose} onSave={() => {
        onSave({ ...form, id: Date.now().toString() });
        setForm(DIST_EMPTY); onClose();
      }} saveLabel="Save Equipment" />}>
      <div className="flex flex-col gap-4">
        <FormField label="Type *">
          <div className="flex rounded-[6px] overflow-hidden border border-[#cbd5e1] w-fit">
            {(["Batch", "Continuous", "Other"] as const).map((t) => (
              <button key={t} type="button"
                onClick={() => { set("type", t); set("typeOther", ""); }}
                className={`px-5 py-2 text-sm font-medium transition-colors ${
                  form.type === t ? "bg-[#1F6F54] text-white" : "bg-white text-[#71717a] hover:bg-[#f7f7f7]"
                }`}>{t}</button>
            ))}
          </div>
        </FormField>
        {form.type === "Other" && (
          <FormField label="Specify Type">
            <input className={inputCls} value={form.typeOther}
              onChange={(e) => set("typeOther", e.target.value)} placeholder="Enter distillation type" />
          </FormField>
        )}
        <FormField label="MOC (Material of Construction)">
          <DropdownSelect
            value={form.moc}
            onChange={(v) => set("moc", v)}
            options={[...MOC_OPTIONS, "Other"]}
            placeholder="Select MOC"
          />
        </FormField>
        {form.moc === "Other" && (
          <FormField label="Specify MOC">
            <input className={inputCls} value={form.mocOther}
              onChange={(e) => set("mocOther", e.target.value)} placeholder="Enter MOC" />
          </FormField>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Column Diameter">
            <input className={inputCls} value={form.colDiameter}
              onChange={(e) => set("colDiameter", e.target.value)} placeholder="e.g. 800 mm" />
          </FormField>
          <FormField label="Column Length / Height">
            <input className={inputCls} value={form.colHeight}
              onChange={(e) => set("colHeight", e.target.value)} placeholder="e.g. 6 m" />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={`Total Distillation Capacity (${capacityUnit})`}>
            <input className={inputCls} type="number" min="0" value={form.totalCapacity}
              onChange={(e) => set("totalCapacity", e.target.value)}
              placeholder={form.type === "Continuous" ? "e.g. 500" : "e.g. 10"} />
          </FormField>
          <FormField label="Count">
            <input className={inputCls} type="number" min="1" value={form.count}
              onChange={(e) => set("count", e.target.value)} placeholder="e.g. 2" />
          </FormField>
        </div>
        <FormField label="Packing Type">
          <DropdownSelect
            value={form.packingType}
            onChange={(v) => { set("packingType", v); set("packingMake", ""); set("packingRandom", ""); }}
            options={PACKING_TYPES}
            placeholder="Select packing type"
          />
        </FormField>
        {form.packingType === "Structured" && (
          <FormField label="Make (Structured Packing)">
            <input className={inputCls} value={form.packingMake}
              onChange={(e) => set("packingMake", e.target.value)} placeholder="e.g. Sulzer, Koch-Glitsch" />
          </FormField>
        )}
        {form.packingType === "Random" && (
          <FormField label="Packing Material">
            <DropdownSelect
              value={form.packingRandom}
              onChange={(v) => set("packingRandom", v)}
              options={RANDOM_PACKING_OPTIONS}
              placeholder="Select packing material"
            />
          </FormField>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Temp Range">
            <input className={inputCls} value={form.tempRange}
              onChange={(e) => set("tempRange", e.target.value)} placeholder="e.g. 20 – 180°C" />
          </FormField>
          <FormField label="Pressure Range">
            <input className={inputCls} value={form.pressureRange}
              onChange={(e) => set("pressureRange", e.target.value)} placeholder="e.g. 0.1 – 10 bar" />
          </FormField>
        </div>
      </div>
    </DrawerBase>
  );
}

// ─── 2. Filtration & Drying ───────────────────────────────────────────────────

const FD_EMPTY: Omit<FilterDryerItem, "id"> = {
  category: "", type: "", capacity: "", moc: "", mocOther: "", dryingMedia: "",
};

function FilterDryerDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (e: FilterDryerItem) => void;
}) {
  const [form, setForm] = useState<Omit<FilterDryerItem, "id">>(FD_EMPTY);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));
  const typeOptions = form.category === "Filter" ? FILTER_TYPES : form.category === "Dryer" ? DRYER_TYPES : [];

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Filter / Dryer Equipment"
      footer={<DrawerFooter onCancel={onClose} onSave={() => {
        if (!form.category) return;
        onSave({ ...form, id: Date.now().toString() });
        setForm(FD_EMPTY); onClose();
      }} saveLabel="Save Equipment" />}>
      <div className="flex flex-col gap-4">
        <FormField label="Category *">
          <DropdownSelect
            value={form.category}
            onChange={(v) => { set("category", v as FilterDryerItem["category"]); set("type", ""); }}
            options={["Filter", "Dryer"]}
            placeholder="Select category"
          />
        </FormField>
        {form.category && (
          <FormField label="Type">
            <DropdownSelect
              value={form.type}
              onChange={(v) => set("type", v)}
              options={typeOptions}
              placeholder="Select type"
            />
          </FormField>
        )}
        <FormField label="Capacity">
          <input className={inputCls} value={form.capacity}
            onChange={(e) => set("capacity", e.target.value)} placeholder="e.g. 500 L" />
        </FormField>
        <FormField label="MOC (Material of Construction)">
          <DropdownSelect
            value={form.moc}
            onChange={(v) => set("moc", v)}
            options={[...MOC_OPTIONS, "Other"]}
            placeholder="Select MOC"
          />
        </FormField>
        {form.moc === "Other" && (
          <FormField label="Specify MOC">
            <input className={inputCls} value={form.mocOther}
              onChange={(e) => set("mocOther", e.target.value)} placeholder="Enter MOC" />
          </FormField>
        )}
        {form.category === "Dryer" && (
          <FormField label="Drying Media">
            <DropdownSelect
              value={form.dryingMedia}
              onChange={(v) => set("dryingMedia", v)}
              options={DRYING_MEDIA}
              placeholder="Select drying media"
            />
          </FormField>
        )}
      </div>
    </DrawerBase>
  );
}

// ─── 3. Lab Equipments ────────────────────────────────────────────────────────

const LAB_EMPTY: Omit<LabEquipItem, "id"> = { type: "", count: "", make: "", notes: "" };

function LabEquipDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (e: LabEquipItem) => void;
}) {
  const [form, setForm] = useState<Omit<LabEquipItem, "id">>(LAB_EMPTY);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Lab Equipment"
      footer={<DrawerFooter onCancel={onClose} onSave={() => {
        if (!form.type) return;
        onSave({ ...form, id: Date.now().toString() });
        setForm(LAB_EMPTY); onClose();
      }} saveLabel="Save Equipment" />}>
      <div className="flex flex-col gap-4">
        <FormField label="Type *">
          <DropdownSelect
            value={form.type}
            onChange={(v) => set("type", v)}
            options={LAB_EQUIPMENT_TYPES}
            placeholder="Select equipment type"
          />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Count">
            <input className={inputCls} type="number" min="1" value={form.count}
              onChange={(e) => set("count", e.target.value)} placeholder="e.g. 2" />
          </FormField>
          <FormField label="Make">
            <input className={inputCls} value={form.make}
              onChange={(e) => set("make", e.target.value)} placeholder="e.g. Agilent, Waters" />
          </FormField>
        </div>
        <FormField label="Notes">
          <textarea className={inputCls + " resize-none"} rows={2} value={form.notes}
            onChange={(e) => set("notes", e.target.value)} placeholder="Any additional details…" />
        </FormField>
      </div>
    </DrawerBase>
  );
}

// ─── 4. Other Equipments ─────────────────────────────────────────────────────

const OTHER_EMPTY: Omit<OtherEquipItem, "id"> = {
  name: "", type: "", moc: "", mocOther: "", capacity: "", count: "", notes: "",
};

function OtherEquipDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (e: OtherEquipItem) => void;
}) {
  const [form, setForm] = useState<Omit<OtherEquipItem, "id">>(OTHER_EMPTY);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));
  const subtypes = form.name ? (OTHER_EQUIPMENT_SUBTYPES[form.name] ?? []) : [];

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Other Equipment"
      footer={<DrawerFooter onCancel={onClose} onSave={() => {
        if (!form.name) return;
        onSave({ ...form, id: Date.now().toString() });
        setForm(OTHER_EMPTY); onClose();
      }} saveLabel="Save Equipment" />}>
      <div className="flex flex-col gap-4">
        <FormField label="Equipment Name *">
          <DropdownSelect
            value={form.name}
            onChange={(v) => { set("name", v); set("type", ""); }}
            options={OTHER_EQUIPMENT_NAMES}
            placeholder="Select equipment"
          />
        </FormField>
        {subtypes.length > 0 && (
          <FormField label="Type">
            <DropdownSelect
              value={form.type}
              onChange={(v) => set("type", v)}
              options={subtypes}
              placeholder="Select type"
            />
          </FormField>
        )}
        <FormField label="MOC (Material of Construction)">
          <DropdownSelect
            value={form.moc}
            onChange={(v) => set("moc", v)}
            options={[...MOC_OPTIONS, "Other"]}
            placeholder="Select MOC"
          />
        </FormField>
        {form.moc === "Other" && (
          <FormField label="Specify MOC">
            <input className={inputCls} value={form.mocOther}
              onChange={(e) => set("mocOther", e.target.value)} placeholder="Enter MOC" />
          </FormField>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Capacity">
            <input className={inputCls} value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)} placeholder="e.g. 500 L" />
          </FormField>
          <FormField label="Count">
            <input className={inputCls} type="number" min="1" value={form.count}
              onChange={(e) => set("count", e.target.value)} placeholder="e.g. 2" />
          </FormField>
        </div>
        <FormField label="Notes">
          <textarea className={inputCls + " resize-none"} rows={2} value={form.notes}
            onChange={(e) => set("notes", e.target.value)} placeholder="Any additional details…" />
        </FormField>
      </div>
    </DrawerBase>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export function Equipments({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [distOpen,  setDistOpen]  = useState(false);
  const [fdOpen,    setFdOpen]    = useState(false);
  const [labOpen,   setLabOpen]   = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);

  const [distExpanded,  setDistExpanded]  = useState(true);
  const [fdExpanded,    setFdExpanded]    = useState(true);
  const [labExpanded,   setLabExpanded]   = useState(true);
  const [otherExpanded, setOtherExpanded] = useState(true);

  const distItems           = useProfileStore((s) => s.equipDistillation);
  const fdItems             = useProfileStore((s) => s.equipFilterDryer);
  const labItems            = useProfileStore((s) => s.equipLab);
  const otherItems          = useProfileStore((s) => s.equipOther);
  const addEquipDistillation   = useProfileStore((s) => s.addEquipDistillation);
  const deleteEquipDistillation = useProfileStore((s) => s.deleteEquipDistillation);
  const addEquipFilterDryer    = useProfileStore((s) => s.addEquipFilterDryer);
  const deleteEquipFilterDryer = useProfileStore((s) => s.deleteEquipFilterDryer);
  const addEquipLab            = useProfileStore((s) => s.addEquipLab);
  const deleteEquipLab         = useProfileStore((s) => s.deleteEquipLab);
  const addEquipOther          = useProfileStore((s) => s.addEquipOther);
  const deleteEquipOther       = useProfileStore((s) => s.deleteEquipOther);

  return (
    <>
      <DistillationDrawer open={distOpen} onClose={() => setDistOpen(false)}
        onSave={(e) => addEquipDistillation(e)} />
      <FilterDryerDrawer open={fdOpen} onClose={() => setFdOpen(false)}
        onSave={(e) => addEquipFilterDryer(e)} />
      <LabEquipDrawer open={labOpen} onClose={() => setLabOpen(false)}
        onSave={(e) => addEquipLab(e)} />
      <OtherEquipDrawer open={otherOpen} onClose={() => setOtherOpen(false)}
        onSave={(e) => addEquipOther(e)} />

      <div className="flex flex-col">
        <div className="p-4 sm:p-6 pb-2 flex flex-col gap-6">

          {/* 1. Distillation */}
          <div className="flex flex-col gap-3">
            <SectionHeader
              icon={Wrench} title="Distillation" count={distItems.length}
              open={distExpanded} onToggle={() => setDistExpanded((v) => !v)}
              onAdd={() => setDistOpen(true)} addLabel="Add Distillation"
            />
            {distExpanded && (
              <CollapsibleCardGrid
                items={distItems}
                emptyText="No distillation equipment added yet."
                renderItem={(e) => (
                  <ItemCard key={e.id}
                    label={`${e.type === "Other" ? e.typeOther : e.type} Distillation${e.moc ? ` — ${e.moc === "Other" ? e.mocOther : e.moc}` : ""}`}
                    sub={[e.totalCapacity && `Capacity: ${e.totalCapacity} ${e.type === "Continuous" ? "Kg/Hr" : "KL"}`, e.count && `Qty: ${e.count}`, e.tempRange && `Temp: ${e.tempRange}`].filter(Boolean).join(" · ")}
                    onDelete={() => deleteEquipDistillation(e.id)}
                    gradient="from-[#7c3aed] to-[#a78bfa]" accentLabel="Distillation"
                  />
                )}
              />
            )}
          </div>

          <div className="border-t border-[#f3f4f6]" />

          {/* 2. Filtration & Drying */}
          <div className="flex flex-col gap-3">
            <SectionHeader
              icon={FlaskConical} title="Filtration & Drying" count={fdItems.length}
              open={fdExpanded} onToggle={() => setFdExpanded((v) => !v)}
              onAdd={() => setFdOpen(true)} addLabel="Add Filter / Dryer"
            />
            {fdExpanded && (
              <CollapsibleCardGrid
                items={fdItems}
                emptyText="No filtration or drying equipment added yet."
                renderItem={(e) => (
                  <ItemCard key={e.id}
                    label={`${e.type || e.category}`}
                    sub={[e.category, e.capacity && `Capacity: ${e.capacity}`, e.moc && `MOC: ${e.moc === "Other" ? e.mocOther : e.moc}`, e.dryingMedia && `Media: ${e.dryingMedia}`].filter(Boolean).join(" · ")}
                    onDelete={() => deleteEquipFilterDryer(e.id)}
                    gradient="from-[#d97706] to-[#fbbf24]" accentLabel="Filter / Dryer"
                  />
                )}
              />
            )}
          </div>

          <div className="border-t border-[#f3f4f6]" />

          {/* 3. Lab Equipments */}
          <div className="flex flex-col gap-3">
            <SectionHeader
              icon={Microscope} title="Lab Equipments" count={labItems.length}
              open={labExpanded} onToggle={() => setLabExpanded((v) => !v)}
              onAdd={() => setLabOpen(true)} addLabel="Add Lab Equipment"
            />
            {labExpanded && (
              <CollapsibleCardGrid
                items={labItems}
                emptyText="No lab equipment added yet."
                renderItem={(e) => (
                  <ItemCard key={e.id}
                    label={e.type}
                    sub={[e.make && `Make: ${e.make}`, e.count && `Qty: ${e.count}`, e.notes].filter(Boolean).join(" · ")}
                    onDelete={() => deleteEquipLab(e.id)}
                    gradient="from-[#2563eb] to-[#60a5fa]" accentLabel="Lab Equipment"
                  />
                )}
              />
            )}
          </div>

          <div className="border-t border-[#f3f4f6]" />

          {/* 4. Other Equipments */}
          <div className="flex flex-col gap-3">
            <SectionHeader
              icon={Settings2} title="Other Equipments" count={otherItems.length}
              open={otherExpanded} onToggle={() => setOtherExpanded((v) => !v)}
              onAdd={() => setOtherOpen(true)} addLabel="Add Other Equipment"
            />
            {otherExpanded && (
              <CollapsibleCardGrid
                items={otherItems}
                emptyText="No other equipment added yet."
                renderItem={(e) => (
                  <ItemCard key={e.id}
                    label={`${e.name}${e.type ? ` — ${e.type}` : ""}`}
                    sub={[e.capacity && `Capacity: ${e.capacity}`, e.count && `Qty: ${e.count}`, e.moc && `MOC: ${e.moc === "Other" ? e.mocOther : e.moc}`].filter(Boolean).join(" · ")}
                    onDelete={() => deleteEquipOther(e.id)}
                    gradient="from-[#018E7E] to-[#34d399]" accentLabel="Other Equipment"
                  />
                )}
              />
            )}
          </div>

        </div>
        {/* navigation handled by ProfileSetup header */}
      </div>
    </>
  );
}
