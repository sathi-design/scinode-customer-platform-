"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  X, Maximize2, Minimize2, ChevronDown, ChevronUp,
  Check, Clock, AlertTriangle, FileText, Download,
  Mail, CalendarDays, ArrowLeft, Share2, Pencil,
  CheckCircle2, XCircle, Package, Headphones, Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useProposalStore,
  type ProposalRecord,
  type NegotiationPhase,
  type QuoteSnapshot,
  type ProposalRevision,
} from "@/store/useProposalStore";
import { ALL_PROJECTS } from "@/lib/projectsData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitialQuote(p: ProposalRecord): QuoteSnapshot {
  return {
    qtyValue:      p.proposedQtyValue,
    qtyUnit:       p.proposedQtyUnit,
    costValue:     p.costValue,
    currency:      p.currency,
    costUnit:      p.costUnit,
    timeline:      p.timeline,
    shipmentTerms: p.shipmentTerms,
    packaging:     p.packaging,
    paymentTerms:  p.paymentTerms,
    productSpec:   p.productSpec,
    termsConditions: p.termsConditions,
  };
}

const PHASE_ORDER: NegotiationPhase[] = [
  "submitted", "under_review", "admin_revised",
  "supplier_counter", "accepted", "rejected", "po_issued",
];

function phaseRank(phase: NegotiationPhase): number {
  return PHASE_ORDER.indexOf(phase);
}

type StageState = "completed" | "active" | "pending";

// ─── StageDot ─────────────────────────────────────────────────────────────────

function StageDot({ state, number }: { state: StageState; number: number }) {
  if (state === "completed") {
    return (
      <div className="w-7 h-7 rounded-full bg-[#1F6F54] border-2 border-[#1F6F54] flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
      </div>
    );
  }
  if (state === "active") {
    return (
      <div className="w-7 h-7 rounded-full bg-white border-2 border-[#f59e0b] flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
        <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-white border-2 border-[#d1d5db] flex items-center justify-center flex-shrink-0 z-10 text-[11px] font-semibold text-[#9ca3af]">
      {number}
    </div>
  );
}

// ─── StageBadge ───────────────────────────────────────────────────────────────

type BadgeColor = "green" | "amber" | "blue" | "red" | "gray";

function StageBadge({ label, color }: { label: string; color: BadgeColor }) {
  const styles: Record<BadgeColor, string> = {
    green: "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]",
    amber: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]",
    blue:  "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
    red:   "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]",
    gray:  "bg-[#f9fafb] text-[#6b7280] border-[#e5e7eb]",
  };
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
      styles[color],
    )}>
      {label}
    </span>
  );
}

// ─── QuoteHighlights ──────────────────────────────────────────────────────────

function QuoteHighlights({ q }: { q: QuoteSnapshot }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-[#f0faf5] border border-[#bbf7d0] rounded-[10px] p-3">
        <p className="text-[10px] font-semibold text-[#62748e] uppercase tracking-wide mb-1">Quantity</p>
        <p className="text-[20px] font-bold text-[#020202] leading-tight">
          {q.qtyValue || "—"}
          {q.qtyValue && <span className="text-[13px] font-semibold text-[#62748e] ml-1">{q.qtyUnit}</span>}
        </p>
      </div>
      <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-[10px] p-3">
        <p className="text-[10px] font-semibold text-[#62748e] uppercase tracking-wide mb-1">Cost Per Unit</p>
        <p className="text-[20px] font-bold text-[#020202] leading-tight">
          {q.currency} {q.costValue || "—"}
          {q.costValue && (
            <span className="text-[13px] font-semibold text-[#62748e] ml-0.5">/{q.costUnit}</span>
          )}
        </p>
      </div>
    </div>
  );
}

// ─── QuoteDetailsGrid ─────────────────────────────────────────────────────────

function QuoteDetailsGrid({
  q,
  showFull = false,
}: {
  q: QuoteSnapshot;
  showFull?: boolean;
}) {
  const rows = [
    { label: "Timeline",        value: q.timeline },
    { label: "Shipment Terms",  value: q.shipmentTerms },
    { label: "Packaging",       value: q.packaging },
    { label: "Payment Terms",   value: q.paymentTerms },
  ].filter((r) => r.value);

  return (
    <div className="space-y-2 mb-3">
      {rows.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {rows.map(({ label, value }) => (
            <div key={label} className="bg-[#f9fafb] border border-[#f3f4f6] rounded-[8px] px-3 py-2">
              <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide">{label}</p>
              <p className="text-[12px] font-semibold text-[#353535] mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}
      {showFull && q.productSpec && (
        <div className="bg-[#f9fafb] border border-[#f3f4f6] rounded-[8px] px-3 py-3">
          <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-1.5">
            Product Specification
          </p>
          <p className="text-[12px] text-[#353535] whitespace-pre-line leading-[18px]">{q.productSpec}</p>
        </div>
      )}
      {showFull && q.termsConditions && (
        <div className="bg-[#f9fafb] border border-[#f3f4f6] rounded-[8px] px-3 py-3">
          <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-1.5">
            Terms & Conditions
          </p>
          <p className="text-[12px] text-[#353535] whitespace-pre-line leading-[18px]">{q.termsConditions}</p>
        </div>
      )}
    </div>
  );
}

// ─── StageContainer ───────────────────────────────────────────────────────────

function StageContainer({
  number,
  title,
  badge,
  badgeColor,
  state,
  isLast = false,
  children,
}: {
  number: number;
  title: string;
  badge: string;
  badgeColor: BadgeColor;
  state: StageState;
  isLast?: boolean;
  children?: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(state !== "active");

  // Sync collapse when stage state changes (e.g., auto-collapse completed stages)
  useEffect(() => {
    setCollapsed(state !== "active");
  }, [state]);

  const canToggle = state !== "pending";

  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        <StageDot state={state} number={number} />
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1 mt-1 min-h-[20px]",
              state === "completed" ? "bg-[#1F6F54]" : "bg-[#e4e4e7]",
            )}
          />
        )}
      </div>

      {/* Stage body */}
      <div className="flex-1 pb-5 min-w-0">
        {/* Header row */}
        <button
          type="button"
          disabled={!canToggle}
          onClick={() => canToggle && setCollapsed((p) => !p)}
          className={cn(
            "flex items-center justify-between w-full mb-2.5 text-left",
            canToggle && "group cursor-pointer",
          )}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "text-[13px] font-semibold leading-tight",
                state === "pending" ? "text-[#9ca3af]" : "text-[#020202]",
              )}
            >
              Stage {number}: {title}
            </span>
            {state !== "pending" && (
              <StageBadge label={badge} color={badgeColor} />
            )}
          </div>
          {canToggle && (
            <ChevronDown
              className={cn(
                "w-4 h-4 text-[#9ca3af] transition-transform flex-shrink-0 ml-2",
                !collapsed && "rotate-180",
              )}
            />
          )}
        </button>

        {/* Collapsible content */}
        {!collapsed && state !== "pending" && children && (
          <div className="bg-white border border-[#e4e4e7] rounded-[12px] p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stage 1: Proposal Submitted ──────────────────────────────────────────────

function Stage1Content({ proposal }: { proposal: ProposalRecord }) {
  const [expanded, setExpanded] = useState(false);
  const q = getInitialQuote(proposal);

  return (
    <>
      <QuoteHighlights q={q} />
      <QuoteDetailsGrid q={q} showFull={expanded} />

      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-1 text-[12px] font-semibold text-[#1F6F54] hover:underline mb-3"
      >
        {expanded ? (
          <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
        ) : (
          <><ChevronDown className="w-3.5 h-3.5" /> View full details</>
        )}
      </button>

      {proposal.fileCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f9fafb] rounded-[8px] border border-[#f3f4f6]">
          <FileText className="w-4 h-4 text-[#62748e]" />
          <span className="text-[12px] text-[#62748e]">
            {proposal.fileCount} supporting document{proposal.fileCount !== 1 ? "s" : ""} attached
          </span>
        </div>
      )}
    </>
  );
}

// ─── Stage 2: Under Review ────────────────────────────────────────────────────

function Stage2Content({
  proposal,
  onSimulateAccept,
  onSimulateReject,
  onSimulateRevise,
}: {
  proposal: ProposalRecord;
  onSimulateAccept: () => void;
  onSimulateReject: () => void;
  onSimulateRevise: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const q = getInitialQuote(proposal);

  return (
    <>
      {/* Review status message */}
      <div className="flex items-start gap-2.5 p-3 bg-[#fffbeb] border border-[#fde68a] rounded-[10px] mb-4">
        <Clock className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#92400e] leading-[18px]">
          Your submitted quote is currently under review by the Scimplify team.
          We&apos;ll update you once a decision has been made.
        </p>
      </div>

      {/* Quantity + cost highlight */}
      <QuoteHighlights q={q} />

      {/* Expandable full details */}
      <button
        onClick={() => setShowDetails((p) => !p)}
        className="flex items-center gap-1 text-[12px] font-semibold text-[#1F6F54] hover:underline mb-3"
      >
        <ChevronDown
          className={cn("w-3.5 h-3.5 transition-transform", showDetails && "rotate-180")}
        />
        {showDetails ? "Hide details" : "View submitted details"}
      </button>

      {showDetails && <QuoteDetailsGrid q={q} showFull />}

      {/* Admin simulation panel */}
      <div className="mt-4 pt-4 border-t border-dashed border-[#e4e4e7]">
        <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-2.5">
          Simulate Admin Response (Demo)
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onSimulateAccept}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#f0fdf4] border border-[#bbf7d0] text-[11px] font-semibold text-[#15803d] hover:bg-[#dcfce7] transition-colors"
          >
            <Check className="w-3 h-3" /> Accept Quote
          </button>
          <button
            onClick={onSimulateReject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#fff1f2] border border-[#fecdd3] text-[11px] font-semibold text-[#be123c] hover:bg-[#ffe4e6] transition-colors"
          >
            <XCircle className="w-3 h-3" /> Reject Quote
          </button>
          <button
            onClick={onSimulateRevise}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#eff6ff] border border-[#bfdbfe] text-[11px] font-semibold text-[#1d4ed8] hover:bg-[#dbeafe] transition-colors"
          >
            <Pencil className="w-3 h-3" /> Send Revised Quote
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Inline revision form ──────────────────────────────────────────────────────

const inputCls =
  "w-full border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-[12px] text-[#020202] focus:outline-none focus:ring-1 focus:ring-[#1F6F54]/60 bg-white placeholder:text-[#9ca3af]";
const labelCls = "block text-[10px] font-semibold text-[#62748e] uppercase tracking-wide mb-1";

function RevisionForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: QuoteSnapshot;
  onSubmit: (q: QuoteSnapshot) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<QuoteSnapshot>({ ...initial });

  const set =
    (k: keyof QuoteSnapshot) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-3">
      <p className="text-[12px] font-semibold text-[#020202] mb-1">Submit Revised Quote</p>
      <div className="grid grid-cols-2 gap-3">
        {/* Quantity */}
        <div>
          <label className={labelCls}>Quantity</label>
          <div className="flex gap-1.5">
            <input value={form.qtyValue} onChange={set("qtyValue")} placeholder="e.g. 20" className={cn(inputCls, "flex-1")} />
            <input value={form.qtyUnit} onChange={set("qtyUnit")} placeholder="MT" className={cn(inputCls, "w-16 text-center")} />
          </div>
        </div>
        {/* Cost */}
        <div>
          <label className={labelCls}>Cost Per Unit</label>
          <div className="flex gap-1.5">
            <input value={form.costValue} onChange={set("costValue")} placeholder="e.g. 1320" className={cn(inputCls, "flex-1")} />
            <input value={form.costUnit} onChange={set("costUnit")} placeholder="kg" className={cn(inputCls, "w-16 text-center")} />
          </div>
        </div>
        {/* Timeline */}
        <div>
          <label className={labelCls}>Timeline</label>
          <input value={form.timeline} onChange={set("timeline")} placeholder="e.g. 4 weeks" className={inputCls} />
        </div>
        {/* Shipment Terms */}
        <div>
          <label className={labelCls}>Shipment Terms</label>
          <input value={form.shipmentTerms} onChange={set("shipmentTerms")} placeholder="e.g. EXW" className={inputCls} />
        </div>
        {/* Packaging */}
        <div>
          <label className={labelCls}>Packaging</label>
          <input value={form.packaging} onChange={set("packaging")} placeholder="e.g. Drums (200 L)" className={inputCls} />
        </div>
        {/* Payment Terms */}
        <div>
          <label className={labelCls}>Payment Terms</label>
          <input value={form.paymentTerms} onChange={set("paymentTerms")} placeholder="e.g. Net 30" className={inputCls} />
        </div>
      </div>
      {/* Product Spec */}
      <div>
        <label className={labelCls}>Product Specification</label>
        <textarea value={form.productSpec} onChange={set("productSpec")} rows={3} className={cn(inputCls, "resize-none")} />
      </div>
      {/* T&C */}
      <div>
        <label className={labelCls}>Terms & Conditions</label>
        <textarea value={form.termsConditions} onChange={set("termsConditions")} rows={2} className={cn(inputCls, "resize-none")} />
      </div>
      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSubmit(form)}
          className="flex-1 py-2.5 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" /> Submit Revision
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-[8px] border border-[#e4e4e7] text-[#62748e] text-[12px] font-semibold hover:bg-[#f9fafb] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Stage 3 sub-components ───────────────────────────────────────────────────

/** Compact top card showing the original supplier submission — always visible */
function InitialProposalCard({
  quote,
  date,
}: {
  quote: QuoteSnapshot;
  date: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-[10px] border border-[#bbf7d0] overflow-hidden mb-1">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-[#f0faf5] text-left"
      >
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#1F6F54] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            1
          </span>
          <span className="text-[12px] font-semibold text-[#020202]">Initial Proposal</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1F6F54]/10 text-[#1F6F54] font-semibold border border-[#bbf7d0]">
            Version 1
          </span>
          <span className="text-[11px] text-[#62748e]">· You</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#9ca3af]">{date}</span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-[#9ca3af] transition-transform",
              expanded && "rotate-180",
            )}
          />
        </div>
      </button>

      {/* Always-visible compact highlights */}
      <div className="px-3 py-2.5 bg-white flex gap-5 border-t border-[#f0fdf4]">
        <div>
          <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide">Quantity</p>
          <p className="text-[15px] font-bold text-[#020202] leading-tight">
            {quote.qtyValue || "—"}
            {quote.qtyValue && (
              <span className="text-[11px] font-semibold text-[#62748e] ml-1">{quote.qtyUnit}</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide">Cost / Unit</p>
          <p className="text-[15px] font-bold text-[#020202] leading-tight">
            {quote.currency} {quote.costValue || "—"}
            {quote.costValue && (
              <span className="text-[11px] font-semibold text-[#62748e] ml-0.5">/{quote.costUnit}</span>
            )}
          </p>
        </div>
      </div>

      {/* Expanded full details */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 bg-white border-t border-[#f3f4f6]">
          <QuoteDetailsGrid q={quote} showFull />
        </div>
      )}
    </div>
  );
}

/** One revision entry in the history timeline */
function RevisionCard({
  revision,
  isLatest,
  defaultExpanded,
}: {
  revision: ProposalRevision;
  isLatest: boolean;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Sync expansion when "latest" changes (new revision appended)
  useEffect(() => {
    if (isLatest) setExpanded(true);
  }, [isLatest]);

  const isAdmin   = revision.from === "admin";
  const revNumber = revision.versionNumber ?? 2; // fallback for legacy data

  const dotColor    = isAdmin ? "#0077CC" : "#1F6F54";
  const headerBg    = isAdmin ? "#eff6ff"  : "#f0faf5";
  const borderColor = isAdmin ? "#bfdbfe"  : "#bbf7d0";
  const tagBg       = isAdmin ? "#dbeafe"  : "#dcfce7";
  const tagText     = isAdmin ? "#1d4ed8"  : "#15803d";

  return (
    <div className="flex gap-3 pt-4 first:pt-2">
      {/* Dot on the vertical line */}
      <div className="flex flex-col items-center flex-shrink-0 relative">
        <div
          className="w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-white text-[10px] font-bold"
          style={{ borderColor: dotColor, color: dotColor }}
        >
          {revNumber}
        </div>
      </div>

      {/* Card */}
      <div
        className="flex-1 min-w-0 rounded-[10px] border overflow-hidden"
        style={{ borderColor }}
      >
        {/* Header */}
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-left"
          style={{ background: headerBg }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="text-[12px] font-semibold text-[#020202]">
              Revision {revNumber - 1}
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
              style={{ background: tagBg, color: tagText, borderColor }}
            >
              {isAdmin ? "Scimplify" : "You"}
            </span>
            <span className="text-[11px] text-[#9ca3af]">{revision.createdAt}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {isLatest && (
              <span className="text-[10px] font-bold text-white bg-[#1F6F54] rounded-full px-2 py-0.5">
                Latest
              </span>
            )}
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-[#9ca3af] transition-transform",
                expanded && "rotate-180",
              )}
            />
          </div>
        </button>

        {/* Collapsed: compact highlights */}
        {!expanded && (
          <div className="px-3 py-2.5 bg-white flex gap-5">
            <div>
              <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide">Quantity</p>
              <p className="text-[14px] font-bold text-[#020202] leading-tight">
                {revision.quote.qtyValue || "—"}
                {revision.quote.qtyValue && (
                  <span className="text-[11px] text-[#62748e] ml-1">{revision.quote.qtyUnit}</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide">Cost / Unit</p>
              <p className="text-[14px] font-bold text-[#020202] leading-tight">
                {revision.quote.currency} {revision.quote.costValue || "—"}
                {revision.quote.costValue && (
                  <span className="text-[11px] text-[#62748e] ml-0.5">/{revision.quote.costUnit}</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Expanded: full quote */}
        {expanded && (
          <div className="px-3 pb-3 pt-2 bg-white">
            <QuoteHighlights q={revision.quote} />
            <QuoteDetailsGrid q={revision.quote} showFull />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stage 3: Negotiation — version-controlled revision history ───────────────

function Stage3Content({
  proposal,
  onAccept,
  onSubmitRevision,
  onSimulateAdminAccept,
  onSimulateAdminReject,
  onSimulateAdminRevise,
}: {
  proposal: ProposalRecord;
  onAccept: () => void;
  onSubmitRevision: (q: QuoteSnapshot) => void;
  onSimulateAdminAccept: () => void;
  onSimulateAdminReject: () => void;
  onSimulateAdminRevise: () => void;
}) {
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  const phase       = proposal.negotiationPhase ?? "submitted";
  const initialQ    = getInitialQuote(proposal);
  const allRevisions = proposal.revisions ?? [];
  const latestRev   = allRevisions.length > 0 ? allRevisions[allRevisions.length - 1] : null;
  const isRejected  = phase === "rejected";

  const latestIsAdmin    = latestRev?.from === "admin";
  const latestIsSupplier = latestRev?.from === "supplier" || (!latestRev && phase === "supplier_counter");
  const showCTAs         = !isRejected && latestIsAdmin && !showRevisionForm;

  // Best quote to pre-fill revision form: latest admin quote, else initial
  const revisionBase = allRevisions.filter((r) => r.from === "admin").slice(-1)[0]?.quote ?? initialQ;

  return (
    <div className="space-y-0">

      {/* ── Version 1: Initial Proposal (always shown at top) ──────────────── */}
      <InitialProposalCard quote={initialQ} date={proposal.submittedDate} />

      {/* ── Revision timeline ─────────────────────────────────────────────── */}
      {allRevisions.length > 0 && (
        <div className="relative pl-3">
          {/* Vertical connector line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-[#e4e4e7]" />

          {allRevisions.map((rev, idx) => (
            <RevisionCard
              key={rev.id}
              revision={rev}
              isLatest={idx === allRevisions.length - 1 && !isRejected}
              defaultExpanded={idx === allRevisions.length - 1 && !isRejected}
            />
          ))}
        </div>
      )}

      {/* ── Inline revision form ──────────────────────────────────────────── */}
      {showRevisionForm && (
        <div className="mt-4 pt-4 border-t border-[#e4e4e7]">
          <RevisionForm
            initial={revisionBase}
            onSubmit={(q) => {
              onSubmitRevision(q);
              setShowRevisionForm(false);
            }}
            onCancel={() => setShowRevisionForm(false)}
          />
        </div>
      )}

      {/* ── CTAs when latest revision is from admin ───────────────────────── */}
      {showCTAs && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={onAccept}
            className="flex-1 py-2.5 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Accept Quote
          </button>
          <button
            onClick={() => setShowRevisionForm(true)}
            className="flex-1 py-2.5 rounded-[8px] border border-[#e4e4e7] text-[#353535] text-[12px] font-semibold hover:bg-[#f9fafb] transition-colors flex items-center justify-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" /> Revise Quote
          </button>
        </div>
      )}

      {/* ── Waiting state when latest is from supplier ────────────────────── */}
      {latestIsSupplier && !isRejected && !showRevisionForm && (
        <div className="flex items-start gap-2.5 p-3 bg-[#fffbeb] border border-[#fde68a] rounded-[10px] mt-4">
          <Clock className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#92400e] leading-[18px]">
            Your revised quote has been submitted. Awaiting Scimplify&apos;s response.
          </p>
        </div>
      )}

      {/* ── Rejection banner (shown after history, not instead of it) ──────── */}
      {isRejected && (
        <div className="flex items-start gap-3 p-4 bg-[#fff1f2] border border-[#fecdd3] rounded-[10px] mt-4">
          <XCircle className="w-5 h-5 text-[#be123c] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-[#be123c] mb-1">Quote Rejected</p>
            <p className="text-[12px] text-[#6b7280] leading-[18px]">
              {proposal.rejectionReason ||
                "Your quote has been reviewed and rejected by the Scimplify team."}
            </p>
          </div>
        </div>
      )}

      {/* ── Admin simulation panel ─────────────────────────────────────────── */}
      {!isRejected && !showRevisionForm && (
        <div className="mt-4 pt-4 border-t border-dashed border-[#e4e4e7]">
          <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-2.5">
            Simulate Admin Response (Demo)
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onSimulateAdminAccept}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#f0fdf4] border border-[#bbf7d0] text-[11px] font-semibold text-[#15803d] hover:bg-[#dcfce7] transition-colors"
            >
              <Check className="w-3 h-3" /> Accept Quote
            </button>
            <button
              onClick={onSimulateAdminReject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#fff1f2] border border-[#fecdd3] text-[11px] font-semibold text-[#be123c] hover:bg-[#ffe4e6] transition-colors"
            >
              <XCircle className="w-3 h-3" /> Reject Quote
            </button>
            <button
              onClick={onSimulateAdminRevise}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#eff6ff] border border-[#bfdbfe] text-[11px] font-semibold text-[#1d4ed8] hover:bg-[#dbeafe] transition-colors"
            >
              <Pencil className="w-3 h-3" /> Send Revised Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stage 4: Quote Accepted ───────────────────────────────────────────────────

function Stage4Content({
  proposal,
  onSimulatePO,
}: {
  proposal: ProposalRecord;
  onSimulatePO: () => void;
}) {
  const adminRevisions = (proposal.revisions ?? []).filter((r) => r.from === "admin");
  const q = adminRevisions.length > 0
    ? adminRevisions[adminRevisions.length - 1].quote
    : getInitialQuote(proposal);

  return (
    <>
      <div className="flex items-start gap-2.5 p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-[10px] mb-4">
        <CheckCircle2 className="w-4 h-4 text-[#15803d] flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#15803d] font-medium leading-[18px]">
          Your quote has been accepted by Scimplify. A Purchase Order will be shared shortly.
        </p>
      </div>
      <QuoteHighlights q={q} />
      <QuoteDetailsGrid q={q} showFull />

      {/* Simulate PO */}
      {proposal.negotiationPhase === "accepted" && (
        <div className="mt-4 pt-4 border-t border-dashed border-[#e4e4e7]">
          <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-2.5">
            Simulate Admin Action (Demo)
          </p>
          <button
            onClick={onSimulatePO}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#f0faf5] border border-[#bbf7d0] text-[11px] font-semibold text-[#1F6F54] hover:bg-[#dcfce7] transition-colors"
          >
            <Package className="w-3 h-3" /> Upload Purchase Order
          </button>
        </div>
      )}
    </>
  );
}

// ─── Stage 5: PO Issued ───────────────────────────────────────────────────────

function Stage5Content({ proposal }: { proposal: ProposalRecord }) {
  if (proposal.negotiationPhase === "po_issued" && proposal.poDocumentUrl) {
    return (
      <div className="flex items-center justify-between p-3 bg-[#f0faf5] border border-[#bbf7d0] rounded-[10px]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1F6F54]" />
          <div>
            <p className="text-[12px] font-semibold text-[#020202]">Purchase Order</p>
            <p className="text-[10px] text-[#62748e]">Ready for download</p>
          </div>
        </div>
        <a
          href={proposal.poDocumentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#1F6F54] text-white text-[11px] font-semibold hover:bg-[#185C45] transition-colors"
        >
          <Download className="w-3 h-3" /> View PO
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 p-3 bg-[#fffbeb] border border-[#fde68a] rounded-[10px]">
      <Clock className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
      <p className="text-[12px] text-[#92400e] leading-[18px]">
        The purchase order will be uploaded shortly by the Scimplify team.
      </p>
    </div>
  );
}

// ─── Right panel: Scimplify Representative ────────────────────────────────────

function ScinodeConnect() {
  return (
    <div className="relative rounded-[12px] bg-[#0F1C17] p-5 text-white overflow-hidden group">
      {/* Background icon — decorative, fades/scales on hover */}
      <Headphones
        className="absolute -bottom-3 -right-3 w-28 h-28 text-white opacity-[0.04] transition-all duration-300 ease-in-out group-hover:opacity-[0.09] group-hover:scale-110 pointer-events-none"
        strokeWidth={1.2}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-[8px] bg-[#1F6F54] flex items-center justify-center flex-shrink-0">
          <Headphones className="w-3.5 h-3.5 text-white" strokeWidth={2} />
        </div>
        <p className="text-[13px] font-bold text-white leading-tight">
          Connect Simplify Representative
        </p>
      </div>

      {/* Contact details */}
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mb-0.5">
            Name
          </p>
          <p className="text-[13px] font-semibold text-white">Vinayak Verma</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mb-0.5">
            Contact No.
          </p>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-[#1F6F54] flex-shrink-0" />
            <p className="text-[13px] font-semibold text-white">+91-9876512345</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mb-0.5">
            Email ID
          </p>
          <div className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-[#1F6F54] flex-shrink-0" />
            <p className="text-[13px] font-semibold text-white break-all">
              vinayakshama@simplify.com
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button className="w-full flex items-center justify-center gap-2 py-2 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] text-[12px] font-semibold text-white transition-colors duration-200">
        <CalendarDays className="w-3.5 h-3.5" /> Schedule a Discussion Call
      </button>
    </div>
  );
}

// ─── Right panel: Project details ─────────────────────────────────────────────

function ProjectDetailsPanel({ proposal }: { proposal: ProposalRecord }) {
  const project = useMemo(
    () => ALL_PROJECTS.find((p) => p.projectId === proposal.projectId),
    [proposal.projectId],
  );
  const [showMoreDesc, setShowMoreDesc] = useState(false);

  const details = project
    ? [
        { label: "PROJECT NAME",  value: project.targetMolecule },
        { label: "CAS",           value: project.cas },
        { label: "INDUSTRY",      value: project.industry },
        { label: "LEAD TIME",     value: project.timeline },
        { label: "PURITY",        value: project.purity },
      ]
    : [
        { label: "PROJECT ID",  value: proposal.projectId },
        { label: "CAS",         value: proposal.cas },
        { label: "INDUSTRY",    value: proposal.industry },
        { label: "PRODUCT",     value: proposal.productName },
      ];

  const docs = project?.attachedDocs ?? [];
  const description = project?.fullDescription || project?.description || "";

  return (
    <div className="space-y-4">
      {/* Project Details card */}
      <div className="bg-white border border-[#e4e4e7] rounded-[12px] p-4">
        <p className="text-[12px] font-bold text-[#020202] mb-3">Project Details</p>
        <div className="space-y-3">
          {details.map(({ label, value }) =>
            value ? (
              <div key={label}>
                <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide">{label}</p>
                <p className="text-[12px] font-medium text-[#353535] mt-0.5">{value}</p>
              </div>
            ) : null,
          )}
          {description && (
            <div>
              <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide">
                PROJECT DESCRIPTION
              </p>
              <p
                className={cn(
                  "text-[12px] text-[#353535] mt-0.5 leading-[18px]",
                  !showMoreDesc && "line-clamp-3",
                )}
              >
                {description}
              </p>
              <button
                onClick={() => setShowMoreDesc((p) => !p)}
                className="text-[11px] font-semibold text-[#1F6F54] hover:underline mt-0.5"
              >
                {showMoreDesc ? "See less" : "See all"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Attached Documents */}
      {docs.length > 0 && (
        <div className="bg-white border border-[#e4e4e7] rounded-[12px] p-4">
          <p className="text-[12px] font-bold text-[#020202] mb-3">Attached Documents</p>
          <div className="space-y-2">
            {docs.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between p-2.5 bg-[#f9fafb] rounded-[8px] border border-[#f3f4f6]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-[#62748e] flex-shrink-0" />
                  <span className="text-[12px] font-medium text-[#353535] truncate">{doc.name}</span>
                </div>
                <button className="p-1.5 rounded hover:bg-[#e4e4e7] transition-colors flex-shrink-0 ml-2">
                  <Download className="w-3.5 h-3.5 text-[#9ca3af]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCINODE Connect */}
      <ScinodeConnect />
    </div>
  );
}

// ─── Outer guard: resolves proposal, then delegates to inner ─────────────────
// Keeps the early-return BEFORE any hooks so Rules of Hooks is never violated.

export function RFQProposalDrawer({
  proposalId,
  onClose,
}: {
  proposalId: string | null;
  onClose: () => void;
}) {
  const proposals = useProposalStore((s) => s.proposals);
  const proposal  = proposalId
    ? (proposals.find((p) => p.id === proposalId) ?? null)
    : null;

  if (!proposal || !proposalId) return null;

  return (
    <RFQProposalDrawerInner
      proposal={proposal}
      proposalId={proposalId}
      onClose={onClose}
    />
  );
}

// ─── Inner component — all hooks live here, proposal is always defined ────────

function RFQProposalDrawerInner({
  proposal,
  proposalId,
  onClose,
}: {
  proposal: ProposalRecord;
  proposalId: string;
  onClose: () => void;
}) {
  const updateStatus        = useProposalStore((s) => s.updateStatus);
  const setNegotiationPhase = useProposalStore((s) => s.setNegotiationPhase);
  const addRevision         = useProposalStore((s) => s.addRevision);
  const setRejection        = useProposalStore((s) => s.setRejection);
  const setPODocument       = useProposalStore((s) => s.setPODocument);

  const [fullscreen, setFullscreen] = useState(false);

  const project = useMemo(
    () => ALL_PROJECTS.find((p) => p.projectId === proposal.projectId) ?? null,
    [proposal.projectId],
  );

  // Close on Escape (drawer mode only)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !fullscreen) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, fullscreen]);

  const phase = proposal.negotiationPhase ?? "submitted";

  // ── Stage states ─────────────────────────────────────────────────────────────
  const s1State: StageState = phase === "submitted" ? "active" : "completed";
  const s2State: StageState =
    phase === "submitted" ? "pending" :
    phase === "under_review" ? "active" :
    "completed";

  const wasNegotiated = (proposal.revisions?.length ?? 0) > 0;

  const showStage3 =
    ["admin_revised", "supplier_counter", "rejected"].includes(phase) ||
    (wasNegotiated && ["accepted", "po_issued"].includes(phase));

  const s3State: StageState =
    ["accepted", "po_issued"].includes(phase) && wasNegotiated ? "completed" :
    ["admin_revised", "supplier_counter"].includes(phase) ? "active" :
    phase === "rejected" ? "active" :
    "pending";

  const showStage4 = ["accepted", "po_issued"].includes(phase);
  const s4State: StageState =
    phase === "po_issued" ? "completed" :
    phase === "accepted" ? "active" :
    "pending";

  const showStage5 = ["accepted", "po_issued"].includes(phase);
  const s5State: StageState = phase === "po_issued" ? "active" : "pending";

  // ── Admin simulation helpers ──────────────────────────────────────────────────
  const simulateAdminAccept = useCallback(() => {
    setNegotiationPhase(proposalId, "accepted");
    updateStatus(proposalId, "Quote Accepted");
  }, [proposalId, setNegotiationPhase, updateStatus]);

  const simulateAdminReject = useCallback(() => {
    setRejection(
      proposalId,
      "The submitted quote does not meet our current pricing requirements. We appreciate your interest and encourage you to reach out for future opportunities.",
    );
  }, [proposalId, setRejection]);

  const simulateAdminRevise = useCallback(() => {
    const allRevisions = proposal.revisions ?? [];
    const base = getInitialQuote(proposal);
    const adminQ: QuoteSnapshot = {
      ...base,
      costValue: base.costValue
        ? String(Math.max(1, Math.round(Number(base.costValue) * 0.92)))
        : "1250",
      qtyValue: base.qtyValue
        ? String(Math.round(Number(base.qtyValue) * 1.1))
        : "22",
      timeline:      base.timeline      || "6 weeks",
      shipmentTerms: base.shipmentTerms || "EXW (Ex Works)",
      packaging:     base.packaging     || "Drums (200 L)",
      paymentTerms:  base.paymentTerms  || "Net 30",
      termsConditions:
        "Standard Scimplify T&C apply. Delivery timeline subject to order confirmation. Quality standards to be mutually agreed upon before production.",
    };
    const adminCount = allRevisions.filter((r) => r.from === "admin").length;
    addRevision(proposalId, {
      id:            `REV-ADM-${Date.now()}`,
      versionNumber: allRevisions.length + 2,
      from:          "admin",
      label:         `Scimplify Revised Quote v${adminCount + 1}`,
      createdAt:     new Date().toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      }),
      quote: adminQ,
      notes: "Revised pricing based on current market rates.",
    });
    setNegotiationPhase(proposalId, "admin_revised");
  }, [proposalId, proposal, addRevision, setNegotiationPhase]);

  const handleAccept = useCallback(() => {
    setNegotiationPhase(proposalId, "accepted");
    updateStatus(proposalId, "Quote Accepted");
  }, [proposalId, setNegotiationPhase, updateStatus]);

  const handleSubmitRevision = useCallback(
    (q: QuoteSnapshot) => {
      const allRevisions = proposal.revisions ?? [];
      const supplierCount = allRevisions.filter((r) => r.from === "supplier").length;
      const revision: ProposalRevision = {
        id:            `REV-SUP-${Date.now()}`,
        versionNumber: allRevisions.length + 2,
        from:          "supplier",
        label:         `Revised Quote from Supplier v${supplierCount + 1}`,
        createdAt:     new Date().toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
        }),
        quote: q,
      };
      addRevision(proposalId, revision);
      setNegotiationPhase(proposalId, "supplier_counter");
      updateStatus(proposalId, "Quote Submitted");
    },
    [proposalId, proposal.revisions, addRevision, setNegotiationPhase, updateStatus],
  );

  const simulatePO = useCallback(() => {
    setPODocument(proposalId, "#po-demo-document.pdf");
  }, [proposalId, setPODocument]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Dimmed overlay (drawer mode only) */}
      {!fullscreen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      {/* Drawer / fullscreen panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col bg-white",
          "shadow-[0px_25px_50px_rgba(0,0,0,0.25)]",
          "transition-[width] duration-300 ease-in-out",
          fullscreen ? "w-full" : "w-full md:w-[70vw]",
        )}
      >
        {/* ── Sticky header ───────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 px-5 py-3 flex items-center justify-between bg-white border-b border-[#e4e4e7]">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-[#9ca3af] mb-0.5">
              <span>My Proposals</span>
              <span className="mx-0.5">›</span>
              <span className="font-semibold text-[#353535]">Sent Proposal</span>
            </div>
            <p className="text-[11px] text-[#9ca3af]">
              Viewing submitted proposal details and tracking current status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f0faf5] text-[#1F6F54] border border-[#bbf7d0]">
              Project Proposal
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white bg-[#0077CC]">
              {proposal.proposalType}
            </span>
            <button
              onClick={() => setFullscreen((p) => !p)}
              title={fullscreen ? "Exit fullscreen" : "Maximize"}
              className="p-1.5 rounded-[6px] text-[#9ca3af] hover:text-[#353535] hover:bg-[#f3f4f6] transition-colors"
            >
              {fullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            {!fullscreen && (
              <button
                onClick={onClose}
                title="Close"
                className="p-1.5 rounded-[6px] text-[#9ca3af] hover:text-[#353535] hover:bg-[#f3f4f6] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">

            {/* ── Project summary card ──────────────────────────────────────── */}
            <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-4 mb-5 shadow-[0px_2px_8px_rgba(0,0,0,0.05)]">
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="w-[100px] h-[72px] rounded-[8px] overflow-hidden bg-[#f3f4f6] flex-shrink-0">
                  {project?.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#d4e0d9] to-[#b5cec6]" />
                  )}
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#0077CC] mb-1">
                      {proposal.proposalType}
                    </span>
                    <h2 className="text-[14px] font-semibold text-[#020202] leading-[20px] line-clamp-2">
                      {proposal.projectTitle}
                    </h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-[11px] text-[#62748e]">
                      <span>
                        Project ID:{" "}
                        <span className="font-semibold text-[#353535]">{proposal.projectId}</span>
                      </span>
                      {(project?.postedDate || proposal.submittedDate) && (
                        <span>
                          Posted:{" "}
                          <span className="font-semibold text-[#353535]">
                            {project?.postedDate ?? proposal.submittedDate}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-2 flex-shrink-0">
                    <button
                      onClick={onClose}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#e4e4e7] text-[#353535] text-[11px] font-semibold hover:bg-[#f9fafb] transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#e4e4e7] text-[#353535] text-[11px] font-semibold hover:bg-[#f9fafb] transition-colors">
                      <Share2 className="w-3.5 h-3.5" /> Export
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Two-column layout ──────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-5 items-start">

              {/* LEFT: Stage timeline (70%) */}
              <div className="flex-[7] min-w-0 w-full">

                {/* Stage 1 */}
                <StageContainer
                  number={1}
                  title="Proposal Submitted"
                  badge="Proposal Submitted"
                  badgeColor="green"
                  state={s1State}
                >
                  <Stage1Content proposal={proposal} />
                </StageContainer>

                {/* Stage 2 */}
                <StageContainer
                  number={2}
                  title="Under Review"
                  badge="Under Review"
                  badgeColor="amber"
                  state={s2State}
                >
                  <Stage2Content
                    proposal={proposal}
                    onSimulateAccept={simulateAdminAccept}
                    onSimulateReject={simulateAdminReject}
                    onSimulateRevise={simulateAdminRevise}
                  />
                </StageContainer>

                {/* Advance to under_review — only while still in "submitted" */}
                {phase === "submitted" && (
                  <div className="flex gap-3 mb-5 pl-0">
                    <div className="w-7 flex-shrink-0" />
                    <div className="flex-1 p-3 bg-[#f9fafb] border border-dashed border-[#e4e4e7] rounded-[10px]">
                      <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-2">
                        Simulate Admin Action (Demo)
                      </p>
                      <button
                        onClick={() => setNegotiationPhase(proposalId, "under_review")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#eff6ff] border border-[#bfdbfe] text-[11px] font-semibold text-[#1d4ed8] hover:bg-[#dbeafe] transition-colors"
                      >
                        <AlertTriangle className="w-3 h-3" /> Mark as Under Review
                      </button>
                    </div>
                  </div>
                )}

                {/* Stage 3: Negotiation */}
                {showStage3 && (
                  <StageContainer
                    number={3}
                    title={phase === "rejected" ? "Rejected" : "Under Negotiation"}
                    badge={phase === "rejected" ? "Rejected" : "Under Negotiation"}
                    badgeColor={phase === "rejected" ? "red" : "amber"}
                    state={s3State}
                  >
                    <Stage3Content
                      proposal={proposal}
                      onAccept={handleAccept}
                      onSubmitRevision={handleSubmitRevision}
                      onSimulateAdminAccept={simulateAdminAccept}
                      onSimulateAdminReject={simulateAdminReject}
                      onSimulateAdminRevise={simulateAdminRevise}
                    />
                  </StageContainer>
                )}

                {/* Stage 4: Accepted */}
                {showStage4 && (
                  <StageContainer
                    number={showStage3 ? 4 : 3}
                    title="Quote Accepted"
                    badge="Quote Accepted"
                    badgeColor="green"
                    state={s4State}
                  >
                    <Stage4Content proposal={proposal} onSimulatePO={simulatePO} />
                  </StageContainer>
                )}

                {/* Stage 5: PO Issued */}
                {showStage5 && (
                  <StageContainer
                    number={showStage3 ? 5 : 4}
                    title="PO Issued"
                    badge="PO Issued"
                    badgeColor={phase === "po_issued" ? "green" : "gray"}
                    state={s5State}
                    isLast
                  >
                    <Stage5Content proposal={proposal} />
                  </StageContainer>
                )}
              </div>

              {/* RIGHT: Project details (30%) */}
              <div className="flex-[3] w-full lg:min-w-[200px] lg:sticky lg:top-5">
                <ProjectDetailsPanel proposal={proposal} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
