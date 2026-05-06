"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Zap, Trash2 } from "lucide-react";
import {
  FormField, inputCls, DropdownSelect,
  EmptyState, DrawerFooter, SectionLabel, YNToggle,
} from "../SharedUI";
import { DrawerBase } from "../DrawerBase";
import {
  UTILITY_CATEGORIES, HEATING_TYPES, HEATING_FUELS,
  COOLING_TYPES, VACUUM_TYPES, LN2_SOURCES, LN2_STORAGE_TYPES,
  COLD_STORAGE_INFRA, OTHER_UTILITY_TYPES, HVAC_TYPES, MOC_OPTIONS,
} from "../constants";
import { useProfileStore } from "@/store/useProfileStore";
import type { Utility } from "../types";

// ─── Per-category sub-forms (each has own local state) ───────────────────────

function HeatingForm({ onSave, onCancel }: { onSave: (d: Record<string, string>) => void; onCancel: () => void }) {
  const [type,     setType]     = useState("");
  const [fuel,     setFuel]     = useState("");
  const [fuelOther,setFuelOther]= useState("");
  const [capacity, setCapacity] = useState("");
  const [pressure, setPressure] = useState("");
  const [count,    setCount]    = useState("");
  const [notes,    setNotes]    = useState("");
  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Heating Details</SectionLabel>
      <FormField label="Type">
        <DropdownSelect value={type} onChange={setType} options={HEATING_TYPES} placeholder="Select type" />
      </FormField>
      <FormField label="Fuel">
        <DropdownSelect value={fuel} onChange={(v) => { setFuel(v); setFuelOther(""); }} options={HEATING_FUELS} placeholder="Select fuel" />
      </FormField>
      {fuel === "Others" && (
        <FormField label="Specify Fuel">
          <input className={inputCls} value={fuelOther} onChange={(e) => setFuelOther(e.target.value)} placeholder="Specify fuel" />
        </FormField>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Capacity (MT/hr or kg/hr)">
          <input className={inputCls} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 5 MT/hr" />
        </FormField>
        <FormField label="Pressure (kg/cm²)">
          <input className={inputCls} value={pressure} onChange={(e) => setPressure(e.target.value)} placeholder="e.g. 10.5" />
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Count">
          <input className={inputCls} type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} placeholder="e.g. 2" />
        </FormField>
        <FormField label="Notes">
          <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details…" />
        </FormField>
      </div>
      <DrawerFooter onCancel={onCancel} onSave={() => onSave({ Type: type, Fuel: fuel === "Others" ? fuelOther : fuel, Capacity: capacity, Pressure: pressure, Count: count, Notes: notes })} saveLabel="Save Utility" />
    </div>
  );
}

function CoolingForm({ onSave, onCancel }: { onSave: (d: Record<string, string>) => void; onCancel: () => void }) {
  const [type,    setType]    = useState("");
  const [capacity,setCapacity]= useState("");
  const [media,   setMedia]   = useState("");
  const [temp,    setTemp]    = useState("");
  const [count,   setCount]   = useState("");
  const [notes,   setNotes]   = useState("");
  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Cooling Details</SectionLabel>
      <FormField label="Type">
        <DropdownSelect value={type} onChange={setType} options={COOLING_TYPES} placeholder="Select type" />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Capacity (TR)">
          <input className={inputCls} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 100" />
        </FormField>
        <FormField label="Cooling Media">
          <input className={inputCls} value={media} onChange={(e) => setMedia(e.target.value)} placeholder="e.g. Chilled Water" />
        </FormField>
      </div>
      <FormField label="Operating Temperature">
        <input className={inputCls} value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="e.g. 5°C" />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Count">
          <input className={inputCls} type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} placeholder="e.g. 2" />
        </FormField>
        <FormField label="Notes">
          <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details…" />
        </FormField>
      </div>
      <DrawerFooter onCancel={onCancel} onSave={() => onSave({ Type: type, "Capacity (TR)": capacity, "Cooling Media": media, "Op. Temp": temp, Count: count, Notes: notes })} saveLabel="Save Utility" />
    </div>
  );
}

function VacuumForm({ onSave, onCancel }: { onSave: (d: Record<string, string>) => void; onCancel: () => void }) {
  const [type,   setType]   = useState("");
  const [vacuum, setVacuum] = useState("");
  const [count,  setCount]  = useState("");
  const [notes,  setNotes]  = useState("");
  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Vacuum Details</SectionLabel>
      <FormField label="Type">
        <DropdownSelect value={type} onChange={setType} options={VACUUM_TYPES} placeholder="Select type" />
      </FormField>
      <FormField label="Vacuum (TOR / mmHg)">
        <input className={inputCls} value={vacuum} onChange={(e) => setVacuum(e.target.value)} placeholder="e.g. 5 mmHg" />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Count">
          <input className={inputCls} type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} placeholder="e.g. 2" />
        </FormField>
        <FormField label="Notes">
          <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details…" />
        </FormField>
      </div>
      <DrawerFooter onCancel={onCancel} onSave={() => onSave({ Type: type, Vacuum: vacuum, Count: count, Notes: notes })} saveLabel="Save Utility" />
    </div>
  );
}

function LN2Form({ onSave, onCancel }: { onSave: (d: Record<string, string>) => void; onCancel: () => void }) {
  const [avail,   setAvail]   = useState<boolean | null>(null);
  const [source,  setSource]  = useState("");
  const [cap,     setCap]     = useState("");
  const [store,   setStore]   = useState("");
  const [count,   setCount]   = useState("");
  const [notes,   setNotes]   = useState("");
  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Liquid Nitrogen Details</SectionLabel>
      <FormField label="Availability">
        <YNToggle value={avail} onChange={setAvail} />
      </FormField>
      <FormField label="Source">
        <DropdownSelect value={source} onChange={setSource} options={LN2_SOURCES} placeholder="Select source" />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Storage Capacity (kL or m³)">
          <input className={inputCls} value={cap} onChange={(e) => setCap(e.target.value)} placeholder="e.g. 10 kL" />
        </FormField>
        <FormField label="Storage Type">
          <DropdownSelect value={store} onChange={setStore} options={LN2_STORAGE_TYPES} placeholder="Select type" />
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Count">
          <input className={inputCls} type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} placeholder="e.g. 2" />
        </FormField>
        <FormField label="Notes">
          <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details…" />
        </FormField>
      </div>
      <DrawerFooter onCancel={onCancel} onSave={() => onSave({ Availability: avail === true ? "Yes" : avail === false ? "No" : "", Source: source, "Storage Cap": cap, "Storage Type": store, Count: count, Notes: notes })} saveLabel="Save Utility" />
    </div>
  );
}

function ColdStorageForm({ onSave, onCancel }: { onSave: (d: Record<string, string>) => void; onCancel: () => void }) {
  const [infra, setInfra] = useState("");
  const [area,  setArea]  = useState("");
  const [temp,  setTemp]  = useState("");
  const [count, setCount] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Cold Storage Details</SectionLabel>
      <FormField label="Storage Infra">
        <DropdownSelect value={infra} onChange={setInfra} options={COLD_STORAGE_INFRA} placeholder="Select infra" />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Capacity Area (Sq.M)">
          <input className={inputCls} value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. 50" />
        </FormField>
        <FormField label="Operating Temperature">
          <input className={inputCls} value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="e.g. 2–8°C" />
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Count">
          <input className={inputCls} type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} placeholder="e.g. 2" />
        </FormField>
        <FormField label="Notes">
          <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details…" />
        </FormField>
      </div>
      <DrawerFooter onCancel={onCancel} onSave={() => onSave({ Infra: infra, "Area (Sq.M)": area, "Op. Temp": temp, Count: count, Notes: notes })} saveLabel="Save Utility" />
    </div>
  );
}

function OtherUtilitiesForm({ onSave, onCancel }: { onSave: (d: Record<string, string>) => void; onCancel: () => void }) {
  const [type,     setType]     = useState("");
  const [capacity, setCapacity] = useState("");
  const [moc,      setMoc]      = useState("");
  const [mocOther, setMocOther] = useState("");
  const [buffer,   setBuffer]   = useState("");
  const [count,    setCount]    = useState("");
  const [notes,    setNotes]    = useState("");
  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Other Utility Details</SectionLabel>
      <FormField label="Type">
        <DropdownSelect value={type} onChange={setType} options={OTHER_UTILITY_TYPES} placeholder="Select type" />
      </FormField>
      <FormField label="Capacity (L/hr, m³/hr, Nm³/hr, kg/hr)">
        <input className={inputCls} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 500 L/hr" />
      </FormField>
      <FormField label="MOC">
        <DropdownSelect value={moc} onChange={(v) => { setMoc(v); setMocOther(""); }} options={[...MOC_OPTIONS, "Other"]} placeholder="Select MOC" />
      </FormField>
      {moc === "Other" && (
        <FormField label="Specify MOC">
          <input className={inputCls} value={mocOther} onChange={(e) => setMocOther(e.target.value)} placeholder="Enter MOC" />
        </FormField>
      )}
      <FormField label="Storage / Buffer Capacity (L, kL or Nm³)">
        <input className={inputCls} value={buffer} onChange={(e) => setBuffer(e.target.value)} placeholder="e.g. 10 kL" />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Count">
          <input className={inputCls} type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} placeholder="e.g. 2" />
        </FormField>
        <FormField label="Notes">
          <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details…" />
        </FormField>
      </div>
      <DrawerFooter onCancel={onCancel} onSave={() => onSave({ Type: type, Capacity: capacity, MOC: moc === "Other" ? mocOther : moc, Buffer: buffer, Count: count, Notes: notes })} saveLabel="Save Utility" />
    </div>
  );
}

function HVACForm({ onSave, onCancel }: { onSave: (d: Record<string, string>) => void; onCancel: () => void }) {
  const [type,  setType]  = useState("");
  const [count, setCount] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>HVAC Details</SectionLabel>
      <FormField label="Type">
        <DropdownSelect value={type} onChange={setType} options={HVAC_TYPES} placeholder="Select type" />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Count">
          <input className={inputCls} type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} placeholder="e.g. 2" />
        </FormField>
        <FormField label="Notes">
          <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details…" />
        </FormField>
      </div>
      <DrawerFooter onCancel={onCancel} onSave={() => onSave({ Type: type, Count: count, Notes: notes })} saveLabel="Save Utility" />
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function AddUtilityDrawer({ open, onClose, onSave }: {
  open: boolean;
  onClose: () => void;
  onSave: (u: Utility) => void;
}) {
  const [category, setCategory] = useState("");

  const handleSave = (details: Record<string, string>) => {
    onSave({ id: Date.now().toString(), category, details });
    setCategory("");
    onClose();
  };

  const formProps = { onSave: handleSave, onCancel: onClose };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Utility">
      <div className="flex flex-col gap-4">
        <FormField label="Category *">
          <DropdownSelect value={category} onChange={setCategory} options={UTILITY_CATEGORIES} placeholder="Select category" />
        </FormField>

        {/* key={category} → unmounts old sub-form, mounts fresh one on every category change */}
        <div key={category}>
          {category === "Heating"                     && <HeatingForm       {...formProps} />}
          {category === "Cooling"                     && <CoolingForm       {...formProps} />}
          {category === "Vacuum"                      && <VacuumForm        {...formProps} />}
          {category === "Liquid Nitrogen (Cryogenic)" && <LN2Form           {...formProps} />}
          {category === "Cold Storage Unit"           && <ColdStorageForm   {...formProps} />}
          {category === "Other Utilities"             && <OtherUtilitiesForm{...formProps} />}
          {category === "HVAC System"                 && <HVACForm          {...formProps} />}
        </div>
      </div>
    </DrawerBase>
  );
}

// ─── Detail row ───────────────────────────────────────────────────────────────

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

// ─── Card ─────────────────────────────────────────────────────────────────────

const UTILITY_GRADIENTS: Record<string, { gradient: string; iconColor: string; iconBg: string }> = {
  "Heating":        { gradient: "from-[#dc2626] to-[#f87171]", iconColor: "#dc2626", iconBg: "#fef2f2" },
  "Cooling":        { gradient: "from-[#2563eb] to-[#60a5fa]", iconColor: "#2563eb", iconBg: "#eff6ff" },
  "Vacuum":         { gradient: "from-[#7c3aed] to-[#a78bfa]", iconColor: "#7c3aed", iconBg: "#f5f3ff" },
  "Liquid Nitrogen":{ gradient: "from-[#06b6d4] to-[#67e8f9]", iconColor: "#0891b2", iconBg: "#ecfeff" },
  "Cold Storage":   { gradient: "from-[#018E7E] to-[#34d399]", iconColor: "#018E7E", iconBg: "#f0faf5" },
  "HVAC":           { gradient: "from-[#6366f1] to-[#a5b4fc]", iconColor: "#4f46e5", iconBg: "#eef2ff" },
};
const UTILITY_FALLBACK = { gradient: "from-[#9ca3af] to-[#d1d5db]", iconColor: "#6b7280", iconBg: "#f9fafb" };

function UtilityCard({ u, onDelete }: { u: Utility; onDelete: () => void }) {
  const entries = Object.entries(u.details).filter(([, v]) => v);
  const style = UTILITY_GRADIENTS[u.category] ?? UTILITY_FALLBACK;
  return (
    <div className="bg-white rounded-xl border border-[#e4e4e7] shadow-sm flex flex-col">
      <div className={cn("h-1 bg-gradient-to-r rounded-t-xl", style.gradient)} />
      {/* Header */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: style.iconBg }}>
            <Zap className="w-3.5 h-3.5" style={{ color: style.iconColor }} />
          </div>
          <p className="text-sm font-bold text-[#020202] leading-snug truncate">{u.category}</p>
        </div>
        <button onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 text-[#d1d5db] hover:text-red-500 transition-colors flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Details */}
      {entries.length > 0 && (
        <div className="px-3 pb-3 border-t border-[#f3f4f6] pt-2 flex flex-col flex-1">
          {entries.map(([k, v]) => (
            <DetailRow key={k} label={k} value={v} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export function Utilities({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [open,      setOpen]  = useState(false);
  const utilities             = useProfileStore((s) => s.utilities);
  const addUtility            = useProfileStore((s) => s.addUtility);
  const deleteUtility         = useProfileStore((s) => s.deleteUtility);

  return (
    <>
      <AddUtilityDrawer open={open} onClose={() => setOpen(false)}
        onSave={(u) => addUtility(u)} />

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
            : <CollapsibleCardGrid
                items={utilities}
                emptyText="No utilities added yet."
                renderItem={(u) => (
                  <UtilityCard key={u.id} u={u} onDelete={() => deleteUtility(u.id)} />
                )}
              />
          }
        </div>
      </div>
    </>
  );
}
