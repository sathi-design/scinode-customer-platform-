"use client";

import React, { useState, useEffect } from "react";
import { Plus, Zap, Trash2 } from "lucide-react";
import {
  FormField, inputCls, DropdownSelect,
  EmptyState, DrawerFooter, SectionLabel, YNToggle, TabFooter,
} from "@/modules/profile/SharedUI";
import { DrawerBase } from "@/modules/profile/DrawerBase";
import { useIndependentCROProfileStore } from "@/store/useIndependentCROProfileStore";
import { CRO_MOC_OPTIONS } from "../constants";
import type { CROUtility } from "../types";
import { cn } from "@/lib/utils";

const UTILITY_CATEGORIES = [
  "Heating",
  "Cooling",
  "Vacuum",
  "Liquid Nitrogen (Cryogenic Utility)",
  "Cold Storage Unit",
  "Other Utilities",
  "Heating, Ventilation and Air Conditioning (HVAC) System",
] as const;

const HEATING_TYPES = ["Boiler","Thermic Fluid","Hot Water","Steam Jacketed","Electric Heater"] as const;
const HEATING_FUELS = ["Coal","Natural Gas (NG)","Bio-Mass","Wood","Furnace Oil","Others"] as const;
const COOLING_TYPES = ["Chilling Plant","Cooling Tower","Brine Plant"] as const;
const VACUUM_TYPES  = ["Oil Ring Pump","Water Ring Pump","Dry Vacuum Pump","Steam Ejector","Water Jet Ejector","Water + Steam Ejector"] as const;
const LN_SOURCES    = ["In-House","Vendor Supply (Tankers/Cylinders)"] as const;
const LN_STORAGE_TYPES = ["Cryogenic Tank","Cylinder Bank"] as const;
const CS_STORAGE_TYPES = ["Insulated Box","Freezer","Cold Room"] as const;
const OU_TYPES = [
  "DM Water","Ultra Pure Water","Nitrogen","Instrument Air","Breathing Air",
  "Compressed Air","Steam (Low Pressure)","Steam (High Pressure)",
] as const;
const HVAC_TYPES = ["Air Handling Unit (AHU)","Dehumidifier"] as const;

const EMPTY_UTILITY: Omit<CROUtility, "id"> = {
  category: "",
  heatingType: "", heatingFuel: "", heatingFuelOther: "", heatingCapacity: "", heatingPressure: "", heatingCount: "", heatingNotes: "",
  coolingType: "", coolingCapacity: "", coolingMedia: "", coolingTemp: "", coolingCount: "", coolingNotes: "",
  vacuumType: "", vacuumLevel: "", vacuumCount: "", vacuumNotes: "",
  lnAvailability: null, lnSource: "", lnStorageCapacity: "", lnStorageType: "", lnCount: "", lnNotes: "",
  csStorageType: "", csArea: "", csTemp: "", csCount: "", csNotes: "",
  ouType: "", ouCapacity: "", ouMoc: "", ouBufferCapacity: "", ouCount: "", ouNotes: "",
  hvacType: "", hvacCount: "", hvacNotes: "",
};

// ─── Add Utility Drawer ───────────────────────────────────────────────────────

function AddUtilityDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (u: CROUtility) => void;
}) {
  const [form, setForm] = useState<Omit<CROUtility, "id">>(EMPTY_UTILITY);

  useEffect(() => { if (!open) setForm(EMPTY_UTILITY); }, [open]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.category) return;
    onSave({ ...form, id: Date.now().toString() });
    onClose();
  };

  const cat = form.category;

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Utility" width={560}
      footer={<DrawerFooter onCancel={onClose} onSave={handleSave} saveLabel="Save Utility" />}>
      <div className="flex flex-col gap-4">

        {/* Category selector */}
        <FormField label={<>Category <span className="text-red-500">*</span></>}>
          <DropdownSelect value={form.category} onChange={(v) => setForm({ ...EMPTY_UTILITY, category: v })} options={UTILITY_CATEGORIES} placeholder="Select category" />
        </FormField>

        {/* ── Heating ─────────────────────────────────────────────────── */}
        {cat === "Heating" && (
          <>
            <SectionLabel>Heating Details</SectionLabel>
            <FormField label="Type">
              <DropdownSelect value={form.heatingType} onChange={(v) => set("heatingType", v)} options={HEATING_TYPES} placeholder="Select type" />
            </FormField>
            <FormField label="Fuel">
              <DropdownSelect value={form.heatingFuel} onChange={(v) => { set("heatingFuel", v); set("heatingFuelOther", ""); }} options={HEATING_FUELS} placeholder="Select fuel" />
            </FormField>
            {form.heatingFuel === "Others" && (
              <FormField label="Specify Fuel">
                <input className={inputCls} value={form.heatingFuelOther} onChange={(e) => set("heatingFuelOther", e.target.value)} placeholder="Specify fuel" />
              </FormField>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Capacity (MT/hr or kg/hr)"><input className={inputCls} value={form.heatingCapacity} onChange={(e) => set("heatingCapacity", e.target.value)} placeholder="e.g. 5 MT/hr" /></FormField>
              <FormField label="Pressure (kg/cm²)"><input className={inputCls} value={form.heatingPressure} onChange={(e) => set("heatingPressure", e.target.value)} placeholder="e.g. 10.5" /></FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Count"><input className={inputCls} type="number" min="1" value={form.heatingCount} onChange={(e) => set("heatingCount", e.target.value)} placeholder="e.g. 2" /></FormField>
              <FormField label="Notes"><input className={inputCls} value={form.heatingNotes} onChange={(e) => set("heatingNotes", e.target.value)} placeholder="Additional details…" /></FormField>
            </div>
          </>
        )}

        {/* ── Cooling ─────────────────────────────────────────────────── */}
        {cat === "Cooling" && (
          <>
            <SectionLabel>Cooling Details</SectionLabel>
            <FormField label="Type">
              <DropdownSelect value={form.coolingType} onChange={(v) => set("coolingType", v)} options={COOLING_TYPES} placeholder="Select type" />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Capacity (TR)"><input className={inputCls} value={form.coolingCapacity} onChange={(e) => set("coolingCapacity", e.target.value)} placeholder="e.g. 100" /></FormField>
              <FormField label="Cooling Media"><input className={inputCls} value={form.coolingMedia} onChange={(e) => set("coolingMedia", e.target.value)} placeholder="e.g. Chilled Water" /></FormField>
            </div>
            <FormField label="Operating Temperature"><input className={inputCls} value={form.coolingTemp} onChange={(e) => set("coolingTemp", e.target.value)} placeholder="e.g. 5°C" /></FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Count"><input className={inputCls} type="number" min="1" value={form.coolingCount} onChange={(e) => set("coolingCount", e.target.value)} placeholder="e.g. 2" /></FormField>
              <FormField label="Notes"><input className={inputCls} value={form.coolingNotes} onChange={(e) => set("coolingNotes", e.target.value)} placeholder="Additional details…" /></FormField>
            </div>
          </>
        )}

        {/* ── Vacuum ──────────────────────────────────────────────────── */}
        {cat === "Vacuum" && (
          <>
            <SectionLabel>Vacuum Details</SectionLabel>
            <FormField label="Type">
              <DropdownSelect value={form.vacuumType} onChange={(v) => set("vacuumType", v)} options={VACUUM_TYPES} placeholder="Select type" />
            </FormField>
            <FormField label="Vacuum (TOR / mmHg)"><input className={inputCls} value={form.vacuumLevel} onChange={(e) => set("vacuumLevel", e.target.value)} placeholder="e.g. 5 mmHg" /></FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Count"><input className={inputCls} type="number" min="1" value={form.vacuumCount} onChange={(e) => set("vacuumCount", e.target.value)} placeholder="e.g. 2" /></FormField>
              <FormField label="Notes"><input className={inputCls} value={form.vacuumNotes} onChange={(e) => set("vacuumNotes", e.target.value)} placeholder="Additional details…" /></FormField>
            </div>
          </>
        )}

        {/* ── Liquid Nitrogen ─────────────────────────────────────────── */}
        {cat === "Liquid Nitrogen (Cryogenic Utility)" && (
          <>
            <SectionLabel>Liquid Nitrogen Details</SectionLabel>
            <FormField label="Availability"><YNToggle value={form.lnAvailability} onChange={(v) => set("lnAvailability", v)} /></FormField>
            <FormField label="Source">
              <DropdownSelect value={form.lnSource} onChange={(v) => set("lnSource", v)} options={LN_SOURCES} placeholder="Select source" />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Storage Capacity (kL or m³)"><input className={inputCls} value={form.lnStorageCapacity} onChange={(e) => set("lnStorageCapacity", e.target.value)} placeholder="e.g. 10 kL" /></FormField>
              <FormField label="Storage Type">
                <DropdownSelect value={form.lnStorageType} onChange={(v) => set("lnStorageType", v)} options={LN_STORAGE_TYPES} placeholder="Select type" />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Count"><input className={inputCls} type="number" min="1" value={form.lnCount} onChange={(e) => set("lnCount", e.target.value)} placeholder="e.g. 2" /></FormField>
              <FormField label="Notes"><input className={inputCls} value={form.lnNotes} onChange={(e) => set("lnNotes", e.target.value)} placeholder="Additional details…" /></FormField>
            </div>
          </>
        )}

        {/* ── Cold Storage ────────────────────────────────────────────── */}
        {cat === "Cold Storage Unit" && (
          <>
            <SectionLabel>Cold Storage Details</SectionLabel>
            <FormField label="Storage Type">
              <DropdownSelect value={form.csStorageType} onChange={(v) => set("csStorageType", v)} options={CS_STORAGE_TYPES} placeholder="Select type" />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Storage Capacity (Sq.M)"><input className={inputCls} value={form.csArea} onChange={(e) => set("csArea", e.target.value)} placeholder="e.g. 50" /></FormField>
              <FormField label="Operating Temperature"><input className={inputCls} value={form.csTemp} onChange={(e) => set("csTemp", e.target.value)} placeholder="e.g. 2–8°C" /></FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Count"><input className={inputCls} type="number" min="1" value={form.csCount} onChange={(e) => set("csCount", e.target.value)} placeholder="e.g. 2" /></FormField>
              <FormField label="Notes"><input className={inputCls} value={form.csNotes} onChange={(e) => set("csNotes", e.target.value)} placeholder="Additional details…" /></FormField>
            </div>
          </>
        )}

        {/* ── Other Utilities ─────────────────────────────────────────── */}
        {cat === "Other Utilities" && (
          <>
            <SectionLabel>Other Utility Details</SectionLabel>
            <FormField label="Type">
              <DropdownSelect value={form.ouType} onChange={(v) => set("ouType", v)} options={OU_TYPES} placeholder="Select type" />
            </FormField>
            <FormField label="Capacity (L/hr, m³/hr, Nm³/hr, kg/hr)"><input className={inputCls} value={form.ouCapacity} onChange={(e) => set("ouCapacity", e.target.value)} placeholder="e.g. 500 L/hr" /></FormField>
            <FormField label="MOC">
              <DropdownSelect value={form.ouMoc} onChange={(v) => set("ouMoc", v)} options={CRO_MOC_OPTIONS} placeholder="Select MOC" />
            </FormField>
            <FormField label="Storage / Buffer Capacity"><input className={inputCls} value={form.ouBufferCapacity} onChange={(e) => set("ouBufferCapacity", e.target.value)} placeholder="e.g. 10 kL" /></FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Count"><input className={inputCls} type="number" min="1" value={form.ouCount} onChange={(e) => set("ouCount", e.target.value)} placeholder="e.g. 2" /></FormField>
              <FormField label="Notes"><input className={inputCls} value={form.ouNotes} onChange={(e) => set("ouNotes", e.target.value)} placeholder="Additional details…" /></FormField>
            </div>
          </>
        )}

        {/* ── HVAC ────────────────────────────────────────────────────── */}
        {cat === "Heating, Ventilation and Air Conditioning (HVAC) System" && (
          <>
            <SectionLabel>HVAC Details</SectionLabel>
            <FormField label="Type">
              <DropdownSelect value={form.hvacType} onChange={(v) => set("hvacType", v)} options={HVAC_TYPES} placeholder="Select type" />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Count"><input className={inputCls} type="number" min="1" value={form.hvacCount} onChange={(e) => set("hvacCount", e.target.value)} placeholder="e.g. 2" /></FormField>
              <FormField label="Notes"><input className={inputCls} value={form.hvacNotes} onChange={(e) => set("hvacNotes", e.target.value)} placeholder="Additional details…" /></FormField>
            </div>
          </>
        )}

      </div>
    </DrawerBase>
  );
}

// ─── Utility card ─────────────────────────────────────────────────────────────

type UtilityStyle = { gradient: string; iconColor: string; shortLabel: string };

const UTILITY_STYLES: Record<string, UtilityStyle> = {
  "Heating":                    { gradient: "from-[#dc2626] to-[#f87171]", iconColor: "#dc2626", shortLabel: "Heating" },
  "Cooling":                    { gradient: "from-[#2563eb] to-[#60a5fa]", iconColor: "#2563eb", shortLabel: "Cooling" },
  "Vacuum":                     { gradient: "from-[#7c3aed] to-[#a78bfa]", iconColor: "#7c3aed", shortLabel: "Vacuum" },
  "Liquid Nitrogen (Cryogenic Utility)": { gradient: "from-[#0891b2] to-[#22d3ee]", iconColor: "#0891b2", shortLabel: "Liquid Nitrogen" },
  "Cold Storage Unit":          { gradient: "from-[#018E7E] to-[#34d399]", iconColor: "#018E7E", shortLabel: "Cold Storage" },
  "Other Utilities":            { gradient: "from-[#059669] to-[#6ee7b7]", iconColor: "#059669", shortLabel: "Other Utilities" },
  "Heating, Ventilation and Air Conditioning (HVAC) System": { gradient: "from-[#4f46e5] to-[#818cf8]", iconColor: "#4f46e5", shortLabel: "HVAC" },
};

const FALLBACK_UTILITY_STYLE: UtilityStyle = { gradient: "from-[#018E7E] to-[#34d399]", iconColor: "#018E7E", shortLabel: "Utility" };

function UtilityCard({ u, onDelete }: { u: CROUtility; onDelete: () => void }) {
  const details: Array<{ label: string; value: string }> = [];

  if (u.category === "Heating") {
    if (u.heatingType)     details.push({ label: "Type",     value: u.heatingType });
    const fuel = u.heatingFuel === "Others" ? u.heatingFuelOther : u.heatingFuel;
    if (fuel)              details.push({ label: "Fuel",     value: fuel });
    if (u.heatingCapacity) details.push({ label: "Capacity", value: u.heatingCapacity });
    if (u.heatingCount)    details.push({ label: "Count",    value: u.heatingCount });
  }
  if (u.category === "Cooling") {
    if (u.coolingType)     details.push({ label: "Type",     value: u.coolingType });
    if (u.coolingCapacity) details.push({ label: "Capacity", value: `${u.coolingCapacity} TR` });
    if (u.coolingTemp)     details.push({ label: "Temp",     value: u.coolingTemp });
    if (u.coolingCount)    details.push({ label: "Count",    value: u.coolingCount });
  }
  if (u.category === "Vacuum") {
    if (u.vacuumType)      details.push({ label: "Type",     value: u.vacuumType });
    if (u.vacuumLevel)     details.push({ label: "Vacuum",   value: u.vacuumLevel });
    if (u.vacuumCount)     details.push({ label: "Count",    value: u.vacuumCount });
  }
  if (u.category === "Liquid Nitrogen (Cryogenic Utility)") {
    if (u.lnSource)        details.push({ label: "Source",   value: u.lnSource });
    if (u.lnStorageCapacity) details.push({ label: "Capacity", value: u.lnStorageCapacity });
    if (u.lnStorageType)   details.push({ label: "Storage",  value: u.lnStorageType });
  }
  if (u.category === "Cold Storage Unit") {
    if (u.csStorageType)   details.push({ label: "Type",     value: u.csStorageType });
    if (u.csTemp)          details.push({ label: "Temp",     value: u.csTemp });
    if (u.csArea)          details.push({ label: "Area",     value: `${u.csArea} Sq.M` });
  }
  if (u.category === "Other Utilities") {
    if (u.ouType)          details.push({ label: "Type",     value: u.ouType });
    if (u.ouCapacity)      details.push({ label: "Capacity", value: u.ouCapacity });
  }
  if (u.category.includes("HVAC")) {
    if (u.hvacType)        details.push({ label: "Type",     value: u.hvacType });
    if (u.hvacCount)       details.push({ label: "Count",    value: u.hvacCount });
  }

  const style = UTILITY_STYLES[u.category] ?? FALLBACK_UTILITY_STYLE;
  const displayName = u.category.includes("HVAC") ? "HVAC System" : u.category;

  return (
    <div className="bg-white rounded-xl border border-[#e4e4e7] shadow-sm flex flex-col overflow-hidden">
      {/* Gradient stripe */}
      <div className={cn("h-1 bg-gradient-to-r", style.gradient)} />

      {/* Header */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: style.iconColor }}>
            {style.shortLabel}
          </p>
          <p className="text-sm font-bold text-[#020202] leading-snug line-clamp-2">{displayName}</p>
        </div>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-[#d1d5db] hover:text-red-500 transition-colors flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Detail rows */}
      {details.length > 0 && (
        <div className="px-3 pb-3 border-t border-[#f3f4f6] pt-2 flex flex-col">
          {details.slice(0, 4).map((d, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-[#f3f4f6] last:border-0 gap-2">
              <span className="text-[11px] text-[#9ca3af] flex-shrink-0">{d.label}</span>
              <span className="text-[11px] font-semibold text-[#020202] text-right">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

interface Props { onNext: () => void; onBack: () => void; }

export function Tab7Utility({ onNext, onBack }: Props) {
  const [open, setOpen] = useState(false);
  const utilities       = useIndependentCROProfileStore((s) => s.utilities);
  const addUtility      = useIndependentCROProfileStore((s) => s.addUtility);
  const deleteUtility   = useIndependentCROProfileStore((s) => s.deleteUtility);

  return (
    <>
      <AddUtilityDrawer open={open} onClose={() => setOpen(false)} onSave={addUtility} />
      <div className="flex flex-col">
        <div className="p-4 sm:p-6 pb-2">
          <div className="flex items-center justify-end mb-4">
            <button onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Utility
            </button>
          </div>
          {utilities.length === 0
            ? <EmptyState icon={Zap} title="No utilities added yet"
                subtitle="Click Add Utility to detail your heating, cooling, vacuum, and other utility infrastructure." />
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {utilities.map((u) => <UtilityCard key={u.id} u={u} onDelete={() => deleteUtility(u.id)} />)}
              </div>
          }
        </div>
        <TabFooter onSave={onNext} onBack={onBack} />
      </div>
    </>
  );
}
