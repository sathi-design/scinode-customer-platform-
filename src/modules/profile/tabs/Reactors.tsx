"use client";

import { useState, useEffect } from "react";
import { Plus, FlaskConical, Pencil, X, ChevronDown, RefreshCw } from "lucide-react";
import {
  FormField, inputCls, EmptyState, DrawerFooter,
} from "../SharedUI";
import { DrawerBase } from "../DrawerBase";
import {
  MOC_OPTIONS, AGITATOR_TYPES, JACKET_TYPES, CONTINUOUS_REACTOR_TYPES,
} from "../constants";
import { useProfileStore } from "@/store/useProfileStore";
import type { Reactor } from "../types";

// ─── DropdownSelect ───────────────────────────────────────────────────────────
// Fully custom dropdown that expands inline (pushes content down) so it is
// never clipped by the DrawerBase's overflow-y: auto scroll container.

function DropdownSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`${inputCls} flex items-center justify-between gap-2 text-left w-full`}
      >
        <span className={`truncate ${value ? "text-[#020202]" : "text-[#9ca3af]"}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#9ca3af] flex-shrink-0 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Inline option list — expands downward, no absolute positioning */}
      {open && (
        <div className="border border-[#cbd5e1] border-t-0 rounded-b-[6px] bg-white overflow-hidden">
          <div className="max-h-52 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm border-b border-[#f3f4f6] last:border-0 transition-colors ${
                  value === opt
                    ? "bg-[#f0faf5] text-[#1F6F54] font-semibold"
                    : "text-[#020202] hover:bg-[#f9fafb]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Segmented category toggle ────────────────────────────────────────────────

function CategoryToggle({
  value, onChange,
}: {
  value: "Batch" | "Continuous";
  onChange: (v: "Batch" | "Continuous") => void;
}) {
  return (
    <div className="inline-flex rounded-[6px] border border-[#e4e4e7] p-0.5 bg-[#f9fafb]">
      {(["Batch", "Continuous"] as const).map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`px-5 py-1.5 rounded-[4px] text-sm font-medium transition-all ${
            value === cat
              ? "bg-[#1F6F54] text-white shadow-sm"
              : "text-[#62748e] hover:text-[#020202]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function ReactorDrawer({
  open, onClose, editingReactor,
}: {
  open: boolean;
  onClose: () => void;
  editingReactor: Reactor | null;
}) {
  const addReactor    = useProfileStore((s) => s.addReactor);
  const updateReactor = useProfileStore((s) => s.updateReactor);

  const [category,         setCategory]         = useState<"Batch" | "Continuous">("Batch");
  const [moc,              setMoc]              = useState("");
  const [mocOther,         setMocOther]         = useState("");
  const [capacityKL,       setCapacityKL]       = useState("");
  const [count,            setCount]            = useState("");
  const [agitatorType,     setAgitatorType]     = useState("");
  const [jacketType,       setJacketType]       = useState("");
  const [reactorType,      setReactorType]      = useState("");
  const [reactorTypeOther, setReactorTypeOther] = useState("");

  // Populate state when drawer opens or editing target changes
  useEffect(() => {
    if (!open) return;
    if (editingReactor) {
      setCategory((editingReactor.category as "Batch" | "Continuous") ?? "Batch");
      setMoc(editingReactor.moc);
      setMocOther(editingReactor.mocOther);
      setCapacityKL(editingReactor.capacityKL);
      setCount(editingReactor.count);
      setAgitatorType(editingReactor.agitatorType);
      setJacketType(editingReactor.jacketType);
      setReactorType(editingReactor.reactorType);
      setReactorTypeOther(editingReactor.reactorTypeOther);
    } else {
      setCategory("Batch");
      setMoc(""); setMocOther(""); setCapacityKL(""); setCount("");
      setAgitatorType(""); setJacketType("");
      setReactorType(""); setReactorTypeOther("");
    }
  }, [open, editingReactor]);

  // Switching category clears category-specific fields
  const handleCategoryChange = (v: "Batch" | "Continuous") => {
    setCategory(v);
    setAgitatorType(""); setJacketType("");
    setReactorType(""); setReactorTypeOther("");
  };

  // "Other (specify)" is shown in the list but stored as "Other"
  const REACTOR_TYPE_OPTIONS = [
    ...CONTINUOUS_REACTOR_TYPES,
    "Other (specify)",
  ] as const;

  const reactorTypeDisplay =
    reactorType === "Other" ? "Other (specify)" : reactorType;

  const handleReactorTypeChange = (v: string) => {
    setReactorType(v === "Other (specify)" ? "Other" : v);
    setReactorTypeOther("");
  };

  const buildFields = (): Omit<Reactor, "id" | "category"> => ({
    moc,
    mocOther,
    capacityKL,
    count,
    agitatorType:     category === "Batch"      ? agitatorType     : "",
    jacketType:       category === "Batch"      ? jacketType       : "",
    reactorType:      category === "Continuous" ? reactorType      : "",
    reactorTypeOther: category === "Continuous" ? reactorTypeOther : "",
  });

  const handleSave = () => {
    if (editingReactor) {
      updateReactor({ ...editingReactor, category, ...buildFields() });
    } else {
      addReactor({ id: Date.now().toString(), category, ...buildFields() });
    }
    onClose();
  };

  return (
    <DrawerBase
      open={open}
      onClose={onClose}
      title={editingReactor ? "Edit Reactor" : "Add Reactor"}
      footer={
        <DrawerFooter
          onCancel={onClose}
          onSave={handleSave}
          saveLabel={editingReactor ? "Update Reactor" : "Save Reactor"}
        />
      }
    >
      <div className="flex flex-col gap-5">

        {/* ── Reactor Category ─────────────────────────────────────────────── */}
        <FormField label="Reactor Category Type *">
          <CategoryToggle value={category} onChange={handleCategoryChange} />
        </FormField>

        {/* ── MOC ─────────────────────────────────────────────────────────── */}
        <FormField label="MOC (Material of Construction)">
          <DropdownSelect
            value={moc}
            onChange={(v) => { setMoc(v); setMocOther(""); }}
            options={MOC_OPTIONS}
            placeholder="Select MOC"
          />
        </FormField>

        {moc === "Other" && (
          <FormField label="Specify MOC">
            <input
              className={inputCls}
              value={mocOther}
              onChange={(e) => setMocOther(e.target.value)}
              placeholder="Specify material"
            />
          </FormField>
        )}

        {/* ── Capacity + Count ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Capacity (KL)">
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.01"
              value={capacityKL}
              onChange={(e) => setCapacityKL(e.target.value)}
              placeholder="e.g. 5"
            />
          </FormField>
          <FormField label="Count">
            <input
              className={inputCls}
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="e.g. 2"
            />
          </FormField>
        </div>

        {/* ── Batch-specific ───────────────────────────────────────────────── */}
        {category === "Batch" && (
          <>
            <FormField label="Agitator Type">
              <DropdownSelect
                value={agitatorType}
                onChange={setAgitatorType}
                options={AGITATOR_TYPES}
                placeholder="Select agitator type"
              />
            </FormField>

            <FormField label="Jacket Type">
              <DropdownSelect
                value={jacketType}
                onChange={setJacketType}
                options={JACKET_TYPES}
                placeholder="Select jacket type"
              />
            </FormField>
          </>
        )}

        {/* ── Continuous-specific ──────────────────────────────────────────── */}
        {category === "Continuous" && (
          <>
            <FormField label="Reactor Type">
              <DropdownSelect
                value={reactorTypeDisplay}
                onChange={handleReactorTypeChange}
                options={REACTOR_TYPE_OPTIONS}
                placeholder="Select reactor type"
              />
            </FormField>

            {reactorType === "Other" && (
              <FormField label="Specify Reactor Type">
                <input
                  className={inputCls}
                  value={reactorTypeOther}
                  onChange={(e) => setReactorTypeOther(e.target.value)}
                  placeholder="e.g. Microreactor"
                />
              </FormField>
            )}
          </>
        )}

      </div>
    </DrawerBase>
  );
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, {
  gradient: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  label: string;
}> = {
  Batch: {
    gradient:  "from-[#2563eb] to-[#60a5fa]",
    Icon:      FlaskConical,
    iconBg:    "#eff6ff",
    iconColor: "#2563eb",
    label:     "Batch Reactor",
  },
  Continuous: {
    gradient:  "from-[#d97706] to-[#fbbf24]",
    Icon:      RefreshCw,
    iconBg:    "#fffbeb",
    iconColor: "#d97706",
    label:     "Continuous Reactor",
  },
};

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 border-b border-[#f3f4f6] last:border-0">
      <span className="text-xs text-[#62748e] flex-shrink-0">{label}</span>
      <span className="text-xs font-semibold text-[#020202] text-right">{value}</span>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ReactorCard({
  r, onEdit, onDelete,
}: {
  r: Reactor;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cfg        = CATEGORY_CONFIG[r.category] ?? CATEGORY_CONFIG.Batch;
  const { Icon }   = cfg;
  const displayMoc = r.moc === "Other" ? r.mocOther : r.moc;
  const displayType = r.category === "Continuous"
    ? (r.reactorType === "Other" ? r.reactorTypeOther : r.reactorType)
    : null;

  return (
    <div className="bg-white rounded-xl border border-[#e4e4e7] shadow-sm flex flex-col overflow-hidden">

      {/* Gradient stripe */}
      <div className={`h-1 bg-gradient-to-r ${cfg.gradient}`} />

      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        {/* Icon badge */}
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: cfg.iconBg, color: cfg.iconColor }}
        >
          <Icon className="w-4 h-4 [color:inherit]" />
        </div>

        {/* Category label + MOC name */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-[#62748e] leading-none mb-0.5">{cfg.label}</p>
          <p className="text-sm font-bold text-[#020202] truncate">{displayMoc || "—"}</p>
        </div>

        {/* Edit + Delete */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="text-[#9ca3af] hover:text-[#1F6F54] transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="text-[#9ca3af] hover:text-red-500 transition-colors"
            title="Delete"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Detail rows */}
      <div className="px-4 pb-4">
        {r.capacityKL   && <DetailRow label="Capacity"     value={`${r.capacityKL} KL`} />}
        {r.count        && <DetailRow label="Count"        value={r.count} />}
        {r.category === "Batch" && r.agitatorType && (
          <DetailRow label="Agitator Type" value={r.agitatorType} />
        )}
        {r.category === "Batch" && r.jacketType && (
          <DetailRow label="Jacket Type"   value={r.jacketType} />
        )}
        {displayType    && <DetailRow label="Reactor Type" value={displayType} />}
      </div>

    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export function Reactors({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [open,           setOpen]           = useState(false);
  const [editingReactor, setEditingReactor] = useState<Reactor | null>(null);
  const [showAll,        setShowAll]        = useState(false);

  const reactors           = useProfileStore((s) => s.reactors);
  const deleteReactor      = useProfileStore((s) => s.deleteReactor);
  const totalCap           = useProfileStore((s) => s.reactorTotalCap);
  const setReactorTotalCap = useProfileStore((s) => s.setReactorTotalCap);

  const openAdd     = () => { setEditingReactor(null); setOpen(true); };
  const openEdit    = (r: Reactor) => { setEditingReactor(r); setOpen(true); };
  const handleClose = () => { setOpen(false); setEditingReactor(null); };

  return (
    <>
      <ReactorDrawer
        open={open}
        onClose={handleClose}
        editingReactor={editingReactor}
      />

      <div className="flex flex-col">
        <div className="p-4 sm:p-6 pb-2">

          {/* Total Capacity */}
          <div className="mb-6 max-w-sm">
            <FormField label="Total Reactor Capacity">
              <div className="flex items-center gap-2">
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalCap}
                  onChange={(e) => setReactorTotalCap(e.target.value)}
                  placeholder="e.g. 120"
                />
                <span className="text-sm text-[#9ca3af] flex-shrink-0 font-medium">KL</span>
              </div>
            </FormField>
          </div>

          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <p className="text-sm font-medium text-[#353535]">Reactor Units</p>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Reactor
            </button>
          </div>

          {/* List or empty state */}
          {reactors.length === 0
            ? (
              <EmptyState
                icon={FlaskConical}
                title="No reactors added yet"
                subtitle="Click Add Reactor to list your batch or continuous reactor units."
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(showAll ? reactors : reactors.slice(0, 3)).map((r) => (
                    <ReactorCard
                      key={r.id}
                      r={r}
                      onEdit={() => openEdit(r)}
                      onDelete={() => deleteReactor(r.id)}
                    />
                  ))}
                </div>
                {reactors.length > 3 && (
                  <button
                    onClick={() => setShowAll((p) => !p)}
                    className="mt-3 text-sm font-medium text-[#1F6F54] hover:text-[#185C45] transition-colors"
                  >
                    {showAll ? "Show less" : `Show all ${reactors.length} reactors`}
                  </button>
                )}
              </>
            )
          }

        </div>
      </div>
    </>
  );
}
