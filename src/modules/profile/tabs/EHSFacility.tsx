"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Droplets, ShieldCheck, Zap, Wind, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  FormField, inputCls, DropdownSelect,
  DrawerFooter, SectionLabel, YNToggle,
} from "../SharedUI";
import { DrawerBase } from "../DrawerBase";
import {
  ETP_INFRA_OPTIONS, WATER_STORAGE_TYPES, POWER_BACKUP_TYPES,
} from "../constants";
import { useProfileStore } from "@/store/useProfileStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ETPCard { id: string; isZLD: boolean | null; infra: string; infraOther: string; capacityKL: string; }
interface CleanRoomCard { id: string; numberOfLines: string; }
interface FireCard { id: string; waterStorageType: string; capacityKL: string; }
interface PowerCard { id: string; type: string; count: string; capacityKVA: string; }

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
  label: string; sub?: string; onDelete: () => void;
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

// ─── ETP Drawer ───────────────────────────────────────────────────────────────

function ETPDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (c: ETPCard) => void;
}) {
  const [isZLD, setIsZLD] = useState<boolean | null>(null);
  const [infra, setInfra] = useState("");
  const [infraOther, setInfraOther] = useState("");
  const [capacityKL, setCapacityKL] = useState("");

  const handleSave = () => {
    onSave({ id: Date.now().toString(), isZLD, infra, infraOther, capacityKL });
    setIsZLD(null); setInfra(""); setInfraOther(""); setCapacityKL("");
    onClose();
  };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add ETP Details"
      footer={<DrawerFooter onCancel={onClose} onSave={handleSave} saveLabel="Save ETP" />}>
      <div className="flex flex-col gap-4">
        <FormField label="Is the plant ZLD (Zero Liquid Discharge)?">
          <YNToggle value={isZLD} onChange={setIsZLD} />
        </FormField>
        <FormField label="ETP Infra">
          <DropdownSelect
            value={infra}
            onChange={(v) => { setInfra(v); setInfraOther(""); }}
            options={ETP_INFRA_OPTIONS}
            placeholder="Select ETP infrastructure"
          />
        </FormField>
        {infra === "Others" && (
          <FormField label="Specify ETP Infra">
            <input className={inputCls} value={infraOther}
              onChange={(e) => setInfraOther(e.target.value)} placeholder="Describe ETP infrastructure" />
          </FormField>
        )}
        <FormField label="Capacity (KL/day)">
          <input className={inputCls} type="number" min="0" value={capacityKL}
            onChange={(e) => setCapacityKL(e.target.value)} placeholder="e.g. 50" />
        </FormField>
      </div>
    </DrawerBase>
  );
}

// ─── Clean Room Drawer ────────────────────────────────────────────────────────

function CleanRoomDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (c: CleanRoomCard) => void;
}) {
  const [numberOfLines, setNumberOfLines] = useState("");

  const handleSave = () => {
    onSave({ id: Date.now().toString(), numberOfLines });
    setNumberOfLines(""); onClose();
  };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Clean Room"
      footer={<DrawerFooter onCancel={onClose} onSave={handleSave} saveLabel="Save Clean Room" />}>
      <div className="flex flex-col gap-4">
        <FormField label="Number of Lines">
          <input className={inputCls} type="number" min="1" value={numberOfLines}
            onChange={(e) => setNumberOfLines(e.target.value)} placeholder="e.g. 3" />
        </FormField>
      </div>
    </DrawerBase>
  );
}

// ─── Fire Fighting Drawer ─────────────────────────────────────────────────────

function FireDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (c: FireCard) => void;
}) {
  const [waterStorageType, setWaterStorageType] = useState("");
  const [capacityKL, setCapacityKL] = useState("");

  const handleSave = () => {
    onSave({ id: Date.now().toString(), waterStorageType, capacityKL });
    setWaterStorageType(""); setCapacityKL(""); onClose();
  };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Fire Fighting Capability"
      footer={<DrawerFooter onCancel={onClose} onSave={handleSave} saveLabel="Save" />}>
      <div className="flex flex-col gap-4">
        <FormField label="Water Storage Type">
          <DropdownSelect
            value={waterStorageType}
            onChange={setWaterStorageType}
            options={WATER_STORAGE_TYPES}
            placeholder="Select storage type"
          />
        </FormField>
        <FormField label="Capacity (kL)">
          <input className={inputCls} type="number" min="0" value={capacityKL}
            onChange={(e) => setCapacityKL(e.target.value)} placeholder="e.g. 100" />
        </FormField>
      </div>
    </DrawerBase>
  );
}

// ─── Power Backup Drawer ──────────────────────────────────────────────────────

function PowerDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (c: PowerCard) => void;
}) {
  const [type, setType] = useState("");
  const [count, setCount] = useState("");
  const [capacityKVA, setCapacityKVA] = useState("");

  const handleSave = () => {
    onSave({ id: Date.now().toString(), type, count, capacityKVA });
    setType(""); setCount(""); setCapacityKVA(""); onClose();
  };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Power Backup"
      footer={<DrawerFooter onCancel={onClose} onSave={handleSave} saveLabel="Save" />}>
      <div className="flex flex-col gap-4">
        <FormField label="Type">
          <DropdownSelect
            value={type}
            onChange={setType}
            options={POWER_BACKUP_TYPES}
            placeholder="Select type"
          />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Count">
            <input className={inputCls} type="number" min="1" value={count}
              onChange={(e) => setCount(e.target.value)} placeholder="e.g. 2" />
          </FormField>
          <FormField label="Capacity (kVA)">
            <input className={inputCls} type="number" min="0" value={capacityKVA}
              onChange={(e) => setCapacityKVA(e.target.value)} placeholder="e.g. 500" />
          </FormField>
        </div>
      </div>
    </DrawerBase>
  );
}

// ─── Sub-section header (with collapse toggle) ────────────────────────────────

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

export function EHSFacility({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [etpOpen,       setEtpOpen]       = useState(false);
  const [cleanRoomOpen, setCleanRoomOpen] = useState(false);
  const [fireOpen,      setFireOpen]      = useState(false);
  const [powerOpen,     setPowerOpen]     = useState(false);

  const [etpExpanded,   setEtpExpanded]   = useState(true);
  const [crExpanded,    setCrExpanded]    = useState(true);
  const [fireExpanded,  setFireExpanded]  = useState(true);
  const [powerExpanded, setPowerExpanded] = useState(true);

  const etpCards       = useProfileStore((s) => s.etpCards);
  const cleanRoomCards = useProfileStore((s) => s.cleanRoomCards);
  const fireCards      = useProfileStore((s) => s.fireCards);
  const powerCards     = useProfileStore((s) => s.powerCards);
  const addETP         = useProfileStore((s) => s.addETP);
  const deleteETP      = useProfileStore((s) => s.deleteETP);
  const addCleanRoom   = useProfileStore((s) => s.addCleanRoom);
  const deleteCleanRoom = useProfileStore((s) => s.deleteCleanRoom);
  const addFire        = useProfileStore((s) => s.addFire);
  const deleteFire     = useProfileStore((s) => s.deleteFire);
  const addPower       = useProfileStore((s) => s.addPower);
  const deletePower    = useProfileStore((s) => s.deletePower);

  return (
    <>
      <ETPDrawer       open={etpOpen}       onClose={() => setEtpOpen(false)}       onSave={(c) => addETP(c)} />
      <CleanRoomDrawer open={cleanRoomOpen} onClose={() => setCleanRoomOpen(false)} onSave={(c) => addCleanRoom(c)} />
      <FireDrawer      open={fireOpen}      onClose={() => setFireOpen(false)}       onSave={(c) => addFire(c)} />
      <PowerDrawer     open={powerOpen}     onClose={() => setPowerOpen(false)}      onSave={(c) => addPower(c)} />

      <div className="flex flex-col">
        <div className="p-4 sm:p-6 pb-2 flex flex-col gap-6">

          {/* ── Section 1: Facility ─────────────────────────────────────────── */}
          <div className="rounded-[10px] border border-[#e4e4e7] p-4 sm:p-5 flex flex-col gap-5">
            <SectionLabel>Facility</SectionLabel>

            {/* ETP */}
            <div className="flex flex-col gap-3">
              <SubSectionHeader icon={Droplets} title="ETP (Effluent Treatment Plant)"
                open={etpExpanded} onToggle={() => setEtpExpanded((v) => !v)}
                onAdd={() => setEtpOpen(true)} addLabel="Add ETP" />
              {etpExpanded && (
                <CollapsibleCardGrid
                  items={etpCards}
                  emptyText="No ETP details added yet."
                  renderItem={(c) => (
                    <ItemCard key={c.id}
                      label={`${c.infra === "Others" ? c.infraOther : c.infra || "ETP"}${c.isZLD === true ? " — ZLD" : ""}`}
                      sub={c.capacityKL ? `Capacity: ${c.capacityKL} KL/day` : undefined}
                      onDelete={() => deleteETP(c.id)}
                      gradient="from-[#059669] to-[#6ee7b7]" accentLabel="ETP"
                    />
                  )}
                />
              )}
            </div>

            <div className="border-t border-[#f3f4f6]" />

            {/* Clean Room */}
            <div className="flex flex-col gap-3">
              <SubSectionHeader icon={Wind} title="Clean Room"
                open={crExpanded} onToggle={() => setCrExpanded((v) => !v)}
                onAdd={() => setCleanRoomOpen(true)} addLabel="Add Clean Room" />
              {crExpanded && (
                <CollapsibleCardGrid
                  items={cleanRoomCards}
                  emptyText="No clean room details added yet."
                  renderItem={(c) => (
                    <ItemCard key={c.id}
                      label="Clean Room"
                      sub={c.numberOfLines ? `Lines: ${c.numberOfLines}` : undefined}
                      onDelete={() => deleteCleanRoom(c.id)}
                      gradient="from-[#2563eb] to-[#60a5fa]" accentLabel="Clean Room"
                    />
                  )}
                />
              )}
            </div>
          </div>

          {/* ── Section 2: EHS ──────────────────────────────────────────────── */}
          <div className="rounded-[10px] border border-[#e4e4e7] p-4 sm:p-5 flex flex-col gap-5">
            <SectionLabel>EHS</SectionLabel>

            {/* Fire Fighting */}
            <div className="flex flex-col gap-3">
              <SubSectionHeader icon={ShieldCheck} title="Fire Fighting Capability"
                open={fireExpanded} onToggle={() => setFireExpanded((v) => !v)}
                onAdd={() => setFireOpen(true)} addLabel="Add Fire Fighting" />
              {fireExpanded && (
                <CollapsibleCardGrid
                  items={fireCards}
                  emptyText="No fire fighting details added yet."
                  renderItem={(c) => (
                    <ItemCard key={c.id}
                      label={c.waterStorageType || "Water Storage"}
                      sub={c.capacityKL ? `Capacity: ${c.capacityKL} kL` : undefined}
                      onDelete={() => deleteFire(c.id)}
                      gradient="from-[#dc2626] to-[#f87171]" accentLabel="Fire Fighting"
                    />
                  )}
                />
              )}
            </div>

            <div className="border-t border-[#f3f4f6]" />

            {/* Power Backup */}
            <div className="flex flex-col gap-3">
              <SubSectionHeader icon={Zap} title="Power Backup"
                open={powerExpanded} onToggle={() => setPowerExpanded((v) => !v)}
                onAdd={() => setPowerOpen(true)} addLabel="Add Power Backup" />
              {powerExpanded && (
                <CollapsibleCardGrid
                  items={powerCards}
                  emptyText="No power backup details added yet."
                  renderItem={(c) => (
                    <ItemCard key={c.id}
                      label={c.type || "Power Backup"}
                      sub={[c.count && `Qty: ${c.count}`, c.capacityKVA && `${c.capacityKVA} kVA`].filter(Boolean).join(" · ")}
                      onDelete={() => deletePower(c.id)}
                      gradient="from-[#f59e0b] to-[#fbbf24]" accentLabel="Power Backup"
                    />
                  )}
                />
              )}
            </div>
          </div>

        </div>
        {/* navigation handled by ProfileSetup header */}
      </div>
    </>
  );
}
