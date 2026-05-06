"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  X, Maximize2, Minimize2, ChevronDown, ChevronUp,
  Check, Clock, AlertTriangle, FileText, Download,
  Mail, CalendarDays, ArrowLeft, Share2, Pencil,
  CheckCircle2, XCircle, Package, Headphones, Phone,
  User, Video, Info, Star, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownSelect } from "@/modules/profile/SharedUI";
import {
  useProposalStore,
  type ProposalRecord,
  type NegotiationPhase,
  type QuoteSnapshot,
  type ProposalRevision,
  type CMODiscussionSummary,
} from "@/store/useProposalStore";
import { ALL_PROJECTS } from "@/lib/projectsData";

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
];
const TIMEZONES = [
  "IST (UTC+5:30)", "EST (UTC-5:00)", "PST (UTC-8:00)",
  "GMT (UTC+0:00)", "CET (UTC+1:00)", "SGT (UTC+8:00)",
];
const SHIPMENT_OPTS = [
  "EXW (Ex Works)", "FOB (Free On Board)", "CIF (Cost, Insurance & Freight)",
  "DDP (Delivered Duty Paid)", "DAP (Delivered at Place)", "FCA (Free Carrier)",
];
const PACKAGING_OPTS = [
  "Drums (200 L)", "IBC (1000 L)", "HDPE Bags (25 kg)",
  "HDPE Bags (50 kg)", "Glass Bottles", "Flexitanks", "Custom",
];
const PAYMENT_OPTS = [
  "Net 30", "Net 60", "Net 90",
  "50% advance + 50% on delivery", "Letter of Credit (LC)", "Escrow",
];
const QTY_UNITS = ["kg", "g", "mg", "MT", "L", "mL", "lb", "batch"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitialQuote(p: ProposalRecord): QuoteSnapshot {
  return {
    qtyValue:        p.proposedQtyValue,
    qtyUnit:         p.proposedQtyUnit,
    costValue:       p.costValue,
    currency:        p.currency,
    costUnit:        p.costUnit,
    timeline:        p.timeline,
    shipmentTerms:   p.shipmentTerms,
    packaging:       p.packaging,
    paymentTerms:    p.paymentTerms,
    productSpec:     p.productSpec,
    termsConditions: p.termsConditions,
  };
}

type StageState = "completed" | "active" | "pending";
type BadgeColor  = "green" | "amber" | "blue" | "red" | "gray" | "purple";

// ─── Shared UI primitives ─────────────────────────────────────────────────────

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

function StageBadge({ label, color }: { label: string; color: BadgeColor }) {
  const styles: Record<BadgeColor, string> = {
    green:  "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]",
    amber:  "bg-[#fffbeb] text-[#92400e] border-[#fde68a]",
    blue:   "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
    red:    "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]",
    gray:   "bg-[#f9fafb] text-[#6b7280] border-[#e5e7eb]",
    purple: "bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]",
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

function StageContainer({
  number, title, badge, badgeColor, state, isLast = false, children,
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
  useEffect(() => { setCollapsed(state !== "active"); }, [state]);
  const canToggle = state !== "pending";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        <StageDot state={state} number={number} />
        {!isLast && (
          <div className={cn(
            "w-0.5 flex-1 mt-1 min-h-[20px]",
            state === "completed" ? "bg-[#1F6F54]" : "bg-[#e4e4e7]",
          )} />
        )}
      </div>
      <div className="flex-1 pb-5 min-w-0">
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
            <span className={cn(
              "text-[13px] font-semibold leading-tight",
              state === "pending" ? "text-[#9ca3af]" : "text-[#020202]",
            )}>
              Stage {number}: {title}
            </span>
            {state !== "pending" && <StageBadge label={badge} color={badgeColor} />}
          </div>
          {canToggle && (
            <ChevronDown className={cn(
              "w-4 h-4 text-[#9ca3af] transition-transform flex-shrink-0 ml-2",
              !collapsed && "rotate-180",
            )} />
          )}
        </button>
        {!collapsed && state !== "pending" && children && (
          <div className="bg-white border border-[#e4e4e7] rounded-[12px] p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Expandable text block ────────────────────────────────────────────────────

function ExpandableText({ label, text, defaultLines = 3 }: {
  label: string;
  text: string;
  defaultLines?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  return (
    <div className="mb-3">
      <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-1">{label}</p>
      <p className={cn(
        "text-[12px] text-[#353535] leading-[18px] whitespace-pre-line",
        !expanded && `line-clamp-${defaultLines}`,
      )}>
        {text}
      </p>
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-1 text-[11px] font-semibold text-[#1F6F54] hover:underline mt-1"
      >
        {expanded
          ? <><ChevronUp className="w-3 h-3" /> View less</>
          : <><ChevronDown className="w-3 h-3" /> View more</>
        }
      </button>
    </div>
  );
}

// ─── Quote sub-components (shared pattern with RFQ) ───────────────────────────

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
          {q.costValue && <span className="text-[13px] font-semibold text-[#62748e] ml-0.5">/{q.costUnit}</span>}
        </p>
      </div>
    </div>
  );
}

function QuoteDetailsGrid({ q }: { q: QuoteSnapshot }) {
  const rows = [
    { label: "Shipment Terms", value: q.shipmentTerms },
    { label: "Packaging",      value: q.packaging },
    { label: "Payment Terms",  value: q.paymentTerms },
    { label: "Timeline",       value: q.timeline },
  ].filter((r) => r.value);
  if (!rows.length) return null;
  return (
    <div className="grid grid-cols-2 gap-2 mb-3">
      {rows.map(({ label, value }) => (
        <div key={label} className="bg-[#f9fafb] border border-[#f3f4f6] rounded-[8px] px-3 py-2">
          <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide">{label}</p>
          <p className="text-[12px] font-semibold text-[#353535] mt-0.5">{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Revision cards (identical pattern to RFQ) ────────────────────────────────

function InitialQuoteCard({ quote, date }: { quote: QuoteSnapshot; date: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-[10px] border border-[#bbf7d0] overflow-hidden mb-1">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-[#f0faf5] text-left"
      >
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#1F6F54] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">1</span>
          <span className="text-[12px] font-semibold text-[#020202]">Your Quote</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1F6F54]/10 text-[#1F6F54] font-semibold border border-[#bbf7d0]">Version 1</span>
          <span className="text-[11px] text-[#62748e]">· You</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#9ca3af]">{date}</span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-[#9ca3af] transition-transform", expanded && "rotate-180")} />
        </div>
      </button>
      <div className="px-3 py-2.5 bg-white flex gap-5 border-t border-[#f0fdf4]">
        <div>
          <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide">Quantity</p>
          <p className="text-[15px] font-bold text-[#020202] leading-tight">
            {quote.qtyValue || "—"}
            {quote.qtyValue && <span className="text-[11px] font-semibold text-[#62748e] ml-1">{quote.qtyUnit}</span>}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide">Cost / Unit</p>
          <p className="text-[15px] font-bold text-[#020202] leading-tight">
            {quote.currency} {quote.costValue || "—"}
            {quote.costValue && <span className="text-[11px] font-semibold text-[#62748e] ml-0.5">/{quote.costUnit}</span>}
          </p>
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 pt-1 bg-white border-t border-[#f3f4f6]">
          <QuoteDetailsGrid q={quote} />
        </div>
      )}
    </div>
  );
}

function RevisionCard({ revision, isLatest, defaultExpanded }: {
  revision: ProposalRevision;
  isLatest: boolean;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  useEffect(() => { if (isLatest) setExpanded(true); }, [isLatest]);

  const isAdmin     = revision.from === "admin";
  const revNumber   = revision.versionNumber ?? 2;
  const dotColor    = isAdmin ? "#0077CC" : "#1F6F54";
  const headerBg    = isAdmin ? "#eff6ff"  : "#f0faf5";
  const borderColor = isAdmin ? "#bfdbfe"  : "#bbf7d0";
  const tagBg       = isAdmin ? "#dbeafe"  : "#dcfce7";
  const tagText     = isAdmin ? "#1d4ed8"  : "#15803d";

  return (
    <div className="flex gap-3 pt-4 first:pt-2">
      <div className="flex flex-col items-center flex-shrink-0 relative">
        <div
          className="w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-white text-[10px] font-bold"
          style={{ borderColor: dotColor, color: dotColor }}
        >
          {revNumber}
        </div>
      </div>
      <div className="flex-1 min-w-0 rounded-[10px] border overflow-hidden" style={{ borderColor }}>
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-left"
          style={{ background: headerBg }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="text-[12px] font-semibold text-[#020202]">Revision {revNumber - 1}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
              style={{ background: tagBg, color: tagText, borderColor }}
            >
              {isAdmin ? "Scimplify" : "You"}
            </span>
            <span className="text-[11px] text-[#9ca3af]">{revision.createdAt}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {isLatest && (
              <span className="text-[10px] font-bold text-white bg-[#1F6F54] rounded-full px-2 py-0.5">Latest</span>
            )}
            <ChevronDown className={cn("w-3.5 h-3.5 text-[#9ca3af] transition-transform", expanded && "rotate-180")} />
          </div>
        </button>
        {!expanded && (
          <div className="px-3 py-2.5 bg-white flex gap-5">
            <div>
              <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide">Quantity</p>
              <p className="text-[14px] font-bold text-[#020202] leading-tight">
                {revision.quote.qtyValue || "—"}
                {revision.quote.qtyValue && <span className="text-[11px] text-[#62748e] ml-1">{revision.quote.qtyUnit}</span>}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide">Cost / Unit</p>
              <p className="text-[14px] font-bold text-[#020202] leading-tight">
                {revision.quote.currency} {revision.quote.costValue || "—"}
                {revision.quote.costValue && <span className="text-[11px] text-[#62748e] ml-0.5">/{revision.quote.costUnit}</span>}
              </p>
            </div>
          </div>
        )}
        {expanded && (
          <div className="px-3 pb-3 pt-2 bg-white">
            <QuoteHighlights q={revision.quote} />
            <QuoteDetailsGrid q={revision.quote} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared form style tokens ──────────────────────────────────────────────────

const inputCls =
  "w-full border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-[12px] text-[#020202] focus:outline-none focus:ring-1 focus:ring-[#1F6F54]/60 bg-white placeholder:text-[#9ca3af]";
const labelCls =
  "block text-[10px] font-semibold text-[#62748e] uppercase tracking-wide mb-1";

// ─── Stage 1: Proposal Submitted (CMO) ───────────────────────────────────────

function CMOStage1Content({ proposal }: { proposal: ProposalRecord }) {
  return (
    <>
      {/* Quantity highlight */}
      <div className="bg-[#f0faf5] border border-[#bbf7d0] rounded-[10px] p-3 mb-4">
        <p className="text-[10px] font-semibold text-[#62748e] uppercase tracking-wide mb-1">Proposed Quantity</p>
        <p className="text-[24px] font-bold text-[#020202] leading-tight">
          {proposal.proposedQtyValue || "—"}
          {proposal.proposedQtyValue && (
            <span className="text-[14px] font-semibold text-[#62748e] ml-2">{proposal.proposedQtyUnit}</span>
          )}
        </p>
      </div>

      {/* Text fields */}
      <ExpandableText label="Product Specification" text={proposal.productSpec} />
      <ExpandableText label="Process Notes"          text={proposal.processNotes} />
      <ExpandableText label="Why You're a Good Fit"  text={proposal.whyGoodFit} />
      <ExpandableText label="Terms & Conditions"     text={proposal.termsConditions} />

      {/* Documents */}
      {proposal.fileCount > 0 ? (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f9fafb] rounded-[8px] border border-[#f3f4f6] mt-1">
          <FileText className="w-4 h-4 text-[#62748e]" />
          <span className="text-[12px] text-[#62748e]">
            {proposal.fileCount} supporting document{proposal.fileCount !== 1 ? "s" : ""} attached
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f9fafb] rounded-[8px] border border-[#f3f4f6] mt-1">
          <FileText className="w-4 h-4 text-[#d1d5db]" />
          <span className="text-[12px] text-[#9ca3af]">No supporting documents uploaded</span>
        </div>
      )}
    </>
  );
}

// ─── Stage 2: Talk to Expert ──────────────────────────────────────────────────

function CMOStage2Content({
  proposal,
  onScheduleCall,
  onAdvanceToQuote,
  onSaveDiscussionSummary,
}: {
  proposal: ProposalRecord;
  onScheduleCall: (date: string, time: string, timezone: string) => void;
  onAdvanceToQuote: () => void;
  onSaveDiscussionSummary: (summary: CMODiscussionSummary) => void;
}) {
  const phase     = proposal.negotiationPhase;
  const scheduled = proposal.expertCallScheduled ?? false;

  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate]   = useState("");
  const [selectedTime, setSelectedTime]   = useState("");
  const [selectedTz,   setSelectedTz]     = useState("IST (UTC+5:30)");
  const [callBooked,   setCallBooked]     = useState(scheduled);

  // Discussion summary admin sim
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [summaryDraft, setSummaryDraft]       = useState<CMODiscussionSummary>(
    proposal.cmoDiscussionSummary ?? {},
  );

  const hasSummary = !!proposal.cmoDiscussionSummary?.projectBrief;

  function handleScheduleSubmit() {
    if (!selectedDate || !selectedTime) return;
    onScheduleCall(selectedDate, selectedTime, selectedTz);
    setCallBooked(true);
    setShowScheduler(false);
  }

  return (
    <div className="space-y-4">

      {/* Expert card */}
      <div className="flex gap-3 p-3 bg-[#f9fafb] border border-[#e4e4e7] rounded-[10px]">
        <div className="w-10 h-10 rounded-full bg-[#1F6F54] flex items-center justify-center flex-shrink-0 text-white font-bold text-[14px]">
          AS
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[13px] font-semibold text-[#020202]">Anil Sharma</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1F6F54] bg-[#f0faf5] border border-[#bbf7d0] px-2 py-0.5 rounded-full">
              <Star className="w-2.5 h-2.5" /> Expert
            </span>
          </div>
          <p className="text-[11px] text-[#62748e] mb-2">20+ years in chemical production &amp; process scale-up</p>
          <div className="flex flex-wrap gap-1.5">
            {["CMO Processes", "GMP Compliance", "Scale-up Strategy", "API Manufacturing"].map((tag) => (
              <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Friendly guidance banner */}
      <div className="flex items-start gap-2.5 p-3 bg-[#f0f9ff] border border-[#bae6fd] rounded-[10px]">
        <Info className="w-4 h-4 text-[#0284c7] flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#0369a1] leading-[18px]">
          If you&apos;re unable to schedule a call right away, no worries — we&apos;ll help move things
          forward by scheduling one for you within the next 24 hours.
        </p>
      </div>

      {/* Scheduling section */}
      {!callBooked ? (
        <div className="border border-[#e4e4e7] rounded-[10px] overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-[#fafafa]">
            <div>
              <p className="text-[12px] font-semibold text-[#020202]">Schedule your discovery call</p>
              <p className="text-[11px] text-[#62748e] mt-0.5">30-min session · video link + prep doc provided</p>
            </div>
            <button
              onClick={() => setShowScheduler((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[11px] font-semibold transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {showScheduler ? "Close" : "Schedule Call"}
            </button>
          </div>

          {showScheduler && (
            <div className="p-3 border-t border-[#e4e4e7] space-y-3 bg-white">
              {/* Date */}
              <div>
                <label className={labelCls}>Preferred Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={inputCls}
                />
              </div>
              {/* Time slots */}
              <div>
                <label className={labelCls}>Preferred Time</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className={cn(
                        "py-1.5 rounded-[7px] text-[11px] font-semibold border transition-all",
                        selectedTime === t
                          ? "bg-[#1F6F54] border-[#1F6F54] text-white"
                          : "bg-white border-[#e4e4e7] text-[#353535] hover:border-[#1F6F54]/40",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {/* Timezone */}
              <div>
                <label className={labelCls}>Time Zone</label>
                <DropdownSelect
                  value={selectedTz}
                  onChange={(v) => setSelectedTz(v)}
                  options={TIMEZONES}
                />
              </div>
              <button
                onClick={handleScheduleSubmit}
                disabled={!selectedDate || !selectedTime}
                className="w-full py-2 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-semibold transition-colors"
              >
                Confirm Call Booking
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Call booked success state */
        <div className="p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-[10px]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
            <p className="text-[12px] font-semibold text-[#15803d]">
              {proposal.expertCallDate
                ? `Call scheduled for ${proposal.expertCallDate} at ${proposal.expertCallTime} (${proposal.expertCallTimezone})`
                : "Call confirmed — we'll send the video link shortly."}
            </p>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[12px] font-semibold transition-colors">
            <Video className="w-3.5 h-3.5" /> Join Meeting
          </button>
        </div>
      )}

      {/* Discussion Summary (admin fills post-call) */}
      {hasSummary && (
        <div className="border border-[#e4e4e7] rounded-[10px] overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[#fafafa] border-b border-[#e4e4e7]">
            <BookOpen className="w-3.5 h-3.5 text-[#1F6F54]" />
            <p className="text-[12px] font-semibold text-[#020202]">Discussion Summary</p>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f0faf5] text-[#1F6F54] border border-[#bbf7d0] ml-auto">
              Finalized after discussion
            </span>
          </div>
          <div className="p-3 grid grid-cols-1 gap-2.5 bg-white">
            {[
              { label: "Finalized Project Brief", value: proposal.cmoDiscussionSummary?.projectBrief },
              { label: "Key Challenges",          value: proposal.cmoDiscussionSummary?.challenges },
              { label: "Required Equipment",      value: proposal.cmoDiscussionSummary?.equipment },
              { label: "Scale Details",           value: proposal.cmoDiscussionSummary?.scale },
            ].filter((r) => r.value).map(({ label, value }) => (
              <div key={label} className="bg-[#f9fafb] border border-[#f3f4f6] rounded-[8px] px-3 py-2">
                <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide">{label}</p>
                <p className="text-[12px] text-[#353535] mt-0.5 leading-[18px]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin simulation panel */}
      <div className="pt-3 border-t border-dashed border-[#e4e4e7]">
        <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-2.5">
          Simulate Admin Actions (Demo)
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setCallBooked(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#f0faf5] border border-[#bbf7d0] text-[11px] font-semibold text-[#15803d] hover:bg-[#dcfce7] transition-colors"
          >
            <CalendarDays className="w-3 h-3" /> Auto-Schedule Call
          </button>
          <button
            onClick={onAdvanceToQuote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#eff6ff] border border-[#bfdbfe] text-[11px] font-semibold text-[#1d4ed8] hover:bg-[#dbeafe] transition-colors"
          >
            <AlertTriangle className="w-3 h-3" /> Advance to Submit Quote
          </button>
          <button
            onClick={() => setShowSummaryForm((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#f5f3ff] border border-[#ddd6fe] text-[11px] font-semibold text-[#6d28d9] hover:bg-[#ede9fe] transition-colors"
          >
            <BookOpen className="w-3 h-3" /> Upload Discussion Summary
          </button>
        </div>

        {showSummaryForm && (
          <div className="space-y-2.5 p-3 bg-[#fafafa] rounded-[10px] border border-[#e4e4e7]">
            {(["projectBrief", "challenges", "equipment", "scale"] as const).map((key) => {
              const labels: Record<string, string> = {
                projectBrief: "Finalized Project Brief",
                challenges:   "Key Challenges",
                equipment:    "Required Equipment",
                scale:        "Scale Details",
              };
              return (
                <div key={key}>
                  <label className={labelCls}>{labels[key]}</label>
                  <textarea
                    rows={2}
                    value={summaryDraft[key] ?? ""}
                    onChange={(e) => setSummaryDraft((p) => ({ ...p, [key]: e.target.value }))}
                    className={cn(inputCls, "resize-none")}
                  />
                </div>
              );
            })}
            <button
              onClick={() => {
                onSaveDiscussionSummary(summaryDraft);
                setShowSummaryForm(false);
              }}
              className="w-full py-2 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[12px] font-semibold transition-colors"
            >
              Save Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stage 3: Submit Quote + Negotiation Loop ──────────────────────────────────

function CMOQuoteForm({
  initialQty,
  initialQtyUnit,
  onSubmit,
  onDrop,
}: {
  initialQty: string;
  initialQtyUnit: string;
  onSubmit: (q: QuoteSnapshot) => void;
  onDrop: (reason: string) => void;
}) {
  const [form, setForm] = useState<QuoteSnapshot>({
    qtyValue:        initialQty,
    qtyUnit:         initialQtyUnit || "kg",
    costValue:       "",
    currency:        "USD",
    costUnit:        "kg",
    timeline:        "",
    shipmentTerms:   "",
    packaging:       "",
    paymentTerms:    "",
    productSpec:     "",
    termsConditions: "",
  });
  const [showDrop, setShowDrop]     = useState(false);
  const [dropReason, setDropReason] = useState("");

  const set = (k: keyof QuoteSnapshot) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const canSubmit = form.costValue.trim() && form.shipmentTerms && form.packaging && form.paymentTerms;

  return (
    <div className="space-y-3">
      <p className="text-[12px] font-semibold text-[#020202]">Submit Your CMO Quote</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Quantity */}
        <div>
          <label className={labelCls}>Quantity</label>
          <div className="flex gap-1.5">
            <input value={form.qtyValue} onChange={set("qtyValue")} placeholder="e.g. 50" className={cn(inputCls, "flex-1")} />
            <DropdownSelect
              value={form.qtyUnit}
              onChange={(v) => setForm((p) => ({ ...p, qtyUnit: v }))}
              options={[...QTY_UNITS]}
              className="w-[90px] flex-shrink-0"
            />
          </div>
        </div>
        {/* Cost */}
        <div>
          <label className={labelCls}>Cost Per Unit</label>
          <div className="flex gap-1.5">
            <DropdownSelect
              value={form.currency}
              onChange={(v) => setForm((p) => ({ ...p, currency: v }))}
              options={["USD", "EUR", "INR", "GBP"]}
              className="w-[90px] flex-shrink-0"
            />
            <input value={form.costValue} onChange={set("costValue")} placeholder="e.g. 1400" className={cn(inputCls, "flex-1")} />
            <DropdownSelect
              value={form.costUnit}
              onChange={(v) => setForm((p) => ({ ...p, costUnit: v }))}
              options={["kg", "g", "L", "batch", "MT"]}
              className="w-[90px] flex-shrink-0"
            />
          </div>
        </div>
        {/* Shipment Terms */}
        <div>
          <label className={labelCls}>Shipment Terms</label>
          <DropdownSelect
            value={form.shipmentTerms}
            onChange={(v) => setForm((p) => ({ ...p, shipmentTerms: v }))}
            options={SHIPMENT_OPTS}
            placeholder="Select…"
          />
        </div>
        {/* Packaging */}
        <div>
          <label className={labelCls}>Packaging Details</label>
          <DropdownSelect
            value={form.packaging}
            onChange={(v) => setForm((p) => ({ ...p, packaging: v }))}
            options={PACKAGING_OPTS}
            placeholder="Select…"
          />
        </div>
        {/* Payment Terms — full width */}
        <div className="col-span-2">
          <label className={labelCls}>Payment Terms</label>
          <DropdownSelect
            value={form.paymentTerms}
            onChange={(v) => setForm((p) => ({ ...p, paymentTerms: v }))}
            options={PAYMENT_OPTS}
            placeholder="Select…"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => canSubmit && onSubmit(form)}
          disabled={!canSubmit}
          className="flex-1 py-2.5 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" /> Submit Quote
        </button>
        <button
          onClick={() => setShowDrop((p) => !p)}
          className="px-4 py-2.5 rounded-[8px] border border-[#fecdd3] text-[#be123c] text-[12px] font-semibold hover:bg-[#fff1f2] transition-colors"
        >
          Drop Proposal
        </button>
      </div>

      {showDrop && (
        <div className="p-3 bg-[#fff1f2] border border-[#fecdd3] rounded-[10px] space-y-2">
          <p className="text-[11px] font-semibold text-[#be123c]">Please provide a reason for dropping this proposal:</p>
          <textarea
            value={dropReason}
            onChange={(e) => setDropReason(e.target.value)}
            rows={2}
            placeholder="e.g. Unable to meet the required scale at this time."
            className={cn(inputCls, "resize-none border-[#fecdd3]")}
          />
          <div className="flex gap-2">
            <button
              onClick={() => dropReason.trim() && onDrop(dropReason)}
              disabled={!dropReason.trim()}
              className="flex-1 py-2 rounded-[7px] bg-[#be123c] hover:bg-[#9f1239] disabled:opacity-40 text-white text-[11px] font-semibold transition-colors"
            >
              Confirm Drop
            </button>
            <button
              onClick={() => setShowDrop(false)}
              className="px-4 py-2 rounded-[7px] border border-[#e4e4e7] text-[#62748e] text-[11px] font-semibold hover:bg-[#f9fafb] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CMORevisionForm({
  initial, onSubmit, onCancel,
}: {
  initial: QuoteSnapshot;
  onSubmit: (q: QuoteSnapshot) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<QuoteSnapshot>({ ...initial });
  const set = (k: keyof QuoteSnapshot) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-3">
      <p className="text-[12px] font-semibold text-[#020202]">Submit Revised Quote</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Quantity</label>
          <div className="flex gap-1.5">
            <input value={form.qtyValue} onChange={set("qtyValue")} placeholder="e.g. 50" className={cn(inputCls, "flex-1")} />
            <DropdownSelect
              value={form.qtyUnit}
              onChange={(v) => setForm((p) => ({ ...p, qtyUnit: v }))}
              options={[...QTY_UNITS]}
              className="w-[90px] flex-shrink-0"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Cost Per Unit</label>
          <div className="flex gap-1.5">
            <input value={form.costValue} onChange={set("costValue")} placeholder="e.g. 1400" className={cn(inputCls, "flex-1")} />
            <DropdownSelect
              value={form.costUnit}
              onChange={(v) => setForm((p) => ({ ...p, costUnit: v }))}
              options={["kg", "g", "L", "batch", "MT"]}
              className="w-[90px] flex-shrink-0"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Shipment Terms</label>
          <DropdownSelect
            value={form.shipmentTerms}
            onChange={(v) => setForm((p) => ({ ...p, shipmentTerms: v }))}
            options={SHIPMENT_OPTS}
          />
        </div>
        <div>
          <label className={labelCls}>Packaging</label>
          <DropdownSelect
            value={form.packaging}
            onChange={(v) => setForm((p) => ({ ...p, packaging: v }))}
            options={PACKAGING_OPTS}
          />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Payment Terms</label>
          <DropdownSelect
            value={form.paymentTerms}
            onChange={(v) => setForm((p) => ({ ...p, paymentTerms: v }))}
            options={PAYMENT_OPTS}
          />
        </div>
      </div>
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

function CMOStage3Content({
  proposal,
  onSubmitInitialQuote,
  onDropProposal,
  onAccept,
  onSubmitRevision,
  onSimulateAdminAccept,
  onSimulateAdminReject,
  onSimulateAdminRevise,
}: {
  proposal: ProposalRecord;
  onSubmitInitialQuote: (q: QuoteSnapshot) => void;
  onDropProposal: (reason: string) => void;
  onAccept: () => void;
  onSubmitRevision: (q: QuoteSnapshot) => void;
  onSimulateAdminAccept: () => void;
  onSimulateAdminReject: () => void;
  onSimulateAdminRevise: () => void;
}) {
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const phase       = proposal.negotiationPhase;
  const allRevisions = proposal.revisions ?? [];
  const latestRev   = allRevisions.length > 0 ? allRevisions[allRevisions.length - 1] : null;
  const isRejected  = phase === "rejected";

  const latestIsAdmin    = latestRev?.from === "admin";
  const latestIsSupplier = latestRev?.from === "supplier" || phase === "supplier_counter";
  const showCTAs         = !isRejected && latestIsAdmin && !showRevisionForm;
  const revisionBase     = allRevisions.filter((r) => r.from === "admin").slice(-1)[0]?.quote
    ?? getInitialQuote(proposal);

  // phase = "quote_pending" → show initial quote form
  if (phase === "quote_pending" && allRevisions.length === 0) {
    return (
      <CMOQuoteForm
        initialQty={proposal.proposedQtyValue}
        initialQtyUnit={proposal.proposedQtyUnit}
        onSubmit={onSubmitInitialQuote}
        onDrop={onDropProposal}
      />
    );
  }

  return (
    <div className="space-y-0">
      {/* Version 1: initial quote */}
      <InitialQuoteCard quote={getInitialQuote(proposal)} date={proposal.submittedDate} />

      {/* Revision history */}
      {allRevisions.length > 0 && (
        <div className="relative pl-3">
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

      {/* Inline revision form */}
      {showRevisionForm && (
        <div className="mt-4 pt-4 border-t border-[#e4e4e7]">
          <CMORevisionForm
            initial={revisionBase}
            onSubmit={(q) => { onSubmitRevision(q); setShowRevisionForm(false); }}
            onCancel={() => setShowRevisionForm(false)}
          />
        </div>
      )}

      {/* CTAs when latest is admin */}
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

      {/* Waiting for admin */}
      {latestIsSupplier && !isRejected && !showRevisionForm && (
        <div className="flex items-start gap-2.5 p-3 bg-[#fffbeb] border border-[#fde68a] rounded-[10px] mt-4">
          <Clock className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#92400e] leading-[18px]">
            Your quote has been submitted. Awaiting Scimplify&apos;s response.
          </p>
        </div>
      )}

      {/* Rejection banner */}
      {isRejected && (
        <div className="flex items-start gap-3 p-4 bg-[#fff1f2] border border-[#fecdd3] rounded-[10px] mt-4">
          <XCircle className="w-5 h-5 text-[#be123c] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-[#be123c] mb-1">Quote Rejected</p>
            <p className="text-[12px] text-[#6b7280] leading-[18px]">
              {proposal.rejectionReason || "Your quote has been reviewed and rejected by the Scimplify team."}
            </p>
          </div>
        </div>
      )}

      {/* Admin simulation */}
      {!isRejected && !showRevisionForm && (
        <div className="mt-4 pt-4 border-t border-dashed border-[#e4e4e7]">
          <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-2.5">
            Simulate Admin Response (Demo)
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={onSimulateAdminAccept}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#f0fdf4] border border-[#bbf7d0] text-[11px] font-semibold text-[#15803d] hover:bg-[#dcfce7] transition-colors">
              <Check className="w-3 h-3" /> Accept Quote
            </button>
            <button onClick={onSimulateAdminReject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#fff1f2] border border-[#fecdd3] text-[11px] font-semibold text-[#be123c] hover:bg-[#ffe4e6] transition-colors">
              <XCircle className="w-3 h-3" /> Reject Quote
            </button>
            <button onClick={onSimulateAdminRevise}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#eff6ff] border border-[#bfdbfe] text-[11px] font-semibold text-[#1d4ed8] hover:bg-[#dbeafe] transition-colors">
              <Pencil className="w-3 h-3" /> Send Revised Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stage 4: Quote Accepted ──────────────────────────────────────────────────

function CMOStage4Content({ proposal, onSimulatePO }: {
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
        <div>
          <p className="text-[12px] font-semibold text-[#15803d]">
            Scimplify has accepted your submitted quote
          </p>
          <p className="text-[11px] text-[#15803d] mt-0.5 opacity-80">
            Purchase Order will be shared shortly.
          </p>
        </div>
      </div>
      <QuoteHighlights q={q} />
      <QuoteDetailsGrid q={q} />

      {proposal.negotiationPhase === "accepted" && (
        <div className="mt-4 pt-4 border-t border-dashed border-[#e4e4e7]">
          <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-2.5">
            Simulate Admin Action (Demo)
          </p>
          <button onClick={onSimulatePO}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#f0faf5] border border-[#bbf7d0] text-[11px] font-semibold text-[#1F6F54] hover:bg-[#dcfce7] transition-colors">
            <Package className="w-3 h-3" /> Upload Purchase Order
          </button>
        </div>
      )}
    </>
  );
}

// ─── Stage 5: PO Issued ───────────────────────────────────────────────────────

function CMOStage5Content({ proposal }: { proposal: ProposalRecord }) {
  if (proposal.negotiationPhase === "po_issued" && proposal.poDocumentUrl) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2.5 p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-[10px]">
          <CheckCircle2 className="w-4 h-4 text-[#15803d] flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#15803d] font-medium leading-[18px]">
            Your CMO order is confirmed. Details have been sent to your email.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={proposal.poDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[12px] font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download PO
          </a>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[8px] border border-[#e4e4e7] text-[#353535] text-[12px] font-semibold hover:bg-[#f9fafb] transition-colors">
            <Package className="w-3.5 h-3.5" /> Track Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 p-3 bg-[#fffbeb] border border-[#fde68a] rounded-[10px]">
      <Clock className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
      <p className="text-[12px] text-[#92400e] leading-[18px]">
        Purchase order will be uploaded shortly by the Scimplify team.
      </p>
    </div>
  );
}

// ─── Right panel ──────────────────────────────────────────────────────────────

function RepresentativeCard() {
  return (
    <div className="relative rounded-[12px] bg-[#0F1C17] p-5 text-white overflow-hidden group">
      <Headphones
        className="absolute -bottom-3 -right-3 w-28 h-28 text-white opacity-[0.04] transition-all duration-300 ease-in-out group-hover:opacity-[0.09] group-hover:scale-110 pointer-events-none"
        strokeWidth={1.2}
      />
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-[8px] bg-[#1F6F54] flex items-center justify-center flex-shrink-0">
          <Headphones className="w-3.5 h-3.5 text-white" strokeWidth={2} />
        </div>
        <p className="text-[13px] font-bold text-white leading-tight">Connect Simplify Representative</p>
      </div>
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mb-0.5">Name</p>
          <p className="text-[13px] font-semibold text-white">Vinayak Verma</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mb-0.5">Contact No.</p>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-[#1F6F54] flex-shrink-0" />
            <p className="text-[13px] font-semibold text-white">+91-9876512345</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mb-0.5">Email ID</p>
          <div className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-[#1F6F54] flex-shrink-0" />
            <p className="text-[13px] font-semibold text-white break-all">vinayakshama@simplify.com</p>
          </div>
        </div>
      </div>
      <button className="w-full flex items-center justify-center gap-2 py-2 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] text-[12px] font-semibold text-white transition-colors duration-200">
        <CalendarDays className="w-3.5 h-3.5" /> Schedule a Discussion Call
      </button>
    </div>
  );
}

function CMOProjectDetailsPanel({ proposal }: { proposal: ProposalRecord }) {
  const project = useMemo(
    () => ALL_PROJECTS.find((p) => p.projectId === proposal.projectId),
    [proposal.projectId],
  );
  const [showMoreDesc, setShowMoreDesc] = useState(false);
  const [activeTab, setActiveTab]       = useState<"details" | "documents">("details");

  const details = project ? [
    { label: "PROJECT NAME", value: project.targetMolecule },
    { label: "CAS",          value: project.cas },
    { label: "INDUSTRY",     value: project.industry },
    { label: "LEAD TIME",    value: project.timeline },
    { label: "PURITY",       value: project.purity },
  ] : [
    { label: "PROJECT ID", value: proposal.projectId },
    { label: "CAS",        value: proposal.cas },
    { label: "INDUSTRY",   value: proposal.industry },
    { label: "PRODUCT",    value: proposal.productName },
  ];

  const docs        = project?.attachedDocs ?? [];
  const description = project?.fullDescription || project?.description || "";

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#e4e4e7] rounded-[12px] overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[#e4e4e7]">
          {(["details", "documents"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2.5 text-[12px] font-semibold capitalize transition-colors",
                activeTab === tab
                  ? "text-[#1F6F54] border-b-2 border-[#1F6F54]"
                  : "text-[#62748e] hover:text-[#353535]",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Details tab */}
        {activeTab === "details" && (
          <div className="p-4 space-y-3">
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
                <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide">PROJECT DESCRIPTION</p>
                <p className={cn("text-[12px] text-[#353535] mt-0.5 leading-[18px]", !showMoreDesc && "line-clamp-3")}>
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
        )}

        {/* Documents tab */}
        {activeTab === "documents" && (
          <div className="p-4">
            {docs.length > 0 ? (
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between p-2.5 bg-[#f9fafb] rounded-[8px] border border-[#f3f4f6]">
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
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <FileText className="w-8 h-8 text-[#d1d5db] mb-2" />
                <p className="text-[12px] text-[#9ca3af]">No documents attached</p>
              </div>
            )}
          </div>
        )}
      </div>

      <RepresentativeCard />
    </div>
  );
}

// ─── Outer guard ──────────────────────────────────────────────────────────────

export function CMOProposalDrawer({
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

  if (!proposal || !proposalId || proposal.proposalType !== "CMO") return null;

  return (
    <CMOProposalDrawerInner
      proposal={proposal}
      proposalId={proposalId}
      onClose={onClose}
    />
  );
}

// ─── Inner component — all hooks ──────────────────────────────────────────────

function CMOProposalDrawerInner({
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
  const updateProposal      = useProposalStore((s) => s.updateProposal);

  const [fullscreen, setFullscreen] = useState(false);

  const project = useMemo(
    () => ALL_PROJECTS.find((p) => p.projectId === proposal.projectId) ?? null,
    [proposal.projectId],
  );

  // Escape key closes in drawer mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !fullscreen) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, fullscreen]);

  const phase = proposal.negotiationPhase ?? "submitted";

  // ── Stage states ──────────────────────────────────────────────────────────────
  const s1State: StageState = phase === "submitted" ? "active" : "completed";

  const s2State: StageState =
    phase === "submitted"                             ? "pending" :
    ["talk_to_expert", "expert_scheduled"].includes(phase) ? "active" :
    "completed";

  const wasNegotiated  = (proposal.revisions?.length ?? 0) > 0;
  const quoteSubmitted =
    phase === "supplier_counter" ||
    phase === "admin_revised"   ||
    phase === "accepted"        ||
    phase === "rejected"        ||
    phase === "po_issued"       ||
    wasNegotiated;

  const showStage3 = !["submitted", "talk_to_expert", "expert_scheduled"].includes(phase);

  const s3State: StageState =
    ["accepted", "po_issued"].includes(phase) ? "completed" :
    phase === "rejected"                       ? "active"    :
    showStage3                                 ? "active"    :
    "pending";

  const showStage4 = ["accepted", "po_issued"].includes(phase);
  const s4State: StageState =
    phase === "po_issued" ? "completed" :
    phase === "accepted"  ? "active"    :
    "pending";

  const showStage5 = ["accepted", "po_issued"].includes(phase);
  const s5State: StageState = phase === "po_issued" ? "active" : "pending";

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleScheduleCall = useCallback((date: string, time: string, tz: string) => {
    updateProposal(proposalId, {
      expertCallScheduled:  true,
      expertCallDate:       date,
      expertCallTime:       time,
      expertCallTimezone:   tz,
      negotiationPhase:     "expert_scheduled",
      status:               "Talk to Expert",
    });
  }, [proposalId, updateProposal]);

  const handleAdvanceToQuote = useCallback(() => {
    setNegotiationPhase(proposalId, "quote_pending");
    updateStatus(proposalId, "Talk to Expert");
  }, [proposalId, setNegotiationPhase, updateStatus]);

  const handleSaveDiscussionSummary = useCallback((summary: CMODiscussionSummary) => {
    updateProposal(proposalId, { cmoDiscussionSummary: summary });
  }, [proposalId, updateProposal]);

  const handleSubmitInitialQuote = useCallback((q: QuoteSnapshot) => {
    updateProposal(proposalId, {
      costValue:       q.costValue,
      currency:        q.currency,
      costUnit:        q.costUnit,
      shipmentTerms:   q.shipmentTerms,
      packaging:       q.packaging,
      paymentTerms:    q.paymentTerms,
      proposedQtyValue: q.qtyValue,
      proposedQtyUnit:  q.qtyUnit,
      negotiationPhase: "supplier_counter",
      status:           "Quote Submitted",
    });
  }, [proposalId, updateProposal]);

  const handleDropProposal = useCallback((reason: string) => {
    setRejection(proposalId, reason);
  }, [proposalId, setRejection]);

  const handleAccept = useCallback(() => {
    setNegotiationPhase(proposalId, "accepted");
    updateStatus(proposalId, "Quote Accepted");
  }, [proposalId, setNegotiationPhase, updateStatus]);

  const handleSubmitRevision = useCallback((q: QuoteSnapshot) => {
    const allRevisions   = proposal.revisions ?? [];
    const supplierCount  = allRevisions.filter((r) => r.from === "supplier").length;
    addRevision(proposalId, {
      id:            `CMO-REV-SUP-${Date.now()}`,
      versionNumber: allRevisions.length + 2,
      from:          "supplier",
      label:         `Revised CMO Quote v${supplierCount + 1}`,
      createdAt:     new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      quote: q,
    });
    setNegotiationPhase(proposalId, "supplier_counter");
    updateStatus(proposalId, "Quote Submitted");
  }, [proposalId, proposal.revisions, addRevision, setNegotiationPhase, updateStatus]);

  const simulateAdminAccept = useCallback(() => {
    setNegotiationPhase(proposalId, "accepted");
    updateStatus(proposalId, "Quote Accepted");
  }, [proposalId, setNegotiationPhase, updateStatus]);

  const simulateAdminReject = useCallback(() => {
    setRejection(proposalId, "The submitted quote does not align with our current CMO requirements. Thank you for your interest.");
  }, [proposalId, setRejection]);

  const simulateAdminRevise = useCallback(() => {
    const allRevisions = proposal.revisions ?? [];
    const base         = getInitialQuote(proposal);
    const adminQ: QuoteSnapshot = {
      ...base,
      costValue:     base.costValue ? String(Math.max(1, Math.round(Number(base.costValue) * 0.90))) : "1200",
      qtyValue:      base.qtyValue  ? String(Math.round(Number(base.qtyValue) * 1.15)) : "55",
      shipmentTerms: base.shipmentTerms || "EXW (Ex Works)",
      packaging:     base.packaging     || "Drums (200 L)",
      paymentTerms:  base.paymentTerms  || "Net 30",
    };
    const adminCount = allRevisions.filter((r) => r.from === "admin").length;
    addRevision(proposalId, {
      id:            `CMO-REV-ADM-${Date.now()}`,
      versionNumber: allRevisions.length + 2,
      from:          "admin",
      label:         `Scimplify Revised CMO Quote v${adminCount + 1}`,
      createdAt:     new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      quote:         adminQ,
      notes:         "Revised pricing and volume based on CMO capacity review.",
    });
    setNegotiationPhase(proposalId, "admin_revised");
  }, [proposalId, proposal, addRevision, setNegotiationPhase]);

  const simulatePO = useCallback(() => {
    setPODocument(proposalId, "#cmo-po-demo.pdf");
  }, [proposalId, setPODocument]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Overlay */}
      {!fullscreen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 flex flex-col bg-white",
        "shadow-[0px_25px_50px_rgba(0,0,0,0.25)]",
        "transition-[width] duration-300 ease-in-out",
        fullscreen ? "w-full" : "w-full md:w-[70vw]",
      )}>

        {/* ── Sticky header ─────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 px-5 py-3 flex items-center justify-between bg-white border-b border-[#e4e4e7]">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-[#9ca3af] mb-0.5">
              <span>My Proposals</span>
              <span className="mx-0.5">›</span>
              <span className="font-semibold text-[#353535]">Sent Proposal</span>
            </div>
            <p className="text-[11px] text-[#9ca3af]">
              Viewing submitted CMO proposal details and tracking current lifecycle.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f0faf5] text-[#1F6F54] border border-[#bbf7d0]">
              Project Proposal
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white bg-[#1F6F54]">
              CMO
            </span>
            <button
              onClick={() => setFullscreen((p) => !p)}
              title={fullscreen ? "Exit fullscreen" : "Maximize"}
              className="p-1.5 rounded-[6px] text-[#9ca3af] hover:text-[#353535] hover:bg-[#f3f4f6] transition-colors"
            >
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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

        {/* ── Scrollable body ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">

            {/* Project summary card */}
            <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-4 mb-5 shadow-[0px_2px_8px_rgba(0,0,0,0.05)]">
              <div className="flex gap-3">
                <div className="w-[100px] h-[72px] rounded-[8px] overflow-hidden bg-[#f3f4f6] flex-shrink-0">
                  {project?.image ? (
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#c8d9d2] to-[#9fc0b4]" />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#1F6F54] mb-1">
                      CMO
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

            {/* Two-column layout */}
            <div className="flex flex-col lg:flex-row gap-5 items-start">

              {/* LEFT: Stage timeline (70%) */}
              <div className="flex-[7] min-w-0 w-full">

                {/* Stage 1: Proposal Submitted */}
                <StageContainer
                  number={1}
                  title="Proposal Submitted"
                  badge="Proposal Submitted"
                  badgeColor="green"
                  state={s1State}
                >
                  <CMOStage1Content proposal={proposal} />
                </StageContainer>

                {/* Advance to Stage 2 — demo panel */}
                {phase === "submitted" && (
                  <div className="flex gap-3 mb-5">
                    <div className="w-7 flex-shrink-0" />
                    <div className="flex-1 p-3 bg-[#f9fafb] border border-dashed border-[#e4e4e7] rounded-[10px]">
                      <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-2">
                        Simulate Admin Action (Demo)
                      </p>
                      <button
                        onClick={() => {
                          setNegotiationPhase(proposalId, "talk_to_expert");
                          updateStatus(proposalId, "Talk to Expert");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#eff6ff] border border-[#bfdbfe] text-[11px] font-semibold text-[#1d4ed8] hover:bg-[#dbeafe] transition-colors"
                      >
                        <AlertTriangle className="w-3 h-3" /> Advance to Talk to Expert
                      </button>
                    </div>
                  </div>
                )}

                {/* Stage 2: Talk to Expert */}
                <StageContainer
                  number={2}
                  title="Talk to an Expert"
                  badge={
                    phase === "expert_scheduled" ? "Call Scheduled" :
                    ["talk_to_expert", "expert_scheduled"].includes(phase) ? "In Progress" :
                    "Completed"
                  }
                  badgeColor={
                    phase === "expert_scheduled"                            ? "green"  :
                    ["talk_to_expert", "expert_scheduled"].includes(phase)  ? "purple" :
                    "green"
                  }
                  state={s2State}
                >
                  <CMOStage2Content
                    proposal={proposal}
                    onScheduleCall={handleScheduleCall}
                    onAdvanceToQuote={handleAdvanceToQuote}
                    onSaveDiscussionSummary={handleSaveDiscussionSummary}
                  />
                </StageContainer>

                {/* Stage 3: Submit Quote / Negotiation */}
                {showStage3 && (
                  <StageContainer
                    number={3}
                    title={
                      phase === "rejected"        ? "Rejected"         :
                      phase === "quote_pending"   ? "Submit Quote"     :
                      phase === "supplier_counter"? "Quote Submitted"  :
                      phase === "admin_revised"   ? "Under Negotiation":
                      "Negotiation"
                    }
                    badge={
                      phase === "rejected"        ? "Rejected"         :
                      phase === "quote_pending"   ? "Awaiting Quote"   :
                      phase === "supplier_counter"? "Pending Review"   :
                      phase === "admin_revised"   ? "Under Negotiation":
                      "Negotiation"
                    }
                    badgeColor={
                      phase === "rejected"        ? "red"   :
                      phase === "quote_pending"   ? "gray"  :
                      phase === "supplier_counter"? "amber" :
                      "amber"
                    }
                    state={s3State}
                  >
                    <CMOStage3Content
                      proposal={proposal}
                      onSubmitInitialQuote={handleSubmitInitialQuote}
                      onDropProposal={handleDropProposal}
                      onAccept={handleAccept}
                      onSubmitRevision={handleSubmitRevision}
                      onSimulateAdminAccept={simulateAdminAccept}
                      onSimulateAdminReject={simulateAdminReject}
                      onSimulateAdminRevise={simulateAdminRevise}
                    />
                  </StageContainer>
                )}

                {/* Stage 4: Quote Accepted */}
                {showStage4 && (
                  <StageContainer
                    number={showStage3 ? 4 : 3}
                    title="Quote Accepted"
                    badge="Quote Accepted"
                    badgeColor="green"
                    state={s4State}
                  >
                    <CMOStage4Content proposal={proposal} onSimulatePO={simulatePO} />
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
                    <CMOStage5Content proposal={proposal} />
                  </StageContainer>
                )}
              </div>

              {/* RIGHT: Project details (30%) */}
              <div className="flex-[3] min-w-0 w-full lg:sticky lg:top-0">
                <CMOProjectDetailsPanel proposal={proposal} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
