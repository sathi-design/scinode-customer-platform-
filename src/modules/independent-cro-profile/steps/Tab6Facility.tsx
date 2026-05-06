"use client";

import React, { useState, useEffect } from "react";
import { Plus, Droplets, Wind, ShieldCheck, Zap, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  FormField, inputCls, DropdownSelect,
  DrawerFooter, SectionLabel, YNToggle, TabFooter,
} from "@/modules/profile/SharedUI";
import { DrawerBase } from "@/modules/profile/DrawerBase";
import { useIndependentCROProfileStore } from "@/store/useIndependentCROProfileStore";
import type { CROETPCard, CROCleanRoomCard, CROFireCard, CROPowerCard } from "../types";
import { cn } from "@/lib/utils";

const ETP_INFRA_OPTIONS = [
  "Primary Treatment","Secondary Treatment","MEE (Multiple Effect Evaporator)",
  "ATFD","RO (Reverse Osmosis)","Others",
] as const;

const WATER_STORAGE_TYPES = ["Underground Storage Tank","Overhead Tank","Reservoir","Sump"] as const;
const POWER_BACKUP_TYPES  = ["Diesel Generator","Captive Power Plant"] as const;

function ItemCard({
  label, sub, onDelete, gradient, sectionLabel, iconColor,
}: {
  label: string; sub?: string; onDelete: () => void;
  gradient?: string; sectionLabel?: string; iconColor?: string;
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
          <p className="text-sm font-bold text-[#020202] leading-snug">{label}</p>
        </div>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-[#d1d5db] hover:text-red-500 transition-colors flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {subParts.length > 0 && (
        <div className="px-3 pb-3 border-t border-[#f3f4f6] pt-2 flex flex-col">
          {subParts.map((part, i) => {
            const colonIdx = part.indexOf(": ");
            if (colonIdx > 0) {
              return (
                <div key={i} className="flex items-center justify-between py-1 border-b border-[#f3f4f6] last:border-0 gap-2">
                  <span className="text-[11px] text-[#9ca3af] flex-shrink-0">{part.slice(0, colonIdx)}</span>
                  <span className="text-[11px] font-semibold text-[#020202] text-right">{part.slice(colonIdx + 2)}</span>
                </div>
              );
            }
            return <p key={i} className="text-[11px] text-[#9ca3af] py-1">{part}</p>;
          })}
        </div>
      )}
    </div>
  );
}

// ─── ETP Drawer ───────────────────────────────────────────────────────────────

function ETPDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (c: CROETPCard) => void;
}) {
  const [isZLD, setIsZLD]         = useState<boolean | null>(null);
  const [infra, setInfra]         = useState("");
  const [infraOther, setInfraOther] = useState("");
  const [capacity, setCapacity]   = useState("");

  useEffect(() => {
    if (!open) { setIsZLD(null); setInfra(""); setInfraOther(""); setCapacity(""); }
  }, [open]);

  return (
    <DrawerBase open={open} onClose={onClose} title="Add ETP Details" width={480}
      footer={<DrawerFooter onCancel={onClose} onSave={() => {
        onSave({ id: Date.now().toString(), isZLD, infra, infraOther, capacity });
        onClose();
      }} saveLabel="Save ETP" />}>
      <div className="flex flex-col gap-4">
        <FormField label="Is the plant ZLD (Zero Liquid Discharge)?">
          <YNToggle value={isZLD} onChange={setIsZLD} />
        </FormField>
        <FormField label={<>ETP Infra <span className="text-red-500">*</span></>}>
          <DropdownSelect value={infra} onChange={(v) => { setInfra(v); setInfraOther(""); }} options={ETP_INFRA_OPTIONS} placeholder="Select ETP infrastructure" />
        </FormField>
        {infra === "Others" && (
          <FormField label="Specify ETP Infra">
            <input className={inputCls} value={infraOther} onChange={(e) => setInfraOther(e.target.value)} placeholder="Describe ETP infrastructure" />
          </FormField>
        )}
        <FormField label="Capacity (KL/day)">
          <input className={inputCls} type="number" min="0" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 50" />
        </FormField>
      </div>
    </DrawerBase>
  );
}

// ─── Clean Room Drawer ────────────────────────────────────────────────────────

function CleanRoomDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (c: CROCleanRoomCard) => void;
}) {
  const [numberOfLines, setNumberOfLines] = useState("");
  useEffect(() => { if (!open) setNumberOfLines(""); }, [open]);

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Clean Room" width={480}
      footer={<DrawerFooter onCancel={onClose} onSave={() => { onSave({ id: Date.now().toString(), numberOfLines }); onClose(); }} saveLabel="Save Clean Room" />}>
      <div className="flex flex-col gap-4">
        <FormField label={<>Number of Lines <span className="text-red-500">*</span></>}>
          <input className={inputCls} type="number" min="1" value={numberOfLines} onChange={(e) => setNumberOfLines(e.target.value)} placeholder="e.g. 3" />
        </FormField>
      </div>
    </DrawerBase>
  );
}

// ─── Fire Fighting Drawer ─────────────────────────────────────────────────────

function FireDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (c: CROFireCard) => void;
}) {
  const [storageType, setStorageType] = useState("");
  const [capacity, setCapacity]       = useState("");
  useEffect(() => { if (!open) { setStorageType(""); setCapacity(""); } }, [open]);

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Fire Fighting Capability" width={480}
      footer={<DrawerFooter onCancel={onClose} onSave={() => { onSave({ id: Date.now().toString(), storageType, capacity }); onClose(); }} saveLabel="Save" />}>
      <div className="flex flex-col gap-4">
        <FormField label="Water Storage Type">
          <DropdownSelect value={storageType} onChange={setStorageType} options={WATER_STORAGE_TYPES} placeholder="Select storage type" />
        </FormField>
        <FormField label="Capacity (kL)">
          <input className={inputCls} type="number" min="0" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 100" />
        </FormField>
      </div>
    </DrawerBase>
  );
}

// ─── Power Backup Drawer ──────────────────────────────────────────────────────

function PowerDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (c: CROPowerCard) => void;
}) {
  const [powerType, setPowerType]     = useState("");
  const [count, setCount]             = useState("");
  const [capacityKva, setCapacityKva] = useState("");
  useEffect(() => { if (!open) { setPowerType(""); setCount(""); setCapacityKva(""); } }, [open]);

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Power Backup" width={480}
      footer={<DrawerFooter onCancel={onClose} onSave={() => { onSave({ id: Date.now().toString(), powerType, count, capacityKva }); onClose(); }} saveLabel="Save" />}>
      <div className="flex flex-col gap-4">
        <FormField label="Type">
          <DropdownSelect value={powerType} onChange={setPowerType} options={POWER_BACKUP_TYPES} placeholder="Select type" />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Count"><input className={inputCls} type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} placeholder="e.g. 2" /></FormField>
          <FormField label="Capacity (kVA)"><input className={inputCls} type="number" min="0" value={capacityKva} onChange={(e) => setCapacityKva(e.target.value)} placeholder="e.g. 500" /></FormField>
        </div>
      </div>
    </DrawerBase>
  );
}

// ─── Collapsible sub-section header ──────────────────────────────────────────

function SubSectionHeader({ icon: Icon, title, open, onToggle, onAdd, addLabel }: {
  icon: React.ElementType; title: string; open: boolean; onToggle: () => void; onAdd: () => void; addLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <button onClick={onToggle} className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#1F6F54]" />
        <p className="text-sm font-semibold text-[#020202]">{title}</p>
        {open ? <ChevronUp className="w-4 h-4 text-[#9ca3af]" /> : <ChevronDown className="w-4 h-4 text-[#9ca3af]" />}
      </button>
      <button onClick={onAdd}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-xs font-medium transition-colors">
        <Plus className="w-3.5 h-3.5" /> {addLabel}
      </button>
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

interface Props { onNext: () => void; onBack: () => void; }

export function Tab6Facility({ onNext, onBack }: Props) {
  const [etpOpen,       setEtpOpen]       = useState(false);
  const [cleanRoomOpen, setCleanRoomOpen] = useState(false);
  const [fireOpen,      setFireOpen]      = useState(false);
  const [powerOpen,     setPowerOpen]     = useState(false);

  const [etpExpanded,       setEtpExpanded]       = useState(true);
  const [crExpanded,        setCrExpanded]        = useState(true);
  const [fireExpanded,      setFireExpanded]      = useState(true);
  const [powerExpanded,     setPowerExpanded]     = useState(true);

  const etpCards       = useIndependentCROProfileStore((s) => s.etpCards);
  const cleanRoomCards = useIndependentCROProfileStore((s) => s.cleanRoomCards);
  const fireCards      = useIndependentCROProfileStore((s) => s.fireCards);
  const powerCards     = useIndependentCROProfileStore((s) => s.powerCards);
  const addETP         = useIndependentCROProfileStore((s) => s.addETP);
  const deleteETP      = useIndependentCROProfileStore((s) => s.deleteETP);
  const addCleanRoom   = useIndependentCROProfileStore((s) => s.addCleanRoom);
  const deleteCleanRoom = useIndependentCROProfileStore((s) => s.deleteCleanRoom);
  const addFire        = useIndependentCROProfileStore((s) => s.addFire);
  const deleteFire     = useIndependentCROProfileStore((s) => s.deleteFire);
  const addPower       = useIndependentCROProfileStore((s) => s.addPower);
  const deletePower    = useIndependentCROProfileStore((s) => s.deletePower);

  return (
    <>
      <ETPDrawer       open={etpOpen}       onClose={() => setEtpOpen(false)}       onSave={addETP} />
      <CleanRoomDrawer open={cleanRoomOpen} onClose={() => setCleanRoomOpen(false)} onSave={addCleanRoom} />
      <FireDrawer      open={fireOpen}      onClose={() => setFireOpen(false)}       onSave={addFire} />
      <PowerDrawer     open={powerOpen}     onClose={() => setPowerOpen(false)}      onSave={addPower} />

      <div className="flex flex-col">
        <div className="p-4 sm:p-6 pb-2 flex flex-col gap-6">

          {/* Section 1: Facility */}
          <div className="rounded-[10px] border border-[#e4e4e7] p-4 sm:p-5 flex flex-col gap-5">
            <SectionLabel>Facility</SectionLabel>

            <div className="flex flex-col gap-3">
              <SubSectionHeader icon={Droplets} title="ETP (Effluent Treatment Plant)"
                open={etpExpanded} onToggle={() => setEtpExpanded((v) => !v)}
                onAdd={() => setEtpOpen(true)} addLabel="Add ETP" />
              {etpExpanded && (
                etpCards.length === 0
                  ? <p className="text-xs text-[#9ca3af] text-center py-3">No ETP details added yet.</p>
                  : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {etpCards.map((c) => (
                        <ItemCard key={c.id}
                          label={`${c.infra === "Others" ? c.infraOther : c.infra || "ETP"}${c.isZLD === true ? " — ZLD" : ""}`}
                          sub={c.capacity ? `Capacity: ${c.capacity} KL/day` : undefined}
                          gradient="from-[#059669] to-[#6ee7b7]"
                          sectionLabel="ETP"
                          iconColor="#059669"
                          onDelete={() => deleteETP(c.id)} />
                      ))}
                    </div>
              )}
            </div>

            <div className="border-t border-[#f3f4f6]" />

            <div className="flex flex-col gap-3">
              <SubSectionHeader icon={Wind} title="Clean Room"
                open={crExpanded} onToggle={() => setCrExpanded((v) => !v)}
                onAdd={() => setCleanRoomOpen(true)} addLabel="Add Clean Room" />
              {crExpanded && (
                cleanRoomCards.length === 0
                  ? <p className="text-xs text-[#9ca3af] text-center py-3">No clean room details added yet.</p>
                  : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cleanRoomCards.map((c) => (
                        <ItemCard key={c.id} label="Clean Room"
                          sub={c.numberOfLines ? `Lines: ${c.numberOfLines}` : undefined}
                          gradient="from-[#2563eb] to-[#60a5fa]"
                          sectionLabel="Clean Room"
                          iconColor="#2563eb"
                          onDelete={() => deleteCleanRoom(c.id)} />
                      ))}
                    </div>
              )}
            </div>
          </div>

          {/* Section 2: EHS */}
          <div className="rounded-[10px] border border-[#e4e4e7] p-4 sm:p-5 flex flex-col gap-5">
            <SectionLabel>EHS</SectionLabel>

            <div className="flex flex-col gap-3">
              <SubSectionHeader icon={ShieldCheck} title="Fire Fighting Capability"
                open={fireExpanded} onToggle={() => setFireExpanded((v) => !v)}
                onAdd={() => setFireOpen(true)} addLabel="Add Fire Fighting" />
              {fireExpanded && (
                fireCards.length === 0
                  ? <p className="text-xs text-[#9ca3af] text-center py-3">No fire fighting details added yet.</p>
                  : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {fireCards.map((c) => (
                        <ItemCard key={c.id} label={c.storageType || "Water Storage"}
                          sub={c.capacity ? `Capacity: ${c.capacity} kL` : undefined}
                          gradient="from-[#dc2626] to-[#f87171]"
                          sectionLabel="Fire Fighting"
                          iconColor="#dc2626"
                          onDelete={() => deleteFire(c.id)} />
                      ))}
                    </div>
              )}
            </div>

            <div className="border-t border-[#f3f4f6]" />

            <div className="flex flex-col gap-3">
              <SubSectionHeader icon={Zap} title="Power Backup"
                open={powerExpanded} onToggle={() => setPowerExpanded((v) => !v)}
                onAdd={() => setPowerOpen(true)} addLabel="Add Power Backup" />
              {powerExpanded && (
                powerCards.length === 0
                  ? <p className="text-xs text-[#9ca3af] text-center py-3">No power backup details added yet.</p>
                  : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {powerCards.map((c) => (
                        <ItemCard key={c.id} label={c.powerType || "Power Backup"}
                          sub={[c.count && `Qty: ${c.count}`, c.capacityKva && `Capacity: ${c.capacityKva} kVA`].filter(Boolean).join(" · ")}
                          gradient="from-[#f59e0b] to-[#fbbf24]"
                          sectionLabel="Power Backup"
                          iconColor="#d97706"
                          onDelete={() => deletePower(c.id)} />
                      ))}
                    </div>
              )}
            </div>
          </div>

        </div>
        <TabFooter onSave={onNext} onBack={onBack} />
      </div>
    </>
  );
}
