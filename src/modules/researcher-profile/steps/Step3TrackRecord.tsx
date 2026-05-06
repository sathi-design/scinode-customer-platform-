"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Cpu,
  FolderKanban,
  BookOpen,
  FileText,
  ExternalLink,
  Check,
  ChevronDown,
  ChevronRight,
  Trash2,
  Zap,
  FlaskConical,
  Award,
  Quote,
} from "lucide-react";
import { useResearcherProfileStore } from "@/store/useResearcherProfileStore";
import {
  FormField,
  SectionLabel,
  inputCls,
  DrawerFooter,
  EmptyState,
} from "@/modules/profile/SharedUI";
import { DrawerBase } from "@/modules/profile/DrawerBase";
import {
  TRL_LEVELS,
  PATENT_STATUS_OPTIONS,
  PROJECT_TYPES,
  PATENT_DOMAINS,
  IP_STATUS_OPTIONS,
} from "../constants";
import type { Technology, ResearchProject, Patent, Publication } from "../types";
import { cn } from "@/lib/utils";

// ─── Custom dropdown (portal-based — avoids drawer overflow clipping) ────────
function SelectField({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef    = useRef<HTMLDivElement>(null);

  const openMenu = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={cn(
          inputCls,
          "flex items-center justify-between w-full cursor-pointer text-left"
        )}
      >
        <span className={cn(
          "truncate flex-1 text-sm",
          value ? "text-[#020202]" : "text-[#9ca3af]"
        )}>
          {value || placeholder}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-[#71717a] flex-shrink-0 ml-2 transition-transform duration-150",
          open && "rotate-180"
        )} />
      </button>

      {open && createPortal(
        <div
          ref={listRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
          className="bg-white border border-[#e4e4e7] rounded-[8px] shadow-xl max-h-56 overflow-y-auto"
        >
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => { onChange(o); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2.5",
                value === o
                  ? "bg-[#f0faf5] text-[#018E7E] font-medium"
                  : "text-[#020202] hover:bg-[#f0faf5]"
              )}
            >
              <span className={cn(
                "flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center",
                value === o ? "border-[#018E7E] bg-[#018E7E]" : "border-[#cbd5e1]"
              )}>
                {value === o && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
              </span>
              {o}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Shared delete button ─────────────────────────────────────────────────────
function DeleteBtn({ onDelete }: { onDelete: () => void }) {
  return (
    <button
      onClick={onDelete}
      className="p-1.5 rounded-lg hover:bg-red-50 text-[#d1d5db] hover:text-red-500 transition-colors flex-shrink-0"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

// ─── Shared detail row (like product card) ────────────────────────────────────
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-[#f3f4f6] last:border-0 gap-2">
      <span className="text-[11px] text-[#9ca3af] flex-shrink-0">{label}</span>
      <span className="text-[11px] font-semibold text-[#020202] text-right line-clamp-2">{value}</span>
    </div>
  );
}

// ─── Collapsible card grid (identical pattern to Products tab) ────────────────
function CollapsibleCardGrid<T extends { id: string }>({
  items,
  renderItem,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  cols = 3,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyIcon: React.ElementType;
  emptyTitle: string;
  emptySubtitle: string;
  cols?: 2 | 3 | 4;
}) {
  const [showAll, setShowAll] = useState(false);
  const LIMIT = cols === 4 ? 4 : cols === 3 ? 3 : 4;
  const visible = showAll ? items : items.slice(0, LIMIT);
  const colCls = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[cols];

  if (items.length === 0) {
    return (
      <EmptyState icon={emptyIcon} title={emptyTitle} subtitle={emptySubtitle} />
    );
  }

  return (
    <div>
      <div className={cn("grid gap-3", colCls)}>
        {visible.map((item) => renderItem(item))}
      </div>
      {items.length > LIMIT && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="mt-3 text-xs font-semibold text-[#1F6F54] hover:text-[#185C45] transition-colors"
        >
          {showAll ? "↑ Show less" : `↓ Show all ${items.length}`}
        </button>
      )}
    </div>
  );
}

// ─── Technology Card ──────────────────────────────────────────────────────────
function TechCard({ t, onDelete }: { t: Technology; onDelete: () => void }) {
  const trlNum = t.trlLevel ? t.trlLevel.split(" - ")[0] : "";
  return (
    <div className="bg-white rounded-xl border border-[#e4e4e7] shadow-sm flex flex-col overflow-hidden">
      {/* Teal gradient accent stripe */}
      <div className="h-1 bg-gradient-to-r from-[#018E7E] to-[#34d399]" />

      {/* Header */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-md bg-[#f0faf5] flex items-center justify-center flex-shrink-0">
              <Zap className="w-3 h-3 text-[#018E7E]" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#018E7E]">Technology</p>
          </div>
          <p className="text-sm font-bold text-[#020202] leading-snug line-clamp-2">{t.name}</p>

          {/* Status chips */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {trlNum && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dbeafe] text-[#1d4ed8] border border-[#bfdbfe]">
                TRL: {trlNum}
              </span>
            )}
            {t.patentStatus && t.patentStatus !== "None" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0faf5] text-[#065f46] border border-[#a7f3d0]">
                Patent: {t.patentStatus}
              </span>
            )}
          </div>
        </div>
        <DeleteBtn onDelete={onDelete} />
      </div>

      {/* Detail rows */}
      <div className="px-3 pb-2 border-t border-[#f3f4f6] pt-2 flex flex-col flex-1">
        {t.applications && <DetailRow label="Applications" value={t.applications} />}
        {t.industrialAdvantages && (
          <p className="text-[11px] text-[#62748e] mt-1 line-clamp-2 leading-[16px]">
            {t.industrialAdvantages}
          </p>
        )}
      </div>

      {/* Link */}
      {t.link && (
        <div className="px-3 pb-3 pt-1">
          <a
            href={t.link} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-semibold text-[#018E7E] hover:underline"
          >
            <ExternalLink className="w-3 h-3" /> View reference
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
const PROJECT_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "Government Funded": { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  "Industry Sponsored": { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  "International":      { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe" },
  "Internal R&D":       { bg: "#dcfce7", text: "#14532d", border: "#bbf7d0" },
  "Collaborative":      { bg: "#ffedd5", text: "#9a3412", border: "#fed7aa" },
};
const DEFAULT_PROJECT_STYLE = { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };

function ProjectCard({ p, onDelete }: { p: ResearchProject; onDelete: () => void }) {
  const style = PROJECT_TYPE_STYLES[p.projectType] ?? DEFAULT_PROJECT_STYLE;
  return (
    <div className="bg-white rounded-xl border border-[#e4e4e7] shadow-sm flex flex-col overflow-hidden">
      {/* Amber gradient accent stripe */}
      <div className="h-1 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]" />

      {/* Header */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-md bg-[#fffbeb] flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-3 h-3 text-[#d97706]" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#d97706]">Project</p>
          </div>
          <p className="text-sm font-bold text-[#020202] leading-snug line-clamp-2">{p.title}</p>

          {p.projectType && (
            <span
              className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{ background: style.bg, color: style.text, borderColor: style.border }}
            >
              {p.projectType}
            </span>
          )}
        </div>
        <DeleteBtn onDelete={onDelete} />
      </div>

      {/* Description */}
      <div className="px-3 pb-2 border-t border-[#f3f4f6] pt-2 flex flex-col flex-1">
        {p.description && (
          <p className="text-[11px] text-[#62748e] leading-[16px] line-clamp-3">{p.description}</p>
        )}
      </div>

      {/* Link */}
      {p.link && (
        <div className="px-3 pb-3 pt-1">
          <a
            href={p.link} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-semibold text-[#d97706] hover:underline"
          >
            <ExternalLink className="w-3 h-3" /> View reference
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Patent / IP Card ─────────────────────────────────────────────────────────
const IP_STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "Filed":    { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  "Published":{ bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  "Granted":  { bg: "#dcfce7", text: "#14532d", border: "#bbf7d0" },
  "Pending":  { bg: "#ffedd5", text: "#9a3412", border: "#fed7aa" },
  "Abandoned":{ bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
};

function PatentCard({ p, onDelete }: { p: Patent; onDelete: () => void }) {
  const statusStyle = IP_STATUS_STYLES[p.status] ?? { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };
  return (
    <div className="bg-white rounded-xl border border-[#e4e4e7] shadow-sm flex flex-col overflow-hidden">
      {/* Purple gradient accent stripe */}
      <div className="h-1 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa]" />

      {/* Header */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-md bg-[#f5f3ff] flex items-center justify-center flex-shrink-0">
              <Award className="w-3 h-3 text-[#7c3aed]" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#7c3aed]">Patent / IP</p>
          </div>
          <p className="text-sm font-bold text-[#020202] leading-snug line-clamp-2">{p.title}</p>

          <div className="flex flex-wrap gap-1 mt-1.5">
            {p.status && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{ background: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
              >
                {p.status}
              </span>
            )}
            {p.domain && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5f3ff] text-[#6d28d9] border border-[#ddd6fe]">
                {p.domain}
              </span>
            )}
          </div>
        </div>
        <DeleteBtn onDelete={onDelete} />
      </div>

      {/* Details */}
      <div className="px-3 pb-2 border-t border-[#f3f4f6] pt-2 flex flex-col flex-1">
        {p.authors && <DetailRow label="Authors" value={p.authors} />}
      </div>

      {/* Link */}
      {p.link && (
        <div className="px-3 pb-3 pt-1">
          <a
            href={p.link} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-semibold text-[#7c3aed] hover:underline"
          >
            <ExternalLink className="w-3 h-3" /> View patent
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Publication Card ─────────────────────────────────────────────────────────
function PublicationCard({ p, onDelete }: { p: Publication; onDelete: () => void }) {
  const citationNum = p.citations ? parseInt(p.citations) : 0;
  const citationColor =
    citationNum >= 100 ? { bg: "#dcfce7", text: "#14532d", border: "#bbf7d0" } :
    citationNum >= 20  ? { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" } :
                         { bg: "#fef3c7", text: "#92400e", border: "#fde68a" };

  return (
    <div className="bg-white rounded-xl border border-[#e4e4e7] shadow-sm flex flex-col overflow-hidden">
      {/* Blue gradient accent stripe */}
      <div className="h-1 bg-gradient-to-r from-[#2563eb] to-[#60a5fa]" />

      {/* Header */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-md bg-[#eff6ff] flex items-center justify-center flex-shrink-0">
              <Quote className="w-3 h-3 text-[#2563eb]" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#2563eb]">Publication</p>
          </div>
          <p className="text-sm font-bold text-[#020202] leading-snug line-clamp-2">{p.title}</p>

          <div className="flex flex-wrap gap-1 mt-1.5">
            {p.year && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                {p.year}
              </span>
            )}
            {p.citations && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{ background: citationColor.bg, color: citationColor.text, borderColor: citationColor.border }}
              >
                {p.citations} citations
              </span>
            )}
          </div>
        </div>
        <DeleteBtn onDelete={onDelete} />
      </div>

      {/* Details */}
      <div className="px-3 pb-2 border-t border-[#f3f4f6] pt-2 flex flex-col flex-1">
        {p.journalConference && (
          <DetailRow label="Journal" value={p.journalConference} />
        )}
        {p.authors && <DetailRow label="Authors" value={p.authors} />}
      </div>

      {/* Link */}
      {p.link && (
        <div className="px-3 pb-3 pt-1">
          <a
            href={p.link} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-semibold text-[#2563eb] hover:underline"
          >
            <ExternalLink className="w-3 h-3" /> Read publication
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Collapsible section wrapper ──────────────────────────────────────────────
function CollapsibleSection({
  icon: Icon,
  title,
  subtitle,
  count,
  accentColor,
  isOpen,
  onToggle,
  onAdd,
  addLabel,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  count: number;
  accentColor: string;
  isOpen: boolean;
  onToggle: () => void;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#F3F4F6] last:border-0">
      <div
        className="flex items-center justify-between px-4 sm:px-5 py-4 cursor-pointer hover:bg-[#fafafa] transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 transition-colors"
            style={isOpen
              ? { background: accentColor, color: "#fff" }
              : { background: "#f1f5f9", color: "#71717a" }
            }
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[#020202]">{title}</p>
              {count > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: accentColor }}
                >
                  {count}
                </span>
              )}
            </div>
            {!isOpen && (
              <p className="text-xs text-[#71717a] truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {isOpen && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border text-xs font-medium transition-colors"
              style={{ borderColor: accentColor, color: accentColor }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = accentColor + "15";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <Plus className="w-3 h-3" /> {addLabel}
            </button>
          )}
          {isOpen
            ? <ChevronDown className="w-4 h-4 text-[#71717a]" />
            : <ChevronRight className="w-4 h-4 text-[#71717a]" />
          }
        </div>
      </div>

      {isOpen && <div className="px-4 sm:px-5 pb-5">{children}</div>}
    </div>
  );
}

// ─── Form state types ─────────────────────────────────────────────────────────
type TechForm    = Omit<Technology, "id">;
type ProjectForm = Omit<ResearchProject, "id">;
type PatentForm  = Omit<Patent, "id">;
type PubForm     = Omit<Publication, "id">;

// ─── Drawer: Add Technology ───────────────────────────────────────────────────
function AddTechDrawer({
  open, onClose, onSave,
  form, setForm,
}: {
  open: boolean; onClose: () => void; onSave: (t: Technology) => void;
  form: TechForm; setForm: React.Dispatch<React.SetStateAction<TechForm>>;
}) {
  const [err, setErr] = useState("");
  const handle = () => {
    if (!form.name.trim()) { setErr("Technology name is required"); return; }
    onSave({ id: Date.now().toString(), ...form, name: form.name.trim() });
    setErr(""); onClose();
  };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Technology / IP"
      footer={<DrawerFooter onCancel={onClose} onSave={handle} saveLabel="Add Technology" />}>
      <div className="flex flex-col gap-5">
        <FormField label="Technology Name *">
          <input className={cn(inputCls, err && "border-red-400")}
            value={form.name} maxLength={200}
            onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErr(""); }}
            placeholder="e.g. Bio-based Polymer Synthesis" />
          {err && <p className="text-xs text-red-500">{err}</p>}
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="TRL Level">
            <SelectField value={form.trlLevel} onChange={(v) => setForm((p) => ({ ...p, trlLevel: v }))}
              options={TRL_LEVELS} placeholder="Select TRL…" />
          </FormField>
          <FormField label="Patent Status">
            <SelectField value={form.patentStatus} onChange={(v) => setForm((p) => ({ ...p, patentStatus: v }))}
              options={PATENT_STATUS_OPTIONS} placeholder="Select status…" />
          </FormField>
        </div>
        <FormField label="Industrial Advantages" hint="Max 1000 characters">
          <textarea className={cn(inputCls, "resize-none min-h-[80px]")}
            value={form.industrialAdvantages} maxLength={1000}
            onChange={(e) => setForm((p) => ({ ...p, industrialAdvantages: e.target.value }))}
            placeholder="Describe the key industrial advantages…" />
        </FormField>
        <FormField label="Applications" hint="Comma-separated: e.g. Aerospace, Construction, Paints">
          <input className={inputCls} value={form.applications}
            onChange={(e) => setForm((p) => ({ ...p, applications: e.target.value }))}
            placeholder="Aerospace, Construction, Paints" />
        </FormField>
        <FormField label="Reference Link">
          <input className={inputCls} type="url" value={form.link}
            onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
            placeholder="https://…" />
        </FormField>
      </div>
    </DrawerBase>
  );
}

// ─── Drawer: Add Project ──────────────────────────────────────────────────────
function AddProjectDrawer({
  open, onClose, onSave,
  form, setForm,
}: {
  open: boolean; onClose: () => void; onSave: (p: ResearchProject) => void;
  form: ProjectForm; setForm: React.Dispatch<React.SetStateAction<ProjectForm>>;
}) {
  const [err, setErr] = useState("");
  const handle = () => {
    if (!form.title.trim()) { setErr("Project title is required"); return; }
    onSave({ id: Date.now().toString(), ...form, title: form.title.trim() });
    setErr(""); onClose();
  };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Project"
      footer={<DrawerFooter onCancel={onClose} onSave={handle} saveLabel="Add Project" />}>
      <div className="flex flex-col gap-5">
        <FormField label="Project Title *">
          <input className={cn(inputCls, err && "border-red-400")}
            value={form.title} maxLength={200}
            onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); setErr(""); }}
            placeholder="e.g. DST-funded polymer synthesis project" />
          {err && <p className="text-xs text-red-500">{err}</p>}
        </FormField>
        <FormField label="Project Type *">
          <SelectField value={form.projectType}
            onChange={(v) => setForm((p) => ({ ...p, projectType: v }))}
            options={PROJECT_TYPES} placeholder="Select type…" />
        </FormField>
        <FormField label="Description" hint="Max 1000 characters">
          <textarea className={cn(inputCls, "resize-none min-h-[80px]")}
            value={form.description} maxLength={1000}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Brief description of the project…" />
        </FormField>
        <FormField label="Reference Link">
          <input className={inputCls} type="url" value={form.link}
            onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
            placeholder="https://…" />
        </FormField>
      </div>
    </DrawerBase>
  );
}

// ─── Drawer: Add Patent ───────────────────────────────────────────────────────
function AddPatentDrawer({
  open, onClose, onSave,
  form, setForm,
}: {
  open: boolean; onClose: () => void; onSave: (p: Patent) => void;
  form: PatentForm; setForm: React.Dispatch<React.SetStateAction<PatentForm>>;
}) {
  const [err, setErr] = useState("");
  const handle = () => {
    if (!form.title.trim()) { setErr("Patent title is required"); return; }
    onSave({ id: Date.now().toString(), ...form, title: form.title.trim() });
    setErr(""); onClose();
  };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Patent / IP"
      footer={<DrawerFooter onCancel={onClose} onSave={handle} saveLabel="Add Patent" />}>
      <div className="flex flex-col gap-5">
        <FormField label="Patent Title *">
          <input className={cn(inputCls, err && "border-red-400")}
            value={form.title} maxLength={300}
            onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); setErr(""); }}
            placeholder="e.g. Novel method for synthesis of…" />
          {err && <p className="text-xs text-red-500">{err}</p>}
        </FormField>
        <FormField label="Authors *" hint="Comma-separated: e.g. Shalinee K., Rajesh Kumar">
          <input className={inputCls} value={form.authors}
            onChange={(e) => setForm((p) => ({ ...p, authors: e.target.value }))}
            placeholder="Author 1, Author 2, …" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Domain">
            <SelectField value={form.domain}
              onChange={(v) => setForm((p) => ({ ...p, domain: v }))}
              options={PATENT_DOMAINS} placeholder="Select domain…" />
          </FormField>
          <FormField label="Status">
            <SelectField value={form.status}
              onChange={(v) => setForm((p) => ({ ...p, status: v }))}
              options={IP_STATUS_OPTIONS} placeholder="Select status…" />
          </FormField>
        </div>
        <FormField label="Reference Link">
          <input className={inputCls} type="url" value={form.link}
            onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
            placeholder="https://…" />
        </FormField>
      </div>
    </DrawerBase>
  );
}

// ─── Drawer: Add Publication ──────────────────────────────────────────────────
function AddPublicationDrawer({
  open, onClose, onSave,
  form, setForm,
}: {
  open: boolean; onClose: () => void; onSave: (p: Publication) => void;
  form: PubForm; setForm: React.Dispatch<React.SetStateAction<PubForm>>;
}) {
  const currentYear = new Date().getFullYear().toString();
  const [err, setErr] = useState("");
  const handle = () => {
    if (!form.title.trim()) { setErr("Publication title is required"); return; }
    onSave({ id: Date.now().toString(), ...form, title: form.title.trim() });
    setErr(""); onClose();
  };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Research Publication"
      footer={<DrawerFooter onCancel={onClose} onSave={handle} saveLabel="Add Publication" />}>
      <div className="flex flex-col gap-5">
        <FormField label="Publication Title *">
          <input className={cn(inputCls, err && "border-red-400")}
            value={form.title} maxLength={300}
            onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); setErr(""); }}
            placeholder="e.g. Synthesis and characterization of…" />
          {err && <p className="text-xs text-red-500">{err}</p>}
        </FormField>
        <FormField label="Authors *" hint="Comma-separated">
          <input className={inputCls} value={form.authors}
            onChange={(e) => setForm((p) => ({ ...p, authors: e.target.value }))}
            placeholder="Author 1, Author 2, …" />
        </FormField>
        <FormField label="Journal / Conference">
          <input className={inputCls} value={form.journalConference}
            onChange={(e) => setForm((p) => ({ ...p, journalConference: e.target.value }))}
            placeholder="e.g. Nature Materials" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Year *" hint="1900–2100">
            <input className={inputCls} type="number" min={1900} max={2100}
              value={form.year}
              onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
              placeholder={currentYear} />
          </FormField>
          <FormField label="Citations" hint="Integer ≥ 0">
            <input className={inputCls} type="number" min={0}
              value={form.citations}
              onChange={(e) => setForm((p) => ({ ...p, citations: e.target.value }))}
              placeholder="e.g. 128" />
          </FormField>
        </div>
        <FormField label="Reference Link">
          <input className={inputCls} type="url" value={form.link}
            onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
            placeholder="https://doi.org/…" />
        </FormField>
      </div>
    </DrawerBase>
  );
}

// ─── Step 3 — Track Record & Contributions ────────────────────────────────────
interface Props { onNext: () => void; onBack: () => void; }

const blankTech    = (): TechForm    => ({ name: "", trlLevel: "", patentStatus: "", industrialAdvantages: "", applications: "", imageUrl: "", link: "" });
const blankProject = (): ProjectForm => ({ title: "", projectType: "", description: "", link: "" });
const blankPatent  = (): PatentForm  => ({ title: "", authors: "", domain: "", status: "", link: "" });
const blankPub     = (): PubForm     => ({ title: "", authors: "", journalConference: "", year: new Date().getFullYear().toString(), citations: "", link: "" });

export function Step3TrackRecord({ onNext, onBack }: Props) {
  const data              = useResearcherProfileStore((s) => s.data);
  const addTechnology     = useResearcherProfileStore((s) => s.addTechnology);
  const deleteTechnology  = useResearcherProfileStore((s) => s.deleteTechnology);
  const addProject        = useResearcherProfileStore((s) => s.addProject);
  const deleteProject     = useResearcherProfileStore((s) => s.deleteProject);
  const addPatent         = useResearcherProfileStore((s) => s.addPatent);
  const deletePatent      = useResearcherProfileStore((s) => s.deletePatent);
  const addPublication    = useResearcherProfileStore((s) => s.addPublication);
  const deletePublication = useResearcherProfileStore((s) => s.deletePublication);

  const [openSections, setOpenSections] = useState({
    technologies: true, projects: true, patents: true, publications: true,
  });
  const toggleSection = (k: keyof typeof openSections) =>
    setOpenSections((p) => ({ ...p, [k]: !p[k] }));

  const [techOpen,   setTechOpen]   = useState(false);
  const [projOpen,   setProjOpen]   = useState(false);
  const [patentOpen, setPatentOpen] = useState(false);
  const [pubOpen,    setPubOpen]    = useState(false);

  const [techForm,   setTechForm]   = useState<TechForm>(blankTech);
  const [projForm,   setProjForm]   = useState<ProjectForm>(blankProject);
  const [patentForm, setPatentForm] = useState<PatentForm>(blankPatent);
  const [pubForm,    setPubForm]    = useState<PubForm>(blankPub);

  const handleAddTech    = (t: Technology)      => { addTechnology(t);   setTechForm(blankTech()); };
  const handleAddProject = (p: ResearchProject) => { addProject(p);      setProjForm(blankProject()); };
  const handleAddPatent  = (p: Patent)          => { addPatent(p);       setPatentForm(blankPatent()); };
  const handleAddPub     = (p: Publication)     => { addPublication(p);  setPubForm(blankPub()); };

  return (
    <>
      <div className="px-4 sm:px-5 py-4 border-b border-[#F3F4F6]">
        <SectionLabel>Track Record & Contributions</SectionLabel>
        <p className="text-xs text-[#62748e] mt-0.5">All sections are optional. Add items that best represent your research impact.</p>
      </div>

      {/* ── Developed Technologies ──────────────────────────────────────────── */}
      <CollapsibleSection
        icon={Cpu} title="Developed Technologies" addLabel="Add Tech / IP"
        subtitle="Technologies you have developed, with TRL level and patent status."
        accentColor="#018E7E"
        count={data.technologies.length}
        isOpen={openSections.technologies}
        onToggle={() => toggleSection("technologies")}
        onAdd={() => setTechOpen(true)}
      >
        <CollapsibleCardGrid
          items={data.technologies}
          cols={3}
          emptyIcon={Cpu}
          emptyTitle="No technologies added"
          emptySubtitle="Add technologies you have developed or are working on."
          renderItem={(t) => (
            <TechCard key={t.id} t={t} onDelete={() => deleteTechnology(t.id)} />
          )}
        />
      </CollapsibleSection>

      {/* ── Key Projects ────────────────────────────────────────────────────── */}
      <CollapsibleSection
        icon={FolderKanban} title="Key Industrial / Research Projects" addLabel="Add Project"
        subtitle="Significant projects you have led or contributed to."
        accentColor="#d97706"
        count={data.projects.length}
        isOpen={openSections.projects}
        onToggle={() => toggleSection("projects")}
        onAdd={() => setProjOpen(true)}
      >
        <CollapsibleCardGrid
          items={data.projects}
          cols={3}
          emptyIcon={FolderKanban}
          emptyTitle="No projects added"
          emptySubtitle="Add key projects that demonstrate your research capabilities."
          renderItem={(p) => (
            <ProjectCard key={p.id} p={p} onDelete={() => deleteProject(p.id)} />
          )}
        />
      </CollapsibleSection>

      {/* ── Intellectual Property ────────────────────────────────────────────── */}
      <CollapsibleSection
        icon={FileText} title="Intellectual Property" addLabel="Add Patent"
        subtitle="Patents filed, published, or granted."
        accentColor="#7c3aed"
        count={data.patents.length}
        isOpen={openSections.patents}
        onToggle={() => toggleSection("patents")}
        onAdd={() => setPatentOpen(true)}
      >
        <CollapsibleCardGrid
          items={data.patents}
          cols={3}
          emptyIcon={FileText}
          emptyTitle="No patents added"
          emptySubtitle="Add patents you have filed or been granted."
          renderItem={(p) => (
            <PatentCard key={p.id} p={p} onDelete={() => deletePatent(p.id)} />
          )}
        />
      </CollapsibleSection>

      {/* ── Research Publications ────────────────────────────────────────────── */}
      <CollapsibleSection
        icon={BookOpen} title="Research Publications" addLabel="Add Publication"
        subtitle="Peer-reviewed papers, conference proceedings, and preprints."
        accentColor="#2563eb"
        count={data.publications.length}
        isOpen={openSections.publications}
        onToggle={() => toggleSection("publications")}
        onAdd={() => setPubOpen(true)}
      >
        <CollapsibleCardGrid
          items={data.publications}
          cols={3}
          emptyIcon={BookOpen}
          emptyTitle="No publications added"
          emptySubtitle="Add research papers, conference articles, or preprints."
          renderItem={(p) => (
            <PublicationCard key={p.id} p={p} onDelete={() => deletePublication(p.id)} />
          )}
        />
      </CollapsibleSection>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-[#e4e4e7] px-4 sm:px-5 py-3 flex items-center justify-between bg-white rounded-b-[12px]">
        <button type="button" onClick={onBack}
          className="text-sm font-medium text-[#71717a] hover:text-[#020202] transition-colors px-3 py-2 rounded-[6px] hover:bg-[#f7f7f7]">
          ← Back
        </button>
        <button type="button" onClick={onNext}
          className="flex items-center gap-2 px-5 py-2 rounded-[6px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-sm font-medium transition-colors">
          <Check className="w-4 h-4" /> Save & Continue
        </button>
      </div>

      {/* ── Drawers ─────────────────────────────────────────────────────────── */}
      <AddTechDrawer    open={techOpen}    onClose={() => setTechOpen(false)}    onSave={handleAddTech}    form={techForm}    setForm={setTechForm}    />
      <AddProjectDrawer open={projOpen}    onClose={() => setProjOpen(false)}    onSave={handleAddProject} form={projForm}    setForm={setProjForm}    />
      <AddPatentDrawer  open={patentOpen}  onClose={() => setPatentOpen(false)}  onSave={handleAddPatent}  form={patentForm}  setForm={setPatentForm}  />
      <AddPublicationDrawer open={pubOpen} onClose={() => setPubOpen(false)}     onSave={handleAddPub}     form={pubForm}     setForm={setPubForm}     />
    </>
  );
}
