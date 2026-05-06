"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Send, ClipboardList, CheckCircle2,
  XCircle, Package, FileText, Calendar,
  FlaskConical, Trash2, ArrowUpRight, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProposalStore, type ProposalRecord, type ProposalStatus } from "@/store/useProposalStore";
import { RFQProposalDrawer } from "./RFQProposalDrawer";
import { CMOProposalDrawer } from "./CMOProposalDrawer";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ProposalStatus,
  { dot: string; bg: string; text: string; border: string }
> = {
  "Proposal Sent":    { dot: "#3b82f6", bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  "Talk to Expert":   { dot: "#8b5cf6", bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" },
  "Quote Submitted":  { dot: "#f59e0b", bg: "#fefce8", text: "#92400e", border: "#fde68a" },
  "Quote Accepted":   { dot: "#10b981", bg: "#f0fdf4", text: "#065f46", border: "#a7f3d0" },
  "Quote Rejected":   { dot: "#ef4444", bg: "#fff1f2", text: "#9f1239", border: "#fecdd3" },
  "PO Issued":        { dot: "#1F6F54", bg: "#f0faf5", text: "#1F6F54", border: "#bbf7d0" },
};

const BADGE_CONFIG: Record<string, { bg: string; text: string }> = {
  CMO:             { bg: "#1F6F54",  text: "#fff" },
  RFQ:             { bg: "#0077CC",  text: "#fff" },
  Exclusive:       { bg: "#020202",  text: "#fff" },
  "Tech Transfer": { bg: "#7C3AED",  text: "#fff" },
  Open:            { bg: "#D97706",  text: "#fff" },
};

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTER_TABS = [
  "All",
  "CMO Proposals",
  "RFQ Proposals",
  "Active",
  "Accepted",
  "Rejected",
] as const;

type FilterTab = (typeof FILTER_TABS)[number];

function filterProposals(proposals: ProposalRecord[], tab: FilterTab, query: string) {
  let filtered = proposals;

  switch (tab) {
    case "CMO Proposals":
      filtered = filtered.filter((p) => p.proposalType === "CMO");
      break;
    case "RFQ Proposals":
      filtered = filtered.filter((p) => p.proposalType === "RFQ");
      break;
    case "Active":
      filtered = filtered.filter((p) =>
        ["Proposal Sent", "Talk to Expert", "Quote Submitted"].includes(p.status),
      );
      break;
    case "Accepted":
      filtered = filtered.filter((p) =>
        ["Quote Accepted", "PO Issued"].includes(p.status),
      );
      break;
    case "Rejected":
      filtered = filtered.filter((p) => p.status === "Quote Rejected");
      break;
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.projectTitle.toLowerCase().includes(q) ||
        p.projectId.toLowerCase().includes(q) ||
        p.productName.toLowerCase().includes(q) ||
        p.cas.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q),
    );
  }

  return filtered;
}

// ─── Date grouping ────────────────────────────────────────────────────────────

const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseSubmittedDate(dateStr: string): Date | null {
  // Expected formats: "15 Apr 2026" or "Apr 15, 2026"
  const parts = dateStr.trim().split(/[\s,]+/);
  if (parts.length < 3) return null;

  // "15 Apr 2026"
  const day = parseInt(parts[0], 10);
  const month = MONTH_MAP[parts[1]];
  const year = parseInt(parts[2], 10);
  if (!isNaN(day) && month !== undefined && !isNaN(year)) {
    return new Date(year, month, day);
  }
  // "Apr 15 2026"
  const month2 = MONTH_MAP[parts[0]];
  const day2 = parseInt(parts[1], 10);
  const year2 = parseInt(parts[2], 10);
  if (month2 !== undefined && !isNaN(day2) && !isNaN(year2)) {
    return new Date(year2, month2, day2);
  }
  return null;
}

function groupByDate(proposals: ProposalRecord[]): {
  recent: ProposalRecord[];
  earlier: ProposalRecord[];
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 5); // last 5 days = "recently"

  const recent: ProposalRecord[] = [];
  const earlier: ProposalRecord[] = [];

  for (const p of proposals) {
    const d = parseSubmittedDate(p.submittedDate);
    if (d && d >= cutoff) {
      recent.push(p);
    } else {
      earlier.push(p);
    }
  }

  return { recent, earlier };
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-[12px] border border-[#e4e4e7] p-4 flex items-center gap-3 shadow-[0px_1px_4px_rgba(0,0,0,0.05)]">
      <div className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#62748e] uppercase tracking-wide truncate">{label}</p>
        <p className={cn("text-[22px] font-bold leading-tight", accent ?? "text-[#020202]")}>{value}</p>
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProposalStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dot }}
      />
      {status}
    </span>
  );
}

// ─── Proposal card ────────────────────────────────────────────────────────────

function ProposalCard({
  p,
  onDelete,
  onClick,
}: {
  p: ProposalRecord;
  onDelete: () => void;
  onClick: () => void;
}) {
  const badgeCfg = BADGE_CONFIG[p.projectBadge] ?? BADGE_CONFIG.CMO;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[12px] border border-[#e4e4e7] p-4 hover:border-[#1F6F54]/40 hover:shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-all cursor-pointer group"
    >
      {/* Top row: badges + status + delete */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f0faf5] text-[#1F6F54] border border-[#bbf7d0]">
            Project Proposal
          </span>
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: badgeCfg.bg, color: badgeCfg.text }}
          >
            {p.proposalType}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={p.status} />
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-[6px] text-[#9ca3af] hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Remove proposal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Project title */}
      <h3 className="text-[14px] font-semibold text-[#020202] leading-[20px] mb-2 line-clamp-2">
        {p.projectTitle}
      </h3>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
        <span className="flex items-center gap-1 text-[11px] text-[#62748e]">
          <FileText className="w-3 h-3" />
          <span className="font-medium text-[#020202]">{p.projectId}</span>
        </span>
        {p.cas && (
          <span className="flex items-center gap-1 text-[11px] text-[#62748e]">
            <FlaskConical className="w-3 h-3" />
            CAS: <span className="font-medium text-[#020202] ml-0.5">{p.cas}</span>
          </span>
        )}
        <span className="flex items-center gap-1 text-[11px] text-[#62748e]">
          <Calendar className="w-3 h-3" />
          {p.submittedDate}
        </span>
      </div>

      {/* Product + industry + open */}
      <div className="flex items-center gap-3">
        {p.productName && (
          <span className="text-[12px] font-medium text-[#353535] truncate">{p.productName}</span>
        )}
        {p.industry && (
          <span className="text-[11px] text-[#9ca3af] truncate">· {p.industry}</span>
        )}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {p.fileCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-[#62748e]">
              <FileText className="w-3 h-3" />
              {p.fileCount} file{p.fileCount !== 1 ? "s" : ""}
            </span>
          )}
          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-[#1F6F54] opacity-0 group-hover:opacity-100 transition-opacity">
            View <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <p className="text-[12px] font-semibold text-[#62748e] uppercase tracking-wide">
        {label}
      </p>
      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#f0faf5] border border-[#bbf7d0] text-[11px] font-bold text-[#1F6F54]">
        {count}
      </span>
      <div className="flex-1 h-px bg-[#e4e4e7]" />
    </div>
  );
}

// ─── Latest submission banner ─────────────────────────────────────────────────

function LatestBanner({ p }: { p: ProposalRecord }) {
  return (
    <div className="rounded-[12px] border border-[#bbf7d0] bg-[#f0faf5] p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-[10px] bg-[#1F6F54] flex items-center justify-center flex-shrink-0">
        <Send className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-[#1F6F54] uppercase tracking-wide mb-0.5">
          Latest Submission
        </p>
        <p className="text-[14px] font-semibold text-[#020202] line-clamp-1">{p.projectTitle}</p>
        <p className="text-[12px] text-[#62748e] mt-0.5">
          {p.projectId} · Submitted {p.submittedDate}
        </p>
      </div>
      <div className="flex-shrink-0">
        <StatusBadge status={p.status} />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyProposals({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-[#f0faf5] flex items-center justify-center mb-4">
        <ClipboardList className="w-8 h-8 text-[#1F6F54]" />
      </div>
      <p className="text-[16px] font-semibold text-[#020202] mb-1">No proposals yet</p>
      <p className="text-[13px] text-[#62748e] max-w-xs leading-[20px] mb-5">
        Browse open projects and submit your first proposal to start tracking here.
      </p>
      <button
        onClick={onBrowse}
        className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[14px] font-semibold transition-colors shadow-sm"
      >
        <ArrowUpRight className="w-4 h-4" /> Explore Projects
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProposalListing() {
  const router = useRouter();
  const proposals      = useProposalStore((s) => s.proposals);
  const deleteProposal = useProposalStore((s) => s.deleteProposal);

  const [activeTab,        setActiveTab]        = useState<FilterTab>("All");
  const [query,            setQuery]            = useState("");
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

  // Stats
  const stats = useMemo(() => ({
    total:    proposals.length,
    sent:     proposals.filter((p) => p.status === "Proposal Sent").length,
    accepted: proposals.filter((p) => ["Quote Accepted", "PO Issued"].includes(p.status)).length,
    dropped:  proposals.filter((p) => p.status === "Quote Rejected").length,
    poIssued: proposals.filter((p) => p.status === "PO Issued").length,
  }), [proposals]);

  const filtered = useMemo(
    () => filterProposals(proposals, activeTab, query),
    [proposals, activeTab, query],
  );

  const { recent, earlier } = useMemo(() => groupByDate(filtered), [filtered]);

  const latest = proposals[0] ?? null;

  return (
    <div className="flex flex-col gap-5 max-w-[1200px] mx-auto pb-12 px-4 sm:px-6 lg:px-0">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold text-[#020202] leading-tight">My Proposals</h1>
            {proposals.length > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#1F6F54] text-white text-[12px] font-bold shadow-sm">
                {proposals.length}
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#62748e] mt-0.5">
            Track and manage all your submitted proposals
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/projects")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[13px] font-semibold transition-colors shadow-sm self-start sm:self-auto"
        >
          <ArrowUpRight className="w-4 h-4" /> Explore Projects
        </button>
      </div>

      {/* ── Stats section ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-2.5">
          Your Status Cards
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Proposals Sent"
            value={stats.sent}
            icon={Send}
            iconBg="bg-[#eff6ff]"
            iconColor="text-[#3b82f6]"
            accent="text-[#1d4ed8]"
          />
          <StatCard
            label="Quote Accepted"
            value={stats.accepted}
            icon={CheckCircle2}
            iconBg="bg-[#f0fdf4]"
            iconColor="text-[#10b981]"
            accent="text-[#065f46]"
          />
          <StatCard
            label="Proposal Dropped"
            value={stats.dropped}
            icon={XCircle}
            iconBg="bg-[#fff1f2]"
            iconColor="text-[#ef4444]"
            accent="text-[#9f1239]"
          />
          <StatCard
            label="PO Issued"
            value={stats.poIssued}
            icon={Package}
            iconBg="bg-[#f0faf5]"
            iconColor="text-[#1F6F54]"
            accent="text-[#1F6F54]"
          />
        </div>
      </div>

      {/* ── Latest banner (only when proposals exist) ──────────────────────── */}
      {latest && <LatestBanner p={latest} />}

      {/* ── Search + filter ────────────────────────────────────────────────── */}
      {proposals.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by project title, CAS, ID, or industry..."
              className="w-full pl-9 pr-4 py-2.5 border border-[#cbd5e1] rounded-[10px] text-[13px] text-[#020202] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1F6F54]/30 focus:border-[#1F6F54] transition-colors bg-white"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-shrink-0 px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-all",
                  activeTab === tab
                    ? "bg-[#1F6F54] border-[#1F6F54] text-white"
                    : "bg-white border-[#e4e4e7] text-[#62748e] hover:border-[#1F6F54]/40",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Proposal list ─────────────────────────────────────────────────── */}
      {proposals.length === 0 ? (
        <EmptyProposals onBrowse={() => router.push("/dashboard/projects")} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-8 h-8 text-[#cbd5e1] mb-3" />
          <p className="text-[14px] font-medium text-[#62748e]">No proposals match your search</p>
          <button
            onClick={() => { setQuery(""); setActiveTab("All"); }}
            className="mt-2 text-[13px] text-[#1F6F54] hover:underline font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {recent.length > 0 && (
            <div>
              <SectionHeading label="Submitted Recently" count={recent.length} />
              <div className="flex flex-col gap-3">
                {recent.map((p) => (
                  <ProposalCard
                    key={p.id}
                    p={p}
                    onDelete={() => deleteProposal(p.id)}
                    onClick={() => setSelectedProposal(p.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {earlier.length > 0 && (
            <div>
              <SectionHeading label="Submitted Earlier" count={earlier.length} />
              <div className="flex flex-col gap-3">
                {earlier.map((p) => (
                  <ProposalCard
                    key={p.id}
                    p={p}
                    onDelete={() => deleteProposal(p.id)}
                    onClick={() => setSelectedProposal(p.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Proposal detail drawers — routed by type */}
      <RFQProposalDrawer
        proposalId={
          proposals.find((p) => p.id === selectedProposal)?.proposalType === "RFQ"
            ? selectedProposal
            : null
        }
        onClose={() => setSelectedProposal(null)}
      />
      <CMOProposalDrawer
        proposalId={
          proposals.find((p) => p.id === selectedProposal)?.proposalType === "CMO"
            ? selectedProposal
            : null
        }
        onClose={() => setSelectedProposal(null)}
      />
    </div>
  );
}
