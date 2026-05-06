"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── CSS class strings ────────────────────────────────────────────────────────

export const inputCls =
  "w-full border border-[#cbd5e1] rounded-[6px] px-3 py-2 text-sm text-[#020202] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1F6F54]/30 focus:border-[#1F6F54] transition-colors";

export const selectCls =
  inputCls + " bg-white appearance-none cursor-pointer";

// ─── Custom dropdown select (avoids native <select> issues inside overflow containers) ─
export function DropdownSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[] | string[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          inputCls,
          "flex items-center justify-between bg-white cursor-pointer",
          !value && "text-[#9ca3af]",
        )}
      >
        <span className="flex-1 truncate text-left">{value || placeholder || "Select…"}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[#94a3b8] flex-shrink-0 ml-2 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-[#cbd5e1] rounded-[6px] shadow-lg max-h-52 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm transition-colors border-b border-[#f3f4f6] last:border-b-0",
                value === opt
                  ? "bg-[#f0faf5] text-[#1F6F54] font-medium"
                  : "text-[#353535] hover:bg-[#f0faf5]",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Form field wrapper ───────────────────────────────────────────────────────

export function FormField({
  label,
  hint,
  children,
}: {
  label: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#020202]">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#9ca3af]">{hint}</p>}
    </div>
  );
}

// ─── Section divider ─────────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] pt-2">
      {children}
    </p>
  );
}

// ─── Pill text input (type → Enter → pill) ───────────────────────────────────

export function PillInput({
  pills,
  onChange,
  placeholder,
}: {
  pills: string[];
  onChange: (pills: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const add = () => {
    const v = input.trim();
    if (v && !pills.includes(v)) onChange([...pills, v]);
    setInput("");
  };

  const remove = (p: string) => onChange(pills.filter((x) => x !== p));

  return (
    <div
      className="flex flex-wrap gap-1.5 border border-[#cbd5e1] rounded-[6px] px-3 py-2 min-h-[40px] cursor-text focus-within:ring-2 focus-within:ring-[#1F6F54]/30 focus-within:border-[#1F6F54] transition-colors"
      onClick={() => ref.current?.focus()}
    >
      {pills.map((p) => (
        <span
          key={p}
          className="flex items-center gap-1 bg-[#e6f4ef] text-[#1F6F54] text-xs font-medium px-2 py-0.5 rounded-full"
        >
          {p}
          <button type="button" onClick={() => remove(p)} className="hover:text-[#185C45]">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        ref={ref}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); add(); }
          if (e.key === "Backspace" && !input && pills.length) remove(pills[pills.length - 1]);
        }}
        placeholder={pills.length ? "" : placeholder}
        className="flex-1 min-w-[80px] text-sm outline-none placeholder:text-[#9ca3af] bg-transparent"
      />
    </div>
  );
}

// ─── Yes / No toggle ──────────────────────────────────────────────────────────

export function YNToggle({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex rounded-[6px] overflow-hidden border border-[#cbd5e1] w-fit">
      {([true, false] as const).map((val) => (
        <button
          key={String(val)}
          type="button"
          onClick={() => onChange(val)}
          className={cn(
            "px-6 py-1.5 text-sm font-medium transition-colors",
            value === val
              ? "bg-[#1F6F54] text-white"
              : "bg-white text-[#71717a] hover:bg-[#f7f7f7]",
          )}
        >
          {val ? "Yes" : "No"}
        </button>
      ))}
    </div>
  );
}

// ─── Multi-select chip group ──────────────────────────────────────────────────

export function ChipGroup({
  options,
  selected,
  onChange,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const toggle = (opt: string) =>
    onChange(
      selected.includes(opt)
        ? selected.filter((x) => x !== opt)
        : [...selected, opt],
    );

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
            selected.includes(opt)
              ? "bg-[#1F6F54] border-[#1F6F54] text-white"
              : "bg-white border-[#cbd5e1] text-[#353535] hover:border-[#1F6F54]/50",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Tab bottom action bar ────────────────────────────────────────────────────

export function TabFooter({
  onSave,
  onBack,
  isFirst = false,
  isLast = false,
}: {
  onSave: () => void;
  onBack?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex-shrink-0 border-t border-[#e4e4e7] px-6 py-3 flex items-center justify-between bg-white rounded-b-[12px]">
      {onBack && !isFirst ? (
        <button
          onClick={onBack}
          className="text-sm font-medium text-[#71717a] hover:text-[#020202] transition-colors px-3 py-2 rounded-[6px] hover:bg-[#f7f7f7]"
        >
          ← Back
        </button>
      ) : (
        <div />
      )}
      <button
        onClick={onSave}
        className="flex items-center gap-2 px-5 py-2 rounded-[6px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-sm font-medium transition-colors"
      >
        {isLast ? "Submit Profile →" : "Save & Continue →"}
      </button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-[#f0faf5] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[#1F6F54]" />
      </div>
      <p className="text-base font-medium text-[#020202]">{title}</p>
      <p className="text-sm text-[#62748e] mt-1 max-w-xs">{subtitle}</p>
    </div>
  );
}

// ─── Card row ─────────────────────────────────────────────────────────────────

export function CardRow({
  onDelete,
  children,
}: {
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between p-4 rounded-[8px] border border-[#e4e4e7] hover:border-[#1F6F54]/30 transition-colors">
      <div className="flex-1 min-w-0">{children}</div>
      <button
        onClick={onDelete}
        className="flex-shrink-0 ml-4 text-[#9ca3af] hover:text-red-500 transition-colors mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Drawer save / cancel footer ─────────────────────────────────────────────

export function DrawerFooter({
  onCancel,
  onSave,
  saveLabel = "Save",
}: {
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={onCancel}
        className="px-4 py-2 rounded-[6px] border border-[#cbd5e1] text-sm font-medium text-[#353535] hover:bg-[#f7f7f7] transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="px-5 py-2 rounded-[6px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-sm font-medium transition-colors"
      >
        {saveLabel}
      </button>
    </div>
  );
}
